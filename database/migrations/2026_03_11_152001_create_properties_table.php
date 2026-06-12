<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();

            // Identification du bien
            $table->string('name'); // ex: "Appartement 1", "Garage B"
            $table->string('type')->default('apartment'); // apartment, studio, garage, commercial...
            $table->integer('floor'); // Étage

            // Métriques pour le calcul des charges et loyers
            $table->decimal('surface_area', 8, 2)->nullable(); // Surface en m²
            $table->integer('tantiemes_water')->nullable(); // Clé Générale (Base 10000)
            $table->integer('tantiemes_commons')->nullable(); // Clé Bâtiment (Base 1000)

            // Informations complémentaires
            $table->text('description')->nullable();
            $table->text('notes')->nullable(); // Notes internes invisibles sur les documents officiels

            // Traçabilité et archivage
            $table->timestamps();
            $table->softDeletes(); // Application stricte du Soft Delete
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
