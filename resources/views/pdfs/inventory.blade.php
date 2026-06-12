<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>État des lieux</title>
    <style>
        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #1a1a1a;
            line-height: 1.4;
        }
        h1 {
            text-align: center;
            color: #8b5cf6;
            font-size: 18px;
            text-transform: uppercase;
            border-bottom: 2px solid #8b5cf6;
            padding-bottom: 8px;
            margin-bottom: 20px;
        }
        h2 {
            font-size: 13px;
            margin: 0;
            padding: 0;
            border: none;
            background: none;
        }
        .info-table {
            width: 100%;
            margin-bottom: 16px;
            border-collapse: collapse;
        }
        .info-table td {
            width: 50%;
            vertical-align: top;
            padding: 8px 10px;
            border: 1px solid #e5e7eb;
        }
        .info-title {
            font-size: 9px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .inventory-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .inventory-table th, .inventory-table td {
            border: 1px solid #d1d5db;
            padding: 5px 6px;
            text-align: left;
        }
        .inventory-table th {
            font-size: 10px;
            font-weight: bold;
        }
        .th-entree {
            background-color: #ede9fe;
            text-align: center;
            color: #5b21b6;
        }
        .th-sortie {
            background-color: #dcfce7;
            text-align: center;
            color: #166534;
        }
        .th-neutral {
            background-color: #f9fafb;
        }
        .col-state {
            width: 28px;
            text-align: center;
            font-size: 10px;
        }
        .col-qty { width: 30px; text-align: center; }
        .checkbox {
            display: inline-block;
            width: 11px;
            height: 11px;
            border: 1px solid #9ca3af;
        }
        .page-break { page-break-after: always; }
        .remarques-label {
            font-size: 9px;
            font-weight: bold;
            color: #6b7280;
            width: 80px;
            vertical-align: top;
            padding-top: 6px;
        }
        .remarques-box {
            height: 40px;
            vertical-align: top;
            padding-top: 4px;
        }
        .room-header-bar {
            background-color: #f3f4f6;
            border-left: 4px solid #8b5cf6;
            padding: 6px 12px;
            vertical-align: middle;
            height: 60px;
        }
        .meter-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }
        .meter-table th, .meter-table td {
            border: 1px solid #d1d5db;
            padding: 7px 10px;
        }
        .meter-table th { background-color: #f9fafb; font-size: 10px; }
        .signature-section-title {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 6px 10px;
            margin-top: 20px;
            margin-bottom: 8px;
        }
        .signature-title-entree {
            background-color: #ede9fe;
            color: #5b21b6;
            border-left: 4px solid #8b5cf6;
        }
        .signature-title-sortie {
            background-color: #dcfce7;
            color: #166534;
            border-left: 4px solid #16a34a;
        }
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            page-break-inside: avoid;
        }
        .signature-box {
            width: 48%;
            border: 1px solid #d1d5db;
            height: 90px;
            padding: 8px;
            vertical-align: top;
        }
        .obs-text {
            display: block;
            font-size: 9px;
            color: #4b5563;
            margin-top: 3px;
            font-style: italic;
        }
    </style>
</head>
<body>

    @php
        $typeTranslations = [
            'studio'     => 'Studio',
            'apartment'  => 'Appartement',
            'commercial' => 'Local commercial',
            'garage'     => 'Garage',
            'other'      => 'Autre',
        ];
        $propertyType = $typeTranslations[$lease->property->type ?? 'other'] ?? ucfirst($lease->property->type);
    @endphp

    <h1>ÉTAT DES LIEUX — ENTRÉE / SORTIE</h1>

    {{-- Infos du bien et des parties --}}
    <table class="info-table">
        <tr>
            <td>
                <div class="info-title">Propriété</div>
                <strong>{{ $lease->property->name ?? 'Nom du bien' }}</strong> — {{ $propertyType }}<br>
                Étage : {{ $lease->property->floor ?? 'Non précisé' }}<br>
                Surface : {{ $lease->property->surface_area ?? '—' }} m²<br>
                Adresse : {{ config('building.address') }}, {{ config('building.zip') }} {{ config('building.city') }}
            </td>
            <td>
                <div class="info-title">Bailleur</div>
                <strong>{{ config('building.landlord_name') }}</strong><br>
                {{ config('building.landlord_address') }}
            </td>
        </tr>
        <tr>
            <td>
                <div class="info-title">Locataire(s)</div>
                @foreach($lease->tenants as $tenant)
                    <strong>{{ $tenant->first_name }} {{ $tenant->last_name }}</strong>
                    @if($tenant->current_address)
                        — {{ $tenant->current_address }}
                    @endif
                    <br>
                @endforeach
            </td>
            <td>
                <div class="info-title">Dates</div>
                <table width="100%" style="border-collapse:collapse;">
                    <tr>
                        <td style="padding:3px 0; width:50%;">
                            <span style="font-size:9px; color:#5b21b6; font-weight:bold;">ENTRÉE</span><br>
                            Date : <span style="border-bottom: 1px solid #999; display:inline-block; min-width:100px;">
                                {{ \Carbon\Carbon::parse($lease->start_date)->format('d / m / Y') }}
                            </span>
                        </td>
                        <td style="padding:3px 0; padding-left:10px;">
                            <span style="font-size:9px; color:#166534; font-weight:bold;">SORTIE</span><br>
                            Date : <span style="border-bottom: 1px solid #999; display:inline-block; min-width:100px;">&nbsp;</span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <p style="font-size: 10px; color: #6b7280; text-align: right; margin-bottom: 10px;">
        Légende : <strong>TB</strong> = Très Bon &nbsp;|&nbsp; <strong>B</strong> = Bon &nbsp;|&nbsp; <strong>M</strong> = Moyen &nbsp;|&nbsp; <strong>D</strong> = Dégradé
    </p>

    {{-- Pièces et équipements --}}
    @if($rooms)
        @foreach($rooms as $room)
            <div style="page-break-inside: avoid; margin-top: 16px;">

                {{-- En-tête de la pièce --}}
                <table width="100%" style="border-collapse: collapse; margin-bottom: 8px;">
                    <tr>
                        <td class="room-header-bar" width="100%">
                            <h2 style="text-transform: uppercase;">{{ $room->name }}</h2>
                            @if($room->surface_area)
                                <span style="font-size:9px; color:#6b7280;">{{ $room->surface_area }} m²</span>
                            @endif
                        </td>
                        @if($room->qr_code_svg)
                            <td style="width:90px; text-align:right; vertical-align:middle; padding-left:8px; white-space:nowrap;">
                                <div style="display:inline-block; text-align:center;">
                                    <img src="{{ $room->qr_code_svg }}" width="65" height="65" style="display:block; margin-left:auto;">
                                    <div style="font-size:6px; color:#8b5cf6; font-weight:bold; text-transform:uppercase; margin-top:2px;">
                                        Scanner pour photos
                                    </div>
                                </div>
                            </td>
                        @endif
                    </tr>
                </table>

                {{-- Tableau équipements avec colonnes Entrée / Sortie --}}
                <table class="inventory-table">
                    <thead>
                        <tr>
                            <th class="col-qty th-neutral" rowspan="2">Qté</th>
                            <th class="th-neutral" rowspan="2">Élément / Description</th>
                            <th class="th-entree" colspan="4">ENTRÉE</th>
                            <th class="th-sortie" colspan="4">SORTIE</th>
                        </tr>
                        <tr>
                            <th class="col-state th-entree">TB</th>
                            <th class="col-state th-entree">B</th>
                            <th class="col-state th-entree">M</th>
                            <th class="col-state th-entree">D</th>
                            <th class="col-state th-sortie">TB</th>
                            <th class="col-state th-sortie">B</th>
                            <th class="col-state th-sortie">M</th>
                            <th class="col-state th-sortie">D</th>
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
                                        <span class="obs-text">{{ $equipment->notes }}</span>
                                    @endif
                                </td>
                                {{-- Entrée --}}
                                <td class="col-state"><div class="checkbox"></div></td>
                                <td class="col-state"><div class="checkbox"></div></td>
                                <td class="col-state"><div class="checkbox"></div></td>
                                <td class="col-state"><div class="checkbox"></div></td>
                                {{-- Sortie --}}
                                <td class="col-state"><div class="checkbox"></div></td>
                                <td class="col-state"><div class="checkbox"></div></td>
                                <td class="col-state"><div class="checkbox"></div></td>
                                <td class="col-state"><div class="checkbox"></div></td>
                            </tr>
                            {{-- Ligne remarques entrée --}}
                            <tr style="page-break-inside: avoid;">
                                <td colspan="2" class="remarques-label" style="background:#faf5ff;">Obs. entrée :</td>
                                <td colspan="8" class="remarques-box" style="background:#faf5ff;">
                                    @php
                                        $eqPhotosIn = $propertyDocs->where('equipment_id', $equipment->id);
                                    @endphp
                                    @if($eqPhotosIn->count() > 0)
                                        <span style="float:right; font-style:italic; color:#4f46e5; font-size:9px;">
                                            {{ $eqPhotosIn->count() }} photo(s) — voir annexe
                                        </span>
                                    @endif
                                </td>
                            </tr>
                            {{-- Ligne remarques sortie --}}
                            <tr style="page-break-inside: avoid;">
                                <td colspan="2" class="remarques-label" style="background:#f0fdf4;">Obs. sortie :</td>
                                <td colspan="8" class="remarques-box" style="background:#f0fdf4;"></td>
                            </tr>
                        @endforeach
                    @else
                        <tr>
                            <td colspan="10" style="text-align:center; color:#9ca3af; padding:12px;">Aucun équipement enregistré.</td>
                        </tr>
                    @endif
                    </tbody>
                </table>
            </div>
        @endforeach
    @endif

    <div class="page-break"></div>

    {{-- Compteurs et clés --}}
    <h2 style="margin-bottom:10px;">COMPTEURS</h2>
    <table class="meter-table">
        <thead>
            <tr>
                <th>Type</th>
                <th style="background:#ede9fe; color:#5b21b6;">Relevé entrée</th>
                <th style="background:#dcfce7; color:#166534;">Relevé sortie</th>
                <th>Observations</th>
            </tr>
        </thead>
        <tbody>
            <tr><td><strong>Eau (m³)</strong></td><td></td><td></td><td></td></tr>
            <tr><td><strong>Électricité (HP)</strong></td><td></td><td></td><td></td></tr>
            <tr><td><strong>Électricité (HC)</strong></td><td></td><td></td><td></td></tr>
        </tbody>
    </table>

    <h2 style="margin-bottom:10px; margin-top:16px;">INVENTAIRE DES CLÉS</h2>
    <table class="meter-table">
        <thead>
            <tr>
                <th>Type de clé</th>
                <th style="background:#ede9fe; color:#5b21b6;">Remises à l'entrée</th>
                <th style="background:#dcfce7; color:#166534;">Restituées à la sortie</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Clés porte d'entrée immeuble</td>
                <td>{{ $lease->keys_building_count ?? '' }}</td>
                <td></td>
            </tr>
            <tr>
                <td>Clés boîte aux lettres</td>
                <td>{{ $lease->keys_mailbox_count ?? '' }}</td>
                <td></td>
            </tr>
            <tr>
                <td>Clés porte d'entrée appartement</td>
                <td>{{ $lease->keys_apartment_count ?? '' }}</td>
                <td></td>
            </tr>
        </tbody>
    </table>

    {{-- Signatures ENTRÉE --}}
    <div class="signature-section-title signature-title-entree">Signatures — État des lieux d'entrée</div>
    <table class="signature-table">
        <tr>
            <td class="signature-box">
                <strong>Le Locataire</strong><br>
                <span style="font-size:9px; color:#6b7280;">Mention "Lu et approuvé" et signature</span>
            </td>
            <td style="width:4%; border:none;"></td>
            <td class="signature-box">
                <strong>Le Bailleur</strong><br>
                <span style="font-size:9px; color:#6b7280;">Mention "Lu et approuvé" et signature</span>
            </td>
        </tr>
    </table>

    {{-- Signatures SORTIE --}}
    <div class="signature-section-title signature-title-sortie">Signatures — État des lieux de sortie</div>
    <table class="signature-table">
        <tr>
            <td class="signature-box">
                <strong>Le Locataire</strong><br>
                <span style="font-size:9px; color:#6b7280;">Mention "Lu et approuvé" et signature</span>
            </td>
            <td style="width:4%; border:none;"></td>
            <td class="signature-box">
                <strong>Le Bailleur</strong><br>
                <span style="font-size:9px; color:#6b7280;">Mention "Lu et approuvé" et signature</span>
            </td>
        </tr>
    </table>

    {{-- Annexe photographique --}}
    @php
        $photos = $propertyDocs;
        $photoCount = 0;
    @endphp
    @if($photos->count() > 0)
        <div class="page-break"></div>
        <h2 style="margin-bottom:12px;">ANNEXES PHOTOGRAPHIQUES — ENTRÉE</h2>
        <div style="width:100%;">
            @foreach($lease->property->rooms as $room)
                @foreach($room->equipments as $equipment)
                    @foreach($propertyDocs->where('equipment_id', $equipment->id) as $photo)
                        @php $photoCount++; @endphp
                        <div style="display:inline-block; width:30%; margin:1%; vertical-align:top; border:1px solid #eee; padding:5px;">
                            <img src="{{ public_path('storage/' . str_replace('public/', '', $photo->file_path)) }}"
                                style="width:100%; height:auto; border-radius:4px;">
                            <p style="font-size:8px; margin-top:4px;">
                                <strong>#{{ $photoCount }}</strong> — {{ $room->name }}<br>
                                {{ $equipment->name }} : {{ $photo->name }}
                            </p>
                        </div>
                    @endforeach
                @endforeach
            @endforeach
        </div>
    @endif

</body>
</html>
