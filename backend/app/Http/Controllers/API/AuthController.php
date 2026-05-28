<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'workspace_name' => 'required|string|max:255',
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|unique:users',
            'password'       => 'required|min:8|confirmed',
            'phone'          => 'nullable|string|max:20',
            'industry'       => 'nullable|string|max:100',
        ]);

        $workspace = Workspace::create([
            'name'          => $data['workspace_name'],
            'slug'          => Str::slug($data['workspace_name']).'-'.Str::random(4),
            'industry'      => $data['industry'] ?? null,
            'plan'          => 'solo',
            'status'        => 'trial',
            'trial_ends_at' => now()->addDays(14),
        ]);

        $user = User::create([
            'workspace_id' => $workspace->id,
            'name'         => $data['name'],
            'email'        => $data['email'],
            'phone'        => $data['phone'] ?? null,
            'password'     => Hash::make($data['password']),
            'role'         => 'owner',
        ]);

        $token = $user->createToken('afrihub')->plainTextToken;

        return response()->json([
            'user'      => $user->load('workspace'),
            'workspace' => $workspace,
            'token'     => $token,
            'message'   => 'Bienvenue sur AFRIHUB ! Votre essai gratuit de 14 jours commence maintenant.',
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $data['email'])->with('workspace')->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'Email ou mot de passe incorrect.']);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Votre compte a ete desactive. Contactez le support.'], 403);
        }

        if (!$user->workspace->isActive()) {
            return response()->json(['message' => 'Votre abonnement a expire. Renouvelez pour continuer.'], 403);
        }

        $user->update(['last_login_at' => now()]);
        $user->tokens()->delete();
        $token = $user->createToken('afrihub')->plainTextToken;

        return response()->json([
            'user'      => $user,
            'workspace' => $user->workspace,
            'token'     => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Deconnexion reussie.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('workspace'));
    }

    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
        ]);
        $request->user()->update($data);
        return response()->json($request->user());
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required',
            'password'         => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($data['current_password'], $request->user()->password)) {
            throw ValidationException::withMessages(['current_password' => 'Mot de passe actuel incorrect.']);
        }

        $request->user()->update(['password' => Hash::make($data['password'])]);
        return response()->json(['message' => 'Mot de passe modifie avec succes.']);
    }
}
