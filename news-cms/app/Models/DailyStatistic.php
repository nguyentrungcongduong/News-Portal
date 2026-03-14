<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class DailyStatistic extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'date',
        'view_count',
    ];

    protected $casts = [
        'date' => 'date',
        'view_count' => 'integer',
    ];
}
