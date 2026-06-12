<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leases', function (Blueprint $table) {
            $table->timestamp('lease_downloaded_at')->nullable()->after('charges_amount');
            $table->timestamp('inventory_downloaded_at')->nullable()->after('lease_downloaded_at');
        });
    }

    public function down(): void
    {
        Schema::table('leases', function (Blueprint $table) {
            $table->dropColumn(['lease_downloaded_at', 'inventory_downloaded_at']);
        });
    }
};
