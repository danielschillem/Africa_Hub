<?php
namespace App\Jobs;
use App\Models\Post;
use App\Models\SocialAccount;
use App\Models\PostAnalytic;
use App\Services\Social\FacebookService;
use App\Services\Social\InstagramService;
use App\Services\Social\TikTokService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class PublishPost implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 120;

    public function __construct(public Post $post) {}

    public function handle(FacebookService $fb, InstagramService $ig, TikTokService $tt): void
    {
        $this->post->update(['status' => 'publishing']);
        $ws       = $this->post->workspace;
        $platform_ids = [];

        foreach ($this->post->platforms as $platform) {
            $account = SocialAccount::where('workspace_id', $ws->id)
                ->where('platform', $platform)->where('is_active', true)->first();

            if (!$account) {
                Log::warning("AFRIHUB: No active account for {$platform}", ['post_id' => $this->post->id]);
                continue;
            }

            if ($account->isTokenExpired()) {
                Log::error("AFRIHUB: Token expired for {$platform}", ['post_id' => $this->post->id]);
                $this->notifyTokenExpired($platform, $ws);
                continue;
            }

            try {
                $platformPostId = match($platform) {
                    'facebook'  => $fb->publishPost($this->post, $account),
                    'instagram' => $ig->publishPost($this->post, $account),
                    'tiktok'    => $tt->publishVideo($this->post, $account),
                    default     => null,
                };

                if ($platformPostId) {
                    $platform_ids[$platform] = $platformPostId;
                    PostAnalytic::create([
                        'post_id'   => $this->post->id,
                        'platform'  => $platform,
                        'synced_at' => now(),
                    ]);
                }
            } catch (\Exception $e) {
                Log::error("AFRIHUB: Publish failed on {$platform}", [
                    'post_id' => $this->post->id,
                    'error'   => $e->getMessage(),
                ]);
                $this->notifyPublishFailed($platform, $e->getMessage(), $ws);
            }
        }

        $this->post->update([
            'status'            => 'published',
            'published_at'      => now(),
            'platform_post_ids' => $platform_ids,
        ]);
    }

    public function failed(\Throwable $e): void
    {
        $this->post->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
    }

    private function notifyTokenExpired(string $platform, $ws): void
    {
        Log::warning("AFRIHUB Alert: Token expire sur {$platform} pour workspace {$ws->name}");
    }

    private function notifyPublishFailed(string $platform, string $error, $ws): void
    {
        Log::error("AFRIHUB Alert: Publication echouee sur {$platform} — {$error}");
    }
}
