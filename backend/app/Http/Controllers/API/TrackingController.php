<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\ConversionEvent;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    public function redirect(Request $request, string $code)
    {
        $post = Post::where('tracking_code', $code)->firstOrFail();

        ConversionEvent::create([
            'workspace_id'  => $post->workspace_id,
            'tracking_code' => $code,
            'source'        => $this->detectSource($request),
            'event_type'    => 'click',
            'device_type'   => $this->detectDevice($request),
            'ip_hash'       => hash('sha256', $request->ip()),
        ]);

        $destination = $request->get('dest', config('app.frontend_url'));
        return redirect($destination)->withCookie(cookie('af_tracking', $code, 24*60));
    }

    public function event(Request $request)
    {
        $data = $request->validate([
            'tracking_code' => 'required|string|max:32',
            'event_type'    => 'required|in:click,page_view,lead,purchase',
            'revenue'       => 'nullable|numeric',
            'reference_id'  => 'nullable|string',
        ]);

        $post = Post::where('tracking_code', $data['tracking_code'])->first();
        if (!$post) return response()->json(['ok' => false]);

        ConversionEvent::create([
            'workspace_id'  => $post->workspace_id,
            'tracking_code' => $data['tracking_code'],
            'source'        => $this->detectSource($request),
            'event_type'    => $data['event_type'],
            'revenue'       => $data['revenue'] ?? null,
            'reference_id'  => $data['reference_id'] ?? null,
            'ip_hash'       => hash('sha256', $request->ip()),
        ]);

        return response()->json(['ok' => true]);
    }

    private function detectSource(Request $request): string
    {
        $referer = $request->header('referer','');
        if (str_contains($referer, 'facebook')) return 'facebook';
        if (str_contains($referer, 'instagram')) return 'instagram';
        if (str_contains($referer, 'tiktok')) return 'tiktok';
        if (str_contains($referer, 'whatsapp')) return 'whatsapp';
        return 'direct';
    }

    private function detectDevice(Request $request): string
    {
        $ua = strtolower($request->userAgent() ?? '');
        if (str_contains($ua, 'mobile') || str_contains($ua, 'android')) return 'mobile';
        if (str_contains($ua, 'tablet') || str_contains($ua, 'ipad')) return 'tablet';
        return 'desktop';
    }
}
