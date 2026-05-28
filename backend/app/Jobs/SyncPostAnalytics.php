<?php
namespace App\Jobs;
use App\Models\Post;
use App\Models\PostAnalytic;
use App\Models\SocialAccount;
use App\Services\Social\FacebookService;
use App\Services\Social\InstagramService;
use App\Services\Social\TikTokService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncPostAnalytics implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(FacebookService $fb, InstagramService $ig, TikTokService $tt): void
    {
        $posts = Post::where('status', 'published')
            ->whereHas('analytics', fn($q) => $q->where('synced_at', '<', now()->subHours(2)))
            ->orWhereHas('analytics', fn($q) => $q->whereNull('synced_at'))
            ->with(['analytics','workspace.socialAccounts'])
            ->take(50)->get();

        foreach ($posts as $post) {
            if (!$post->platform_post_ids) continue;

            foreach ($post->platform_post_ids as $platform => $platformPostId) {
                $account = $post->workspace->socialAccounts
                    ->where('platform', $platform)->where('is_active', true)->first();
                if (!$account || $account->isTokenExpired()) continue;

                try {
                    $stats = match($platform) {
                        'facebook'  => $fb->getPostStats($platformPostId, $account->access_token),
                        'instagram' => $ig->getPostStats($platformPostId, $account->access_token),
                        'tiktok'    => $tt->getVideoStats($platformPostId, $account->access_token),
                        default     => [],
                    };

                    if (!empty($stats)) {
                        PostAnalytic::updateOrCreate(
                            ['post_id' => $post->id, 'platform' => $platform],
                            [...$stats, 'synced_at' => now()]
                        );
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning("Sync analytics failed: {$e->getMessage()}");
                }
            }
        }
    }
}
