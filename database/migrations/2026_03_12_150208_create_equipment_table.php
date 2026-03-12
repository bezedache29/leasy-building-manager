<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->string('name'); // ex: "Prise murale", "Radiateur"
            $table->string('type')->nullable(); // ex: "Électricité", "Menuiserie"
            $table->integer('quantity')->default(1);
            $table->text('notes')->nullable(); // État, marque, etc.
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipments');
    }
};
