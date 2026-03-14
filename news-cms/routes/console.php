<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

\Illuminate\Support\Facades\Schedule::command('app:expire-breaking-news')->everyMinute();
\Illuminate\Support\Facades\Schedule::command('app:sync-ads-stats')->everyFiveMinutes();
