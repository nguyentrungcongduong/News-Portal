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
        $allowedOrigins = array_values(array_filter(array_map(
            static fn($v) => trim($v),
            explode(',', env('CORS_ALLOWED_ORIGINS', 'https://news-portal-public-gray.vercel.app,https://news-portal-admin-beta.vercel.app,http://localhost:3000'))
        )));

        $origin = $request->header('Origin');
        $origin = is_string($origin) ? trim($origin) : null;

        $allowOrigin = '*';

        if ($origin) {
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

            if (!$isAllowed) {
                // Check regex for Vercel and Render subdomains (optional trailing slash)
                if (
                    preg_match('/^https:\/\/.*\.vercel\.app\/?$/', $origin) ||
                    preg_match('/^https:\/\/.*\.onrender\.com\/?$/', $origin)
                ) {
                    $isAllowed = true;
                }
            }

            $allowOrigin = $isAllowed
                ? rtrim($origin, '/')
                : (isset($allowedOrigins[0]) && $allowedOrigins[0] !== '' ? rtrim($allowedOrigins[0], '/') : '*');
        }

        // Echo back requested headers when possible (helps if frontend adds more headers).
        $requestedHeaders = $request->header('Access-Control-Request-Headers');
        $allowHeaders = $requestedHeaders ? $requestedHeaders : 'Content-Type, Authorization, X-Requested-With, Accept, X-XSRF-TOKEN';

        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $allowOrigin)
                ->header('Vary', 'Origin')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Allow-Headers', $allowHeaders);
        }

        $response = $next($request);

        if (method_exists($response, 'header')) {
            $response->header('Access-Control-Allow-Origin', $allowOrigin);
            $response->header('Vary', 'Origin');
            $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->header('Access-Control-Allow-Credentials', 'true');
            $response->header('Access-Control-Allow-Headers', $allowHeaders);
        }

        return $response;
    }
}
