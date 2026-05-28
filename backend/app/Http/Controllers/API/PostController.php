<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Jobs\PublishPost;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $posts = $request->user()->workspace->posts()
            ->with(['user:id,name,avatar','analytics'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->platform, fn($q) => $q->whereJsonContains('platforms', $request->platform))
            ->when($request->from, fn($q) => $q->where('scheduled_at', '>=', $request->from))
            ->when($request->to, fn($q) => $q->where('scheduled_at', '<=', $request->to))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'content'      => 'required|string',
            'platforms'    => 'required|array|min:1',
            'platforms.*'  => 'in:facebook,instagram,tiktok,whatsapp',
            'media_ids'    => 'nullable|array',
            'scheduled_at' => 'nullable|date|after:now',
            'campaign_tag' => 'nullable|string|max:100',
        ]);

        // Verifier les limites du plan
        $ws     = $request->user()->workspace;
        $limits = $ws->getPlanLimits();
        if ($limits['posts_per_month'] !== -1) {
            $thisMonth = $ws->posts()->whereMonth('created_at', now()->month)->count();
            if ($thisMonth >= $limits['posts_per_month']) {
                return response()->json(['message' => 'Limite mensuelle de posts atteinte. Passez au plan superieur.'], 422);
            }
        }

        $post = Post::create([
            ...$data,
            'workspace_id' => $ws->id,
            'user_id'      => $request->user()->id,
            'status'       => $data['scheduled_at'] ? 'scheduled' : 'draft',
        ]);

        // Publication immediate si pas de scheduled_at
        if (!$data['scheduled_at']) {
            PublishPost::dispatch($post)->onQueue('social');
        }

        return response()->json($post->load('analytics'), 201);
    }

    public function show(Request $request, Post $post)
    {
        abort_unless($post->workspace_id === $request->user()->workspace_id, 403);
        return response()->json($post->load(['analytics','conversions','user:id,name']));
    }

    public function update(Request $request, Post $post)
    {
        abort_unless($post->workspace_id === $request->user()->workspace_id, 403);
        if (in_array($post->status, ['publishing','published'])) {
            return response()->json(['message' => 'Impossible de modifier un post deja publie.'], 422);
        }

        $data = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'content'      => 'sometimes|string',
            'platforms'    => 'sometimes|array',
            'media_ids'    => 'nullable|array',
            'scheduled_at' => 'nullable|date',
        ]);

        $post->update($data);
        return response()->json($post);
    }

    public function destroy(Request $request, Post $post)
    {
        abort_unless($post->workspace_id === $request->user()->workspace_id, 403);
        if ($post->status === 'publishing') {
            return response()->json(['message' => 'Publication en cours, impossible de supprimer.'], 422);
        }
        $post->delete();
        return response()->json(['message' => 'Post supprime.']);
    }

    public function publish(Request $request, Post $post)
    {
        abort_unless($post->workspace_id === $request->user()->workspace_id, 403);
        if ($post->status === 'published') {
            return response()->json(['message' => 'Post deja publie.'], 422);
        }
        $post->update(['status' => 'scheduled', 'scheduled_at' => null]);
        PublishPost::dispatch($post)->onQueue('social');
        return response()->json(['message' => 'Publication en cours...', 'post' => $post]);
    }

    public function duplicate(Request $request, Post $post)
    {
        abort_unless($post->workspace_id === $request->user()->workspace_id, 403);
        $newPost = $post->replicate(['tracking_code','status','published_at','platform_post_ids']);
        $newPost->status       = 'draft';
        $newPost->title        = $post->title.' (copie)';
        $newPost->scheduled_at = null;
        $newPost->save();
        return response()->json($newPost, 201);
    }

    public function calendar(Request $request)
    {
        $from  = $request->get('from', now()->startOfMonth());
        $to    = $request->get('to', now()->endOfMonth());
        $posts = $request->user()->workspace->posts()
            ->select(['id','title','platforms','status','scheduled_at','published_at','campaign_tag'])
            ->where(function($q) use ($from, $to) {
                $q->whereBetween('scheduled_at', [$from, $to])
                  ->orWhereBetween('published_at', [$from, $to]);
            })
            ->orderBy('scheduled_at')
            ->get();

        return response()->json($posts);
    }

    public function stats(Request $request, Post $post)
    {
        abort_unless($post->workspace_id === $request->user()->workspace_id, 403);
        return response()->json([
            'post'        => $post->only(['id','title','status','published_at','tracking_code']),
            'analytics'   => $post->analytics,
            'conversions' => $post->conversions->count(),
            'gmv'         => $post->total_gmv,
            'reach'       => $post->total_reach,
            'clicks'      => $post->total_clicks,
            'tracking_url'=> $post->tracking_url,
        ]);
    }
}
