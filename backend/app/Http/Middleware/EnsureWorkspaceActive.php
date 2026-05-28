<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;

class EnsureWorkspaceActive
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if ($user && !$user->workspace->isActive()) {
            return response()->json(['message' => 'Votre abonnement a expire. Renouvelez sur afrihub.africa/billing'], 402);
        }
        return $next($request);
    }
}
