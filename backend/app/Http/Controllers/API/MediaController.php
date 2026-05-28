<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->workspace->media()
                ->when($request->type, fn($q) => $q->where('type', $request->type))
                ->orderByDesc('created_at')
                ->paginate(30)
        );
    }

    public function upload(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png,gif,mp4,mov|max:102400']);
        $file     = $request->file('file');
        $mimeType = $file->getMimeType();
        $type     = str_starts_with($mimeType, 'image') ? 'image' : 'video';
        $path     = $file->store("workspace_{$request->user()->workspace_id}/media", 'public');
        $url      = Storage::url($path);

        $width = $height = null;
        if ($type === 'image') {
            [$width, $height] = getimagesize($file->getPathname()) ?: [null, null];
        }

        $media = Media::create([
            'workspace_id' => $request->user()->workspace_id,
            'user_id'      => $request->user()->id,
            'name'         => $file->getClientOriginalName(),
            'file_path'    => $path,
            'file_url'     => $url,
            'mime_type'    => $mimeType,
            'file_size'    => $file->getSize(),
            'type'         => $type,
            'width'        => $width,
            'height'       => $height,
        ]);

        return response()->json($media, 201);
    }

    public function destroy(Request $request, Media $media)
    {
        abort_unless($media->workspace_id === $request->user()->workspace_id, 403);
        Storage::disk('public')->delete($media->file_path);
        $media->delete();
        return response()->json(['message' => 'Fichier supprime.']);
    }
}
