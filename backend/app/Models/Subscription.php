<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Subscription extends Model {
    protected $guarded = ['id'];
    protected $casts   = ['current_period_start'=>'datetime','current_period_end'=>'datetime','cancelled_at'=>'datetime'];
    public function workspace() { return $this->belongsTo(Workspace::class); }
    public function invoices()  { return $this->hasMany(Invoice::class); }
}
