<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guarantors', function (Blueprint $table) {
            $table->string('visale_contract_number')->nullable()->after('type');
        });
    }

    public function down(): void
    {
        Schema::table('guarantors', function (Blueprint $table) {
            $table->dropColumn('visale_contract_number');
        });
    }
};
