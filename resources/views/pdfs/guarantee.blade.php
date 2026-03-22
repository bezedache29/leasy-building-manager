<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Acte de Cautionnement Solidaire</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 13px; line-height: 1.5; color: #333; margin: 25px; } 
        h1 { text-align: center; font-size: 18px; text-transform: uppercase; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 20px; } 
        h2 { font-size: 14px; margin-top: 15px; margin-bottom: 10px; text-decoration: underline; }
        .section { margin-bottom: 15px; padding: 12px; border: 1px solid #ddd; background-color: #fcfcfc; page-break-inside: avoid; } 
        .handwritten-box { border: 2px dashed #999; padding: 15px; margin-top: 15px; min-height: 150px; background-color: #fff; }
        .text-bold { font-weight: bold; }
        .text-center { text-align: center; }
        .text-small { font-size: 11px; color: #555; }
        .row { margin-bottom: 5px; }
        .signature-area { margin-top: 40px; width: 100%; }
        .signature-box { width: 45%; display: inline-block; vertical-align: top; }
        .page-break { page-break-before: always; }
    </style>
</head>
<body>

    <h1>Acte de Cautionnement Solidaire</h1>

    <div class="text-small text-center" style="margin-bottom: 20px;">
        Conformément à la loi n°89-462 du 6 juillet 1989 modifiée et à l'article 2297 du Code civil.
    </div>

    <div class="section">
        <h2>1. LE BAILLEUR (Propriétaire)</h2>
        <div class="row">Je soussigné(e), <span class="text-bold">Eliane Salou</span>,</div>
        <div class="row">Adresse : 5 hent kerliver, 29890 Kerlouan</div>
    </div>

    <div class="section">
        <h2>2. LA CAUTION (Garant)</h2>
        <div class="row">Je soussigné(e), <span class="text-bold">{{ $guarantor->first_name }} {{ $guarantor->last_name }}</span>,</div>
        <div class="row">Né(e) le : {{ \Carbon\Carbon::parse($guarantor->birth_date)->format('d/m/Y') }} à {{ $guarantor->birth_place }}</div>
        <div class="row">Demeurant au : {{ $guarantor->current_address }}</div>
        <div class="row">Déclare me porter caution solidaire pour le(s) locataire(s) désigné(s) ci-dessous.</div>
    </div>

    <div class="section">
        <h2>3. LE(S) LOCATAIRE(S)</h2>
        @foreach($tenants as $tenant)
            <div class="row" style="margin-bottom: 10px;">
                <span class="text-bold">- {{ $tenant->first_name }} {{ $tenant->last_name }}</span><br>
                @if($tenant->birth_date && $tenant->birth_place)
                    <span class="text-small" style="margin-left: 10px; display: inline-block;">
                        Né(e) le {{ \Carbon\Carbon::parse($tenant->birth_date)->format('d/m/Y') }} à {{ $tenant->birth_place }}
                    </span><br>
                @endif
                @if($tenant->email || $tenant->phone)
                    <span class="text-small" style="margin-left: 10px; display: inline-block; color: #555;">
                        @php
                            $formattedPhone = $tenant->phone ? preg_replace('/(\d{2})(?=\d)/', '$1 ', $tenant->phone) : 'Non renseigné';
                        @endphp
                        Contact : {{ $formattedPhone }} | {{ $tenant->email ?? 'Non renseigné' }}
                    </span>
                @endif
            </div>
        @endforeach
    </div>

    <div class="section">
        <h2>4. LE BIEN LOUÉ ET CONDITIONS FINANCIÈRES</h2>
        <div class="row">
            Adresse du bien : {{ $property->name }}
            @if($property->type === 'apartment' && $property->floor !== null)
                - 
                @if($property->floor == 0)
                    Rez-de-chaussée
                @elseif($property->floor == 1)
                    1er étage
                @else
                    {{ $property->floor }}ème étage
                @endif
            @endif
             - {{ config('building.address') }}, {{ config('building.zip') }} {{ config('building.city') }}
        </div>
        <div class="row">Date d'effet du bail : {{ \Carbon\Carbon::parse($lease->start_date)->format('d/m/Y') }}</div>
        <div class="row" style="margin-top: 10px;">
            Montant du loyer principal : <span class="text-bold">{{ number_format($lease->rent_amount, 2, ',', ' ') }} €</span> ({{ $rentInWords }} euros).<br>
            Montant des charges : <span class="text-bold">{{ number_format($lease->charges_amount, 2, ',', ' ') }} €</span> ({{ $chargesInWords }} euros).<br>
            Total mensuel : <span class="text-bold">{{ number_format($monthlyTotal, 2, ',', ' ') }} €</span>.
        </div>
        <div class="text-small" style="margin-top: 5px;">Le loyer est révisable annuellement selon l'Indice de Référence des Loyers (IRL).</div>
    </div>

    <div class="section">
        <h2>5. ENGAGEMENT DE LA CAUTION</h2>
        <p>
            En signant le présent acte, je m'engage à payer au bailleur les loyers, charges, indemnités d'occupation et réparations locatives 
            en cas de défaillance du ou des locataires, et ce, dans la limite d'un montant maximum garanti de 
            <span class="text-bold">{{ number_format($maxGuaranteeAmount, 2, ',', ' ') }} €</span> ({{ $maxGuaranteeInWords }} euros).
        </p>
        <p>
            Cet engagement est consenti <span class="text-bold">pour toute la durée du bail initial, ainsi que pour ses renouvellements et reconductions tacites</span>.
        </p>
        <p>
            Je reconnais avoir reçu un exemplaire du contrat de location et en avoir pris pleine et entière connaissance.
        </p>
        <p>
            Je reconnais renoncer au bénéfice de discussion (le bailleur peut me réclamer la dette sans avoir à poursuivre le locataire au préalable) 
            et au bénéfice de division (le bailleur peut me réclamer la totalité de la dette même s'il y a d'autres garants).
        </p>
    </div>

    <div class="section">
        <h2>6. RAPPEL DES DISPOSITIONS LÉGALES</h2>
        <p class="text-small" style="font-style: italic; color: #444;">
            <strong>Article 22-1 de la loi du 6 juillet 1989 :</strong><br>
            « Lorsque le cautionnement d'obligations résultant d'un contrat de location conclu en application du présent titre ne comporte aucune indication de durée ou lorsque la durée du cautionnement est stipulée indéterminée, la caution peut le résilier unilatéralement. La résiliation prend effet au terme du contrat de location, qu'il s'agisse du contrat initial ou d'un contrat reconduit ou renouvelé, au cours duquel le bailleur reçoit notification de la résiliation. »
        </p>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <h2>7. MENTION MANUSCRITE OBLIGATOIRE ET SIGNATURES</h2>

        <div class="text-small text-bold" style="color: #d32f2f; margin-bottom: 10px;">
            IMPORTANT : La caution doit impérativement RECOPIER À LA MAIN le texte ci-dessous dans l'encadré, 
            sans rature ni modification, pour que l'engagement soit valable :
        </div>

        <div style="background-color: #f0f0f0; padding: 10px; margin-top: 5px; font-style: italic; border-left: 3px solid #666;">
            "Je me porte caution solidaire du paiement des loyers, charges et indemnités de ce bail, dans la limite de la somme de {{ $maxGuaranteeInWords }} euros ({{ number_format($maxGuaranteeAmount, 2, ',', ' ') }} €), 
            en renonçant au bénéfice de discussion et de division."
        </div>

        <div class="handwritten-box">
            <span class="text-small" style="color: #ccc;">(Espace réservé à la recopie manuscrite par le garant)</span>
        </div>

        <div class="signature-area">
            <div class="signature-box">
                Fait à : ..........................................<br>
                Le : ........ / ........ / .....................<br><br>
                <span class="text-bold">LA CAUTION</span><br>
                <span class="text-small">(Signature précédée de la mention "Lu et approuvé")</span>
            </div>
            <div class="signature-box" style="text-align: right;">
                Fait à : ..........................................<br>
                Le : ........ / ........ / .....................<br><br>
                <span class="text-bold">LE BAILLEUR</span><br>
                <span class="text-small">(Signature précédée de la mention "Lu et approuvé")</span>
            </div>
        </div>
    </div>

</body>
</html>