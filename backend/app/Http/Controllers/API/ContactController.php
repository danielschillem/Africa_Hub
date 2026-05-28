<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->workspace->contacts()
                ->when($request->tag, fn($q) => $q->where('tags','like','%'.$request->tag.'%'))
                ->when($request->search, fn($q) => $q->where(fn($q2) => $q2->where('name','like','%'.$request->search.'%')->orWhere('phone','like','%'.$request->search.'%')))
                ->orderBy('name')
                ->paginate(50)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'               => 'required|string|max:255',
            'phone'              => 'required|string|max:20',
            'email'              => 'nullable|email',
            'tags'               => 'nullable|array',
            'whatsapp_opted_in'  => 'boolean',
        ]);

        $contact = Contact::create([
            ...$data,
            'workspace_id' => $request->user()->workspace_id,
        ]);
        return response()->json($contact, 201);
    }

    public function importCsv(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt|max:5120']);
        $file     = $request->file('file');
        $lines    = array_filter(file($file->getPathname()));
        $imported = 0;
        $errors   = [];

        foreach (array_slice($lines, 1) as $i => $line) {
            $cols = str_getcsv(trim($line));
            if (count($cols) < 2) { $errors[] = "Ligne $i invalide"; continue; }
            try {
                Contact::updateOrCreate(
                    ['workspace_id' => $request->user()->workspace_id, 'phone' => trim($cols[1])],
                    ['name' => trim($cols[0]), 'email' => $cols[2] ?? null, 'tags' => isset($cols[3]) ? [trim($cols[3])] : []]
                );
                $imported++;
            } catch (\Exception $e) { $errors[] = "Ligne $i: ".$e->getMessage(); }
        }

        return response()->json(['imported' => $imported, 'errors' => $errors]);
    }

    public function destroy(Request $request, Contact $contact)
    {
        abort_unless($contact->workspace_id === $request->user()->workspace_id, 403);
        $contact->delete();
        return response()->json(['message' => 'Contact supprime.']);
    }

    public function optOut(Request $request, Contact $contact)
    {
        abort_unless($contact->workspace_id === $request->user()->workspace_id, 403);
        $contact->update(['whatsapp_opted_in' => false]);
        return response()->json(['message' => 'Contact desabonne des notifications WhatsApp.']);
    }
}
