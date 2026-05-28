<?php
namespace App\Services\Social;
use App\Models\Broadcast;
use App\Models\Contact;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private string $baseUrl;
    private string $apiKey;
    const BATCH_SIZE  = 50;
    const BATCH_DELAY = 1000000; // 1 seconde en microsecondes

    public function __construct()
    {
        $this->baseUrl = config('services.termii.base_url', 'https://api.ng.termii.com/api');
        $this->apiKey  = config('services.termii.api_key');
    }

    public function sendBroadcast(Broadcast $broadcast): void
    {
        $broadcast->update(['status' => 'sending']);
        $contacts = $this->getSegmentContacts($broadcast);
        $broadcast->update(['total_recipients' => $contacts->count()]);

        $contacts->chunk(self::BATCH_SIZE, function($batch) use ($broadcast) {
            foreach ($batch as $contact) {
                $this->sendToContact($contact, $broadcast);
            }
            usleep(self::BATCH_DELAY);
        });

        $broadcast->update(['status' => 'sent', 'sent_at' => now()]);
    }

    private function sendToContact(Contact $contact, Broadcast $broadcast): void
    {
        try {
            $vars = $this->resolveVariables($broadcast->template_vars ?? [], $contact);
            $response = Http::withHeaders(['Authorization' => 'Termii '.$this->apiKey])
                ->post("{$this->baseUrl}/push/whatsapp", [
                    'to'           => $contact->phone,
                    'from'         => 'AFRIHUB',
                    'type'         => 'whatsapp',
                    'channel'      => 'whatsapp',
                    'template_id'  => $broadcast->template_id,
                    'template_variables' => array_values($vars),
                ]);

            if ($response->successful()) {
                $broadcast->increment('sent_count');
                $broadcast->increment('delivered_count');
            } else {
                $broadcast->increment('failed_count');
                Log::warning('WhatsApp send failed', ['contact' => $contact->id, 'response' => $response->body()]);
            }
        } catch (\Exception $e) {
            $broadcast->increment('failed_count');
            Log::error('WhatsApp exception', ['contact' => $contact->id, 'error' => $e->getMessage()]);
        }
    }

    private function resolveVariables(array $vars, Contact $contact): array
    {
        $resolved = [];
        foreach ($vars as $key => $val) {
            $resolved[$key] = match(true) {
                $val === '{{contact_name}}' => $contact->name,
                $val === '{{contact_phone}}'=> $contact->phone,
                default => $val,
            };
        }
        return $resolved;
    }

    private function getSegmentContacts(Broadcast $broadcast)
    {
        $query = $broadcast->workspace->contacts()
            ->where('whatsapp_opted_in', true)
            ->where('is_active', true);

        if ($broadcast->segment !== 'all') {
            $query->where('tags', 'like', '%'.$broadcast->segment.'%');
        }
        return $query->get();
    }
}
