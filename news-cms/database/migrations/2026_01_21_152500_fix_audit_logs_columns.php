<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('audit_logs')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();

        if (Schema::hasColumn('audit_logs', 'target_type') && !Schema::hasColumn('audit_logs', 'subject_type')) {
            $this->renameColumn('audit_logs', 'target_type', 'subject_type', $driver, 'VARCHAR(255)');
        }

        if (Schema::hasColumn('audit_logs', 'target_id') && !Schema::hasColumn('audit_logs', 'subject_id')) {
            $this->renameColumn('audit_logs', 'target_id', 'subject_id', $driver, 'BIGINT UNSIGNED');
        }

        Schema::table('audit_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('audit_logs', 'before')) {
                $table->json('before')->nullable();
            }

            if (!Schema::hasColumn('audit_logs', 'after')) {
                $table->json('after')->nullable();
            }

            if (!Schema::hasColumn('audit_logs', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }

            if (!Schema::hasColumn('audit_logs', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });

        // Ensure composite index exists for faster lookups
        if ($driver === 'pgsql') {
            DB::statement('CREATE INDEX IF NOT EXISTS audit_logs_subject_type_subject_id_index ON audit_logs (subject_type, subject_id)');
        } elseif ($driver === 'mysql') {
            DB::statement('CREATE INDEX IF NOT EXISTS audit_logs_subject_type_subject_id_index ON audit_logs (subject_type, subject_id)');
        } else {
            try {
                Schema::table('audit_logs', function (Blueprint $table) {
                    $table->index(['subject_type', 'subject_id']);
                });
            } catch (\Throwable $e) {
                // ignore if index already exists or not supported
            }
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('audit_logs')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();

        if (Schema::hasColumn('audit_logs', 'subject_type') && !Schema::hasColumn('audit_logs', 'target_type')) {
            $this->renameColumn('audit_logs', 'subject_type', 'target_type', $driver, 'VARCHAR(255)');
        }

        if (Schema::hasColumn('audit_logs', 'subject_id') && !Schema::hasColumn('audit_logs', 'target_id')) {
            $this->renameColumn('audit_logs', 'subject_id', 'target_id', $driver, 'BIGINT UNSIGNED');
        }

        Schema::table('audit_logs', function (Blueprint $table) {
            if (Schema::hasColumn('audit_logs', 'before')) {
                $table->dropColumn('before');
            }

            if (Schema::hasColumn('audit_logs', 'after')) {
                $table->dropColumn('after');
            }

            if (Schema::hasColumn('audit_logs', 'created_at')) {
                $table->dropColumn('created_at');
            }

            if (Schema::hasColumn('audit_logs', 'updated_at')) {
                $table->dropColumn('updated_at');
            }
        });
    }

    private function renameColumn(string $table, string $from, string $to, string $driver, string $mysqlType): void
    {
        if (in_array($driver, ['pgsql', 'sqlite', 'sqlsrv'])) {
            DB::statement("ALTER TABLE {$table} RENAME COLUMN {$from} TO {$to}");
            return;
        }

        // Default to MySQL syntax
        DB::statement("ALTER TABLE {$table} CHANGE {$from} {$to} {$mysqlType}");
    }
};
