<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Guarantor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TenantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tenants = Tenant::with([
            'documents',
            'guarantors.documents',
            'leases' => function ($query) {
                // Tri des baux du plus récent au plus ancien
                $query->orderBy('start_date', 'desc')->with('property');
            }
        ])
            ->get()
            ->append('is_complete')
            ->sortByDesc(function ($tenant) {
                // Création d'une clé de tri magique !
                // Ex: Si actif aujourd'hui -> "1_2026-03-13"
                // Ex: Si ancien locataire -> "0_2024-12-01"
                $isActive = $tenant->leases->contains('status', 'active') ? '1' : '0';
                $latestDate = $tenant->leases->first()->start_date ?? '0000-00-00';

                return $isActive . '_' . $latestDate;
            })
            ->values(); // IMPORTANT : On réinitialise l'index du tableau pour React

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
        // On applique le meme tri decroissant pour la page de detail du locataire
        $tenant->loadMissing([
            'documents',
            'guarantors.documents',
            'leases' => function ($query) {
                $query->orderBy('start_date', 'desc')->with('property');
            }
        ]);

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
        // 1. Validation avec la liste stricte des catégories [cite: 2026-03-10]
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

        // Tableau pour traquer les chemins des fichiers fraîchement uploadés
        $storedPaths = [];

        DB::beginTransaction();

        try {
            // Mise à jour des informations de base
            $tenant->update($validated);

            // Traitement des nouveaux fichiers via la dot-notation [cite: 2026-02-19]
            if ($request->has('tenant_documents')) {
                foreach ($request->input('tenant_documents') as $index => $docData) {
                    $file = $request->file("tenant_documents.{$index}.file");

                    if ($file) {
                        // 1. Stockage du fichier
                        $path = $file->store("documents/tenants/{$tenant->id}", 'public');

                        // 2. On garde une trace du chemin en cas de rollback
                        $storedPaths[] = $path;

                        // 3. Création de l'enregistrement en base
                        $tenant->documents()->create([
                            'name'      => $docData['name'],
                            'file_path' => $path,
                            'category'  => $docData['category'],
                            'mime_type' => $file->getMimeType(),
                        ]);
                    }
                }
            }

            // Tout s'est bien passé, on valide la transaction en base
            DB::commit();
        } catch (\Throwable $e) {
            // En cas d'erreur (SQL, etc.), on annule les écritures en base de données
            DB::rollBack();

            // Et on supprime physiquement les fichiers orphelins qui venaient d'être uploadés
            if (!empty($storedPaths)) {
                Storage::disk('public')->delete($storedPaths);
            }

            // On relance l'exception pour que Laravel puisse la gérer (affichage d'erreur 500, logs, etc.)
            throw $e;
        }

        return redirect()->route('tenants.show', $tenant)->with('success', 'Dossier mis à jour avec succès.');
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
