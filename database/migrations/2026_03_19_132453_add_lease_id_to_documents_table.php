<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // Ajout du lease_id, nullable car certains documents (carte d'identite...) ne sont pas lies a un bail
            $table->foreignId('lease_id')->nullable()->constrained('leases')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['lease_id']);
            $table->dropColumn('lease_id');
        });
    }
};
