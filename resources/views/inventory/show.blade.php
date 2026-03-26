<div class="p-4">
    <h1 class="text-xl font-bold mb-4">Galerie Photos - {{ $property->name }}</h1>
    
    <div class="grid grid-cols-2 gap-4">
        @foreach($photos as $photo)
            <div class="border rounded shadow-sm">
                <img src="{{ asset('storage/' . $photo->file_path) }}" class="w-full h-auto">
                <p class="p-2 text-sm">{{ $photo->name }}</p>
            </div>
        @endforeach
    </div>

    @if($photos->isEmpty())
        <p class="text-gray-500">Aucune photo trouvée pour cette pièce.</p>
    @endif
</div>