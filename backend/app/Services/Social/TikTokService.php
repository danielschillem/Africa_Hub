<?php
namespace App\Services\Social;
use App\Models\Post;
use App\Models\SocialAccount;
use Illuminate\Support\Facades\Http;

class TikTokService
{
    private string $baseUrl    = 'https://open.tiktokapis.com/v2';
    private string $clientKey;
    private string $clientSecret;

    public function __construct()
    {
        $this->clientKey    = config('services.tiktok.client_key');
        $this->clientSecret = config('services.tiktok.client_secret');
    }

    public function exchangeCodeForToken(string $code): array
    {
        $response = Http::post("{$this->baseUrl}/oauth/token/", [
            'client_key'    => $this->clientKey,
            'client_secret' => $this->clientSecret,
            'code'          => $code,
            'grant_type'    => 'authorization_code',
            'redirect_uri'  => config('services.tiktok.redirect_uri'),
        ]);
        if (!$response->successful()) throw new \Exception('TikTok token error: '.$response->body());
        return $response->json('data');
    }

    public function getUserInfo(string $token): array
    {
        $response = Http::withToken($token)
            ->post("{$this->baseUrl}/user/info/", ['fields' => ['open_id','display_name','avatar_url','follower_count']]);
        if (!$response->successful()) throw new \Exception('TikTok user info error');
        return $response->json('data.user');
    }

    public function publishVideo(Post $post, SocialAccount $account): string
    {
        $mediaIds = $post->media_ids ?? [];
        if (empty($mediaIds)) throw new \Exception('TikTok necessite une video.');

        $media    = \App\Models\Media::find($mediaIds[0]);
        if (!$media || $media->type !== 'video') throw new \Exception('Le media doit etre une video pour TikTok.');

        $fileSize = $media->file_size;

        // Etape 1 : Initialiser l'upload
        $initResponse = Http::withToken($account->access_token)
            ->post("{$this->baseUrl}/post/publish/video/init/", [
                'post_info' => [
                    'title'         => substr($post->title, 0, 150),
                    'privacy_level' => 'PUBLIC_TO_EVERYONE',
                    'disable_comment' => false,
                ],
                'source_info' => [
                    'source'     => 'FILE_UPLOAD',
                    'video_size' => $fileSize,
                    'chunk_size' => min($fileSize, 5242880),
                ]
            ]);

        if (!$initResponse->successful()) throw new \Exception('TikTok init error: '.$initResponse->body());

        $uploadUrl = $initResponse->json('data.upload_url');
        $publishId = $initResponse->json('data.publish_id');

        // Etape 2 : Upload le fichier
        $videoContent = file_get_contents($media->file_path);
        Http::withHeaders([
            'Content-Range'  => "bytes 0-".($fileSize-1)."/{$fileSize}",
            'Content-Length' => $fileSize,
            'Content-Type'   => 'video/mp4',
        ])->put($uploadUrl, $videoContent);

        return $publishId;
    }

    public function getVideoStats(string $videoId, string $token): array
    {
        $response = Http::withToken($token)
            ->post("{$this->baseUrl}/video/query/", [
                'filters' => ['video_ids' => [$videoId]],
                'fields'  => ['view_count','like_count','comment_count','share_count'],
            ]);
        if (!$response->successful()) return [];
        $v = $response->json('data.videos.0', []);
        return ['video_views' => $v['view_count'] ?? 0, 'likes' => $v['like_count'] ?? 0, 'shares' => $v['share_count'] ?? 0, 'comments' => $v['comment_count'] ?? 0];
    }
}
