<?php
namespace App\Services\Social;
use App\Models\AdCampaign;
use Illuminate\Support\Facades\Http;

class AdService
{
    private array $presetTargeting = [
        'preset_commerçantes'  => ['age_min'=>25,'age_max'=>45,'genders'=>[2],'geo_locations'=>['cities'=>[['key'=>'2054345','name'=>'Ouagadougou','country'=>'BF']]],'interests'=>[['id'=>'6003348604981','name'=>'Mode'],['id'=>'6003352965791','name'=>'Commerce']]],
        'preset_commerciaux'   => ['age_min'=>18,'age_max'=>30,'geo_locations'=>['countries'=>['BF']],'interests'=>[['id'=>'6003327918206','name'=>'Entrepreneuriat']]],
        'preset_acheteurs'     => ['age_min'=>20,'age_max'=>40,'geo_locations'=>['cities'=>[['key'=>'2054345','name'=>'Ouagadougou','country'=>'BF']]],'behaviors'=>[['id'=>'6002714895372','name'=>'Online buyers']]],
        'preset_professionnels'=> ['age_min'=>25,'age_max'=>50,'geo_locations'=>['cities'=>[['key'=>'2054345','name'=>'Ouagadougou','country'=>'BF']]],'interests'=>[['id'=>'6003382312177','name'=>'Business']]],
        'preset_etudiants'     => ['age_min'=>18,'age_max'=>25,'geo_locations'=>['countries'=>['BF']],'education_statuses'=>[2,3,7,8]],
        'preset_sante'         => ['age_min'=>25,'age_max'=>55,'geo_locations'=>['cities'=>[['key'=>'2054345','name'=>'Ouagadougou','country'=>'BF']]],'interests'=>[['id'=>'6003023447279','name'=>'Sante']]],
    ];

    public function createCampaign(AdCampaign $campaign): array
    {
        $adAccountId = config('services.meta_ads.account_id');
        $token       = config('services.meta_ads.access_token');
        $baseUrl     = 'https://graph.facebook.com/v19.0';

        $objectiveMap = [
            'reach'       => 'REACH',
            'traffic'     => 'OUTCOME_TRAFFIC',
            'lead_gen'    => 'OUTCOME_LEADS',
            'conversions' => 'OUTCOME_SALES',
        ];

        // 1. Campagne
        $campaignResp = Http::post("{$baseUrl}/act_{$adAccountId}/campaigns", [
            'name'                    => $campaign->name,
            'objective'               => $objectiveMap[$campaign->objective],
            'status'                  => 'ACTIVE',
            'special_ad_categories'   => [],
            'access_token'            => $token,
        ]);
        if (!$campaignResp->successful()) throw new \Exception('Meta campaign error: '.$campaignResp->json('error.message'));

        $targeting = $campaign->target_preset
            ? ($this->presetTargeting[$campaign->target_preset] ?? [])
            : ($campaign->custom_targeting ?? []);

        // 2. AdSet
        $adSetResp = Http::post("{$baseUrl}/act_{$adAccountId}/adsets", [
            'campaign_id'       => $campaignResp->json('id'),
            'name'              => $campaign->name.' - AdSet',
            'daily_budget'      => ($campaign->budget_daily ?? ($campaign->budget_total / max(1, $campaign->start_date->diffInDays($campaign->end_date ?? now()->addDays(7))))) * 655,
            'targeting'         => $targeting,
            'optimization_goal' => 'LINK_CLICKS',
            'billing_event'     => 'IMPRESSIONS',
            'start_time'        => $campaign->start_date->toIso8601String(),
            'end_time'          => $campaign->end_date?->toIso8601String(),
            'status'            => 'ACTIVE',
            'access_token'      => $token,
        ]);
        if (!$adSetResp->successful()) throw new \Exception('Meta adset error: '.$adSetResp->json('error.message'));

        return [
            'campaign_id' => $campaignResp->json('id'),
            'adset_id'    => $adSetResp->json('id'),
            'ad_id'       => null,
        ];
    }
}
