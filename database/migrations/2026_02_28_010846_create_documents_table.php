<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();

            // C'est la magie de Laravel : crée documentable_type et documentable_id
            $table->morphs('documentable');

            $table->string('name'); // ex: "Carte d'identité", "Bail signé", "État des lieux entrant"
            $table->string('file_path'); // Le chemin dans storage/app/public
            $table->string('category')->nullable(); // Pour filtrer (ex: 'id_card', 'payslip', 'contract')
            $table->string('mime_type')->nullable(); // ex: 'application/pdf', 'image/jpeg'

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
