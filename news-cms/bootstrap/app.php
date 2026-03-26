<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // ForceCors is our comprehensive CORS handler (covers exceptions too via
        // the withExceptions()->respond() callback below).
        // HandleCors (Laravel's built-in) MUST be removed — if both run, they
        // both set Access-Control-Allow-Origin, producing a duplicate header:
        //   "(null), https://..."  which browsers reject.
        $middleware->remove(\Illuminate\Http\Middleware\HandleCors::class);
        $middleware->prepend(\App\Http\Middleware\ForceCors::class);

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(prepend: [
            \App\Http\Middleware\IdentifyTenant::class,
        ]);

        $middleware->alias([
            'blocked' => \App\Http\Middleware\CheckBlockedUser::class,
            'tenant' => \App\Http\Middleware\IdentifyTenant::class,
            'role' => \App\Http\Middleware\CheckRole::class,
            'permission' => \App\Http\Middleware\CheckPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Inject CORS headers on EVERY exception response.
        // Without this, errors like 401, 403, 500 reach the browser with no
        // Access-Control-Allow-Origin header, and the browser reports it as
        // "blocked by CORS policy" — hiding the real error.
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $e, \Illuminate\Http\Request $request) {
            $origin = $request->header('Origin');

            if ($origin) {
                $normalizedOrigin = rtrim((string) $origin, '/');
                $isAllowed =
                    preg_match('/^https:\/\/[a-z0-9\-]+\.vercel\.app$/', $normalizedOrigin) ||
                    preg_match('/^https:\/\/[a-z0-9\-]+\.onrender\.com$/', $normalizedOrigin) ||
                    preg_match('/^http:\/\/localhost(:\d+)?$/', $normalizedOrigin) ||
                    preg_match('/^http:\/\/127\.0\.0\.1(:\d+)?$/', $normalizedOrigin);

                $allowOrigin = $isAllowed ? $normalizedOrigin : 'https://news-portal-public-gray.vercel.app';

                $response->headers->set('Access-Control-Allow-Origin', $allowOrigin);
                $response->headers->set('Access-Control-Allow-Credentials', 'true');
                $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
                $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-XSRF-TOKEN');
                $response->headers->set('Vary', 'Origin');
            }

            return $response;
        });
    })
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        $schedule->command('app:sync-post-views')->everyFiveMinutes();
        $schedule->command('app:sync-ads-stats')->everyFiveMinutes();
    })
    ->create();
