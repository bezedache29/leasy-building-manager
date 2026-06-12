<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Profil résidentiel actif (vrai par défaut pour la rétrocompatibilité)
            $table->boolean('has_residential')->default(true)->after('tenant_type');
            // Profil commercial actif (faux par défaut)
            $table->boolean('has_commercial')->default(false)->after('has_residential');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['has_residential', 'has_commercial']);
        });
    }
};
