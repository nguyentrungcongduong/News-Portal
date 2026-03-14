<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;
use App\Models\Post;
use App\Models\PostViewStat;
use Illuminate\Support\Facades\Log;

class SyncPostViews extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'app:sync-post-views';

    /**
     * The console command description.
     */
    protected $description = 'Sync total and daily post view counts from Redis to the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            if (!extension_loaded('redis') && config('database.redis.client') !== 'predis') {
                $this->warn('Redis/Predis not available. Skipping sync.');
                return;
            }

            $prefix = config('database.redis.options.prefix', '');
            $today = now()->format('Ymd');
            $dbDate = now()->format('Y-m-d');

            // 1. Sync Total Views (post:{id}:views)
            $totalKeys = Redis::keys('post:*:views');
            $syncedTotal = 0;
            foreach ($totalKeys as $key) {
                $cleanKey = str_replace($prefix, '', $key);
                // Regex matches post:{id}:views but NOT post:{id}:views:{date}
                if (preg_match('/post:(\d+):views$/', $cleanKey, $matches)) {
                    $postId = $matches[1];
                    $views = (int) Redis::getset($cleanKey, 0);

                    if ($views > 0) {
                        Post::where('id', $postId)->increment('views', $views);
                        $syncedTotal++;
                    }
                    Redis::del($cleanKey);
                }
            }

            // 2. Sync Daily Stats (post:{id}:views:{date})
            // We search for all date keys to ensure we catch any late views from previous days if they exist
            $dailyKeys = Redis::keys('post:*:views:20*'); // Matches 20xx dates
            $syncedDaily = 0;
            foreach ($dailyKeys as $key) {
                $cleanKey = str_replace($prefix, '', $key);
                if (preg_match('/post:(\d+):views:(\d{8})$/', $cleanKey, $matches)) {
                    $postId = $matches[1];
                    $dateStr = $matches[2];
                    $dateObj = \DateTime::createFromFormat('Ymd', $dateStr);
                    $formattedDate = $dateObj->format('Y-m-d');

                    $views = (int) Redis::getset($cleanKey, 0);

                    if ($views > 0) {
                        PostViewStat::updateOrCreate(
                            ['post_id' => $postId, 'date' => $formattedDate],
                            ['views' => \Illuminate\Support\Facades\DB::raw("views + $views")]
                        );
                        $syncedDaily++;
                    }
                    
                    // If it's not today's key, we can safely delete it. 
                    // If it IS today's key, we also delete it because we just synced it to DB.
                    // The next view will recreate it.
                    Redis::del($cleanKey);
                }
            }

            // 3. Sync Global Site Views (site:{tenant_id}:views:{date})
            $siteKeys = Redis::keys('site:*:views:20*');
            $syncedSite = 0;
            foreach ($siteKeys as $key) {
                $cleanKey = str_replace($prefix, '', $key);
                if (preg_match('/site:(\d+):views:(\d{8})$/', $cleanKey, $matches)) {
                    $tenantId = $matches[1];
                    $dateStr = $matches[2];
                    $dateObj = \DateTime::createFromFormat('Ymd', $dateStr);
                    $formattedDate = $dateObj->format('Y-m-d');

                    $views = (int) Redis::getset($cleanKey, 0);

                    if ($views > 0) {
                        \App\Models\DailyStatistic::updateOrCreate(
                            ['tenant_id' => $tenantId, 'date' => $formattedDate],
                            ['view_count' => \Illuminate\Support\Facades\DB::raw("view_count + $views")]
                        );
                        $syncedSite++;
                    }
                    Redis::del($cleanKey);
                }
            }

            $this->info("Synced total views for $syncedTotal posts, daily stats for $syncedDaily entries, and site stats for $syncedSite days.");
        } catch (\Throwable $e) {
            $this->error('Error syncing views: ' . $e->getMessage());
            Log::error('SyncPostViews Command failed: ' . $e->getMessage());
        }
    }
}
