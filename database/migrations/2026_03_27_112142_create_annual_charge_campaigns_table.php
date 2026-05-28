<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annual_charge_campaigns', function (Blueprint $table) {
            $table->id();

            // annee de la campagne de regularisation (ex: 2023)
            $table->integer('year')->unique();

            // stockage des tarifs unitaires saisis (0.9190, 0.4880, abonnements...) pour historique
            $table->json('water_rates_history')->nullable();

            // montants globaux des factures payees par le proprietaire
            $table->decimal('total_water_invoice', 8, 2)->nullable();
            $table->decimal('total_water_consumption', 8, 2)->nullable();
            $table->decimal('total_electricity_invoice', 8, 2)->nullable();
            $table->decimal('total_garbage_invoice', 8, 2)->nullable();
            $table->decimal('total_cleaning_invoice', 8, 2)->nullable();

            $table->timestamps();

            // suppression douce pour ne jamais perdre l'historique d'une annee
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annual_charge_campaigns');
    }
};
