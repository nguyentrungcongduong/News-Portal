<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;
use App\Models\Ad;
use Illuminate\Support\Facades\Log;

class SyncAdsStats extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'app:sync-ads-stats';

    /**
     * The console command description.
     */
    protected $description = 'Sync ad impressions and clicks from Redis to database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $ads = Ad::where('status', 'active')->get();
            $syncedCount = 0;

            foreach ($ads as $ad) {
                // Get and reset impressions
                $impKey = "ads:{$ad->id}:impressions";
                $impressions = (int) Redis::getset($impKey, 0);
                
                // Get and reset clicks
                $clickKey = "ads:{$ad->id}:clicks";
                $clicks = (int) Redis::getset($clickKey, 0);

                if ($impressions > 0 || $clicks > 0) {
                    $ad->increment('impressions', $impressions);
                    $ad->increment('clicks', $clicks);
                    $syncedCount++;

                    // Check Quota - if clicks reach 90%
                    if ($ad->quota_clicks > 0 && ($ad->clicks >= $ad->quota_clicks * 0.9)) {
                        \App\Services\NotificationService::notifyAdmins('ad_quota', [
                            'ad_id' => $ad->id,
                            'ad_name' => $ad->name,
                            'current' => $ad->clicks,
                            'quota' => $ad->quota_clicks,
                            'type' => 'clicks'
                        ]);
                    }

                    // Check Quota - if impressions reach 90%
                    if ($ad->quota_impressions > 0 && ($ad->impressions >= $ad->quota_impressions * 0.9)) {
                        \App\Services\NotificationService::notifyAdmins('ad_quota', [
                            'ad_id' => $ad->id,
                            'ad_name' => $ad->name,
                            'current' => $ad->impressions,
                            'quota' => $ad->quota_impressions,
                            'type' => 'impressions'
                        ]);
                    }
                }

                // Cleanup key if it was reset to 0
                Redis::del($impKey);
                Redis::del($clickKey);
            }

            $this->info("Synced stats for $syncedCount ads successfully.");
        } catch (\Throwable $e) {
            $this->error('Error syncing ads stats: ' . $e->getMessage());
            Log::error('SyncAdsStats Command failed: ' . $e->getMessage());
        }
    }
}
