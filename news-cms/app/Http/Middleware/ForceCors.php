<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceCors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $allowedOrigins = explode(',', env('CORS_ALLOWED_ORIGINS', 'https://news-portal-public-gray.vercel.app,https://news-portal-admin-beta.vercel.app,http://localhost:3000'));
        $origin = $request->header('Origin');
        
        // Validate origin with exact match (handling optional trailing slash)
        $isAllowed = false;
        foreach ($allowedOrigins as $allowed) {
            $trimmedAllowed = rtrim($allowed, '/');
            $trimmedOrigin = rtrim($origin, '/');
            if ($trimmedOrigin === $trimmedAllowed) {
                $isAllowed = true;
                break;
            }
        }
        
        if (!$isAllowed && $origin) {
            // Check regex for Vercel and Render subdomains (optional trailing slash)
            if (preg_match('/^https:\/\/.*\.vercel\.app\/?$/', $origin) || 
                preg_match('/^https:\/\/.*\.onrender\.com\/?$/', $origin)) {
                $isAllowed = true;
            }
        }

        if ($isAllowed) {
            // Keep the exact origin sent by the browser
        } else {
            $origin = isset($allowedOrigins[0]) ? $allowedOrigins[0] : '*';
        }
        
        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-XSRF-TOKEN');
        }

        $response = $next($request);
        
        if (method_exists($response, 'header')) {
            $response->header('Access-Control-Allow-Origin', $origin);
            $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->header('Access-Control-Allow-Credentials', 'true');
            $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-XSRF-TOKEN');
        }

        return $response;
    }
}
