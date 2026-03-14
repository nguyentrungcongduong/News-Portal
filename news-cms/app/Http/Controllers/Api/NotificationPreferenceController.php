<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationSetting;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    /**
     * Get user preferences.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $settings = NotificationSetting::where('user_id', $user->id)->get();
        
        // Define all available types
        $defaultTypes = ['comment', 'breaking_news', 'post_approved', 'system_alert'];
        
        $result = [];
        foreach ($defaultTypes as $type) {
            $setting = $settings->firstWhere('type', $type);
            $result[] = [
                'type' => $type,
                'in_app' => $setting ? $setting->in_app : true, // Default true
                'email' => $setting ? $setting->email : false, // Default false
            ];
        }

        return response()->json($result);
    }

    /**
     * Update preference.
     */
    public function update(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'channel' => 'required|in:in_app,email',
            'value' => 'required|boolean'
        ]);

        $user = $request->user();
        
        $setting = NotificationSetting::firstOrNew([
            'user_id' => $user->id,
            'type' => $request->type
        ]);

        $channel = $request->channel;
        $setting->$channel = $request->value;
        $setting->save();

        return response()->json(['message' => 'Settings updated', 'data' => $setting]);
    }
}
