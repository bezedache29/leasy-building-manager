<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Inertia\Inertia;

class TenantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // On charge les locataires avec leurs relations pour éviter le problème "N+1 queries"
        $tenants = Tenant::with(['guarantors', 'documents'])->latest()->get();

        return Inertia::render('Tenants/Index', [
            'tenants' => $tenants
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Tenants/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validation stricte des données entrantes
        $validated = $request->validate([
            // Locataire
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'current_address' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'birth_place' => 'nullable|string|max:255',
            'profession' => 'nullable|string|max:255',
            'notes' => 'nullable|string',

            // Garants
            'guarantors' => 'nullable|array',
            'guarantors.*.first_name' => 'required|string|max:255',
            'guarantors.*.last_name' => 'required|string|max:255',
            'guarantors.*.email' => 'nullable|email',
            'guarantors.*.phone' => 'nullable|string',
            'guarantors.*.current_address' => 'nullable|string',
            'guarantors.*.profession' => 'nullable|string',

            // Documents des garants
            'guarantors.*.documents' => 'nullable|array',
            'guarantors.*.documents.*.file' => 'required|file|max:5120',
            'guarantors.*.documents.*.category' => 'required|string',
            'guarantors.*.documents.*.name' => 'required|string',

            // Documents du locataire
            'tenant_documents' => 'nullable|array',
            'tenant_documents.*.file' => 'required|file|max:5120',
            'tenant_documents.*.category' => 'required|string',
            'tenant_documents.*.name' => 'required|string',
        ]);

        // 2. Exécution dans une Transaction
        DB::transaction(function () use ($validated) {

            // A. Création du locataire
            $tenant = Tenant::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'current_address' => $validated['current_address'] ?? null,
                'birth_date' => $validated['birth_date'] ?? null,
                'birth_place' => $validated['birth_place'] ?? null,
                'profession' => $validated['profession'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            // B. Création des garants et de leurs documents
            if (!empty($validated['guarantors'])) {
                foreach ($validated['guarantors'] as $guarantorData) {

                    // On isole les infos du garant sans les documents
                    $guarantorDbData = \Illuminate\Support\Arr::except($guarantorData, ['documents']);
                    $guarantor = $tenant->guarantors()->create($guarantorDbData);

                    // On boucle directement sur les documents validés du garant
                    if (!empty($guarantorData['documents'])) {
                        foreach ($guarantorData['documents'] as $docData) {
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
            }

            // C. Upload et création des documents du locataire
            if (!empty($validated['tenant_documents'])) {
                foreach ($validated['tenant_documents'] as $docData) {
                    if (isset($docData['file'])) {
                        $file = $docData['file'];
                        $path = $file->store("documents/tenants/{$tenant->id}", 'public');

                        $tenant->documents()->create([
                            'name' => $docData['name'],
                            'file_path' => $path,
                            'category' => $docData['category'],
                            'mime_type' => $file->getMimeType(),
                        ]);
                    }
                }
            }
        });

        // 3. Redirection avec un message de succès
        return redirect()->route('tenants.index')->with('success', 'Dossier locataire créé avec succès.');
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
    public function destroy(string $id)
    {
        //
    }
}
