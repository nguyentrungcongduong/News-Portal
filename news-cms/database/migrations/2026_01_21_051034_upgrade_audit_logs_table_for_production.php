<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('audit_logs')) {
            $driver = Schema::getConnection()->getDriverName();

            // Only rename if columns exist
            if (Schema::hasColumn('audit_logs', 'target_type') && !Schema::hasColumn('audit_logs', 'subject_type')) {
                $this->renameColumn('audit_logs', 'target_type', 'subject_type', $driver, 'VARCHAR(255)');
            }
            if (Schema::hasColumn('audit_logs', 'target_id') && !Schema::hasColumn('audit_logs', 'subject_id')) {
                $this->renameColumn('audit_logs', 'target_id', 'subject_id', $driver, 'BIGINT UNSIGNED');
            }
            
            // Add before/after columns if not exist
            Schema::table('audit_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('audit_logs', 'before')) {
                    $table->json('before')->nullable()->after('subject_id');
                }
                if (!Schema::hasColumn('audit_logs', 'after')) {
                    $table->json('after')->nullable()->after('before');
                }
            });
            
            // Update indexes
            Schema::table('audit_logs', function (Blueprint $table) {
                // Drop old index if exists (might have different name)
                try {
                    $table->dropIndex(['target_type', 'target_id']);
                } catch (\Exception $e) {
                    // Index might not exist or have different name
                }
                
                // Add new indexes
                if (!$this->hasIndex('audit_logs', 'audit_logs_subject_type_subject_id_index')) {
                    $table->index(['subject_type', 'subject_id']);
                }
                if (!$this->hasIndex('audit_logs', 'audit_logs_created_at_index')) {
                    $table->index('created_at');
                }
            });
        }
    }

    protected function hasIndex($table, $indexName): bool
    {
        $connection = DB::connection();
        $driver = $connection->getDriverName();

        if ($driver === 'pgsql') {
            $schema = $connection->getConfig('schema') ?? 'public';
            $result = $connection->select(
                "SELECT COUNT(*) as count FROM pg_indexes WHERE schemaname = ? AND tablename = ? AND indexname = ?",
                [$schema, $table, $indexName]
            );
            return !empty($result) && $result[0]->count > 0;
        }

        if ($driver === 'sqlite') {
            $result = $connection->select("PRAGMA index_list({$table})");
            foreach ($result as $row) {
                if (($row->name ?? null) === $indexName) {
                    return true;
                }
            }
            return false;
        }

        // Default to MySQL-compatible information_schema lookup
        $database = $connection->getDatabaseName();
        $result = $connection->select(
            "SELECT COUNT(*) as count FROM information_schema.statistics WHERE table_schema = ? AND table_name = ? AND index_name = ?",
            [$database, $table, $indexName]
        );
        return !empty($result) && $result[0]->count > 0;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('audit_logs')) {
            $driver = Schema::getConnection()->getDriverName();

            // Drop new indexes
            Schema::table('audit_logs', function (Blueprint $table) {
                try {
                    $table->dropIndex('audit_logs_subject_type_subject_id_index');
                } catch (\Exception $e) {}
                try {
                    $table->dropIndex('audit_logs_created_at_index');
                } catch (\Exception $e) {}
                
                // Drop before/after columns
                if (Schema::hasColumn('audit_logs', 'before')) {
                    $table->dropColumn('before');
                }
                if (Schema::hasColumn('audit_logs', 'after')) {
                    $table->dropColumn('after');
                }
            });
            
            // Rename back
            if (Schema::hasColumn('audit_logs', 'subject_type') && !Schema::hasColumn('audit_logs', 'target_type')) {
                $this->renameColumn('audit_logs', 'subject_type', 'target_type', $driver, 'VARCHAR(255)');
            }
            if (Schema::hasColumn('audit_logs', 'subject_id') && !Schema::hasColumn('audit_logs', 'target_id')) {
                $this->renameColumn('audit_logs', 'subject_id', 'target_id', $driver, 'BIGINT UNSIGNED');
            }
            
            // Restore old index
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->index(['target_type', 'target_id']);
            });
        }
    }
    protected function renameColumn(string $table, string $from, string $to, string $driver, string $mysqlType): void
    {
        if (in_array($driver, ['pgsql', 'sqlite', 'sqlsrv'])) {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE {$table} RENAME COLUMN {$from} TO {$to}");
            return;
        }

        // Default to MySQL syntax
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE {$table} CHANGE {$from} {$to} {$mysqlType}");
    }
};
