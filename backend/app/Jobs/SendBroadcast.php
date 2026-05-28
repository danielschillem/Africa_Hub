<?php
namespace App\Jobs;
use App\Models\Broadcast;
use App\Services\Social\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendBroadcast implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public int $tries   = 1;
    public int $timeout = 3600;

    public function __construct(public Broadcast $broadcast) {}

    public function handle(WhatsAppService $wa): void
    {
        $wa->sendBroadcast($this->broadcast);
    }

    public function failed(\Throwable $e): void
    {
        $this->broadcast->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
    }
}
