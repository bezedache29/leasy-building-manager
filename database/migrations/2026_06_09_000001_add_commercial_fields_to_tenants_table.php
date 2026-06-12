<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Discriminateur : personne physique (défaut, rétrocompatible) ou personne morale
            $table->string('tenant_type')->default('physical')->after('id');

            // Champs communs physique (auto-entrepreneur) et morale
            $table->string('siret', 20)->nullable()->after('tenant_type');

            // Champs spécifiques à la personne morale (société)
            $table->string('company_name')->nullable()->after('siret');
            $table->string('legal_form', 100)->nullable()->after('company_name'); // SARL, SAS, EURL...
            $table->decimal('share_capital', 12, 2)->nullable()->after('legal_form'); // Capital social
            $table->string('registered_office')->nullable()->after('share_capital'); // Siège social
            $table->string('rcs_city', 100)->nullable()->after('registered_office'); // Ville du RCS
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'tenant_type',
                'siret',
                'company_name',
                'legal_form',
                'share_capital',
                'registered_office',
                'rcs_city',
            ]);
        });
    }
};
