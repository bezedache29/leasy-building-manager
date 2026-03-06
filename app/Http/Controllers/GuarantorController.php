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
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'current_address' => 'nullable|string',
            'profession' => 'nullable|string|max:255',

            // Documents du garant
            'documents' => 'nullable|array',
            'documents.*.file' => 'required|file|max:5120',
            'documents.*.category' => 'required|string',
            'documents.*.name' => 'required|string',
        ]);

        DB::transaction(function () use ($validated, $tenant) {
            // 1. On isole les infos du garant et on le crée en le liant au locataire
            $guarantorDbData = Arr::except($validated, ['documents']);
            $guarantor = $tenant->guarantors()->create($guarantorDbData);

            // 2. On gère ses documents s'il y en a
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
        });

        // On redirige vers la page du locataire (qu'on va créer juste après)
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
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tenant $tenant, Guarantor $guarantor)
    {
        $guarantor->delete();

        return back()->with('success', 'Garant retiré du dossier (archivé).');
    }
}
