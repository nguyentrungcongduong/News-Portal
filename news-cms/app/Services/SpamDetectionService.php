<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Support\Str;

class SpamDetectionService
{
    protected static $blacklist = [
        'casino', 'xxx', 'bet', 'free money', 'lừa đảo', 
        'http://', 'https://', 'telegram.me', 'zalo.me', 
        'nhận thưởng', 'tặng tiền', 'mlem', 'cave', 'phim sex'
    ];

    /**
     * Check content for spam rules.
     * Returns array ['status' => string, 'reason' => ?string]
     */
    public static function check(string $content, ?User $user = null): array
    {
        // 1. Keyword Blacklist
        foreach (self::$blacklist as $word) {
            if (Str::contains(Str::lower($content), $word)) {
                return [
                    'status' => 'hidden',
                    'reason' => "Chứa từ khóa cấm: $word"
                ];
            }
        }

        // 2. Link count check (limit 2 links)
        $linkCount = substr_count(Str::lower($content), 'http');
        if ($linkCount >= 2) {
            return [
                'status' => 'hidden',
                'reason' => "Chứa quá nhiều đường dẫn ($linkCount link)"
            ];
        }

        // 3. Repeated content (exact match)
        $exists = Comment::where('content', $content)->exists();
        if ($exists) {
            return [
                'status' => 'hidden',
                'reason' => "Nội dung bình luận bị trùng lặp"
            ];
        }

        // 4. Rate limiting (if user is logged in)
        if ($user) {
            $recentComments = Comment::where('user_id', $user->id)
                ->where('created_at', '>=', now()->subMinutes(2))
                ->count();
            
            if ($recentComments >= 3) {
                return [
                    'status' => 'reported',
                    'reason' => "Bình luận quá nhanh (Spam rate limit)"
                ];
            }
        }

        // 5. Trust Score Check
        if ($user) {
            // If user has low trust score, comment must be pending
            if ($user->trust_score < 10) {
                return [
                    'status' => 'pending',
                    'reason' => "Tài khoản mới hoặc độ tin cậy thấp (Trust score: {$user->trust_score})"
                ];
            }
        } else {
            // Guest comments (if allowed) always pending
            return [
                'status' => 'pending',
                'reason' => "Khách vãng lai gửi bình luận"
            ];
        }

        return [
            'status' => 'approved',
            'reason' => null
        ];
    }
}
