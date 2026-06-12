<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leases', function (Blueprint $table) {
            $table->id();

            // Relation uniquement vers le bien (la relation locataire passe par la table pivot)
            $table->foreignId('property_id')->constrained()->onDelete('cascade');

            // Période
            $table->date('start_date');
            $table->date('end_date')->nullable();

            // Finances
            $table->decimal('rent_amount', 8, 2);
            $table->decimal('charges_amount', 8, 2);
            $table->decimal('deposit_amount', 8, 2)->nullable();

            // Modalités
            $table->integer('payment_day')->default(1);
            $table->string('status')->default('active');
            $table->timestamp('pdf_downloaded_at')->nullable();

            // Informations sur l'assurance
            $table->string('insurer_name')->nullable();
            $table->string('insurer_address')->nullable();
            $table->string('insurer_phone')->nullable();

            // Remise des clefs
            $table->integer('keys_building_count')->default(0);
            $table->integer('keys_mailbox_count')->default(0);
            $table->integer('keys_apartment_count')->default(0);

            // État des lieux
            $table->boolean('has_entry_inventory')->default(false);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leases');
    }
};
