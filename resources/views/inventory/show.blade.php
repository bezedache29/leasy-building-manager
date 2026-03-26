<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>État des lieux - {{ $property->name }}</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.6/viewer.min.css">
    
    <style>
        :root {
            --bg: 20 16 32;
            --surface: 30 24 50;
            --surface-2: 40 32 66;
            --border: 72 56 120;
            --text: 245 243 255;
            --muted: 196 181 253;
            --primary-400: 167 139 250;
            --primary-500: 139 92 246;
            --primary-900: 76 29 149;
        }

        body {
            background-color: rgb(var(--bg));
            color: rgb(var(--text));
        }

        .bg-surface { background-color: rgb(var(--surface)); }
        .bg-surface-2 { background-color: rgb(var(--surface-2)); }
        .text-muted { color: rgb(var(--muted)); }
        .border-app { border-color: rgb(var(--border)); }
        .text-primary { color: rgb(var(--primary-400)); }
    </style>

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            400: 'rgb(var(--primary-400))',
                            500: 'rgb(var(--primary-500))',
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="min-h-screen font-sans antialiased">

    <div id="leasy-gallery" class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div class="bg-surface p-8 rounded-lg shadow-lg border border-app text-center md:text-left">
            <h1 class="text-3xl font-extrabold text-[rgb(var(--text))]">
                {{ $property->name }} - <span class="text-primary">État des lieux</span>
            </h1>
            <p class="mt-2 text-sm text-muted">
                Galerie de photos pour la pièce : <strong class="text-[rgb(var(--text))]">{{ $room->name }}</strong>
            </p>
        </div>

        <div class="bg-surface p-8 rounded-lg shadow-lg border border-app space-y-10">
            <h2 class="text-2xl font-semibold text-[rgb(var(--text))] border-b border-app pb-4">
                Photos de la pièce ({{ $photos->count() }})
            </h2>

            @if($photos->isEmpty())
                <div class="text-center py-16 bg-surface-2 rounded-xl border-2 border-dashed border-app">
                    <p class="text-lg font-medium text-[rgb(var(--text))]">Aucune photo trouvée pour cette pièce.</p>
                </div>
            @else
                @php
                    $generalPhotos = $photos->whereNull('equipment_id');
                @endphp

                @if($generalPhotos->isNotEmpty())
                    <div class="space-y-4">
                        <h3 class="text-lg font-medium text-[rgb(var(--text))] flex items-center gap-2">
                            <span class="text-primary">📸</span> Vues générales
                        </h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            @foreach($generalPhotos as $photo)
                                <div class="bg-surface-2 border border-app rounded-xl overflow-hidden shadow-sm hover:border-primary-500 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                                    <img src="{{ URL::temporarySignedRoute('documents.public', now()->addHours(24), ['document' => $photo->id]) }}"
                                         alt="{{ $photo->name ?: 'Vue générale' }}"
                                         class="w-full h-56 object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
                                    <div class="p-4 space-y-1 bg-surface-2 relative z-10">
                                        <p class="text-sm font-semibold text-[rgb(var(--text))] truncate">{{ $photo->name ?: 'Photo sans nom' }}</p>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                @if(isset($equipments) && $equipments->isNotEmpty())
                    @foreach($equipments as $equipment)
                        @php
                            $equipmentPhotos = $photos->where('equipment_id', $equipment->id);
                        @endphp

                        @if($equipmentPhotos->isNotEmpty())
                            <div class="space-y-4 pt-6 border-t border-app">
                                <h3 class="text-lg font-medium text-[rgb(var(--text))] flex items-center gap-2">
                                    <span class="text-primary">🔧</span> {{ $equipment->name }}
                                </h3>
                                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    @foreach($equipmentPhotos as $photo)
                                        <div class="bg-surface-2 border border-app rounded-xl overflow-hidden shadow-sm hover:border-primary-500 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                                            <img src="{{ URL::temporarySignedRoute('documents.public', now()->addHours(24), ['document' => $photo->id]) }}"
                                                 alt="{{ $photo->name ?: 'Équipement ' . $equipment->name }}"
                                                 class="w-full h-56 object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
                                            <div class="p-4 space-y-1 bg-surface-2 relative z-10">
                                                <p class="text-sm font-semibold text-[rgb(var(--text))] truncate">{{ $photo->name ?: 'Photo sans nom' }}</p>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        @endif
                    @endforeach
                @endif
            @endif
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.6/viewer.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const gallery = document.getElementById('leasy-gallery');
            
            if (gallery) {
                // Initialisation de Viewer.js sur tout le container
                new Viewer(gallery, {
                    url: 'src',
                    toolbar: {
                        zoomIn: 1,
                        zoomOut: 1,
                        oneToOne: 1,
                        reset: 1,
                        prev: 1,
                        play: 0,
                        next: 1,
                        rotateLeft: 1,
                        rotateRight: 1,
                        flipHorizontal: 0,
                        flipVertical: 0,
                    },
                    // Desactive le fond cliquable pour eviter de fermer accidentellement en "glissant"
                    backdrop: true,
                    // Active la navigation au clavier et molette
                    keyboard: true,
                    zoomable: true,
                    movable: true,
                    // Transition fluide
                    transition: true,
                });
            }
        });
    </script>
</body>
</html>