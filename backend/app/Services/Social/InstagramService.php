<?php
namespace App\Services\Social;
use App\Models\Post;
use App\Models\SocialAccount;
use Illuminate\Support\Facades\Http;

class InstagramService
{
    private string $baseUrl = 'https://graph.facebook.com/v19.0';

    public function publishPost(Post $post, SocialAccount $account): string
    {
        $caption = $post->content."\n\n".$post->tracking_url;
        $mediaIds = $post->media_ids ?? [];

        if (empty($mediaIds)) {
            // Post texte seul — non supporte par Instagram, publier avec image placeholder
            throw new \Exception('Instagram necessite au moins une image.');
        }

        $firstMedia = \App\Models\Media::find($mediaIds[0]);
        if (!$firstMedia) throw new \Exception('Media introuvable.');

        // Creer le media container
        $containerResponse = Http::post("{$this->baseUrl}/{$account->account_id}/media", [
            'image_url'    => $firstMedia->file_url,
            'caption'      => $caption,
            'access_token' => $account->access_token,
        ]);
        if (!$containerResponse->successful()) throw new \Exception('Instagram container error: '.$containerResponse->json('error.message'));

        $containerId = $containerResponse->json('id');
        sleep(2); // Attendre le traitement

        // Publier le container
        $publishResponse = Http::post("{$this->baseUrl}/{$account->account_id}/media_publish", [
            'creation_id'  => $containerId,
            'access_token' => $account->access_token,
        ]);
        if (!$publishResponse->successful()) throw new \Exception('Instagram publish error: '.$publishResponse->json('error.message'));

        return $publishResponse->json('id');
    }

    public function getPostStats(string $mediaId, string $token): array
    {
        $response = Http::get("{$this->baseUrl}/{$mediaId}/insights", [
            'metric'       => 'impressions,reach,likes,comments,saved',
            'access_token' => $token,
        ]);
        if (!$response->successful()) return [];

        $stats = ['impressions' => 0, 'reach' => 0, 'likes' => 0, 'comments' => 0, 'saves' => 0];
        foreach ($response->json('data', []) as $m) {
            $stats[$m['name']] = $m['values'][0]['value'] ?? 0;
        }
        return $stats;
    }
}
