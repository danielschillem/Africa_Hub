<?php
namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
class User extends Authenticatable {
    use HasApiTokens, Notifiable;
    protected $fillable = ['workspace_id','name','email','phone','password','role','avatar','is_active'];
    protected $hidden   = ['password','remember_token'];
    protected $casts    = ['password'=>'hashed','last_login_at'=>'datetime','is_active'=>'boolean'];
    public function workspace() { return $this->belongsTo(Workspace::class); }
}
