<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Quittance de loyer — {{ $monthLabel }} {{ $year }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10.5px;
            color: #1a1a1a;
            background: #fff;
        }

        .page {
            padding: 0;
        }

        /* Bandeau d'en-tête */
        .header-band {
            background-color: #1a1a1a;
            color: #fff;
            padding: 22px 40px;
        }

        .header-band .doc-type {
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .header-band .doc-period {
            font-size: 10px;
            margin-top: 4px;
            opacity: 0.85;
            letter-spacing: 0.5px;
        }

        /* Corps du document */
        .body {
            padding: 30px 40px;
        }

        /* Bloc parties */
        .parties {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 28px;
        }

        .parties td {
            vertical-align: top;
            padding: 14px 16px;
        }

        .parties td:first-child {
            width: 48%;
            border-right: 1px solid #ddd;
        }

        .parties td:last-child {
            width: 52%;
            padding-left: 24px;
        }

        .party-label {
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #1a1a1a;
            margin-bottom: 6px;
        }

        .party-name {
            font-size: 11.5px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 3px;
        }

        .party-detail {
            font-size: 10px;
            color: #555;
            line-height: 1.5;
        }

        /* Date d'émission */
        .emission-date {
            text-align: right;
            font-size: 10px;
            color: #666;
            margin-bottom: 24px;
        }

        /* Tableau des montants */
        .amounts-section {
            margin-bottom: 24px;
        }

        .section-title {
            font-size: 8.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #1a1a1a;
            border-bottom: 1px solid #1a1a1a;
            padding-bottom: 5px;
            margin-bottom: 12px;
        }

        .amounts-table {
            width: 100%;
            border-collapse: collapse;
        }

        .amounts-table tr td {
            padding: 7px 10px;
            font-size: 10.5px;
            border-bottom: 1px solid #f0f0f0;
        }

        .amounts-table tr td:last-child {
            text-align: right;
            font-weight: bold;
        }

        .amounts-table tr.total td {
            background-color: #1a1a1a;
            color: #fff;
            font-weight: bold;
            font-size: 11px;
            border-bottom: none;
            padding: 9px 10px;
        }

        /* Corps déclaratif */
        .declaration {
            background-color: #f5f5f5;
            border-left: 3px solid #1a1a1a;
            padding: 14px 16px;
            font-size: 10.5px;
            line-height: 1.7;
            color: #333;
            margin-bottom: 24px;
        }

        /* Signature */
        .signature-section {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .signature-section td {
            vertical-align: top;
            padding: 0;
        }

        .signature-section td:first-child {
            width: 55%;
        }

        .sig-label {
            font-size: 8.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #1a1a1a;
            margin-bottom: 8px;
        }

        .sig-img {
            max-height: 70px;
            max-width: 180px;
        }

        .sig-box {
            border-bottom: 1px solid #aaa;
            height: 60px;
            width: 180px;
        }

        /* Pied de page */
        .footer {
            margin-top: 30px;
            padding-top: 12px;
            border-top: 1px solid #e0e0e0;
            font-size: 8px;
            color: #999;
            line-height: 1.5;
            text-align: center;
        }
    </style>
</head>
<body>
<div class="page">

    {{-- Bandeau titre --}}
    <div class="header-band">
        <div class="doc-type">Quittance de Loyer</div>
        <div class="doc-period">Période du {{ $periodStart }} au {{ $periodEnd }}</div>
    </div>

    <div class="body">

        {{-- Date d'émission --}}
        <p class="emission-date">Émis le {{ $generatedDate }}</p>

        {{-- Bloc bailleur / locataire --}}
        <table class="parties">
            <tr>
                <td>
                    <div class="party-label">Bailleur</div>
                    <div class="party-name">{{ config('building.landlord_name') }}</div>
                    <div class="party-detail">{{ config('building.landlord_address') }}</div>
                </td>
                <td>
                    <div class="party-label">Locataire(s)</div>
                    @foreach($lease->tenants as $tenant)
                        <div class="party-name">{{ strtoupper($tenant->last_name) }} {{ $tenant->first_name }}</div>
                    @endforeach
                    <div class="party-detail">
                        {{ config('building.address') }}, {{ config('building.zip') }} {{ config('building.city') }}<br>
                        <span style="color: #1a1a1a;">{{ $lease->property->name }}</span>
                    </div>
                </td>
            </tr>
        </table>

        {{-- Détail des montants --}}
        <div class="amounts-section">
            <div class="section-title">Détail du règlement</div>
            <table class="amounts-table">
                <tr>
                    <td>Loyer hors charges</td>
                    <td>{{ number_format($lease->rent_amount, 2, ',', ' ') }} €</td>
                </tr>
                <tr>
                    <td>Provision sur charges</td>
                    <td>{{ number_format($lease->charges_amount, 2, ',', ' ') }} €</td>
                </tr>
                <tr class="total">
                    <td>Total reçu pour la période</td>
                    <td>{{ number_format($lease->rent_amount + $lease->charges_amount, 2, ',', ' ') }} €</td>
                </tr>
            </table>
        </div>

        {{-- Déclaration --}}
        <div class="declaration">
            Nous soussignés, <strong>{{ config('building.landlord_name') }}</strong>, bailleur des locaux
            vacants non meublés situés <strong>{{ config('building.address') }}, {{ config('building.zip') }} {{ config('building.city') }}</strong>
            ({{ $lease->property->name }}), attestons avoir reçu de
            <strong>{{ $tenantsNames }}</strong> la somme de
            <strong>{{ number_format($lease->rent_amount + $lease->charges_amount, 2, ',', ' ') }} euros</strong>
            ({{ strtoupper(str_replace('-', ' ', $totalInWords)) }} EUROS)
            au titre du loyer et des charges du mois de <strong>{{ $monthLabel }} {{ $year }}</strong>,
            correspondant au contrat de location consenti le {{ $leaseStartDate }}.
        </div>

        {{-- Signature --}}
        <table class="signature-section">
            <tr>
                <td>
                    <div class="sig-label">Le bailleur</div>
                    @if($signatureBase64)
                        <img class="sig-img" src="{{ $signatureBase64 }}">
                    @else
                        <div class="sig-box"></div>
                    @endif
                </td>
                <td style="text-align: right; padding-top: 8px;">
                    <div style="font-size: 9px; color: #aaa; line-height: 1.6;">
                        Bail débuté le {{ $leaseStartDate }}<br>
                        Loyer mensuel HC : {{ number_format($lease->rent_amount, 2, ',', ' ') }} € <br>
                        Loyer mensuel TTC : {{ number_format($lease->rent_amount + $lease->charges_amount, 2, ',', ' ') }} €
                    </div>
                </td>
            </tr>
        </table>

        {{-- Pied de page légal --}}
        <div class="footer">
            Cette quittance est délivrée gratuitement sur demande du locataire (art.&nbsp;21, loi n°&nbsp;89-462 du 6 juillet 1989).
            Elle annule tous reçus antérieurs établis pour la même période. Le paiement des charges est effectué
            à titre provisionnel et fera l'objet d'une régularisation annuelle.
        </div>

    </div>
</div>
</body>
</html>
