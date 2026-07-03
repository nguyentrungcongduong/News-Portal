<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'comments_status_created_at_idx');
            $table->index(['report_count', 'created_at'], 'comments_report_count_created_at_idx');
            $table->index(['user_id', 'status'], 'comments_user_id_status_idx');
        });

        Schema::table('comment_reports', function (Blueprint $table) {
            $table->index(['comment_id', 'status'], 'comment_reports_comment_id_status_idx');
            $table->index(['user_id', 'status'], 'comment_reports_user_id_status_idx');
        });
    }

    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->dropIndex('comments_status_created_at_idx');
            $table->dropIndex('comments_report_count_created_at_idx');
            $table->dropIndex('comments_user_id_status_idx');
        });

        Schema::table('comment_reports', function (Blueprint $table) {
            $table->dropIndex('comment_reports_comment_id_status_idx');
            $table->dropIndex('comment_reports_user_id_status_idx');
        });
    }
};
