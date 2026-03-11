<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * Display the specified document.
     */
    public function show(Document $document)
    {
        // 1. Autorisation (vérifie que l'utilisateur a le droit de voir ce document)
        Gate::authorize('view', $document);

        // 2. Vérification de l'existence physique du fichier
        if (!Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'Le fichier est introuvable sur le serveur.');
        }

        // 3. Retourne le fichier pour affichage dans le navigateur
        return response()->file(Storage::disk('public')->path($document->file_path));
    }

    /**
     * Remove the specified document from storage (Soft Delete).
     */
    public function destroy(Document $document)
    {
        // Vérification des droits d'accès avant la suppression
        Gate::authorize('delete', $document);

        // Grâce au Soft Delete configuré sur le modèle Document,
        // la ligne en base est marquée comme supprimée mais le fichier physique est conservé.
        $document->delete();

        // On renvoie l'utilisateur sur la page où il était
        return back()->with('success', 'Le document a été retiré du dossier.');
    }
}
