<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_annual_settlements', function (Blueprint $table) {
            $table->id();

            // cles etrangeres vers la campagne de l'annee et le bail du locataire
            $table->foreignId('annual_charge_campaign_id')->constrained()->onDelete('cascade');
            $table->foreignId('lease_id')->constrained()->onDelete('cascade');

            // releves du sous-compteur d'eau
            $table->decimal('water_meter_old', 8, 2)->nullable();
            $table->decimal('water_meter_new', 8, 2)->nullable();
            $table->decimal('water_consumption', 8, 2)->nullable();

            // charges d'eau (calcul theorique vs ajustement manuel)
            $table->decimal('water_calc', 8, 2)->default(0);
            $table->decimal('water_override', 8, 2)->nullable();

            // ordures menageres (calcul theorique vs ajustement manuel)
            $table->decimal('garbage_calc', 8, 2)->default(0);
            $table->decimal('garbage_override', 8, 2)->nullable();

            // electricite des communs (calcul theorique vs ajustement manuel)
            $table->decimal('electricity_calc', 8, 2)->default(0);
            $table->decimal('electricity_override', 8, 2)->nullable();

            // menage des communs (calcul theorique vs ajustement manuel)
            $table->decimal('cleaning_calc', 8, 2)->default(0);
            $table->decimal('cleaning_override', 8, 2)->nullable();

            // bilan financier du locataire
            $table->decimal('total_provisions', 8, 2)->default(0);
            $table->decimal('final_balance', 8, 2)->nullable();

            $table->timestamps();

            // suppression douce pour garder l'historique des regularisations
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_annual_settlements');
    }
};
