<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Contact extends Model {
    protected $guarded = ['id'];
    protected $casts   = ['tags'=>'array','extra'=>'array','whatsapp_opted_in'=>'boolean','is_active'=>'boolean','last_interaction_at'=>'datetime'];
    public function workspace() { return $this->belongsTo(Workspace::class); }
}
