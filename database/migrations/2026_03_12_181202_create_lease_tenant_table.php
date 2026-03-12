<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lease_tenant', function (Blueprint $table) {
            $table->id();

            // Clés étrangères vers le bail et le locataire
            $table->foreignId('lease_id')->constrained()->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');

            // Permet de désigner un locataire principal pour les courriers/quittances
            $table->boolean('is_main_tenant')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lease_tenant');
    }
};
