<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bail Professionnel - {{ $lease->property->name }}</title>
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
        .fin-label { color: #000; width: 38%; }
        .fin-value { font-weight: bold; color: #111; }
        .fin-grid tr:nth-child(even) td { background: rgba(255,255,255,0.6); }

        /* ── MISC ───────────────────────────────── */
        p { margin: 0 0 5px 0; }
        .strong { font-weight: bold; }
        .indent { margin-left: 16px; }
        ul { margin: 3px 0 5px 0; padding-left: 16px; }
        li { margin-bottom: 2px; }
        .avoid-break { page-break-inside: avoid; }
        .page-break { page-break-after: always; }
        .section { margin-bottom: 10px; }
        .hr { border: none; border-top: 1px solid #ddd; margin: 8px 0; }

        /* ── SIGNATURES ─────────────────────────── */
        .sig-wrap { width: 100%; border-collapse: collapse; margin-top: 16px; page-break-inside: avoid; }
        .sig-cell {
            width: 48%; vertical-align: top;
            border: 1px solid #000; background: #fafafa;
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
            border-top: 1px dashed #000; margin-top: 40px;
            padding-top: 4px; font-size: 8px;
            color: #000; font-style: italic;
        }
    </style>
</head>
<body>
@php
    $fmt        = new NumberFormatter('fr_FR', NumberFormatter::SPELLOUT);
    $annualRent = $lease->rent_amount * 12;
    $annualRentW= strtoupper($fmt->format($annualRent));
    $monthlyRent= $lease->rent_amount;
    $startFr    = $lease->start_date->locale('fr')->translatedFormat('j F Y');
    $endDate6   = $lease->start_date->copy()->addYears(6)->subDay()->locale('fr')->translatedFormat('j F Y');
    $payDay     = $lease->payment_day === 1 ? '1er' : $lease->payment_day . 'ème';
@endphp

{{-- ── HEADER ─────────────────────────────────────────────── --}}
<div class="doc-header">
    <table class="doc-header-inner">
        <tr>
            <td>
                <p class="doc-title">BAIL PROFESSIONNEL</p>
                <p class="doc-subtitle">Article 57 A de la loi n° 86-1290 du 23 décembre 1986 (mod. loi LME 2008)</p>
            </td>
            <td style="text-align:right; vertical-align:middle; width:130px;">
                <div class="doc-badge">
                    {{ $lease->property->name }}<br>
                    <span style="font-size:7px;">Bail de 6 ans · ILAT</span>
                </div>
            </td>
        </tr>
    </table>
</div>

{{-- PARTIES ─────────────────────────────────────────────── --}}
<div class="section-title">Identification des parties</div>

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
            <p style="font-size:9px; color:#000;">
                Né(e) le {{ config('building.landlord_birth_date') }}
                à {{ config('building.landlord_birth_place') }},
                nationalité {{ config('building.landlord_nationality') }}.
            </p>
            @endif
            <p style="margin-top:6px; font-size:8.5px; font-style:italic;">« le Bailleur »</p>
        </td>
        <td class="party-spacer"></td>
        <td class="party-cell">
            <div class="party-label">Preneur{{ $lease->tenants->count() > 1 ? 's' : '' }}</div>
            @foreach($lease->tenants as $tenant)
            <p>
                @if($tenant->tenant_type === 'legal_entity')
                    <span class="strong">{{ $tenant->company_name ?? '—' }}</span>
                    ({{ $tenant->legal_form ?? '' }}) — SIRET {{ $tenant->siret ?? '—' }}<br>
                    Siège : {{ $tenant->registered_office ?? '—' }}<br>
                    Représentée par {{ $tenant->first_name }} {{ strtoupper($tenant->last_name) }}
                    ({{ $tenant->rcs_city ?? '—' }})
                @else
                    <span class="strong">{{ strtoupper($tenant->last_name) }} {{ $tenant->first_name }}</span><br>
                    {{ $tenant->current_address ?? '—' }}<br>
                    <span style="font-size:9px; color:#000;">
                        Né(e) le {{ $tenant->birth_date?->locale('fr')->translatedFormat('j F Y') ?? '—' }}
                        à {{ $tenant->birth_place ?? '—' }},
                        nat. {{ $tenant->nationality ?? '—' }}
                    </span>
                @endif
            </p>
            @if(!$loop->last)<div class="hr"></div>@endif
            @endforeach
            <p style="margin-top:6px; font-size:8.5px; font-style:italic;">« le Preneur »</p>
        </td>
    </tr>
</table>

<p style="margin-top:10px;">Il a été convenu et arrêté ce qui suit :</p>

{{-- ── ARTICLES ────────────────────────────────────────────── --}}
<div class="section-title">Dispositions contractuelles</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 1 — OBJET — RÉGIME JURIDIQUE</p>
    <p>
        Le Bailleur donne en location au Preneur, qui accepte, des locaux destinés à un usage
        <span class="strong">exclusivement professionnel</span>, dans les conditions ci-après définies.
        Le présent contrat est soumis aux dispositions de l'article 57 A de la loi n° 86-1290 du 23 décembre 1986,
        telle que modifiée. Toute activité commerciale, artisanale ou industrielle est exclue.
        Le Preneur ne bénéficie d'aucun droit à la propriété commerciale ni d'aucune indemnité d'éviction.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 2 — DURÉE</p>
    <p>
        Le présent bail est consenti pour une durée minimale de <span class="strong">SIX (6) ANS</span>,
        prenant effet le <span class="strong">{{ $startFr }}</span>,
        venant à expiration le <span class="strong">{{ $endDate6 }}</span>.
    </p>
    <p>
        À l'expiration, et à défaut de congé régulièrement signifié, le bail se renouvelle tacitement
        pour une nouvelle période de six (6) ans dans les mêmes conditions.
    </p>
    <p>
        <span class="strong">Résiliation anticipée :</span> Chacune des parties peut mettre fin au contrat
        à tout moment, sans avoir à motiver sa décision, sous réserve d'un préavis de
        <span class="strong">six (6) mois</span> signifié par lettre recommandée avec accusé de réception
        ou par acte de commissaire de justice.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 3 — DÉSIGNATION DES LOCAUX</p>
    <p>
        Les locaux loués sont situés :
        <span class="strong">{{ config('building.address') }}, {{ config('building.zip') }} {{ config('building.city') }}</span> — {{ $lease->property->name }}.
        @if($lease->property->surface_area)Superficie approximative : <span class="strong">{{ $lease->property->surface_area }} m²</span>.@endif
        @if($lease->property->description)Se composant de : {{ $lease->property->description }}.@endif
    </p>
    <p>
        Le Preneur déclare avoir visité les locaux et les accepte dans leur état actuel sans pouvoir
        réclamer de travaux ni d'équipements supplémentaires.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 4 — DESTINATION</p>
    <p>
        Les locaux sont destinés à l'usage <span class="strong">exclusivement professionnel</span> suivant :
        <span class="strong">{{ $lease->activity_description ?? '—' }}</span>.
    </p>
    <p>
        Le Preneur s'engage à n'utiliser les locaux qu'à cet usage et à ne pas les affecter, même
        partiellement, à un autre usage sans l'accord écrit préalable du Bailleur.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 5 — DÉLIVRANCE — ÉTAT DES LIEUX</p>
    <p>Le Bailleur remet les locaux au Preneur à la date de prise d'effet du bail.</p>
    @if($lease->keys_building_count || $lease->keys_apartment_count || $lease->keys_grid_count)
    <p>Clés remises à la signature :</p>
    <ul>
        @if($lease->keys_building_count)<li>{{ $lease->keys_building_count }} clé(s) d'immeuble / entrée</li>@endif
        @if($lease->keys_apartment_count)<li>{{ $lease->keys_apartment_count }} clé(s) des locaux</li>@endif
        @if($lease->keys_grid_count)<li>{{ $lease->keys_grid_count }} clé(s) de grille / vitrine</li>@endif
    </ul>
    @endif
    <p>
        Un état des lieux est établi contradictoirement à l'entrée et à la sortie du Preneur.
        À défaut d'accord amiable, il est dressé par un commissaire de justice à frais partagés.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 6 — ÉTAT DES RISQUES ET POLLUTIONS</p>
    <p>
        L'état des risques et pollutions (art. L.125-5 et R.125-23 C.env.) est annexé au présent contrat.
        Le Preneur déclare en avoir pris connaissance et en accepter le contenu.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 7 — SINISTRES ANTÉRIEURS INDEMNISÉS — AMIANTE</p>
    <p>
        Le Bailleur déclare que les locaux n'ont fait l'objet d'aucun sinistre antérieur donnant lieu
        à indemnisation au titre d'une catastrophe naturelle ou technologique, ou en a informé le Preneur
        conformément aux dispositions légales.
    </p>
    <p>
        Si le permis de construire de l'immeuble est antérieur au 1er juillet 1997, le Bailleur tient le
        dossier technique amiante (DTA) à la disposition du Preneur pour consultation sur simple demande.
    </p>
</div>


<div class="section avoid-break art">
    <p class="art-title">ARTICLE 9 — LOYER</p>
    <div class="fin-box">
        <div class="fin-box-title">Conditions financières</div>
        <table class="fin-grid">
            <tr>
                <td class="fin-label">Loyer annuel HT&nbsp;:</td>
                <td class="fin-value">{{ number_format($annualRent, 2, ',', ' ') }} € ({{ $annualRentW }} EUROS)</td>
            </tr>
            <tr>
                <td class="fin-label">Loyer mensuel HT&nbsp;:</td>
                <td class="fin-value">{{ number_format($monthlyRent, 2, ',', ' ') }} € — le {{ $payDay }} de chaque mois, d'avance</td>
            </tr>
            @if($lease->charges_amount > 0)
            <tr>
                <td class="fin-label">Provision charges&nbsp;:</td>
                <td class="fin-value">{{ number_format($lease->charges_amount, 2, ',', ' ') }} €/mois — régularisation annuelle</td>
            </tr>
            @endif
            @if($lease->deposit_amount)
            <tr>
                <td class="fin-label">Dépôt de garantie&nbsp;:</td>
                <td class="fin-value">
                    {{ number_format($lease->deposit_amount, 2, ',', ' ') }} €
                    ({{ strtoupper($fmt->format($lease->deposit_amount)) }} EUROS) — restitution sous 2 mois
                </td>
            </tr>
            @endif
        </table>
    </div>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 9 BIS — INDEXATION (ILAT)</p>
    <p>
        Révision annuelle automatique à la date anniversaire du bail, sans notification préalable, selon la
        variation de l'<span class="strong">Indice des Loyers des Activités Tertiaires (ILAT)</span> publié par l'INSEE :
    </p>
    <div class="fin-box" style="padding:7px 12px; margin:5px 0;">
        <span class="strong">Loyer révisé = Loyer en vigueur × (ILAT comparaison / ILAT référence)</span>
    </div>
    @if($lease->base_index_label && $lease->base_index_value)
    <p>Indice de référence : {{ $lease->base_index_label }} = <span class="strong">{{ $lease->base_index_value }}</span>.</p>
    @else
    <p>Indice de référence : dernier indice publié à la date de signature.</p>
    @endif
    <p>En cas de disparition de l'ILAT, l'indice légalement substitué s'appliquera de plein droit.</p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 10 — CHARGES ET ACCESSOIRES</p>
    <p>
        <span class="strong">À la charge du Preneur :</span> charges privatives (électricité, eau, téléphone,
        internet), taxes et impôts liés à son activité, quote-part des charges communes (entretien parties
        communes, assurance immeuble hors honoraires de gestion, TEOM) au prorata de sa surface.
    </p>
    <p>
        <span class="strong">À la charge du Bailleur :</span> grosses réparations (art. 606 C.civ.) et travaux
        de vétusté structurelle, sauf faute ou défaut d'entretien imputable au Preneur.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 11 — ASSURANCE DE L'IMMEUBLE</p>
    <p>
        Le Bailleur déclare avoir assuré l'immeuble contre l'incendie et les dégâts des eaux. Le Preneur
        s'engage à ne rien faire qui puisse entraîner la déchéance ou l'aggravation du risque garanti.
    </p>
</div>

@if($lease->deposit_amount)
<div class="section avoid-break art">
    <p class="art-title">ARTICLE 11 BIS — DÉPÔT DE GARANTIE</p>
    <p>
        Le Preneur verse à la signature <span class="strong">{{ number_format($lease->deposit_amount, 2, ',', ' ') }} €</span>
        à titre de dépôt de garantie. Somme non productive d'intérêts, affectée à la garantie des obligations
        du bail. Restituée dans les deux (2) mois suivant la remise des clés, déduction des sommes dues.
        Ne peut être imputée sur les derniers loyers.
    </p>
</div>
@endif

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 12 — OBLIGATIONS FISCALES</p>
    <p>
        Le Preneur supporte seul les taxes professionnelles, impôts et contributions liés à son activité.
        La taxe foncière reste à la charge du Bailleur.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 13 — ASSURANCES DU PRENEUR</p>
    <p>Dès la prise de possession, le Preneur souscrit et maintient auprès d'une compagnie notoirement solvable :</p>
    <ul>
        <li>Une assurance risques locatifs (incendie, explosion, dégâts des eaux) ;</li>
        <li>Une assurance responsabilité civile professionnelle ;</li>
        <li>Toute assurance complémentaire requise par son activité ou la réglementation.</li>
    </ul>
    @if($lease->insurer_name)
    <p>
        Assurance souscrite auprès de <span class="strong">{{ $lease->insurer_name }}</span>{{ $lease->insurer_address ? ', ' . $lease->insurer_address : '' }}{{ $lease->insurer_phone ? ', tél. ' . $lease->insurer_phone : '' }}.
    </p>
    @endif
    <p>Justificatif à fournir à la première demande du Bailleur. Tout sinistre doit être signalé sans délai.</p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 14 — RÈGLES GÉNÉRALES D'OCCUPATION</p>
    <ul>
        <li>Jouir des locaux en bon père de famille, conformément à leur destination professionnelle ;</li>
        <li>Respecter le règlement de copropriété ou d'immeuble ;</li>
        <li>Ne causer aucun trouble de voisinage ;</li>
        <li>Ne pas entreposer de matières dangereuses, inflammables ou malodorantes ;</li>
        <li>Respecter les règles d'hygiène, de sécurité et de police applicables à l'immeuble ;</li>
        <li>Souffrir sans indemnité les travaux urgents nécessaires à la conservation de l'immeuble.</li>
    </ul>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 15 — INSTALLATIONS ET ÉQUIPEMENTS</p>
    <p>
        Le Preneur maintient en bon état de fonctionnement tous les équipements et installations mis à sa
        disposition. Toute installation électrique ou de fluides non prévue à l'origine requiert l'autorisation
        écrite préalable du Bailleur.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 16 — TRAVAUX DU PRENEUR</p>
    <p>
        Tout travail d'aménagement, de modification ou d'installation nécessite l'accord préalable et écrit
        du Bailleur. Travaux réalisés aux frais et sous la responsabilité du Preneur, dans le respect des
        règles de l'art et des autorisations administratives nécessaires. À l'expiration, le Bailleur peut
        exiger la remise en état d'origine, aux frais du Preneur, ou conserver les aménagements sans indemnité.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 17 — TRAVAUX DU BAILLEUR EN COURS DE BAIL</p>
    <p>
        Le Preneur souffre sans indemnité ni réduction de loyer les réparations et travaux nécessaires,
        sous réserve d'un préavis raisonnable et que ceux-ci ne rendent pas les locaux impropres à leur
        usage pendant plus de quarante (40) jours consécutifs.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 18 — VISITE DES LOCAUX</p>
    <p>
        Le Preneur laisse accéder le Bailleur ou ses mandataires avec un préavis de 48 heures (sauf urgence).
        En cas de congé ou de mise en vente, les visites sont organisées aux jours et heures convenus.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 19 — OCCUPATION PERSONNELLE — CESSION — SOUS-LOCATION</p>
    <p>
        Le Preneur occupe personnellement les locaux pour l'exercice de son activité professionnelle. Toute
        cession du présent bail ou sous-location, même partielle ou à titre gratuit, est interdite sans accord
        préalable et écrit du Bailleur. En cas d'autorisation, le Preneur demeure garant solidaire du
        cessionnaire ou sous-locataire pour l'exécution de toutes les obligations du bail.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 20 — ENTRETIEN ET RÉPARATIONS LOCATIVES</p>
    <p>
        Le Preneur entretient les locaux en bon état de propreté et effectue à ses frais toutes les réparations
        courantes (menus travaux, entretien des canalisations, installations électriques, revêtements et
        équipements). Il signale sans délai tout sinistre au Bailleur.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 21 — RESTITUTION DES LOCAUX</p>
    <p>
        À l'expiration ou résiliation du bail, le Preneur restitue les locaux libres, propres et en bon état
        d'entretien, conformément à l'état des lieux d'entrée (compte tenu de la vétusté normale), et remet
        les clés au Bailleur au plus tard à minuit le dernier jour du bail.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 22 — INDEMNITÉ D'OCCUPATION</p>
    <p>
        En cas de maintien dans les locaux après cessation du bail, le Preneur est redevable de plein droit
        d'une indemnité d'occupation mensuelle égale au dernier loyer majoré de <span class="strong">40 %</span>,
        à compter du lendemain de l'expiration, sans préjudice des dommages et intérêts.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 23 — RÉGLEMENTATION APPLICABLE</p>
    <p>
        Le Preneur fait son affaire personnelle de l'obtention et du maintien de toutes les autorisations
        nécessaires à son activité (ordre professionnel, préfecture, etc.). Il se conforme à l'ensemble des
        lois, règlements et prescriptions applicables à sa profession et à l'immeuble.
    </p>
</div>

@if($lease->guarantors && $lease->guarantors->where('type', '!=', 'visale')->isNotEmpty())
<div class="section avoid-break art">
    <p class="art-title">ARTICLE 24 — GARANT(S)</p>
    @foreach($lease->guarantors->where('type', '!=', 'visale') as $guarantor)
    <p>
        <span class="strong">{{ strtoupper($guarantor->last_name) }} {{ $guarantor->first_name }}</span>
        @if($guarantor->current_address), {{ $guarantor->current_address }}@endif
        — caution solidaire par acte de cautionnement joint au présent contrat.
    </p>
    @endforeach
</div>
@endif

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 25 — CLAUSE RÉSOLUTOIRE</p>
    <p>
        À défaut de paiement de tout terme de loyer, provision de charges, complément de dépôt de garantie
        ou d'exécution de toute obligation du bail, et <span class="strong">un (1) mois</span> après
        commandement de payer ou mise en demeure d'exécuter mentionnant la présente clause, demeuré
        infructueux, le bail sera résilié de plein droit si bon semble au Bailleur, sans formalité judiciaire.
        Tous frais de recouvrement restent à la charge du Preneur.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 26 — CLAUSE PÉNALE</p>
    <p>
        Tout retard de paiement entraîne automatiquement et de plein droit, sans mise en demeure, un intérêt
        de retard au taux légal majoré de deux (2) points, calculé sur les sommes dues, de l'échéance jusqu'au
        paiement effectif.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 27 — IMPRÉVISION</p>
    <p>
        Par dérogation à l'art. 1195 C.civ., les parties renoncent expressément à invoquer l'imprévision
        pour renégocier ou résilier le présent contrat.
    </p>
</div>

<div class="section avoid-break art">
    <p class="art-title">ARTICLE 28 — ÉLECTION DE DOMICILE — LITIGES</p>
    <ul>
        <li>Bailleur : {{ config('building.landlord_address') }}</li>
        <li>Preneur : {{ config('building.address') }}, {{ config('building.zip') }} {{ config('building.city') }}</li>
    </ul>
    <p>
        En cas de litige, les parties s'efforceront de trouver un règlement amiable avant tout recours
        judiciaire. Le tribunal compétent est celui du ressort du lieu de situation des locaux loués.
    </p>
</div>

{{-- ANNEXES --}}
<div class="section avoid-break">
    <div class="hr"></div>
    <p class="subsection-title">Annexes au présent bail</p>
    <ul>
        <li>État des lieux d'entrée</li>
        <li>État des risques et pollutions (ERP)</li>
        @if($lease->guarantors && $lease->guarantors->where('type', '!=', 'visale')->isNotEmpty())
        <li>Acte(s) de cautionnement</li>
        @endif
    </ul>
</div>

{{-- ── SIGNATURES ──────────────────────────────────────────── --}}
<div class="section-title" style="margin-top:20px;">Signatures</div>

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
            <div class="sig-label">Le Preneur</div>
            @if($tenant->tenant_type === 'legal_entity')
                <div class="sig-name">{{ $tenant->company_name ?? '' }}</div>
                <p style="font-size:9px; color:#000; margin:2px 0 0 0;">Représentée par {{ $tenant->first_name }} {{ strtoupper($tenant->last_name) }}</p>
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

</body>
</html>
