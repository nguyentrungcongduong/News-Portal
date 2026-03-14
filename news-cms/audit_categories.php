<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Category;

$categories = Category::all();
echo "CATEGORY AUDIT REPORT\n";
echo str_repeat("=", 40) . "\n";
foreach ($categories as $cat) {
    $publishedCount = $cat->posts()->where('status', 'published')->count();
    $totalCount = $cat->posts()->count();
    $parentId = $cat->parent_id ?? 'None';
    echo "Name: {$cat->name}\n";
    echo "  ID: {$cat->id}\n";
    echo "  Parent ID: {$parentId}\n";
    echo "  Published Posts: {$publishedCount}\n";
    echo "  Total Posts: {$totalCount}\n";
    echo str_repeat("-", 20) . "\n";
}
