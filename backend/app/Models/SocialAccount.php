<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
class SocialAccount extends Model {
    protected $fillable = ['workspace_id','platform','account_name','account_id','access_token','refresh_token','page_id','page_name','avatar','followers','token_expires_at','is_active','extra'];
    protected $hidden   = ['access_token','refresh_token'];
    protected $casts    = ['token_expires_at'=>'datetime','is_active'=>'boolean','extra'=>'array'];
    public function workspace() { return $this->belongsTo(Workspace::class); }
    public function setAccessTokenAttribute(string $v): void {
        $this->attributes['access_token'] = Crypt::encryptString($v);
    }
    public function getAccessTokenAttribute(?string $v): string {
        if(!$v) return '';
        try { return Crypt::decryptString($v); } catch(\Exception $e) { return ''; }
    }
    public function isTokenExpired(): bool { return $this->token_expires_at && $this->token_expires_at->isPast(); }
    public function willExpireSoon(): bool { return $this->token_expires_at && $this->token_expires_at->diffInDays(now()) <= 7; }
}
