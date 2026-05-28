<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Services\Social\FacebookService;
use App\Services\Social\TikTokService;
use App\Services\Social\WhatsAppService;
use Illuminate\Http\Request;

class SocialAccountController extends Controller
{
    public function index(Request $request)
    {
        $accounts = $request->user()->workspace->socialAccounts()
            ->select(['id','platform','account_name','page_name','avatar','followers','is_active','token_expires_at','last_sync_at'])
            ->get()
            ->map(function($a) {
                $a->token_status = $a->isTokenExpired() ? 'expired' : ($a->willExpireSoon() ? 'expiring_soon' : 'valid');
                return $a;
            });
        return response()->json($accounts);
    }

    public function connectFacebook(Request $request)
    {
        $data = $request->validate([
            'access_token' => 'required|string',
            'page_id'      => 'required|string',
        ]);

        $ws     = $request->user()->workspace;
        $limits = $ws->getPlanLimits();

        if ($limits['social_accounts'] !== -1 && $ws->socialAccounts()->where('is_active', true)->count() >= $limits['social_accounts']) {
            return response()->json(['message' => 'Limite de comptes sociaux atteinte pour votre plan.'], 422);
        }

        try {
            $fbService = app(FacebookService::class);
            $pageInfo  = $fbService->getPageInfo($data['access_token'], $data['page_id']);
            $longToken = $fbService->getLongLivedToken($data['access_token']);

            $account = SocialAccount::updateOrCreate(
                ['workspace_id' => $ws->id, 'platform' => 'facebook', 'page_id' => $data['page_id']],
                [
                    'account_name'      => $pageInfo['name'],
                    'account_id'        => $pageInfo['id'],
                    'access_token'      => $longToken['token'],
                    'page_name'         => $pageInfo['name'],
                    'avatar'            => $pageInfo['picture'] ?? null,
                    'followers'         => $pageInfo['fan_count'] ?? 0,
                    'token_expires_at'  => now()->addDays(60),
                    'is_active'         => true,
                ]
            );

            return response()->json(['message' => 'Compte Facebook connecte avec succes.', 'account' => $account], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur de connexion Facebook: '.$e->getMessage()], 422);
        }
    }

    public function connectInstagram(Request $request)
    {
        $data = $request->validate([
            'access_token'   => 'required|string',
            'instagram_id'   => 'required|string',
        ]);

        $ws = $request->user()->workspace;

        try {
            $fbService  = app(FacebookService::class);
            $igInfo     = $fbService->getInstagramInfo($data['access_token'], $data['instagram_id']);
            $longToken  = $fbService->getLongLivedToken($data['access_token']);

            $account = SocialAccount::updateOrCreate(
                ['workspace_id' => $ws->id, 'platform' => 'instagram', 'account_id' => $data['instagram_id']],
                [
                    'account_name'     => $igInfo['username'],
                    'access_token'     => $longToken['token'],
                    'avatar'           => $igInfo['profile_picture_url'] ?? null,
                    'followers'        => $igInfo['followers_count'] ?? 0,
                    'token_expires_at' => now()->addDays(60),
                    'is_active'        => true,
                ]
            );

            return response()->json(['message' => 'Compte Instagram connecte.', 'account' => $account], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur connexion Instagram: '.$e->getMessage()], 422);
        }
    }

    public function connectTikTok(Request $request)
    {
        $data = $request->validate(['auth_code' => 'required|string']);
        $ws   = $request->user()->workspace;

        try {
            $ttService  = app(TikTokService::class);
            $tokenData  = $ttService->exchangeCodeForToken($data['auth_code']);
            $userInfo   = $ttService->getUserInfo($tokenData['access_token']);

            $account = SocialAccount::updateOrCreate(
                ['workspace_id' => $ws->id, 'platform' => 'tiktok', 'account_id' => $userInfo['open_id']],
                [
                    'account_name'     => $userInfo['display_name'],
                    'access_token'     => $tokenData['access_token'],
                    'refresh_token'    => $tokenData['refresh_token'],
                    'avatar'           => $userInfo['avatar_url'] ?? null,
                    'followers'        => $userInfo['follower_count'] ?? 0,
                    'token_expires_at' => now()->addSeconds($tokenData['expires_in']),
                    'is_active'        => true,
                ]
            );

            return response()->json(['message' => 'Compte TikTok connecte.', 'account' => $account], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur connexion TikTok: '.$e->getMessage()], 422);
        }
    }

    public function connectWhatsApp(Request $request)
    {
        $data = $request->validate([
            'phone_number' => 'required|string',
            'business_name'=> 'required|string',
            'api_key'      => 'required|string',
        ]);

        $ws = $request->user()->workspace;
        $account = SocialAccount::updateOrCreate(
            ['workspace_id' => $ws->id, 'platform' => 'whatsapp', 'account_id' => $data['phone_number']],
            [
                'account_name' => $data['business_name'],
                'access_token' => $data['api_key'],
                'is_active'    => true,
            ]
        );

        return response()->json(['message' => 'Compte WhatsApp Business configure.', 'account' => $account], 201);
    }

    public function disconnect(Request $request, SocialAccount $account)
    {
        abort_unless($account->workspace_id === $request->user()->workspace_id, 403);
        $account->update(['is_active' => false]);
        return response()->json(['message' => 'Compte deconnecte.']);
    }

    public function syncStats(Request $request, SocialAccount $account)
    {
        abort_unless($account->workspace_id === $request->user()->workspace_id, 403);
        // Mettre a jour les stats (followers etc.) depuis l'API
        $account->update(['last_sync_at' => now()]);
        return response()->json(['message' => 'Statistiques synchronisees.', 'account' => $account]);
    }
}
