<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>État des lieux</title>
    <style>
        body { 
            font-family: Helvetica, Arial, sans-serif; 
            font-size: 12px; 
            color: #1a1a1a;
            line-height: 1.4;
        }
        h1 { 
            text-align: center;
            color: #8b5cf6;
            font-size: 20px;
            text-transform: uppercase;
            border-bottom: 2px solid #8b5cf6;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        h2 {
            font-size: 16px;
            margin: 0;
            padding: 0;
            border: none;
            background: none;
        }
        .info-table {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .info-table td {
            width: 50%;
            vertical-align: top;
            padding: 10px;
            border: 1px solid #e5e7eb;
        }
        .info-title {
            font-size: 10px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .inventory-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .inventory-table th, .inventory-table td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
        }
        .inventory-table th {
            background-color: #f9fafb;
            font-size: 11px;
            font-weight: bold;
        }
        
        .col-state { width: 40px; text-align: center; font-size: 10px; }
        .col-qty { width: 40px; text-align: center; }
        
        .checkbox {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 1px solid #9ca3af;
        }
        .page-break { page-break-after: always; }
        
        .signature-table {
            width: 100%;
            margin-top: 40px;
            page-break-inside: avoid;
            border-collapse: collapse;
        }
        .signature-box {
            width: 48%;
            border: 1px solid #d1d5db;
            height: 120px;
            padding: 10px;
            vertical-align: top;
        }
        .meter-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .meter-table th, .meter-table td {
            border: 1px solid #d1d5db;
            padding: 10px;
        }
        
        .remarques-box {
            height: 60px;
            vertical-align: top;
            padding-top: 8px;
            background-color: #fff;
        }

        .obs-text {
            display: block;
            font-size: 10px;
            color: #4b5563;
            margin-top: 4px;
            font-style: italic;
        }
        .footer-signatures {
            position: fixed;
            bottom: 0;
            width: 100%;
        }
        .room-header-bar {
            background-color: #f3f4f6;
            border-left: 4px solid #8b5cf6;
            padding: 8px 15px;
            vertical-align: middle;
            height: 75px;
        }
    </style>
</head>
<body>

    @php
        $typeTranslations = [
            'studio' => 'Studio',
            'apartment' => 'Appartement',
            'commercial' => 'Local commercial',
            'garage' => 'Garage',
            'other' => 'Autre'
        ];
        $propertyType = $typeTranslations[$lease->property->type ?? 'other'] ?? ucfirst($lease->property->type);
    @endphp

    <h1>ÉTAT DES LIEUX {{ $type === 'in' ? 'D\'ENTRÉE' : 'DE SORTIE' }}</h1>

    <table class="info-table">
        <tr>
            <td>
                <div class="info-title">Propriété</div>
                <strong>{{ $lease->property->name ?? 'Nom du bien' }}</strong> - {{ $propertyType }}<br>
                Étage : {{ $lease->property->floor ?? 'Non précisé' }}<br>
                Surface : {{ $lease->property->surface_area ?? '-' }} m²<br>
                Adresse : {{ config('building.address') }}, {{ config('building.zip') }} {{ config('building.city') }}
            </td>
            <td>
                <div class="info-title">Détails du document</div>
                Date de l'état des lieux : {{ date('d / m / Y') }}<br>
                Type : {{ $type === 'in' ? 'Entrée' : 'Sortie' }}
            </td>
        </tr>
        <tr>
            <td>
                <div class="info-title">Bailleur</div>
                <strong>{{ config('building.landlord_name') }}</strong><br>
                Adresse : {{ config('building.landlord_address') }}
            </td>
            <td>
                <div class="info-title">Locataire(s)</div>
                @if($lease->tenants && $lease->tenants->count() > 0)
                    @foreach($lease->tenants as $tenant)
                        <strong>{{ $tenant->first_name }} {{ $tenant->last_name }}</strong> - {{ $tenant->current_address }}<br>
                    @endforeach
                @else
                    Non renseigné
                @endif
            </td>
        </tr>
    </table>

    <p style="font-size: 11px; color: #6b7280; text-align: right;">
        Légende : TB (Très Bon) - B (Bon) - M (Moyen) - D (Dégradé)
    </p>

    @if($rooms)
        @foreach($rooms as $room)
            <div style="page-break-inside: avoid; margin-top: 20px;">
                {{-- En-tête de la pièce avec Barre Grise extensible --}}
                <table width="100%" style="border-collapse: collapse; margin-bottom: 10px;">
                    <tr>
                        <td class="room-header-bar" width="100%">
                            <h2 style="text-transform: uppercase;">{{ $room->name }}</h2>
                        </td>

                        {{-- Cette cellule ne s'affiche que si le QR Code existe --}}
                        @if($room->qr_code_svg)
                            {{-- On agrandit la cellule pour accommoder le QR Code plus dense --}}
                            <td style="width: 110px; text-align: right; vertical-align: middle; padding-left: 10px; white-space: nowrap;">
                                <div style="display: inline-block; text-align: center;">
                                    {{-- On agrandit aussi l'image du QR Code pour faciliter le scan --}}
                                    <img src="{{ $room->qr_code_svg }}" width="70" height="70" style="display: block; margin-left: auto;">
                                    <div style="font-size: 6px; color: #8b5cf6; font-weight: bold; text-transform: uppercase; margin-top: 2px;">
                                        Scanner pour photos
                                    </div>
                                </div>
                            </td>
                        @endif
                    </tr>
                </table>
                
                <table class="inventory-table">
                    <thead>
                        <tr>
                            <th class="col-qty">Qté</th>
                            <th>Élément / Description</th>
                            <th class="col-state">TB</th>
                            <th class="col-state">B</th>
                            <th class="col-state">M</th>
                            <th class="col-state">D</th>
                        </tr>
                    </thead>
                    <tbody>
                    @if($room->equipments && $room->equipments->count() > 0)
                        @foreach($room->equipments as $equipment)
                            <tr style="page-break-inside: avoid;">
                                <td class="col-qty">{{ $equipment->quantity }}</td>
                                <td>
                                    <strong>{{ $equipment->name }}</strong>
                                    @if($equipment->notes)
                                        <span class="obs-text">Observations : {{ $equipment->notes }}</span>
                                    @endif
                                </td>
                                <td class="col-state"><div class="checkbox"></div></td>
                                <td class="col-state"><div class="checkbox"></div></td>
                                <td class="col-state"><div class="checkbox"></div></td>
                                <td class="col-state"><div class="checkbox"></div></td>
                            </tr>
                            <tr style="page-break-inside: avoid;">
                                <td colspan="6" class="remarques-box">
                                    <strong>Remarques :</strong> 
                                    
                                    @php
                                        $eqPhotos = $lease->documents->where('equipment_id', $equipment->id)->where('category', 'inventory_photo_' . $type);
                                    @endphp

                                    @if($eqPhotos->count() > 0)
                                        <span style="float: right; font-style: italic; color: #4f46e5; font-size: 10px;">
                                            {{ $eqPhotos->count() }} photo(s) disponible(s) via le scan ci-dessus
                                        </span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    @else
                        <tr>
                            <td colspan="6" style="text-align: center; color: #9ca3af; padding: 15px;">Aucun équipement enregistré.</td>
                        </tr>
                    @endif
                    </tbody>
                </table>
            </div>
        @endforeach
    @endif

    <div class="page-break"></div>

    <h2>COMPTEURS ET CLÉS</h2>

    <table class="meter-table">
        <thead>
            <tr>
                <th>Type</th>
                <th>Relevé / Numéro</th>
                <th>Observations</th>
            </tr>
        </thead>
        <tbody>
            <tr><td><strong>Eau (m³)</strong></td><td></td><td></td></tr>
            <tr><td><strong>Électricité (HP)</strong></td><td></td><td></td></tr>
            <tr><td><strong>Électricité (HC)</strong></td><td></td><td></td></tr>
        </tbody>
    </table>

    <table class="inventory-table" style="margin-top: 20px;">
        <thead>
            <tr>
                <th>Inventaire des clés remises</th>
                <th class="col-qty">Qté</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Clés porte d'entrée immeuble</td><td></td></tr>
            <tr><td>Clés boîte aux lettres</td><td></td></tr>
            <tr><td>Clés porte d'entrée appartement</td><td></td></tr>
        </tbody>
    </table>

    <table class="signature-table">
        <tr>
            <td class="signature-box">
                <strong>Le Locataire</strong><br>
                <span style="font-size: 10px; color: #6b7280;">Mention "Lu et approuvé" et signature</span>
            </td>
            <td style="width: 4%; border: none;"></td>
            <td class="signature-box">
                <strong>Le Bailleur</strong><br>
                <span style="font-size: 10px; color: #6b7280;">Mention "Lu et approuvé" et signature</span>
            </td>
        </tr>
    </table>

    <div class="page-break"></div>
    <h2>ANNEXES PHOTOGRAPHIQUES</h2>

    <div style="width: 100%;">
        @php $photoCount = 0; @endphp
        @foreach($lease->property->rooms as $room)
            @foreach($room->equipments as $equipment)
                @foreach($lease->documents->where('equipment_id', $equipment->id)->where('category', 'inventory_photo_' . $type) as $photo)
                    @php $photoCount++; @endphp
                    <div style="display: inline-block; width: 30%; margin: 1%; vertical-align: top; border: 1px solid #eee; padding: 5px;">
                        <img src="{{ public_path('storage/' . str_replace('public/', '', $photo->file_path)) }}" 
                            style="width: 100%; height: auto; border-radius: 4px;">
                        <p style="font-size: 8px; margin-top: 5px;">
                            <strong>#{{ $photoCount }}</strong> - {{ $room->name }}<br>
                            {{ $equipment->name }} : {{ $photo->name }}
                        </p>
                    </div>
                @endforeach
            @endforeach
        @endforeach
    </div>

</body>
</html>