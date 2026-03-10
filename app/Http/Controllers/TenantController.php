<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Guarantor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TenantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // 1. On "Eager Load" les relations nécessaires pour éviter les requêtes N+1
        $tenants = Tenant::with(['documents', 'guarantors.documents'])
            ->get()
            ->append('is_complete');

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
            'marital_status' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'current_address' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'birth_place' => 'nullable|string|max:255',
            'nationality' => 'nullable|string|max:255',
            'profession' => 'nullable|string|max:255',
            'notes' => 'nullable|string',

            // Garants
            'guarantors' => 'nullable|array',
            'guarantors.*.first_name' => 'required|string|max:255',
            'guarantors.*.last_name' => 'required|string|max:255',
            'guarantors.*.marital_status' => 'nullable|string|max:255',
            'guarantors.*.relationship' => 'nullable|string|max:255',
            'guarantors.*.email' => 'nullable|email',
            'guarantors.*.phone' => 'nullable|string',
            'guarantors.*.current_address' => 'nullable|string',
            'guarantors.*.birth_date' => 'nullable|date',
            'guarantors.*.birth_place' => 'nullable|string|max:255',
            'guarantors.*.nationality' => 'nullable|string|max:255',
            'guarantors.*.profession' => 'nullable|string',

            // Documents des garants
            'guarantors.*.documents' => 'nullable|array',
            'guarantors.*.documents.*.file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx',
            'guarantors.*.documents.*.category' => [
                'required',
                'string',
                Rule::in(['id_card', 'proof_of_address', 'employment_contract', 'payslip', 'tax_notice', 'guarantee_deed', 'other'])
            ],
            'guarantors.*.documents.*.name' => 'required|string',

            // Documents du locataire
            'tenant_documents' => 'nullable|array',
            'tenant_documents.*.file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx',
            'tenant_documents.*.category' => [
                'required',
                'string',
                Rule::in(['id_card', 'proof_of_address', 'employment_contract', 'payslip', 'tax_notice', 'bank_details', 'insurance', 'lease', 'inventory', 'deposit_check', 'other'])
            ],
            'tenant_documents.*.name' => 'required|string',
        ]);

        // 2. Exécution dans une Transaction
        DB::transaction(function () use ($validated) {

            // A. Création du locataire
            $tenant = Tenant::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'marital_status' => $validated['marital_status'] ?? null,
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'current_address' => $validated['current_address'] ?? null,
                'birth_date' => $validated['birth_date'] ?? null,
                'birth_place' => $validated['birth_place'] ?? null,
                'nationality' => $validated['nationality'] ?? null,
                'profession' => $validated['profession'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            if (!empty($validated['guarantors'])) {
                foreach ($validated['guarantors'] as $guarantorData) {

                    // On isole les infos du garant pur (sans documents ni relationship de la table pivot)
                    $guarantorDbData = Arr::except($guarantorData, ['documents', 'relationship']);

                    // 1. On crée le garant de manière isolée
                    $guarantor = Guarantor::create($guarantorDbData);

                    // 2. On l'attache au locataire via la table pivot (en y ajoutant le lien de parenté)
                    $tenant->guarantors()->attach($guarantor->id, [
                        'relationship' => $guarantorData['relationship'] ?? null
                    ]);

                    // 3. On boucle sur les documents validés du garant
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
    public function show(Tenant $tenant)
    {
        // 1. On s'assure que toutes les relations du locataire sont chargées
        $tenant->loadMissing(['documents', 'guarantors.documents']);

        // 2. On ajoute manuellement les deux attributs lourds pour cette vue précise
        $tenant->append(['is_complete', 'missing_items']);

        $availableGuarantors = Guarantor::orderBy('last_name')->get();

        return Inertia::render('Tenants/Show', [
            'tenant' => $tenant,
            'availableGuarantors' => $availableGuarantors ?? [],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tenant $tenant)
    {
        $tenant->load(['documents', 'guarantors.documents']);

        return Inertia::render('Tenants/Edit', [
            'tenant' => $tenant
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tenant $tenant)
    {
        // 1. Validation avec la liste stricte des catégories
        $validated = $request->validate([
            'first_name'      => 'required|string|max:255',
            'last_name'       => 'required|string|max:255',
            'marital_status'  => 'nullable|string|max:255',
            'email'           => ['nullable', 'email', 'max:255', Rule::unique('tenants')->ignore($tenant->id)],
            'phone'           => 'nullable|string|max:255',
            'current_address' => 'nullable|string',
            'birth_date'      => 'nullable|date',
            'birth_place'     => 'nullable|string|max:255',
            'nationality'     => 'nullable|string|max:255',
            'profession'      => 'nullable|string|max:255',
            'notes'           => 'nullable|string',

            // Validation des nouveaux documents
            'tenant_documents' => 'nullable|array',
            'tenant_documents.*.file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx',
            'tenant_documents.*.name' => 'required|string',
            'tenant_documents.*.category' => [
                'required',
                'string',
                Rule::in([
                    'id_card',
                    'proof_of_address',
                    'employment_contract',
                    'payslip',
                    'tax_notice',
                    'bank_details',
                    'insurance',
                    'lease',
                    'inventory',
                    'deposit_check',
                    'other'
                ])
            ],
        ]);

        // 2. Transaction pour sécuriser la mise à jour et l'upload
        DB::transaction(function () use ($validated, $tenant, $request) {
            $tenant->update($validated);

            // Traitement des nouveaux fichiers
            if ($request->has('tenant_documents')) {
                foreach ($request->input('tenant_documents') as $index => $docData) {
                    $file = $request->file("tenant_documents.{$index}.file");

                    if ($file) {
                        $path = $file->store("documents/tenants/{$tenant->id}", 'public');

                        $tenant->documents()->create([
                            'name'      => $docData['name'],
                            'file_path' => $path,
                            'category'  => $docData['category'],
                            'mime_type' => $file->getMimeType(),
                        ]);
                    }
                }
            }
        });

        return redirect()->route('tenants.show', $tenant)->with('success', 'Dossier mis à jour.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tenant $tenant)
    {
        $tenant->delete();

        return redirect()->route('tenants.index')->with('success', 'Le dossier locataire a été archivé.');
    }
}
