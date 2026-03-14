<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SocketService
{
    protected static $url = 'http://localhost:3001/emit';

    public static function emit($channel, $event, $data)
    {
        try {
            // Non-blocking fire and forget is ideal but for now simple HTTP is fine as it's queued
            $response = Http::timeout(2)->post(self::$url, [
                'channel' => $channel,
                'event' => $event,
                'data' => $data
            ]);

            if ($response->failed()) {
                Log::warning("Socket emit failed: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Socket connection error: " . $e->getMessage());
        }
    }
}
