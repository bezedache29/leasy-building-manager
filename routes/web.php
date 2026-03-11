<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\GuarantorController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\TenantController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // Locataires
    Route::resource('tenants', TenantController::class);

    // Garants
    Route::post('/tenants/{tenant}/guarantors', [GuarantorController::class, 'store'])->name('tenants.guarantors.store');
    Route::put('/tenants/{tenant}/guarantors/{guarantor}', [GuarantorController::class, 'update'])->name('tenants.guarantors.update');
    Route::delete('/tenants/{tenant}/guarantors/{guarantor}', [GuarantorController::class, 'destroy'])->name('tenants.guarantors.destroy');

    // Routes pour la gestion des documents
    Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    Route::resource('properties', PropertyController::class);

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
