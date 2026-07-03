<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $duplicates = DB::table('breaking_news')
            ->select('tenant_id', 'post_id', DB::raw('MAX(id) as keep_id'))
            ->groupBy('tenant_id', 'post_id')
            ->get();

        foreach ($duplicates as $duplicate) {
            DB::table('breaking_news')
                ->where('post_id', $duplicate->post_id)
                ->where('id', '!=', $duplicate->keep_id)
                ->when(
                    is_null($duplicate->tenant_id),
                    fn ($query) => $query->whereNull('tenant_id'),
                    fn ($query) => $query->where('tenant_id', $duplicate->tenant_id)
                )
                ->delete();
        }

        Schema::table('breaking_news', function (Blueprint $table) {
            $table->unique(['tenant_id', 'post_id'], 'breaking_news_tenant_post_unique');
        });
    }

    public function down(): void
    {
        Schema::table('breaking_news', function (Blueprint $table) {
            $table->dropUnique('breaking_news_tenant_post_unique');
        });
    }
};
