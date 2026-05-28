<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Acte de Cautionnement Solidaire</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #111;
            margin: 30px 40px;
        }
        h1 {
            text-align: center;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }
        .subtitle {
            text-align: center;
            font-size: 11px;
            color: #555;
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #333;
            padding-bottom: 3px;
            margin-top: 22px;
            margin-bottom: 10px;
        }
        .section-number {
            display: inline-block;
            margin-right: 6px;
        }
        p { margin: 0 0 6px 0; }
        .bold { font-weight: bold; }
        .italic { font-style: italic; }
        .text-small { font-size: 10px; color: #444; }
        .warning { color: #b00; font-weight: bold; }
        .quote-box {
            border-left: 3px solid #555;
            padding: 8px 12px;
            margin: 8px 0;
            background: #f8f8f8;
            font-style: italic;
            font-size: 11px;
        }
        .handwritten-lines {
            margin-top: 10px;
        }
        .handwritten-line {
            border-bottom: 1px solid #888;
            height: 22px;
            margin-bottom: 6px;
        }
        .signature-table {
            width: 100%;
            margin-top: 30px;
            border-collapse: collapse;
        }
        .signature-table td {
            width: 50%;
            vertical-align: top;
            padding: 0 10px;
        }
        .signature-table td:first-child { padding-left: 0; }
        .signature-table td:last-child { padding-right: 0; text-align: right; }
        .signature-block {
            border: 1px solid #ccc;
            padding: 10px 14px;
            min-height: 80px;
        }
        .page-break { page-break-before: always; }
        .legal-text {
            font-size: 10.5px;
            color: #333;
        }
    </style>
</head>
<body>

    <h1>Acte de Cautionnement Solidaire</h1>
    <div class="subtitle">
        Caution solidaire — Article 22-1 de la loi n°89-462 du 6 juillet 1989 et loi ALUR n°2014-366 du 24 mars 2014
    </div>

    {{-- 1. ENGAGEMENT DU GARANT --}}
    <div class="section-title"><span class="section-number">1.</span> Engagement du Garant</div>

    @php
        $tenantNames = $tenants->map(fn($t) => $t->first_name . ' ' . $t->last_name)->implode(' et ');
    @endphp

    <p>
        Je soussigné(e), <span class="bold">{{ $guarantor->first_name }} {{ $guarantor->last_name }}</span>,
        @if($guarantor->birth_date && $guarantor->birth_place)
            né(e) le <span class="bold">{{ \Carbon\Carbon::parse($guarantor->birth_date)->format('d/m/Y') }}</span>
            à <span class="bold">{{ $guarantor->birth_place }}</span>,
        @else
            <span style="color:#b00;">(date et lieu de naissance non renseignés)</span>,
        @endif
        résidant à l'adresse suivante : <span class="bold">{{ $guarantor->current_address }}</span>,
    </p>
    <p>
        déclare me porter caution solidaire de <span class="bold">{{ $tenantNames }}</span>
        pour les obligations résultant du bail qui lui a été consenti par le bailleur
        <span class="bold">{{ config('building.landlord_name') }}</span>,
        demeurant <span class="bold">{{ config('building.landlord_address') }}</span>,
        pour la location du logement situé :
        <span class="bold">{{ $property->name }}
        @if($property->type === 'apartment' && $property->floor !== null)
            —
            @if($property->floor == 0) Rez-de-chaussée
            @elseif($property->floor == 1) 1<sup>er</sup> étage
            @else {{ $property->floor }}<sup>ème</sup> étage
            @endif
        @endif
        — {{ config('building.address') }}, {{ config('building.zip') }} {{ config('building.city') }}</span>.
    </p>

    @if($startDate)
        <p>Date d'entrée en vigueur du bail : <span class="bold">{{ \Carbon\Carbon::parse($startDate)->format('d/m/Y') }}</span>.</p>
    @else
        <p>Date d'entrée en vigueur du bail : .............................................</p>
    @endif

    {{-- 2. MONTANT DU LOYER --}}
    <div class="section-title"><span class="section-number">2.</span> Montant du Loyer</div>

    <p>
        J'ai pris connaissance du montant du loyer de
        <span class="bold">{{ ucfirst($rentInWords) }} euros, soit {{ number_format($rentAmount, 2, ',', ' ') }} €</span>
        par mois (hors charges).
    </p>
    @if($chargesAmount > 0)
        <p>
            Les charges sont fixées à
            <span class="bold">{{ ucfirst($chargesInWords) }} euros, soit {{ number_format($chargesAmount, 2, ',', ' ') }} €</span>
            par mois, soit un total mensuel de
            <span class="bold">{{ number_format($monthlyTotal, 2, ',', ' ') }} €</span> charges comprises.
        </p>
    @endif
    <p>
        Le loyer sera révisé annuellement
        @if($revisionLabel)
            tous les <span class="bold">{{ $revisionLabel }}</span>
        @else
            à la date anniversaire du bail
        @endif
        selon la variation de l'indice de référence des loyers (IRL) publié par l'INSEE
        au <span class="bold">{{ config('building.irl_quarter') }}</span>
        (valeur : <span class="bold">{{ config('building.irl_value') }}</span>).
    </p>

    {{-- 3. ÉTENDUE DE LA CAUTION --}}
    <div class="section-title"><span class="section-number">3.</span> Étendue de la Caution</div>

    <p>
        Cet engagement vaut pour le paiement, en cas de défaillance du ou des locataires, des loyers,
        des indemnités d'occupation, des charges, des réparations et des dégradations locatives,
        des impôts et taxes, des frais et dépens de procédure, des coûts des actes dus,
        dans la limite de <span class="bold">{{ ucfirst($maxGuaranteeInWords) }} euros
        ({{ number_format($maxGuaranteeAmount, 2, ',', ' ') }} €)</span>, en principal et accessoires.
    </p>
    <p>
        Cet engagement est valable pour une durée <span class="bold">indéterminée</span>,
        conformément à l'article 22-1 de la loi du 6 juillet 1989.
    </p>

    {{-- 4. RÉFÉRENCES LÉGALES --}}
    <div class="section-title"><span class="section-number">4.</span> Références Légales</div>

    <p class="legal-text">
        Je reconnais avoir pris connaissance de l'avant-dernier alinéa de l'article 22-1 de la loi du 6 juillet 1989, selon lequel :
    </p>
    <div class="quote-box legal-text">
        « Lorsque le cautionnement d'obligations résultant d'un contrat de location conclu en application du présent titre
        ne comporte aucune indication de durée ou lorsque la durée du cautionnement est stipulée indéterminée,
        la caution peut le résilier unilatéralement. La résiliation prend effet au terme du contrat de location,
        qu'il s'agisse du contrat initial ou d'un contrat reconduit ou renouvelé au cours duquel le bailleur
        reçoit notification de la résiliation. »
    </div>

    <p class="legal-text" style="margin-top: 10px;">
        Je reconnais également avoir pris connaissance de l'article 2297 du Code civil, selon lequel :
    </p>
    <div class="quote-box legal-text">
        « Si la caution est privée des bénéfices de discussion ou de division, elle reconnaît ne pouvoir exiger
        du créancier qu'il poursuive d'abord le débiteur ou qu'il divise ses poursuites entre les cautions.
        À défaut, elle conserve le droit de se prévaloir de ces bénéfices. »
    </div>

    {{-- 5. MENTION MANUSCRITE --}}
    <div class="page-break"></div>

    <div class="section-title"><span class="section-number">5.</span> Mention Manuscrite Obligatoire</div>

    <p class="warning"> À RECOPIER OBLIGATOIREMENT À LA MAIN PAR LE GARANT :</p>

    <div class="quote-box" style="margin-bottom: 14px;">
        « En me portant caution solidaire de <span class="bold">{{ $tenantNames }}</span>
        dans la limite de <span class="bold">{{ $maxGuaranteeInWords }} euros
        ({{ number_format($maxGuaranteeAmount, 2, ',', ' ') }} €)</span>,
        je reconnais avoir pris connaissance de la nature et de l'étendue de mon engagement. »
    </div>

    <p class="text-small">Recopiez ci-dessous la mention ci-dessus de votre main :</p>

    <div class="handwritten-lines">
        <div class="handwritten-line"></div>
        <div class="handwritten-line"></div>
        <div class="handwritten-line"></div>
        <div class="handwritten-line"></div>
        <div class="handwritten-line"></div>
        <div class="handwritten-line"></div>
    </div>

    {{-- 6. DATE ET SIGNATURE --}}
    <div class="section-title" style="margin-top: 28px;"><span class="section-number">6.</span> Date et Signature</div>

    <table class="signature-table">
        <tr>
            <td>
                <div class="signature-block">
                    <p class="bold">{{ $guarantor->first_name }} {{ $guarantor->last_name }}</p>
                    <p class="text-small">(Garant)</p>
                    <br>
                    <p class="text-small">Fait à ........................................,</p>
                    <p class="text-small">le ........ / ........ / ................</p>
                    <br>
                    <p class="text-small">Signature précédée de la mention manuscrite « Lu et approuvé » :</p>
                </div>
            </td>
            <td>
                <div class="signature-block">
                    <p class="bold">{{ config('building.landlord_name') }}</p>
                    <p class="text-small">(Bailleur)</p>
                    <br>
                    <p class="text-small">Fait à ........................................,</p>
                    <p class="text-small">le ........ / ........ / ................</p>
                    <br>
                    <p class="text-small">Signature précédée de la mention manuscrite « Lu et approuvé » :</p>
                </div>
            </td>
        </tr>
    </table>

    <p class="text-small" style="margin-top: 20px; text-align: center; color: #777;">
        Document établi conformément à la loi n°89-462 du 6 juillet 1989 et à la loi ALUR n°2014-366 du 24 mars 2014
    </p>

</body>
</html>
