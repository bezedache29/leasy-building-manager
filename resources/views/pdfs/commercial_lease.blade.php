<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bail Commercial - {{ $lease->property->name }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', 'Helvetica', 'Arial', sans-serif;
            font-size: 9.5px;
            line-height: 1.6;
            color: #111;
            margin: 0;
            padding: 0 20px;
            text-align: justify;
        }

        /* ── HEADER ─────────────────────────────── */
        .doc-header {
            background: #111;
            color: #fff;
            padding: 18px 24px 14px 24px;
            margin: 0 -20px 20px -20px;
        }
        .doc-header-inner { width: 100%; border-collapse: collapse; }
        .doc-title { font-size: 20px; font-weight: bold; letter-spacing: 3px; margin: 0 0 3px 0; }
        .doc-subtitle { font-size: 8px; color: #bbb; margin: 0; }
        .doc-badge {
            font-size: 8px; color: #ccc;
            border: 1px solid rgba(255,255,255,0.25);
            padding: 4px 10px; text-align: center;
        }

        /* ── SECTION TITLES ─────────────────────── */
        .section-title {
            background: #222; color: #fff;
            font-size: 9px; font-weight: bold;
            text-transform: uppercase; letter-spacing: 1.5px;
            padding: 6px 12px; margin: 20px 0 12px 0;
        }
        .subsection-title {
            color: #111; font-size: 9.5px; font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1.5px solid #111;
            padding-bottom: 2px; margin: 12px 0 8px 0;
        }

        /* ── ARTICLES ───────────────────────────── */
        .art { margin-top: 10px; margin-bottom: 4px; }
        .art-title {
            font-weight: bold; font-size: 9.5px; color: #111;
            border-left: 3px solid #333;
            padding: 2px 0 2px 8px;
            margin: 10px 0 5px 0;
        }

        /* ── PARTIES ────────────────────────────── */
        .parties-wrap { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .party-cell {
            width: 49%; vertical-align: top;
            border: 1px solid #ccc; background: #fafafa;
            padding: 10px 12px;
        }
        .party-spacer { width: 2%; }
        .party-label {
            font-size: 8px; font-weight: bold; color: #111;
            text-transform: uppercase; letter-spacing: 1px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px; margin-bottom: 6px;
        }

        /* ── FINANCIAL BOX ──────────────────────── */
        .fin-box {
            background: #f5f5f5; border: 1px solid #ccc;
            border-left: 4px solid #333;
            padding: 10px 14px; margin: 10px 0;
        }
        .fin-box-title {
            font-size: 8.5px; font-weight: bold; color: #111;
            text-transform: uppercase; letter-spacing: 0.5px;
            margin-bottom: 7px;
        }
        .fin-grid { width: 100%; border-collapse: collapse; }
        .fin-grid td { padding: 3px 6px; font-size: 9.5px; vertical-align: middle; }
        .fin-label { color: #555; width: 38%; }
        .fin-value { font-weight: bold; color: #111; }
        .fin-grid tr:nth-child(even) td { background: rgba(255,255,255,0.6); }

        /* ── INFO NOTE ──────────────────────────── */
        .note-box {
            background: #f5f5f5; border: 1px solid #ccc;
            border-left: 3px solid #666;
            padding: 7px 12px; margin: 8px 0;
            font-size: 9px; color: #444; font-style: italic;
        }

        /* ── MISC ───────────────────────────────── */
        p { margin: 0 0 5px 0; }
        .strong { font-weight: bold; }
        .indent { margin-left: 16px; }
        ul { margin: 3px 0 5px 0; padding-left: 16px; }
        li { margin-bottom: 2px; }
        .avoid-break { page-break-inside: avoid; }
        .page-break { page-break-after: always; }
        .section { margin-bottom: 10px; }
        .hr { border: none; border-top: 1px solid #ddd; margin: 10px 0; }

        /* ── SIGNATURES ─────────────────────────── */
        .sig-wrap { width: 100%; border-collapse: collapse; margin-top: 16px; page-break-inside: avoid; }
        .sig-cell {
            width: 48%; vertical-align: top;
            border: 1px solid #ccc; background: #fafafa;
            padding: 12px 14px;
        }
        .sig-spacer { width: 4%; }
        .sig-label {
            font-size: 8px; font-weight: bold; color: #111;
            text-transform: uppercase; letter-spacing: 1px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px; margin-bottom: 8px;
        }
        .sig-name { font-weight: bold; font-size: 9.5px; color: #111; margin-bottom: 4px; }
        .sig-line {
            border-top: 1px dashed #aaa; margin-top: 40px;
            padding-top: 4px; font-size: 8px;
            color: #888; font-style: italic;
        }
    </style>
</head>
<body>
@php
    $fmt        = new NumberFormatter('fr_FR', NumberFormatter::SPELLOUT);
    $annualRent = $lease->rent_amount * 12;
    $annualRentW= strtoupper($fmt->format($annualRent));
    $monthlyRent= $lease->rent_amount;
    $annualChg  = $lease->charges_amount * 12;
    $startFr    = $lease->start_date->locale('fr')->translatedFormat('j F Y');
    $endDate9   = $lease->start_date->copy()->addYears(9)->subDay()->locale('fr')->translatedFormat('j F Y');
    $payDay     = $lease->payment_day === 1 ? '1er' : $lease->payment_day . 'ème';
@endphp

{{-- ── HEADER ─────────────────────────────────────────────── --}}
<div class="doc-header">
    <table class="doc-header-inner">
        <tr>
            <td>
                <p class="doc-title">BAIL COMMERCIAL</p>
                <p class="doc-subtitle">Articles L.145-1 et suivants &amp; R.145-1 et suivants du Code de Commerce</p>
            </td>
            <td style="text-align:right; vertical-align:middle; width:130px;">
                <div class="doc-badge">
                    {{ $lease->property->name }}<br>
                    <span style="font-size:7px;">Bail de 9 ans · ILC</span>
                </div>
            </td>
        </tr>
    </table>
</div>

{{-- ══════════════════════════════════════════════════════════
     CONDITIONS PARTICULIÈRES
══════════════════════════════════════════════════════════ --}}
<div class="section-title">CONDITIONS PARTICULIÈRES DU CONTRAT</div>

{{-- PARTIES ─────────────────────────────────────────────── --}}
<p class="subsection-title">I. Désignation des parties</p>

<table class="parties-wrap">
    <tr>
        <td class="party-cell">
            <div class="party-label">Bailleur</div>
            <p>
                <span class="strong">{{ config('building.landlord_first_name') }} {{ config('building.landlord_last_name') }}</span>,
                {{ config('building.landlord_profession') }}.<br>
                {{ config('building.landlord_address') }}.
            </p>
            @if(config('building.landlord_birth_date'))
            <p style="font-size:9px; color:#444;">
                Né(e) le {{ config('building.landlord_birth_date') }}
                à {{ config('building.landlord_birth_place') }},
                nationalité {{ config('building.landlord_nationality') }}.
            </p>
            @endif
            <p style="margin-top:6px; font-size:8.5px; font-style:italic; color:#333;">« le Bailleur »</p>
        </td>
        <td class="party-spacer"></td>
        <td class="party-cell">
            <div class="party-label">Locataire{{ $lease->tenants->count() > 1 ? 's' : '' }}</div>
            @foreach($lease->tenants as $tenant)
            <p>
                @if($tenant->tenant_type === 'legal_entity')
                    <span class="strong">{{ $tenant->company_name ?? '—' }}</span>
                    ({{ $tenant->legal_form ?? '' }}) — SIRET {{ $tenant->siret ?? '—' }}<br>
                    Siège : {{ $tenant->registered_office ?? '—' }}<br>
                    Représentée par {{ $tenant->first_name }} {{ strtoupper($tenant->last_name) }}
                    ({{ $tenant->company_role ?? '—' }})
                @else
                    <span class="strong">{{ strtoupper($tenant->last_name) }} {{ $tenant->first_name }}</span><br>
                    {{ $tenant->current_address ?? '—' }}<br>
                    <span style="font-size:9px; color:#444;">
                        Né(e) le {{ $tenant->birth_date?->locale('fr')->translatedFormat('j F Y') ?? '—' }}
                        à {{ $tenant->birth_place ?? '—' }},
                        nationalité {{ $tenant->nationality ?? '—' }}
                    </span>
                @endif
            </p>
            @if(!$loop->last)<div class="hr"></div>@endif
            @endforeach
            <p style="margin-top:6px; font-size:8.5px; font-style:italic; color:#333;">« le Locataire »</p>
        </td>
    </tr>
</table>

{{-- OBJET ─────────────────────────────────────────────────── --}}
<div class="section avoid-break" style="margin-top:12px;">
    <p class="subsection-title">II. Objet du contrat</p>
    <p>
        Les locaux loués sont situés : <span class="strong">{{ config('building.address') }}, {{ config('building.zip') }} {{ config('building.city') }}</span> — {{ $lease->property->name }}.
        @if($lease->property->surface_area)Superficie approximative : <span class="strong">{{ $lease->property->surface_area }} m²</span>.@endif
        @if($lease->property->description){{ $lease->property->description }}.@endif
    </p>
    <p>
        <span class="strong">Destination :</span>
        Locaux à usage {{ $lease->activity_description ?? 'commercial' }}.
        Toute activité non mentionnée est soumise à l'accord préalable écrit du Bailleur (art. L.145-47 C.com.).
    </p>
</div>

{{-- DURÉE ─────────────────────────────────────────────────── --}}
<div class="section avoid-break">
    <p class="subsection-title">III. Durée</p>
    <p>
        Prise d'effet : <span class="strong">{{ $startFr }}</span> — Terme : <span class="strong">{{ $endDate9 }}</span>
        (<span class="strong">9 ans</span> entiers et consécutifs).
        Congé triennal possible avec 6 mois de préavis par LRAR.
    </p>
</div>

{{-- CONDITIONS FINANCIÈRES ───────────────────────────────── --}}
<div class="section avoid-break">
    <p class="subsection-title">IV. Conditions financières</p>

    <div class="fin-box">
        <div class="fin-box-title">Synthèse financière</div>
        <table class="fin-grid">
            <tr>
                <td class="fin-label">Loyer annuel HT&nbsp;:</td>
                <td class="fin-value">{{ number_format($annualRent, 2, ',', ' ') }} € ({{ $annualRentW }} EUROS)</td>
            </tr>
            <tr>
                <td class="fin-label">Loyer mensuel HT&nbsp;:</td>
                <td class="fin-value">{{ number_format($monthlyRent, 2, ',', ' ') }} € — payable le {{ $payDay }} de chaque mois, d'avance</td>
            </tr>
            @if($lease->charges_amount > 0)
            <tr>
                <td class="fin-label">Provision charges&nbsp;:</td>
                <td class="fin-value">{{ number_format($lease->charges_amount, 2, ',', ' ') }} €/mois ({{ number_format($annualChg, 2, ',', ' ') }} €/an) — régularisation annuelle</td>
            </tr>
            @endif
            <tr>
                <td class="fin-label">Indexation&nbsp;:</td>
                <td class="fin-value">
                    ILC (Indice des Loyers Commerciaux — INSEE), révision annuelle automatique
                    @if($lease->base_index_label && $lease->base_index_value)
                    — Indice de référence : {{ $lease->base_index_label }} = {{ $lease->base_index_value }}
                    @endif
                </td>
            </tr>
            @if($lease->deposit_amount)
            <tr>
                <td class="fin-label">Dépôt de garantie&nbsp;:</td>
                <td class="fin-value">
                    {{ number_format($lease->deposit_amount, 2, ',', ' ') }} €
                    ({{ strtoupper($fmt->format($lease->deposit_amount)) }} EUROS)
                    — {{ $monthlyRent > 0 ? round($lease->deposit_amount / $monthlyRent) : 'N/A' }} mois HC — restitution sous 3 mois
                </td>
            </tr>
            @endif
            <tr>
                <td class="fin-label">TVA&nbsp;:</td>
                <td class="fin-value">Non soumis à la TVA (sauf option ultérieure du Bailleur)</td>
            </tr>
        </table>
    </div>
</div>

{{-- REMISE DES CLÉS ──────────────────────────────────────── --}}
@if($lease->keys_building_count || $lease->keys_apartment_count || $lease->keys_grid_count)
<div class="section avoid-break">
    <p class="subsection-title">V. Remise des clés</p>
    <ul>
        @if($lease->keys_building_count)<li>{{ $lease->keys_building_count }} clé(s) d'immeuble / entrée</li>@endif
        @if($lease->keys_apartment_count)<li>{{ $lease->keys_apartment_count }} clé(s) du local</li>@endif
        @if($lease->keys_grid_count)<li>{{ $lease->keys_grid_count }} clé(s) de grille / vitrine</li>@endif
    </ul>
</div>
@endif

{{-- GARANTS ──────────────────────────────────────────────── --}}
@if($lease->guarantors && $lease->guarantors->isNotEmpty())
<div class="section avoid-break">
    <p class="subsection-title">VI. Garantie(s) personnelle(s)</p>
    @foreach($lease->guarantors as $guarantor)
    <p>
        @if($guarantor->type === 'visale')
            Garantie Visale (Action Logement) souscrite au nom du Locataire.
        @else
            <span class="strong">{{ strtoupper($guarantor->last_name) }} {{ $guarantor->first_name }}</span>
            @if($guarantor->current_address), {{ $guarantor->current_address }}@endif
            — caution solidaire par acte séparé joint en annexe.
        @endif
    </p>
    @endforeach
</div>
@endif

{{-- ANNEXES ──────────────────────────────────────────────── --}}
<div class="section avoid-break">
    <p class="subsection-title">VII. Annexes</p>
    <ul>
        <li>État des risques et pollutions (ERP)</li>
        <li>État des lieux d'entrée</li>
        <li>État prévisionnel et récapitulatif des travaux</li>
    </ul>
</div>

<div class="page-break"></div>

{{-- ══════════════════════════════════════════════════════════
     CONDITIONS GÉNÉRALES
══════════════════════════════════════════════════════════ --}}
<div class="section-title">CONDITIONS GÉNÉRALES DU CONTRAT</div>

<div class="note-box">
    Les présentes conditions générales s'appliquent à l'ensemble du bail. En cas de contradiction avec les conditions
    particulières, ces dernières priment. Les références au Code de commerce s'entendent dans leur rédaction en vigueur
    à la date de signature.
</div>

{{-- ARTICLES ─────────────────────────────────────────────── --}}

<div class="section avoid-break art">
    <p class="art-title">1. DÉSIGNATION DES LOCAUX</p>
    <p>
        Le Locataire déclare parfaitement connaître les locaux pour les avoir visités et les accepte dans l'état où ils
        se trouvent avec leurs dépendances. Toute erreur de désignation ne justifiera ni modification du loyer ni
        demande de travaux.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">2. DESTINATION DES LOCAUX</p>
    <p>
        Le Locataire s'engage à n'exercer dans les locaux que l'activité décrite aux conditions particulières, sous
        peine d'application de la clause résolutoire (art. 21). Toute activité connexe ou complémentaire est soumise
        à l'accord préalable et écrit du Bailleur (art. L.145-47 C.com.).
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">3. RESPECT DE LA RÉGLEMENTATION</p>
    <p>
        Le Locataire fera son affaire personnelle de toutes autorisations nécessaires à son activité (ERP, PMR,
        hygiène, sécurité, environnement) et se conformera à l'ensemble des lois et règlements applicables, de
        sorte que le Bailleur ne soit jamais inquiété.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">4. DURÉE — CONGÉ — RENOUVELLEMENT</p>
    <p>
        <span class="strong">Durée :</span> Neuf (9) années entières et consécutives.
    </p>
    <p>
        <span class="strong">Congé triennal :</span> Le Locataire peut donner congé à l'expiration de chaque
        période de trois (3) ans par LRAR ou acte extrajudiciaire, avec un préavis d'au moins six (6) mois.
        Le Bailleur peut y mettre fin aux mêmes conditions dans les cas des art. L.145-18 et L.145-21 C.com.
    </p>
    <p>
        <span class="strong">Renouvellement :</span> À défaut de congé, le bail se renouvelle selon les art. L.145-12
        et suivants du Code de commerce.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">5. TRAVAUX</p>
    <p>
        Sont annexés : (1°) un état prévisionnel des travaux du Bailleur sur les trois années à venir avec budget ;
        (2°) un récapitulatif des travaux réalisés sur les trois années passées. Ces documents sont mis à jour à
        chaque échéance triennale dans les deux mois qui suivent.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">6. CESSION — SOUS-LOCATION</p>
    <p>
        Toute cession isolée du droit au bail est interdite. La cession avec le fonds de commerce est autorisée,
        le cédant restant garant solidaire du cessionnaire pendant trois (3) ans (art. L.145-16-2 C.com.).
        Toute sous-location, même partielle, est interdite sans accord écrit préalable du Bailleur.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">7. ÉTAT DES LIEUX</p>
    <p>
        Un état des lieux est établi contradictoirement à l'entrée et à la sortie du Locataire. À défaut
        d'accord amiable, il est dressé par un commissaire de justice à frais partagés.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">8. INDEXATION (ILC)</p>
    <p>
        Révision annuelle automatique à la date anniversaire, sans formalité ni notification, selon la formule :
    </p>
    <div class="fin-box" style="padding:7px 12px; margin:5px 0;">
        <span class="strong">Loyer indexé = Loyer de référence × (ILC comparaison / ILC référence)</span>
    </div>
    <p>
        En cas de disparition de l'ILC, un indice légalement substitué s'appliquera de plein droit. La clause
        d'indexation est une stipulation essentielle et déterminante du consentement du Bailleur.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">9. OBLIGATIONS DU LOCATAIRE</p>
    <ul>
        <li>Ne causer aucun trouble de voisinage ;</li>
        <li>Tenir les locaux suffisamment garnis pour répondre du paiement des loyers ;</li>
        <li>Respecter les charges de ville, de police et les prescriptions d'hygiène ;</li>
        <li>Ne pas surcharger les planchers au-delà de leur résistance ;</li>
        <li>Ne rien entreposer dans les parties communes ;</li>
        <li>Exploiter les locaux honorablement et paisiblement (art. 1728 et 1729 C.civ.) ;</li>
        <li>Subordonner toute enseigne, plaque ou store à l'accord écrit du Bailleur.</li>
    </ul>
</div>

<div class="section avoid-break art">
    <p class="art-title">10. VISITE DES LOCAUX</p>
    <p>
        Le Locataire doit laisser accéder le Bailleur ou ses mandataires avec un préavis de 48 heures (sauf urgence).
        En cas de non-renouvellement ou de vente, les visites sont organisées tous les jours ouvrables
        de 9h à 18h sous préavis raisonnable.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">11. ASSURANCES — RESPONSABILITÉ</p>
    <p>
        <span class="strong">Locataire :</span> Assurance contre les risques locatifs et tous risques liés à
        l'activité dès la prise de possession, auprès d'une compagnie notoirement solvable. Justificatif à
        fournir à la moindre requête du Bailleur.
        @if($lease->insurer_name)
        Assurance souscrite auprès de <span class="strong">{{ $lease->insurer_name }}</span>{{ $lease->insurer_address ? ', ' . $lease->insurer_address : '' }}{{ $lease->insurer_phone ? ', tél. ' . $lease->insurer_phone : '' }}.
        @endif
    </p>
    <p>
        <span class="strong">Bailleur :</span> Assurance de l'immeuble pour sa valeur de remplacement
        et garantie de sa responsabilité civile de propriétaire.
    </p>
    <p>
        <span class="strong">Renonciation croisée :</span> Le Locataire renonce à tout recours contre le
        Bailleur, ses mandataires et leurs assureurs en cas de vol, dysfonctionnement des services communs
        ou accidents dus au Locataire ou à son personnel.
    </p>
</div>

<div class="section art">
    <p class="art-title">12. CHARGES ET ACCESSOIRES (art. R.145-35 C.com.)</p>
    <p>
        <span class="strong">À la charge exclusive du Bailleur :</span>
        grosses réparations (art. 606 C.civ.), honoraires de gestion des loyers, charges des locaux vacants,
        travaux de vétusté relevant de l'art. 606 C.civ.
    </p>
    <p>
        <span class="strong">À la charge du Locataire :</span> toutes autres charges (entretien courant,
        nettoyage, fluides, assurance immeuble hors honoraires de gestion, impôts et taxes liés à l'usage —
        notamment taxe foncière et TEOM — au prorata de la surface). État récapitulatif annuel remis par le
        Bailleur (art. R.145-36 C.com.). Charges privatives (eau, EDF, tél.) directement à la charge du Locataire.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">13. DESTRUCTION DES LOCAUX</p>
    <p>
        Destruction totale par cas fortuit : résiliation de plein droit sans indemnité. Destruction partielle :
        résiliation possible à la demande de l'une ou l'autre partie, sans indemnité, sauf faute imputable.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">14. DÉPÔT DE GARANTIE</p>
    @if($lease->deposit_amount)
    <p>
        Le dépôt de garantie de <span class="strong">{{ number_format($lease->deposit_amount, 2, ',', ' ') }} €</span>
        n'est pas productif d'intérêts. Il garantit l'exécution des obligations du bail et peut être utilisé
        par le Bailleur en cas de défaillance. Restitution dans les trois (3) mois suivant la remise des clés,
        déduction des sommes dues. Il ne peut en aucun cas être imputé sur les derniers loyers.
    </p>
    @else
    <p>Aucun dépôt de garantie n'a été convenu.</p>
    @endif
</div>

<div class="section avoid-break art">
    <p class="art-title">15. ENTRETIEN, RÉPARATIONS ET MISE AUX NORMES</p>
    <p>
        Le Locataire entretient les locaux en bon état de propreté et de réparations de toute nature
        (fermetures, vitrages, menuiseries, serrures, sols, revêtements, canalisations, électricité,
        sanitaires) et réalise à ses frais tous travaux d'entretien, renouvellement et mise aux normes.
        Tout sinistre doit être signalé sans délai au Bailleur.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">16. TRAVAUX PAR LE LOCATAIRE</p>
    <p>
        Tout changement de distribution, démolition, percement ou modification nécessite l'accord préalable
        et écrit du Bailleur. Travaux réalisés aux frais et sous la responsabilité exclusive du Locataire,
        dans le respect de la réglementation applicable.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">17. SORT DES TRAVAUX À L'ISSUE DU BAIL</p>
    <p>
        Les aménagements réalisés par le Locataire deviennent, sans indemnité, la propriété du Bailleur
        à l'expiration du bail. Le Bailleur se réserve toutefois le droit d'exiger la remise en état
        d'origine, aux frais du Locataire.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">18. TRAVAUX DU BAILLEUR EN COURS DE BAIL</p>
    <p>
        Le Locataire souffre sans indemnité ni réduction de loyer, quelle qu'en soit la durée, tous travaux
        que le Bailleur jugera nécessaires dans l'immeuble ou les locaux, par dérogation à l'art. 1724 C.civ.
        Le Bailleur s'efforcera de limiter la gêne occasionnée.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">19. RESTITUTION DES LOCAUX</p>
    <p>
        À l'expiration ou à la résiliation du bail, le Locataire restitue les locaux libres, propres, en bon
        état d'entretien et dans leur configuration initiale, à ses frais. État des lieux de sortie
        contradictoire ou par commissaire de justice (frais partagés).
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">20. INDEMNITÉ D'OCCUPATION</p>
    <p>
        Dès la prise d'effet de la résiliation et jusqu'à la reprise des locaux, le Locataire est redevable
        de plein droit d'une indemnité d'occupation forfaitaire égale à <span class="strong">1,5 fois</span>
        le dernier loyer annuel exigible, prorata temporis, augmentée des charges et accessoires.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">21. CLAUSE RÉSOLUTOIRE</p>
    <p>
        À défaut de paiement de tout terme de loyer, provision de charges, complément de garantie, ou
        d'exécution de toute clause du bail, et <span class="strong">un (1) mois</span> après commandement
        de payer ou sommation d'exécuter contenant mention de la présente clause, demeuré infructueux,
        le bail sera résilié de plein droit si bon semble au Bailleur, sans formalité judiciaire préalable.
        Tous frais de procédure restent à la charge du Locataire.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">22. CLAUSE PÉNALE</p>
    <p>
        À titre de clause pénale, le Locataire accepte de payer <span class="strong">10 %</span> des sommes
        dues en cas d'impayé, automatiquement et de plein droit, sans mise en demeure, sans être dispensé
        du règlement des sommes principales.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">23. ÉLECTION DE DOMICILE</p>
    <ul>
        <li>Bailleur : {{ config('building.landlord_address') }}</li>
        <li>Locataire : {{ config('building.address') }}, {{ config('building.zip') }} {{ config('building.city') }}</li>
    </ul>
</div>

<div class="section avoid-break art">
    <p class="art-title">24. IMPRÉVISION</p>
    <p>
        Par dérogation à l'art. 1195 C.civ., les parties renoncent expressément à invoquer l'imprévision
        pour renégocier ou résilier le présent bail.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">25. DIAGNOSTICS</p>
    <p>
        <span class="strong">DTA :</span> Si permis de construire antérieur au 01/07/1997, le dossier
        technique amiante est tenu à disposition sur demande.
        <span class="strong">ERP :</span> Joint en annexe, établi depuis moins de 6 mois (art. L.125-5 C.env.).
        Le Locataire déclare avoir pris connaissance de ces documents.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">26. CAPACITÉ</p>
    <p>Les signataires déclarent avoir tous pouvoirs pour conclure le présent bail.</p>
</div>

{{-- ── SIGNATURES ──────────────────────────────────────────── --}}
<div class="avoid-break">
    <div class="section-title" style="margin-top:20px;">SIGNATURES</div>

    <p>
        Fait à {{ config('building.city') }},
        le <span class="strong">{{ $startFr }}</span>,
        en {{ 1 + $lease->tenants->count() }} exemplaires originaux remis à chacune des parties.
    </p>

    <table class="sig-wrap">
        <tr>
            <td class="sig-cell">
                <div class="sig-label">Le Bailleur</div>
                <div class="sig-name">{{ config('building.landlord_first_name') }} {{ config('building.landlord_last_name') }}</div>
                <div class="sig-line">Signature précédée de « Lu et approuvé »</div>
            </td>
            <td class="sig-spacer"></td>
            @foreach($lease->tenants as $tenant)
            <td class="sig-cell">
                <div class="sig-label">Le Locataire</div>
                @if($tenant->tenant_type === 'legal_entity')
                    <div class="sig-name">{{ $tenant->company_name ?? '' }}</div>
                    <p style="font-size:9px; color:#444; margin:2px 0 0 0;">Représentée par {{ $tenant->first_name }} {{ strtoupper($tenant->last_name) }}</p>
                @else
                    <div class="sig-name">{{ $tenant->first_name }} {{ strtoupper($tenant->last_name) }}</div>
                @endif
                <div class="sig-line">Signature précédée de « Lu et approuvé »</div>
            </td>
            @endforeach
        </tr>
    </table>

    @if($lease->guarantors && $lease->guarantors->where('type', '!=', 'visale')->isNotEmpty())
    <table class="sig-wrap" style="margin-top:12px;">
        <tr>
            @foreach($lease->guarantors->where('type', '!=', 'visale') as $guarantor)
            <td class="sig-cell">
                <div class="sig-label">La Caution</div>
                <div class="sig-name">{{ $guarantor->first_name }} {{ strtoupper($guarantor->last_name) }}</div>
                <div class="sig-line">Signature précédée de « Lu et approuvé »</div>
            </td>
            @if(!$loop->last)<td class="sig-spacer"></td>@endif
            @endforeach
        </tr>
    </table>
    @endif
</div>

<div class="page-break"></div>

{{-- ══════════════════════════════════════════════════════════
     ANNEXE — ÉTAT PRÉVISIONNEL ET RÉCAPITULATIF DES TRAVAUX
     (art. L.145-40-2 et D.145-36-1 C.com.)
══════════════════════════════════════════════════════════ --}}
<div class="doc-header">
    <table class="doc-header-inner">
        <tr>
            <td>
                <p class="doc-title">ANNEXE TRAVAUX</p>
                <p class="doc-subtitle">Art. L.145-40-2 &amp; D.145-36-1 du Code de Commerce — Loi Pinel n°2014-626</p>
            </td>
            <td style="text-align:right; vertical-align:middle; width:130px;">
                <div class="doc-badge">
                    {{ $lease->property->name }}<br>
                    <span style="font-size:7px;">Annexe au bail commercial</span>
                </div>
            </td>
        </tr>
    </table>
</div>

<p style="margin: 12px 0 8px 0;">
    En application de l'article L.145-40-2 du Code de commerce, le Bailleur remet au Locataire, en annexe
    au présent bail, l'état prévisionnel des travaux qu'il envisage de réaliser dans les trois années à venir
    ainsi que le récapitulatif des travaux réalisés dans les trois années précédentes.
</p>

<div class="section avoid-break" style="margin-top: 16px;">
    <p class="subsection-title">I. Récapitulatif des travaux réalisés — 3 dernières années</p>
    <div class="fin-box">
        <table style="width:100%; border-collapse: collapse;">
            <tr>
                <td style="width:30%; font-weight:bold; font-size:9px; color:#555; padding: 4px 6px; border-bottom: 1px solid #ddd;">Nature des travaux</td>
                <td style="width:20%; font-weight:bold; font-size:9px; color:#555; padding: 4px 6px; border-bottom: 1px solid #ddd;">Année</td>
                <td style="width:25%; font-weight:bold; font-size:9px; color:#555; padding: 4px 6px; border-bottom: 1px solid #ddd;">Coût (€ HT)</td>
                <td style="width:25%; font-weight:bold; font-size:9px; color:#555; padding: 4px 6px; border-bottom: 1px solid #ddd;">Observations</td>
            </tr>
            @for($i = 0; $i < 4; $i++)
            <tr>
                <td style="padding: 10px 6px; border-bottom: 1px dashed #ccc;">&nbsp;</td>
                <td style="padding: 10px 6px; border-bottom: 1px dashed #ccc;">&nbsp;</td>
                <td style="padding: 10px 6px; border-bottom: 1px dashed #ccc;">&nbsp;</td>
                <td style="padding: 10px 6px; border-bottom: 1px dashed #ccc;">&nbsp;</td>
            </tr>
            @endfor
        </table>
    </div>
</div>

<div class="section avoid-break" style="margin-top: 16px;">
    <p class="subsection-title">II. État prévisionnel des travaux — 3 prochaines années</p>
    <div class="fin-box">
        <table style="width:100%; border-collapse: collapse;">
            <tr>
                <td style="width:30%; font-weight:bold; font-size:9px; color:#555; padding: 4px 6px; border-bottom: 1px solid #ddd;">Nature des travaux</td>
                <td style="width:20%; font-weight:bold; font-size:9px; color:#555; padding: 4px 6px; border-bottom: 1px solid #ddd;">Année prévisionnelle</td>
                <td style="width:25%; font-weight:bold; font-size:9px; color:#555; padding: 4px 6px; border-bottom: 1px solid #ddd;">Budget estimatif (€ HT)</td>
                <td style="width:25%; font-weight:bold; font-size:9px; color:#555; padding: 4px 6px; border-bottom: 1px solid #ddd;">Observations</td>
            </tr>
            @for($i = 0; $i < 4; $i++)
            <tr>
                <td style="padding: 10px 6px; border-bottom: 1px dashed #ccc;">&nbsp;</td>
                <td style="padding: 10px 6px; border-bottom: 1px dashed #ccc;">&nbsp;</td>
                <td style="padding: 10px 6px; border-bottom: 1px dashed #ccc;">&nbsp;</td>
                <td style="padding: 10px 6px; border-bottom: 1px dashed #ccc;">&nbsp;</td>
            </tr>
            @endfor
        </table>
    </div>
</div>

<div class="note-box" style="margin-top: 16px;">
    Ce document est mis à jour par le Bailleur à chaque échéance triennale, dans les deux mois qui suivent,
    et communiqué au Locataire par tout moyen conférant date certaine (art. D.145-36-1 C.com.).
</div>

<table class="sig-wrap" style="margin-top: 24px;">
    <tr>
        <td class="sig-cell">
            <div class="sig-label">Le Bailleur</div>
            <div class="sig-name">{{ config('building.landlord_first_name') }} {{ config('building.landlord_last_name') }}</div>
            <p style="font-size:8.5px; color:#555; margin: 4px 0 0 0;">
                Fait à {{ config('building.city') }}, le {{ $startFr }}
            </p>
            <div class="sig-line">Signature</div>
        </td>
        <td class="sig-spacer"></td>
        @foreach($lease->tenants as $tenant)
        <td class="sig-cell">
            <div class="sig-label">Le Locataire — Accusé de réception</div>
            @if($tenant->tenant_type === 'legal_entity')
                <div class="sig-name">{{ $tenant->company_name ?? '' }}</div>
                <p style="font-size:9px; color:#444; margin:2px 0 0 0;">Représentée par {{ $tenant->first_name }} {{ strtoupper($tenant->last_name) }}</p>
            @else
                <div class="sig-name">{{ $tenant->first_name }} {{ strtoupper($tenant->last_name) }}</div>
            @endif
            <div class="sig-line">Signature précédée de « Reçu le »</div>
        </td>
        @endforeach
    </tr>
</table>

</body>
</html>
