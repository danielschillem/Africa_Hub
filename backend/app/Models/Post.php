<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
class Post extends Model {
    protected $fillable = ['workspace_id','user_id','title','content','platforms','media_ids','status','tracking_code','platform_post_ids','scheduled_at','published_at','campaign_tag','error_message','is_campaign'];
    protected $casts    = ['platforms'=>'array','media_ids'=>'array','platform_post_ids'=>'array','scheduled_at'=>'datetime','published_at'=>'datetime','is_campaign'=>'boolean'];
    protected static function boot() {
        parent::boot();
        static::creating(function($p) { if(!$p->tracking_code) $p->tracking_code = 'AF'.strtoupper(Str::random(8)); });
    }
    public function workspace()   { return $this->belongsTo(Workspace::class); }
    public function user()        { return $this->belongsTo(User::class); }
    public function analytics()   { return $this->hasMany(PostAnalytic::class); }
    public function conversions() { return $this->hasMany(ConversionEvent::class,'tracking_code','tracking_code'); }
    public function getTrackingUrlAttribute(): string { return config('app.url').'/r/'.$this->tracking_code; }
    public function getTotalReachAttribute():  int    { return $this->analytics->sum('reach'); }
    public function getTotalClicksAttribute(): int    { return $this->analytics->sum('clicks'); }
    public function getTotalGmvAttribute():    float  { return $this->conversions->where('event_type','purchase')->sum('revenue'); }
}
