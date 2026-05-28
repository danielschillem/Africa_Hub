<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Workspace extends Model {
    protected $fillable = ['name','slug','logo','industry','country','timezone','plan','status','trial_ends_at','plan_ends_at','settings'];
    protected $casts    = ['settings'=>'array','trial_ends_at'=>'datetime','plan_ends_at'=>'datetime'];
    public function users()         { return $this->hasMany(User::class); }
    public function socialAccounts(){ return $this->hasMany(SocialAccount::class); }
    public function posts()         { return $this->hasMany(Post::class); }
    public function broadcasts()    { return $this->hasMany(Broadcast::class); }
    public function adCampaigns()   { return $this->hasMany(AdCampaign::class); }
    public function contacts()      { return $this->hasMany(Contact::class); }
    public function media()         { return $this->hasMany(Media::class); }
    public function subscriptions() { return $this->hasMany(Subscription::class); }
    public function getPlanLimits(): array {
        return match($this->plan) {
            'solo'   => ['social_accounts'=>2,'users'=>1,'posts_per_month'=>15,'broadcasts_per_month'=>5,'campaigns'=>0],
            'pme'    => ['social_accounts'=>4,'users'=>3,'posts_per_month'=>-1,'broadcasts_per_month'=>20,'campaigns'=>1],
            'pro'    => ['social_accounts'=>8,'users'=>5,'posts_per_month'=>-1,'broadcasts_per_month'=>-1,'campaigns'=>3],
            'agence' => ['social_accounts'=>-1,'users'=>-1,'posts_per_month'=>-1,'broadcasts_per_month'=>-1,'campaigns'=>-1],
            default  => ['social_accounts'=>1,'users'=>1,'posts_per_month'=>10,'broadcasts_per_month'=>2,'campaigns'=>0],
        };
    }
    public function isActive(): bool { return in_array($this->status,['trial','active']); }
}
