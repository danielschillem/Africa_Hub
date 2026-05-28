<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PostAnalytic extends Model {
    protected $table    = 'post_analytics';
    protected $guarded  = ['id'];
    protected $casts    = ['synced_at'=>'datetime'];
    public function post() { return $this->belongsTo(Post::class); }
}
