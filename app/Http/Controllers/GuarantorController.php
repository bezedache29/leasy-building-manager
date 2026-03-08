<?php

namespace App\Http\Controllers;

use App\Models\Guarantor;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class GuarantorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'guarantor_id' => 'nullable|exists:guarantors,id',
            'first_name' => 'required_without:guarantor_id|string|max:255|nullable',
            'last_name' => 'required_without:guarantor_id|string|max:255|nullable',
            'marital_status' => 'nullable|string|max:255',
            'relationship' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'current_address' => 'nullable|string',
            'profession' => 'nullable|string|max:255',

            // Documents du garant
            'documents' => 'nullable|array',
            'documents.*.file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx',
            'documents.*.category' => 'required|string',
            'documents.*.name' => 'required|string',
        ]);

        DB::transaction(function () use ($validated, $tenant) {

            // CAS 1 : C'est un garant existant qu'on rattache au dossier
            if (!empty($validated['guarantor_id'])) {
                // syncWithoutDetaching empêche de dupliquer l'entrée dans la table pivot
                $tenant->guarantors()->syncWithoutDetaching([
                    $validated['guarantor_id'] => ['relationship' => $validated['relationship'] ?? null]
                ]);
            }
            // CAS 2 : C'est un tout nouveau garant
            else {
                // 1. On isole les infos du garant et on le crée
                $guarantorDbData = Arr::except($validated, ['documents', 'relationship', 'guarantor_id']);
                $guarantor = Guarantor::create($guarantorDbData);

                // 2. On l'attache au locataire avec le lien de parenté (Table Pivot)
                $tenant->guarantors()->attach($guarantor->id, [
                    'relationship' => $validated['relationship'] ?? null
                ]);

                // 3. On gère ses documents s'il y en a
                if (!empty($validated['documents'])) {
                    foreach ($validated['documents'] as $docData) {
                        if (isset($docData['file'])) {
                            $file = $docData['file'];
                            $path = $file->store("documents/guarantors/{$guarantor->id}", 'public');

                            $guarantor->documents()->create([
                                'name' => $docData['name'],
                                'file_path' => $path,
                                'category' => $docData['category'],
                                'mime_type' => $file->getMimeType(),
                            ]);
                        }
                    }
                }
            }
        });

        return back()->with('success', 'Garant ajouté avec succès au dossier.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tenant $tenant, Guarantor $guarantor)
    {
        // 🔒 Sécurité anti-IDOR : On vérifie que le garant qu'on essaie de modifier est bien rattaché à ce locataire
        if (!$tenant->guarantors()->where('guarantor_id', $guarantor->id)->exists()) {
            abort(404);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'marital_status' => 'nullable|string|max:255',
            'relationship' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'current_address' => 'nullable|string',
            'profession' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($validated, $tenant, $guarantor) {
            // 1. On met à jour les informations pures du garant
            $guarantorDbData = Arr::except($validated, ['relationship']);
            $guarantor->update($guarantorDbData);

            // 2. On met à jour spécifiquement le lien de parenté dans la table pivot pour CE locataire
            $tenant->guarantors()->updateExistingPivot($guarantor->id, [
                'relationship' => $validated['relationship'] ?? null
            ]);
        });

        return back()->with('success', 'Les informations du garant ont été modifiées.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tenant $tenant, Guarantor $guarantor)
    {
        // 🔒 Sécurité anti-IDOR : On vérifie dans la table pivot que le garant est bien lié à ce locataire
        if (!$tenant->guarantors()->where('guarantor_id', $guarantor->id)->exists()) {
            abort(404);
        }

        $guarantor->delete();

        return back()->with('success', 'Garant retiré du dossier (archivé).');
    }
}
