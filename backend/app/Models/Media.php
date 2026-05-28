<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Media extends Model {
    protected $guarded = ['id'];
    protected $casts   = ['tags'=>'array'];
    public function workspace() { return $this->belongsTo(Workspace::class); }
}
