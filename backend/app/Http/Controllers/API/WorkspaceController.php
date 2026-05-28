<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WorkspaceController extends Controller
{
    public function show(Request $request)
    {
        $ws = $request->user()->workspace->load('socialAccounts');
        $ws->plan_limits = $ws->getPlanLimits();
        return response()->json($ws);
    }

    public function update(Request $request)
    {
        $this->authorize('settings', $request->user());
        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'industry' => 'sometimes|nullable|string|max:100',
            'country'  => 'sometimes|string|max:5',
            'timezone' => 'sometimes|string|max:50',
            'settings' => 'sometimes|array',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $data['logo'] = Storage::url($path);
        }

        $request->user()->workspace->update($data);
        return response()->json($request->user()->workspace->fresh());
    }

    public function members(Request $request)
    {
        $members = $request->user()->workspace->users()->get(['id','name','email','role','avatar','is_active','last_login_at']);
        return response()->json($members);
    }

    public function inviteMember(Request $request)
    {
        $data = $request->validate([
            'name'  => 'required|string',
            'email' => 'required|email|unique:users',
            'role'  => 'required|in:admin,editor,viewer',
        ]);

        $ws     = $request->user()->workspace;
        $limits = $ws->getPlanLimits();
        if ($limits['users'] !== -1 && $ws->users()->count() >= $limits['users']) {
            return response()->json(['message' => 'Limite utilisateurs atteinte pour votre plan. Passez au plan superieur.'], 422);
        }

        $tempPassword = \Illuminate\Support\Str::random(12);
        $user = \App\Models\User::create([
            'workspace_id' => $ws->id,
            'name'         => $data['name'],
            'email'        => $data['email'],
            'password'     => \Illuminate\Support\Facades\Hash::make($tempPassword),
            'role'         => $data['role'],
        ]);

        // TODO: envoyer email d'invitation avec $tempPassword
        return response()->json(['message' => 'Membre invite avec succes.', 'user' => $user], 201);
    }

    public function removeMember(Request $request, int $userId)
    {
        $member = $request->user()->workspace->users()->where('id', $userId)->firstOrFail();
        if ($member->role === 'owner') {
            return response()->json(['message' => 'Impossible de supprimer le proprietaire.'], 422);
        }
        $member->delete();
        return response()->json(['message' => 'Membre supprime.']);
    }
}
