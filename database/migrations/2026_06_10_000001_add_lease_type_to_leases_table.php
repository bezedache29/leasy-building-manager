<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leases', function (Blueprint $table) {
            // Type de bail : residential (Alur), commercial (L145-1 C.com.), professional (art. 57A loi 1986)
            $table->string('lease_type', 20)->default('residential')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('leases', function (Blueprint $table) {
            $table->dropColumn('lease_type');
        });
    }
};
