<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\AdCampaign;
use App\Services\Social\AdService;
use Illuminate\Http\Request;

class AdCampaignController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->workspace->adCampaigns()
                ->orderByDesc('created_at')->paginate(15)
        );
    }

    public function presets()
    {
        return response()->json([
            ['id'=>'preset_commerçantes',  'label'=>'Commerçantes Ouaga',      'platform'=>'facebook', 'description'=>'Femmes 25-45 ans, Ouagadougou, Mode & Commerce', 'budget_min'=>25000],
            ['id'=>'preset_commerciaux',   'label'=>'Jeunes commerciaux BF',   'platform'=>'facebook', 'description'=>'18-30 ans, Burkina Faso, Entrepreneuriat & Revenus', 'budget_min'=>20000],
            ['id'=>'preset_acheteurs',     'label'=>'Acheteurs mode Ouaga',    'platform'=>'facebook', 'description'=>'Mixte 20-40 ans, Ouagadougou, Achats en ligne', 'budget_min'=>50000],
            ['id'=>'preset_professionnels','label'=>'Professionnels Ouaga',    'platform'=>'facebook', 'description'=>'25-50 ans, Ouagadougou, Cadres & Entreprises', 'budget_min'=>40000],
            ['id'=>'preset_etudiants',     'label'=>'Etudiants BF',            'platform'=>'tiktok',  'description'=>'18-25 ans, Burkina Faso, Education & Tech', 'budget_min'=>15000],
            ['id'=>'preset_sante',         'label'=>'Public sante Ouaga',      'platform'=>'facebook', 'description'=>'Adultes 25-55 ans, Ouagadougou, Sante & Bien-etre', 'budget_min'=>30000],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'              => 'required|string|max:255',
            'platform'          => 'required|in:facebook,instagram,tiktok',
            'objective'         => 'required|in:reach,traffic,lead_gen,conversions',
            'target_preset'     => 'nullable|string',
            'custom_targeting'  => 'nullable|array',
            'budget_total'      => 'required|numeric|min:5000',
            'budget_daily'      => 'nullable|numeric',
            'start_date'        => 'required|date|after_or_equal:today',
            'end_date'          => 'nullable|date|after:start_date',
            'post_id'           => 'nullable|exists:posts,id',
        ]);

        $ws     = $request->user()->workspace;
        $limits = $ws->getPlanLimits();
        if ($limits['campaigns'] === 0) {
            return response()->json(['message' => 'La gestion des campagnes publicitaires n\'est pas disponible dans votre plan.'], 422);
        }
        if ($limits['campaigns'] !== -1) {
            $active = $ws->adCampaigns()->where('status','active')->count();
            if ($active >= $limits['campaigns']) {
                return response()->json(['message' => 'Nombre maximum de campagnes actives atteint.'], 422);
            }
        }

        $campaign = AdCampaign::create([
            ...$data,
            'workspace_id' => $ws->id,
            'user_id'      => $request->user()->id,
            'status'       => 'draft',
        ]);

        return response()->json($campaign, 201);
    }

    public function launch(Request $request, AdCampaign $campaign)
    {
        abort_unless($campaign->workspace_id === $request->user()->workspace_id, 403);
        if ($campaign->status !== 'draft') {
            return response()->json(['message' => 'Cette campagne ne peut pas etre lancee.'], 422);
        }

        try {
            $adService = app(AdService::class);
            $result    = $adService->createCampaign($campaign);
            $campaign->update([
                'status'               => 'active',
                'platform_campaign_id' => $result['campaign_id'],
                'platform_adset_id'    => $result['adset_id'],
                'platform_ad_id'       => $result['ad_id'],
            ]);
            return response()->json(['message' => 'Campagne lancee avec succes.', 'campaign' => $campaign]);
        } catch (\Exception $e) {
            $campaign->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur au lancement: '.$e->getMessage()], 422);
        }
    }

    public function pause(Request $request, AdCampaign $campaign)
    {
        abort_unless($campaign->workspace_id === $request->user()->workspace_id, 403);
        $campaign->update(['status' => 'paused']);
        return response()->json(['message' => 'Campagne mise en pause.']);
    }

    public function show(Request $request, AdCampaign $campaign)
    {
        abort_unless($campaign->workspace_id === $request->user()->workspace_id, 403);
        return response()->json($campaign);
    }
}
