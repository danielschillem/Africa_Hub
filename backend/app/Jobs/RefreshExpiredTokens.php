<?php
namespace App\Jobs;
use App\Models\SocialAccount;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RefreshExpiredTokens implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $expiring = SocialAccount::where('is_active', true)
            ->where('token_expires_at', '<=', now()->addDays(7))
            ->get();

        foreach ($expiring as $account) {
            Log::warning("AFRIHUB: Token expire bientot pour {$account->platform} — workspace {$account->workspace_id}");
            // Notifier l'admin du workspace
            // TODO: implémenter la notification push/email selon le systeme
        }
    }
}
