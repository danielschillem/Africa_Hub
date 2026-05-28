<?php
namespace App\Services\Social;
use App\Models\Post;
use App\Models\SocialAccount;
use Illuminate\Support\Facades\Http;

class FacebookService
{
    private string $baseUrl = 'https://graph.facebook.com/v19.0';
    private string $appId;
    private string $appSecret;

    public function __construct()
    {
        $this->appId     = config('services.facebook.app_id');
        $this->appSecret = config('services.facebook.app_secret');
    }

    public function publishPost(Post $post, SocialAccount $account): string
    {
        $payload = ['message' => $this->buildMessage($post), 'access_token' => $account->access_token];

        if ($post->media_ids && count($post->media_ids) > 0) {
            // Upload les photos d'abord
            $photoIds = [];
            foreach ($post->media_ids as $mediaId) {
                $media = \App\Models\Media::find($mediaId);
                if ($media && $media->type === 'image') {
                    $uploaded = $this->uploadPhoto($account, $media->file_url);
                    if ($uploaded) $photoIds[] = ['media_fbid' => $uploaded];
                }
            }
            if (count($photoIds) > 0) $payload['attached_media'] = json_encode($photoIds);
        }

        $response = Http::post("{$this->baseUrl}/{$account->page_id}/feed", $payload);

        if (!$response->successful()) throw new \Exception('Facebook API: '.$response->json('error.message', 'Erreur inconnue'));

        return $response->json('id');
    }

    public function uploadPhoto(SocialAccount $account, string $imageUrl): ?string
    {
        $response = Http::post("{$this->baseUrl}/{$account->page_id}/photos", [
            'url'          => $imageUrl,
            'published'    => false,
            'access_token' => $account->access_token,
        ]);
        return $response->successful() ? $response->json('id') : null;
    }

    public function getPostStats(string $postId, string $token): array
    {
        $response = Http::get("{$this->baseUrl}/{$postId}/insights", [
            'metric'       => 'post_impressions,post_reach,post_clicks,post_reactions_by_type_total,post_shares',
            'access_token' => $token,
        ]);
        if (!$response->successful()) return [];

        $stats = ['reach' => 0, 'impressions' => 0, 'clicks' => 0, 'likes' => 0, 'shares' => 0];
        foreach ($response->json('data', []) as $metric) {
            $val = $metric['values'][0]['value'] ?? 0;
            match($metric['name']) {
                'post_reach'       => $stats['reach'] = $val,
                'post_impressions' => $stats['impressions'] = $val,
                'post_clicks'      => $stats['clicks'] = $val,
                default => null
            };
        }
        return $stats;
    }

    public function getInstagramInfo(string $token, string $igId): array
    {
        $response = Http::get("{$this->baseUrl}/{$igId}", [
            'fields'       => 'username,profile_picture_url,followers_count,media_count',
            'access_token' => $token,
        ]);
        if (!$response->successful()) throw new \Exception('Instagram API error: '.$response->json('error.message'));
        return $response->json();
    }

    public function getPageInfo(string $token, string $pageId): array
    {
        $response = Http::get("{$this->baseUrl}/{$pageId}", [
            'fields'       => 'id,name,fan_count,picture{url}',
            'access_token' => $token,
        ]);
        if (!$response->successful()) throw new \Exception('Facebook API error: '.$response->json('error.message'));
        $data = $response->json();
        $data['picture'] = $data['picture']['data']['url'] ?? null;
        return $data;
    }

    public function getLongLivedToken(string $shortToken): array
    {
        $response = Http::get("{$this->baseUrl}/oauth/access_token", [
            'grant_type'        => 'fb_exchange_token',
            'client_id'         => $this->appId,
            'client_secret'     => $this->appSecret,
            'fb_exchange_token' => $shortToken,
        ]);
        if (!$response->successful()) throw new \Exception('Impossible d\'obtenir un token longue duree.');
        return $response->json();
    }

    private function buildMessage(Post $post): string
    {
        return $post->content."\n\n".$post->tracking_url;
    }
}
