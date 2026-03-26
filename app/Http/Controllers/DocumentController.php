<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Lease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class DocumentController extends Controller
{
    /**
     * Display the specified document.
     */
    public function show(Document $document)
    {
        // 1. Autorisation (verifie que l'utilisateur a le droit de voir ce document)
        Gate::authorize('view', $document);

        // 2. Verification de l'existence physique du fichier
        if (!Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'Le fichier est introuvable sur le serveur.');
        }

        // 3. Retourne le fichier pour affichage dans le navigateur
        return response()->file(Storage::disk('public')->path($document->file_path));
    }

    public function update(Request $request, Document $document)
    {
        Gate::authorize('update', $document);

        $request->validate([
            'name' => 'required|string|max:255',
            'room_id' => 'nullable|exists:rooms,id',
            'equipment_id' => 'nullable|exists:equipments,id',
        ]);

        $document->update([
            'name' => $request->name,
            'room_id' => $request->room_id,
            'equipment_id' => $request->equipment_id,
        ]);

        return back();
    }

    /**
     * Store documents specifically for a lease (Bail & Etat des lieux).
     */
    public function storeForLease(Request $request, Lease $lease)
    {
        Gate::authorize('update', $lease);

        // Validation des tableaux de fichiers envoyes par React
        $request->validate([
            'signed_lease' => 'nullable|array',
            'signed_lease.*' => 'file|mimes:pdf,jpeg,png,jpg,zip,rar|max:10240',

            'signed_inventory' => 'nullable|array',
            'signed_inventory.*' => 'file|mimes:pdf,jpeg,png,jpg,zip,rar|max:10240',

            'signed_guarantee' => 'nullable|array',
            'signed_guarantee.*' => 'file|mimes:pdf,jpg,jpeg,png,zip,rar|max:10240',
        ]);

        DB::transaction(function () use ($request, $lease) {
            // Dossier cible pour le stockage physique
            $storageFolder = "documents/leases/{$lease->id}";

            // Traitement des fichiers du bail
            if ($request->hasFile('signed_lease')) {
                foreach ($request->file('signed_lease') as $file) {
                    $path = $file->store($storageFolder, 'public');

                    // Creation du document via la relation polymorphique
                    $lease->documents()->create([
                        'name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'category' => 'signed_lease',
                        'mime_type' => $file->getClientMimeType(),
                    ]);
                }
            }

            // Traitement des fichiers de l'etat des lieux
            if ($request->hasFile('signed_inventory')) {
                foreach ($request->file('signed_inventory') as $file) {
                    $path = $file->store($storageFolder, 'public');

                    $lease->documents()->create([
                        'name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'category' => 'signed_inventory',
                        'mime_type' => $file->getClientMimeType(),
                    ]);
                }
            }

            if ($request->hasFile('signed_guarantee')) {
                foreach ($request->file('signed_guarantee') as $file) {
                    $path = $file->store('documents/leases/' . $lease->id, 'public');

                    $lease->documents()->create([
                        'name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'category' => 'signed_guarantee',
                        'mime_type' => $file->getClientMimeType(),
                    ]);
                }
            }
        });

        return back()->with('success', 'Les documents ont ete sauvegardes avec succes.');
    }

    /**
     * Remove the specified document from storage (Soft Delete).
     */
    public function destroy(Document $document)
    {
        // Verification des droits d'acces avant la suppression
        Gate::authorize('delete', $document);

        // Grace au Soft Delete configure sur le modele Document,
        // la ligne en base est marquee comme supprimee mais le fichier physique est conserve.
        $document->delete();

        // On renvoie l'utilisateur sur la page ou il etait
        return back()->with('success', 'Le document a ete retire du dossier.');
    }

    public function storePhotoForLease(Request $request, Lease $lease)
    {
        Gate::authorize('update', $lease);

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:10240',
            'type' => 'required|in:inventory_photo_in,inventory_photo_out',
            'name' => 'nullable|string|max:255',
            'room_id' => 'nullable|exists:rooms,id',
            'equipment_id' => 'nullable|exists:equipments,id',
        ]);

        $file = $request->file('photo');

        // On force l'extension webp pour toutes les images uploadees
        $filename = time() . '_' . Str::random(10) . '.webp';
        $folderPath = "documents/leases/{$lease->id}/inventory";

        // On s'assure que le dossier de destination existe
        if (!Storage::disk('public')->exists($folderPath)) {
            Storage::disk('public')->makeDirectory($folderPath);
        }

        // Initialisation de Intervention avec le driver GD par defaut
        $manager = new ImageManager(new Driver());

        // Lecture de l'image originale
        $image = $manager->read($file->getRealPath());

        // Redimensionnement proportionnel : max 1920px de large
        // Si l'image est plus petite, elle ne sera pas etiree
        $image->scaleDown(width: 1920);

        // Encodage en format WebP avec une qualite de 80%
        $encoded = $image->toWebp(100);

        // Sauvegarde sur le disque public
        $path = $folderPath . '/' . $filename;
        Storage::disk('public')->put($path, $encoded->toString());

        $documentName = $request->name ?: ('Photo ' . ($request->type === 'inventory_photo_in' ? 'Entrée' : 'Sortie'));

        $lease->documents()->create([
            'name' => $documentName,
            'file_path' => $path,
            'category' => $request->type,
            'mime_type' => 'image/webp',
            // On calcule le poids reel du nouveau fichier WebP
            'size' => Storage::disk('public')->size($path),
            'room_id' => $request->room_id,
            'equipment_id' => $request->equipment_id,
        ]);

        return back();
    }

    public function showPublic(Document $document)
    {
        // Sécurité supplémentaire : on s'assure que le fichier est bien une image
        if (!Str::startsWith($document->mime_type, 'image/')) {
            abort(403, 'Ce type de document ne peut pas être affiché publiquement.');
        }

        if (!Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'Le fichier est introuvable sur le serveur.');
        }

        return response()->file(Storage::disk('public')->path($document->file_path));
    }
}
