<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class AdCampaign extends Model {
    protected $guarded = ['id'];
    protected $casts   = ['custom_targeting'=>'array','start_date'=>'date','end_date'=>'date','last_sync_at'=>'datetime'];
    public function workspace() { return $this->belongsTo(Workspace::class); }
    public function user()      { return $this->belongsTo(User::class); }
}
