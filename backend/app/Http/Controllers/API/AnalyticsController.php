<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostAnalytic;
use App\Models\ConversionEvent;
use App\Models\AdCampaign;
use App\Models\Broadcast;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function dashboard(Request $request)
    {
        $ws   = $request->user()->workspace;
        $from = $request->get('from', now()->subDays(30));
        $to   = $request->get('to', now());

        $posts = Post::where('workspace_id', $ws->id)
            ->whereBetween('published_at', [$from, $to])
            ->with('analytics')
            ->get();

        $totalReach       = PostAnalytic::whereIn('post_id', $posts->pluck('id'))->sum('reach');
        $totalImpressions = PostAnalytic::whereIn('post_id', $posts->pluck('id'))->sum('impressions');
        $totalClicks      = PostAnalytic::whereIn('post_id', $posts->pluck('id'))->sum('clicks');
        $totalLikes       = PostAnalytic::whereIn('post_id', $posts->pluck('id'))->sum('likes');
        $totalShares      = PostAnalytic::whereIn('post_id', $posts->pluck('id'))->sum('shares');

        $conversions = ConversionEvent::where('workspace_id', $ws->id)
            ->whereBetween('created_at', [$from, $to]);
        $totalConversions = $conversions->where('event_type', 'purchase')->count();
        $totalRevenue     = $conversions->where('event_type', 'purchase')->sum('revenue');

        $adSpend = AdCampaign::where('workspace_id', $ws->id)
            ->where('status', 'active')
            ->sum('spend_to_date');

        // Repartition par plateforme
        $byPlatform = PostAnalytic::whereIn('post_id', $posts->pluck('id'))
            ->select('platform', DB::raw('SUM(reach) as reach'), DB::raw('SUM(clicks) as clicks'), DB::raw('SUM(impressions) as impressions'))
            ->groupBy('platform')
            ->get();

        // Evolution dans le temps (7 derniers jours)
        $daily = ConversionEvent::where('workspace_id', $ws->id)
            ->where('event_type', 'purchase')
            ->whereBetween('created_at', [now()->subDays(7), now()])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(revenue) as revenue'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top posts
        $topPosts = $posts->map(function($p) {
            return [
                'id'       => $p->id,
                'title'    => $p->title,
                'platforms'=> $p->platforms,
                'reach'    => $p->total_reach,
                'clicks'   => $p->total_clicks,
                'gmv'      => $p->total_gmv,
                'status'   => $p->status,
                'date'     => $p->published_at,
            ];
        })->sortByDesc('gmv')->take(5)->values();

        return response()->json([
            'period'           => ['from' => $from, 'to' => $to],
            'posts_count'      => $posts->count(),
            'total_reach'      => $totalReach,
            'total_impressions'=> $totalImpressions,
            'total_clicks'     => $totalClicks,
            'total_likes'      => $totalLikes,
            'total_shares'     => $totalShares,
            'engagement_rate'  => $totalImpressions > 0 ? round(($totalLikes+$totalShares+$totalClicks)/$totalImpressions*100, 2) : 0,
            'total_conversions'=> $totalConversions,
            'total_revenue'    => $totalRevenue,
            'ad_spend'         => $adSpend,
            'roi'              => $adSpend > 0 ? round(($totalRevenue - $adSpend) / $adSpend * 100, 1) : 0,
            'click_to_purchase'=> $totalClicks > 0 ? round($totalConversions/$totalClicks*100, 2) : 0,
            'by_platform'      => $byPlatform,
            'daily_revenue'    => $daily,
            'top_posts'        => $topPosts,
        ]);
    }

    public function posts(Request $request)
    {
        $ws   = $request->user()->workspace;
        $from = $request->get('from', now()->subDays(30));
        $to   = $request->get('to', now());

        $posts = Post::where('workspace_id', $ws->id)
            ->where('status', 'published')
            ->whereBetween('published_at', [$from, $to])
            ->with('analytics')
            ->orderByDesc('published_at')
            ->get()
            ->map(fn($p) => [
                'id'        => $p->id,
                'title'     => $p->title,
                'platforms' => $p->platforms,
                'reach'     => $p->total_reach,
                'clicks'    => $p->total_clicks,
                'gmv'       => $p->total_gmv,
                'conversions'=> $p->conversions->count(),
                'date'      => $p->published_at,
                'tracking'  => $p->tracking_url,
            ]);

        return response()->json($posts->sortByDesc('gmv')->values());
    }

    public function conversion(Request $request)
    {
        $ws      = $request->user()->workspace;
        $from    = $request->get('from', now()->subDays(30));
        $to      = $request->get('to', now());
        $events  = ConversionEvent::where('workspace_id', $ws->id)->whereBetween('created_at', [$from, $to]);

        return response()->json([
            'total_clicks'    => (clone $events)->where('event_type', 'click')->count(),
            'total_leads'     => (clone $events)->where('event_type', 'lead')->count(),
            'total_purchases' => (clone $events)->where('event_type', 'purchase')->count(),
            'total_revenue'   => (clone $events)->where('event_type', 'purchase')->sum('revenue'),
            'by_source'       => (clone $events)->where('event_type','purchase')
                ->select('source', DB::raw('COUNT(*) as count'), DB::raw('SUM(revenue) as revenue'))
                ->groupBy('source')->get(),
            'funnel' => [
                'clicks'    => (clone $events)->where('event_type','click')->count(),
                'page_views'=> (clone $events)->where('event_type','page_view')->count(),
                'leads'     => (clone $events)->where('event_type','lead')->count(),
                'purchases' => (clone $events)->where('event_type','purchase')->count(),
            ],
        ]);
    }
}
