<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\Broadcast;
use App\Jobs\SendBroadcast;
use Illuminate\Http\Request;

class BroadcastController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->workspace->broadcasts()
                ->with('user:id,name')
                ->orderByDesc('created_at')
                ->paginate(15)
        );
    }

    public function templates(Request $request)
    {
        // Templates WhatsApp pre-valides par Meta pour AFRIHUB
        $templates = [
            ['id'=>'afrihub_live_reminder',    'name'=>'Rappel live',       'vars'=>['heure','theme','lien'],           'preview'=>'Live ce soir a {{1}} - Theme : {{2}} - Rejoindre : {{3}}'],
            ['id'=>'afrihub_new_product',      'name'=>'Nouveau produit',   'vars'=>['nom_produit','prix','lien'],      'preview'=>'Nouveau : {{1}} disponible a {{2}} FCFA. Commander : {{3}}'],
            ['id'=>'afrihub_promo',            'name'=>'Promotion',         'vars'=>['description','code','expiration'],'preview'=>'Offre speciale : {{1}}. Code : {{2}}. Jusqu\'au {{3}}.'],
            ['id'=>'afrihub_news',             'name'=>'Actualite',         'vars'=>['titre','corps','lien'],           'preview'=>'{{1}} - {{2}} - En savoir plus : {{3}}'],
            ['id'=>'afrihub_event_reminder',   'name'=>'Rappel evenement',  'vars'=>['evenement','date','lieu'],        'preview'=>'Rappel : {{1}} le {{2}} a {{3}}. Ne manquez pas!'],
            ['id'=>'afrihub_order_confirmed',  'name'=>'Commande confirmee','vars'=>['nom','produit','montant'],        'preview'=>'Bonjour {{1}}, votre commande {{2}} de {{3}} FCFA est confirmee.'],
            ['id'=>'afrihub_recrut',           'name'=>'Recrutement',       'vars'=>['poste','avantage','lien'],        'preview'=>'Rejoignez notre equipe : {{1}}. {{2}}. Postuler : {{3}}'],
        ];
        return response()->json($templates);
    }

    public function segments(Request $request)
    {
        // Compter les contacts par segment en temps reel
        $ws  = $request->user()->workspace;
        $all = $ws->contacts()->where('whatsapp_opted_in', true)->where('is_active', true);

        return response()->json([
            ['id'=>'all',        'label'=>'Tous les contacts',       'count'=>$all->count()],
            ['id'=>'clients',    'label'=>'Clients actifs',          'count'=>$all->where('tags','like','%client%')->count()],
            ['id'=>'leads',      'label'=>'Prospects',               'count'=>$all->where('tags','like','%prospect%')->count()],
            ['id'=>'vip',        'label'=>'Contacts VIP',            'count'=>$all->where('tags','like','%vip%')->count()],
            ['id'=>'newsletter', 'label'=>'Abonnes newsletter',      'count'=>$all->where('tags','like','%newsletter%')->count()],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'              => 'required|string|max:255',
            'template_id'       => 'required|string',
            'template_name'     => 'required|string',
            'template_vars'     => 'nullable|array',
            'segment'           => 'required|string',
            'recipient_filters' => 'nullable|array',
            'scheduled_at'      => 'nullable|date|after:now',
        ]);

        // Verifier les limites
        $ws     = $request->user()->workspace;
        $limits = $ws->getPlanLimits();
        if ($limits['broadcasts_per_month'] !== -1) {
            $thisMonth = $ws->broadcasts()->whereMonth('created_at', now()->month)->count();
            if ($thisMonth >= $limits['broadcasts_per_month']) {
                return response()->json(['message' => 'Limite mensuelle de broadcasts atteinte.'], 422);
            }
        }

        // Compter les destinataires
        $contacts = $ws->contacts()
            ->where('whatsapp_opted_in', true)
            ->where('is_active', true);

        if ($data['segment'] !== 'all') {
            $contacts = $contacts->where('tags', 'like', '%'.$data['segment'].'%');
        }
        $total = $contacts->count();

        if ($total === 0) {
            return response()->json(['message' => 'Aucun destinataire trouve pour ce segment.'], 422);
        }

        $broadcast = Broadcast::create([
            ...$data,
            'workspace_id'     => $ws->id,
            'user_id'          => $request->user()->id,
            'status'           => $data['scheduled_at'] ? 'scheduled' : 'draft',
            'total_recipients' => $total,
        ]);

        return response()->json($broadcast, 201);
    }

    public function send(Request $request, Broadcast $broadcast)
    {
        abort_unless($broadcast->workspace_id === $request->user()->workspace_id, 403);
        if (in_array($broadcast->status, ['sending','sent'])) {
            return response()->json(['message' => 'Broadcast deja envoye ou en cours.'], 422);
        }
        SendBroadcast::dispatch($broadcast)->onQueue('broadcasts');
        return response()->json(['message' => "Envoi en cours pour {$broadcast->total_recipients} destinataires."]);
    }

    public function show(Request $request, Broadcast $broadcast)
    {
        abort_unless($broadcast->workspace_id === $request->user()->workspace_id, 403);
        return response()->json($broadcast);
    }

    public function destroy(Request $request, Broadcast $broadcast)
    {
        abort_unless($broadcast->workspace_id === $request->user()->workspace_id, 403);
        if ($broadcast->status === 'sending') {
            return response()->json(['message' => 'Envoi en cours, impossible de supprimer.'], 422);
        }
        $broadcast->delete();
        return response()->json(['message' => 'Broadcast supprime.']);
    }
}
