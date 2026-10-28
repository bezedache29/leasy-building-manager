<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            // Compteur électrique individuel à la charge du locataire.
            // Vrai par défaut : c'est le cas de la plupart des logements de l'immeuble.
            // Faux (ex. le studio) : l'électricité du logement est comprise dans les charges.
            $table->boolean('has_individual_electricity_meter')->default(true)->after('tantiemes_commons');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn('has_individual_electricity_meter');
        });
    }
};
