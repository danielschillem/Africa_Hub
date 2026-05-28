<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\{
    AuthController, WorkspaceController, SocialAccountController,
    PostController, BroadcastController, ContactController,
    AnalyticsController, AdCampaignController, MediaController,
    TrackingController
};

// ── Tracking public (pas d'auth) ──────────────────────────────
Route::get('/r/{code}', [TrackingController::class, 'redirect'])->name('track.redirect');
Route::post('/track/event', [TrackingController::class, 'event'])->name('track.event');

// ── Auth ──────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// ── Routes protegees ──────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout',          [AuthController::class, 'logout']);
        Route::get('/me',               [AuthController::class, 'me']);
        Route::put('/profile',          [AuthController::class, 'updateProfile']);
        Route::put('/change-password',  [AuthController::class, 'changePassword']);
    });

    // Workspace
    Route::prefix('workspace')->group(function () {
        Route::get('/',                     [WorkspaceController::class, 'show']);
        Route::put('/',                     [WorkspaceController::class, 'update']);
        Route::get('/members',              [WorkspaceController::class, 'members']);
        Route::post('/members/invite',      [WorkspaceController::class, 'inviteMember']);
        Route::delete('/members/{userId}',  [WorkspaceController::class, 'removeMember']);
    });

    // Comptes sociaux
    Route::prefix('social-accounts')->group(function () {
        Route::get('/',                          [SocialAccountController::class, 'index']);
        Route::post('/facebook',                 [SocialAccountController::class, 'connectFacebook']);
        Route::post('/instagram',                [SocialAccountController::class, 'connectInstagram']);
        Route::post('/tiktok',                   [SocialAccountController::class, 'connectTikTok']);
        Route::post('/whatsapp',                 [SocialAccountController::class, 'connectWhatsApp']);
        Route::delete('/{account}',              [SocialAccountController::class, 'disconnect']);
        Route::post('/{account}/sync',           [SocialAccountController::class, 'syncStats']);
    });

    // Posts
    Route::prefix('posts')->group(function () {
        Route::get('/',                  [PostController::class, 'index']);
        Route::post('/',                 [PostController::class, 'store']);
        Route::get('/calendar',          [PostController::class, 'calendar']);
        Route::get('/{post}',            [PostController::class, 'show']);
        Route::put('/{post}',            [PostController::class, 'update']);
        Route::delete('/{post}',         [PostController::class, 'destroy']);
        Route::post('/{post}/publish',   [PostController::class, 'publish']);
        Route::post('/{post}/duplicate', [PostController::class, 'duplicate']);
        Route::get('/{post}/stats',      [PostController::class, 'stats']);
    });

    // WhatsApp Broadcasts
    Route::prefix('broadcasts')->group(function () {
        Route::get('/',                  [BroadcastController::class, 'index']);
        Route::get('/templates',         [BroadcastController::class, 'templates']);
        Route::get('/segments',          [BroadcastController::class, 'segments']);
        Route::post('/',                 [BroadcastController::class, 'store']);
        Route::get('/{broadcast}',       [BroadcastController::class, 'show']);
        Route::post('/{broadcast}/send', [BroadcastController::class, 'send']);
        Route::delete('/{broadcast}',    [BroadcastController::class, 'destroy']);
    });

    // Contacts
    Route::prefix('contacts')->group(function () {
        Route::get('/',                      [ContactController::class, 'index']);
        Route::post('/',                     [ContactController::class, 'store']);
        Route::post('/import',               [ContactController::class, 'importCsv']);
        Route::delete('/{contact}',          [ContactController::class, 'destroy']);
        Route::post('/{contact}/opt-out',    [ContactController::class, 'optOut']);
    });

    // Analytics
    Route::prefix('analytics')->group(function () {
        Route::get('/dashboard',    [AnalyticsController::class, 'dashboard']);
        Route::get('/posts',        [AnalyticsController::class, 'posts']);
        Route::get('/conversion',   [AnalyticsController::class, 'conversion']);
    });

    // Campagnes publicitaires
    Route::prefix('campaigns')->group(function () {
        Route::get('/',                    [AdCampaignController::class, 'index']);
        Route::get('/presets',             [AdCampaignController::class, 'presets']);
        Route::post('/',                   [AdCampaignController::class, 'store']);
        Route::get('/{campaign}',          [AdCampaignController::class, 'show']);
        Route::post('/{campaign}/launch',  [AdCampaignController::class, 'launch']);
        Route::post('/{campaign}/pause',   [AdCampaignController::class, 'pause']);
    });

    // Medias
    Route::prefix('media')->group(function () {
        Route::get('/',             [MediaController::class, 'index']);
        Route::post('/upload',      [MediaController::class, 'upload']);
        Route::delete('/{media}',   [MediaController::class, 'destroy']);
    });
});
