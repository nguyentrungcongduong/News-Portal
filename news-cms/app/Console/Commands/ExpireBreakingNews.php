<?php

namespace App\Console\Commands;

use App\Models\Post;
use Illuminate\Console\Command;
use Carbon\Carbon;

class ExpireBreakingNews extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:expire-breaking-news';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically unset breaking news status for expired items';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = Post::where('is_breaking', true)
            ->whereNotNull('breaking_until')
            ->where('breaking_until', '<', Carbon::now())
            ->update(['is_breaking' => false]);

        if ($count > 0) {
            $this->info("Expired $count breaking news items.");
        } else {
            $this->info('No expired breaking news found.');
        }
    }
}
