<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Broadcast extends Model {
    protected $guarded = ['id'];
    protected $casts   = ['template_vars'=>'array','recipient_filters'=>'array','scheduled_at'=>'datetime','sent_at'=>'datetime'];
    public function workspace() { return $this->belongsTo(Workspace::class); }
    public function user()      { return $this->belongsTo(User::class); }
    public function getReadRateAttribute(): float {
        if(!$this->delivered_count) return 0;
        return round($this->read_count/$this->delivered_count*100,1);
    }
}
