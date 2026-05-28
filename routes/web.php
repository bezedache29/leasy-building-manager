<?php

use App\Http\Controllers\AnnualChargeController;
use App\Http\Controllers\CandidatureController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\GuarantorController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LeaseController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\TenantController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/properties/{property}/inventory', [InventoryController::class, 'show'])
    ->name('properties.inventory')
    ->middleware('signed');

Route::get('/documents/{document}/public', [DocumentController::class, 'showPublic'])
    ->name('documents.public')
    ->middleware('signed');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // Locataires
    Route::resource('tenants', TenantController::class);

    // Garants
    Route::post('/tenants/{tenant}/guarantors', [GuarantorController::class, 'store'])->name('tenants.guarantors.store');
    Route::put('/tenants/{tenant}/guarantors/{guarantor}', [GuarantorController::class, 'update'])->name('tenants.guarantors.update');
    Route::delete('/tenants/{tenant}/guarantors/{guarantor}', [GuarantorController::class, 'destroy'])->name('tenants.guarantors.destroy');
    Route::get('/leases/{lease}/guarantors/{guarantor}/pdf', [LeaseController::class, 'downloadGuarantee'])
        ->name('leases.guarantors.pdf');

    // Routes pour la gestion des documents
    Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');
    Route::put('/documents/{document}', [DocumentController::class, 'update'])->name('documents.update');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    Route::resource('properties', PropertyController::class);

    // Routes pour les pièces
    Route::post('/properties/{property}/rooms', [RoomController::class, 'store'])->name('rooms.store');
    Route::put('/rooms/{room}', [RoomController::class, 'update'])->name('rooms.update');
    Route::delete('/rooms/{room}', [RoomController::class, 'destroy'])->name('rooms.destroy');

    // Routes pour les équipements
    Route::post('/rooms/{room}/equipments', [EquipmentController::class, 'store'])->name('equipments.store');
    Route::put('/equipments/{equipment}', [EquipmentController::class, 'update'])->name('equipments.update');
    Route::delete('/equipments/{equipment}', [EquipmentController::class, 'destroy'])->name('equipments.destroy');

    // Routes pour les baux (Leases)
    Route::get('/leases/create', [LeaseController::class, 'create'])->name('leases.create');
    Route::get('/leases/{lease}/edit', [LeaseController::class, 'edit'])->name('leases.edit');
    Route::post('/leases', [LeaseController::class, 'store'])->name('leases.store');
    Route::put('/leases/{lease}', [LeaseController::class, 'update'])->name('leases.update');
    Route::patch('/leases/{lease}/terminate', [LeaseController::class, 'terminate'])->name('leases.terminate');

    Route::get('/leases/{lease}/pdf', [LeaseController::class, 'pdf'])->name('leases.pdf');
    Route::post('/leases/{lease}/documents', [DocumentController::class, 'storeForLease'])->name('leases.documents.store');
    Route::post('/leases/{lease}/photos', [DocumentController::class, 'storePhotoForLease'])->name('leases.photos.store');
    Route::get('/leases/{lease}/inventory/{type}/pdf', [LeaseController::class, 'generateInventoryPdf'])->name('leases.inventory.pdf');

    // Génération d'un acte de cautionnement sans bail (phase de candidature)
    Route::get('/properties/{property}/candidature/acte', [CandidatureController::class, 'generateActe'])
        ->name('properties.candidature.acte');

    Route::get('/properties/{property}/annual-charges/create', [AnnualChargeController::class, 'create'])->name('properties.annual-charges.create');
    Route::post('/properties/{property}/annual-charges', [AnnualChargeController::class, 'store'])->name('properties.annual-charges.store');
    Route::get('/properties/{property}/annual-charges/{settlement}/review', [AnnualChargeController::class, 'review'])->name('properties.annual-charges.review');


    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
