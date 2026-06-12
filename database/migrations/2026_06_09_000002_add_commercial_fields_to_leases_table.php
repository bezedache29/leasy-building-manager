<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leases', function (Blueprint $table) {
            // Destination des lieux (obligatoire pour bail commercial — art. L145-1 C.com.)
            $table->text('activity_description')->nullable()->after('status');

            // Indice ILC de base (bail commercial) — enregistré à la signature du bail
            $table->string('base_index_label', 50)->nullable()->after('activity_description'); // ex: "4ème trimestre 2016"
            $table->decimal('base_index_value', 8, 2)->nullable()->after('base_index_label'); // ex: 108.91

            // Clé grille / vitrine (même clé physique pour la grille et la porte d'entrée du local)
            $table->integer('keys_grid_count')->default(0)->after('keys_apartment_count');
        });
    }

    public function down(): void
    {
        Schema::table('leases', function (Blueprint $table) {
            $table->dropColumn([
                'activity_description',
                'base_index_label',
                'base_index_value',
                'keys_grid_count',
            ]);
        });
    }
};
