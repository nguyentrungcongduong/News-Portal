<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Get first tenant
        $tenantId = DB::table('tenants')->first()->id ?? 1;
        
        // Update all users without tenant_id
        DB::table('users')
            ->whereNull('tenant_id')
            ->update(['tenant_id' => $tenantId]);
    }

    public function down(): void
    {
        //
    }
};
