<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Contrat de location - {{ $lease->property->name }}</title>
    <style>
        body { 
            font-family: 'Helvetica', 'Arial', sans-serif; 
            font-size: 11.5px; 
            line-height: 1.4; 
            color: #111;
            margin: 20px 30px;
            text-align: justify;
        }
        h1 { text-align: center; font-size: 16px; text-transform: uppercase; margin-bottom: 5px; }
        .subtitle { text-align: center; font-size: 10px; font-style: italic; margin-bottom: 25px; color: #444; }
        h2 { 
            font-size: 12px; 
            background-color: #f4f4f4; 
            padding: 6px 10px; 
            border-left: 3px solid #000; 
            margin-top: 20px; 
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        h3 { font-size: 11.5px; margin-top: 15px; margin-bottom: 5px; text-decoration: underline; font-weight: bold; }
        p { margin-bottom: 8px; margin-top: 0; }
        ul { margin-top: 5px; padding-left: 20px; margin-bottom: 10px; }
        li { margin-bottom: 4px; }
        .section { margin-bottom: 15px; }
        .row { margin-bottom: 6px; }
        .strong { font-weight: bold; }
        .avoid-break { page-break-inside: avoid; }
        
        .highlight-box { border: 1px solid #000; padding: 12px; background-color: #fafafa; margin-top: 5px; border-radius: 2px; }
        
        .signature-table { width: 100%; margin-top: 15px; border-collapse: collapse; page-break-inside: avoid; }
        .signature-table td { width: 50%; vertical-align: top; border: 1px solid #aaa; padding: 10px; height: 100px; }
        .small-text { font-size: 9.5px; color: #555; font-style: italic; }
        
        .dotted-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        .dotted-label { white-space: nowrap; width: 1%; padding-right: 5px; }
        .dotted-line { border-bottom: 1px dotted #000; width: 99%; padding-left: 5px; }
    </style>
</head>
<body>

    <h1>Contrat de location de locaux non meublés</h1>
    <div class="subtitle">
        Soumis au titre Ier de la loi n° 89-462 du 6 juillet 1989 tendant à améliorer les rapports locatifs<br>
        et au décret n° 2015-587 du 29 mai 2015 relatif aux contrats types de location de logement à usage de résidence principale.
    </div>

    <div class="section">
        <h2>I. DÉSIGNATION DES PARTIES</h2>
        <div class="row">
            <span class="strong">LE BAILLEUR :</span><br>
            Madame Eliane SALOU<br>
            5 hent kerliver, 29890 Kerlouan<br>
            Téléphone : 06 61 71 80 19<br>
            Dénommée ci-après « LE BAILLEUR »,
        </div>

        <div class="row" style="margin-top: 15px;">
            <span class="strong">LE(S) LOCATAIRE(S) :</span><br>
            @foreach($lease->tenants as $tenant)
                - <span class="strong">{{ strtoupper($tenant->last_name) }} {{ $tenant->first_name }}</span>, 
                né(e) le {{ $tenant->birth_date ? \Carbon\Carbon::parse($tenant->birth_date)->format('d/m/Y') : '...' }} 
                à {{ $tenant->birth_place ?: '...' }} 
                (Tél : {{ $tenant->phone ? wordwrap(preg_replace('/[^0-9]/', '', $tenant->phone), 2, ' ', true) : '...' }} - Email : {{ $tenant->email }})<br>
            @endforeach
            Dénommé(s) ci-après « LE LOCATAIRE »,
        </div>
    </div>

    @php
        $typesFr = [
            'studio' => 'Studio',
            'apartment' => 'Appartement',
            'commercial' => 'Local commercial',
            'garage' => 'Garage',
            'other' => 'Autre'
        ];
        $typeFr = $typesFr[$lease->property->type] ?? $lease->property->type;
    @endphp

    <div class="section avoid-break">
        <h2>II. OBJET DU CONTRAT</h2>
        <div class="row"><span class="strong">Désignation du logement :</span> {{ $lease->property->name }} - {{ $typeFr }}</div>
        
        <div class="row">
            <span class="strong">Adresse du logement :</span> 
            {{ config('building.address') }}, {{ config('building.zip') }} {{ config('building.city') }}
        </div>
        
        <div class="row">
            <span class="strong">Étage :</span> 
            @if($lease->property->floor == 0)
                Rez-de-chaussée
            @elseif($lease->property->floor == 1)
                1er étage
            @else
                {{ $lease->property->floor }}ème étage
            @endif
        </div>

        <div class="row"><span class="strong">Surface habitable :</span> {{ $lease->property->surface_area ?? '...' }} m² environ.</div>
        <div class="row"><span class="strong">Destination des locaux :</span> Usage exclusif d'habitation principale. Le locataire s'interdit notamment d'exercer dans les locaux loués toute activité commerciale, industrielle ou artisanale.</div>
        
        <h3>Consistance et équipements du logement</h3>
        <p>Tels que ces locaux existent et tels que le locataire déclare parfaitement les connaître pour les avoir visités dès avant ce jour. Il reconnaît qu'ils sont en bon état d'usage et d'entretien.</p>
        <ul>
            <li><span class="strong">Équipements privatifs :</span> Chauffage individuel, production d'eau chaude individuelle, système de ventilation (VMC) individuel. Sous-compteur d'eau individuel. Compteur électrique individuel à la charge du locataire.</li>
            <li><span class="strong">Parties et équipements communs :</span> Hall d'entrée, escalier menant aux appartements, boîtes aux lettres, interphone.</li>
        </ul>
    </div>

    <div class="section avoid-break">
        <h2>III. DATE DE PRISE D'EFFET ET DURÉE DU CONTRAT</h2>
        <div class="row"><span class="strong">Date de prise d'effet :</span> Le {{ \Carbon\Carbon::parse($lease->start_date)->format('d/m/Y') }}</div>
        <div class="row"><span class="strong">Durée :</span> Le présent contrat est conclu pour une durée de <span class="strong">3 années</span>.</div>
        <p>À défaut de congé ou de proposition de renouvellement, le contrat parvenu à son terme est reconduit tacitement pour des périodes de 3 ans. Le locataire peut résilier le contrat à tout moment, sous réserve de respecter un préavis de trois mois, réductible à un mois dans les cas prévus par la loi (mutation, perte d'emploi, zone tendue, etc.).</p>
    </div>

    <div class="section avoid-break">
        <h2>IV. CONDITIONS FINANCIÈRES</h2>
        
        <h3>1. Loyer et Charges</h3>
        <p>Le loyer est payable d'avance le <span class="strong">{{ $lease->payment_day }}</span> de chaque mois.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px;">
            <tr>
                <td style="width: 70%; padding: 4px;">Loyer mensuel principal :</td>
                <td style="width: 30%; text-align: right; padding: 4px;"><span class="strong">{{ number_format($lease->rent_amount, 2, ',', ' ') }} €</span></td>
            </tr>
            <tr>
                <td style="padding: 4px;">Provisions sur charges mensuelles :</td>
                <td style="text-align: right; padding: 4px;"><span class="strong">{{ number_format($lease->charges_amount, 2, ',', ' ') }} €</span></td>
            </tr>
            <tr style="border-top: 1px solid #000; font-weight: bold;">
                <td style="padding: 6px 4px;">TOTAL MENSUEL À RÉGLER :</td>
                <td style="text-align: right; padding: 6px 4px;">{{ number_format($lease->rent_amount + $lease->charges_amount, 2, ',', ' ') }} €</td>
            </tr>
        </table>
        
        <p><span class="strong">Détail des charges :</span> Ordures ménagères, électricité des parties communes, ménage des communs, eau. En même temps et de la même façon que le loyer principal, le locataire s'oblige à acquitter les charges et prestations récupérables. Le paiement de ces charges donnera lieu au paiement de provisions mensuelles justifiées par une régularisation annuelle établie par le bailleur sur présentation des justificatifs correspondants.</p>

        <h3>2. Nettoyage des parties communes</h3>
        <p>Afin de garantir le maintien en bon état de propreté de l'immeuble, le bailleur mandate une entreprise de nettoyage pour l'entretien des parties communes. Le coût de cette prestation est répercuté au locataire au sein des provisions pour charges susmentionnées.</p>

        <h3>3. Révision du loyer</h3>
        <p>Le loyer sera révisé automatiquement et de plein droit chaque année à la date anniversaire du présent contrat, sans que le bailleur ait à effectuer une notification préalable, en fonction de la variation de l'Indice de Référence des Loyers (IRL) publié par l'INSEE. L'indice de base à prendre en compte est celui du trimestre de la signature du présent contrat.</p>
    </div>

    <div class="section avoid-break">
        <h2>V. DÉPÔT DE GARANTIE</h2>
        <p>À titre de garantie de l'entière exécution de ses obligations, le locataire verse ce jour un dépôt de garantie correspondant à un mois de loyer hors charges, soit la somme de : <span class="strong">{{ number_format($lease->rent_amount, 2, ',', ' ') }} €</span>.</p>
        <p>Cette somme sera restituée sans intérêt au locataire en fin de bail, dans un délai maximal de un mois à compter de la remise des clés si l'état des lieux de sortie est conforme à l'état des lieux d'entrée, ou de deux mois s'il y a des différences. Le bailleur pourra déduire de ce dépôt toutes les sommes dont le locataire serait débiteur (loyers, charges, réparations locatives justifiées par devis ou factures, frais de nettoyage si le logement n'est pas rendu en parfait état de propreté).</p>
    </div>

    <div class="section avoid-break">
        <h2>VI. ASSURANCE DU LOCATAIRE</h2>
        <p>Le locataire est tenu de s'assurer contre les risques locatifs (incendie, dégât des eaux, etc.) et d'en justifier lors de la remise des clés, puis chaque année à la demande du bailleur.</p>
        <div class="highlight-box">
            <table class="dotted-table">
                <tr>
                    <td class="dotted-label"><span class="strong">Compagnie d'assurance :</span></td>
                    <td class="{{ $lease->insurer_name ? '' : 'dotted-line' }}" style="width: 99%; padding-left: 5px;">{{ $lease->insurer_name }}</td>
                </tr>
            </table>
            <table class="dotted-table">
                <tr>
                    <td class="dotted-label"><span class="strong">Adresse de l'assureur :</span></td>
                    <td class="{{ $lease->insurer_address ? '' : 'dotted-line' }}" style="width: 99%; padding-left: 5px;">{{ $lease->insurer_address }}</td>
                </tr>
            </table>
            <table class="dotted-table" style="margin-bottom: 0;">
                <tr>
                    <td class="dotted-label"><span class="strong">Téléphone :</span></td>
                    <td class="{{ $lease->insurer_phone ? '' : 'dotted-line' }}" style="width: 99%; padding-left: 5px;">{{ $lease->insurer_phone }}</td>
                </tr>
            </table>
        </div>
    </div>

    @php
        // On récupère uniquement les garants cochés spécifiquement pour CE bail
        $guarantors = $lease->guarantors;
    @endphp

    @if($guarantors->count() > 0)
    <div class="section avoid-break">
        <h2>VII. GARANT(S) SOLIDAIRE(S)</h2>
        <p>La présente location est garantie par la ou les personnes désignées ci-dessous en qualité de caution solidaire. Un acte de cautionnement séparé et conforme à la législation en vigueur est annexé au présent contrat.</p>
        
        @foreach($guarantors as $guarantor)
            <div class="highlight-box">
                <div class="row">
                    <span class="strong">Nom et Prénom :</span> {{ strtoupper($guarantor->last_name) }} {{ $guarantor->first_name }}
                </div>
                
                <table class="dotted-table">
                    <tr>
                        <td class="dotted-label"><span class="strong">Adresse :</span></td>
                        <td class="{{ $guarantor->current_address ? '' : 'dotted-line' }}" style="width: 99%; padding-left: 5px;">
                            {{ $guarantor->current_address }}
                        </td>
                    </tr>
                </table>

                <table class="dotted-table">
                    <tr>
                        <td class="dotted-label"><span class="strong">Profession :</span></td>
                        <td class="{{ $guarantor->profession ? '' : 'dotted-line' }}" style="width: 99%; padding-left: 5px;">
                            {{ $guarantor->profession }}
                        </td>
                    </tr>
                </table>

                <div class="row" style="margin-top: 8px;">
                    <span class="strong">Contact :</span> 
                    Tél : {{ $guarantor->phone ? wordwrap(preg_replace('/[^0-9]/', '', $guarantor->phone), 2, ' ', true) : '........................' }} - 
                    Email : {{ $guarantor->email ?: '........................................' }}
                </div>
            </div>
        @endforeach
    </div>
    @endif

    <div class="section">
        <h2>VIII. OBLIGATIONS DU LOCATAIRE</h2>
        <p>Le locataire est tenu des obligations principales suivantes (Art. 7 de la loi du 6 juillet 1989) :</p>
        <ul>
            <li><span class="strong">Paiement :</span> Payer le loyer et les charges récupérables aux termes convenus.</li>
            <li><span class="strong">Usage paisible :</span> User paisiblement des locaux et équipements loués suivant la destination prévue au contrat. Respecter le règlement intérieur de l'immeuble.</li>
            <li><span class="strong">Entretien et réparations :</span> Prendre à sa charge l'entretien courant du logement et des équipements, les menues réparations et l'ensemble des réparations locatives définies par le décret n° 87-712 du 26 août 1987.</li>
            <li><span class="strong">Entretien spécifique :</span>
            En complément des obligations d’entretien courant visées ci-dessus,
            le locataire devra procéder au nettoyage régulier des bouches de ventilation
            et des entrées d’air du logement.

            Il devra assurer l’entretien courant des équipements de production d’eau chaude,
            notamment le détartrage lorsque cela est nécessaire,
            et signaler sans délai au bailleur toute anomalie ou dysfonctionnement.

            Le locataire devra permettre l’accès au logement pour toute intervention
            rendue nécessaire à l’entretien ou à la réparation des équipements.
            Toute dégradation résultant d’un défaut d’entretien
            ou d’un signalement tardif pourra être mise à sa charge.
            </li>
            <li><span class="strong">Assurance :</span> S'assurer contre les risques dont il doit répondre en sa qualité de locataire (incendie, dégât des eaux, etc.) et en justifier au bailleur à la remise des clés puis chaque année. <span class="strong">À défaut, le bailleur pourra résilier le présent contrat.</span></li>
            <li><span class="strong">Dégradations :</span> Répondre des dégradations et pertes qui surviennent pendant la durée du contrat dans les locaux dont il a la jouissance exclusive.</li>
            <li><span class="strong">Transformations :</span> Ne pas transformer les locaux et équipements loués sans l'accord écrit du bailleur.</li>
            <li><span class="strong">Accès :</span> Laisser exécuter dans les lieux loués les travaux d'amélioration des parties communes ou privatives, ainsi que les travaux nécessaires au maintien en état et à l'entretien normal des locaux.</li>
            <li><span class="strong">Sous-location :</span> Le locataire ne peut ni céder le contrat de location, ni sous-louer le logement sauf accord écrit du bailleur.</li>
            <li><span class="strong">Droit de visite :</span> Laisser visiter les lieux loués, en vue de la vente ou de la relocation, deux heures par jour pendant les jours ouvrables. L'horaire sera défini par accord amiable ou, à défaut d'accord, entre 17h00 et 19h00.</li>
        </ul>
    </div>

    <div class="section">
        <h2>IX. OBLIGATIONS DU BAILLEUR</h2>
        <p>Le bailleur est tenu des obligations principales suivantes (Art. 6 de la loi du 6 juillet 1989) :</p>
        <ul>
            <li>Délivrer au locataire le logement en bon état d'usage et de réparation, ainsi que les équipements en bon état de fonctionnement.</li>
            <li>Délivrer un logement décent ne laissant pas apparaître de risques manifestes pouvant porter atteinte à la sécurité physique ou à la santé, exempt de toute infestation d'espèces nuisibles et parasites.</li>
            <li>Assurer au locataire la jouissance paisible du logement et le garantir des vices ou défauts de nature à y faire obstacle.</li>
            <li>Entretenir les locaux en état de servir à l'usage prévu par le contrat et y faire toutes les réparations autres que locatives nécessaires au maintien en état.</li>
            <li>Délivrer gratuitement une quittance au locataire lorsque celui-ci en fait la demande.</li>
        </ul>
    </div>

    <div class="section avoid-break">
        <h2>X. CLAUSE RÉSOLUTOIRE</h2>
        <div class="highlight-box">
            <p>Il est expressément convenu qu'à défaut de paiement d'un seul terme de loyer ou de charges à son échéance, ou de non-versement du dépôt de garantie, et deux mois après un commandement de payer demeuré infructueux, le présent contrat sera résilié de plein droit, sans qu'il soit besoin de remplir aucune formalité judiciaire.</p>
            <p>Le contrat sera également résilié de plein droit un mois après un commandement demeuré infructueux en cas de :</p>
            <ul>
                <li>Défaut d'assurance contre les risques locatifs.</li>
                <li>Troubles de voisinage constatés par une décision de justice passée en force de chose jugée.</li>
            </ul>
            <p>Une fois la résiliation acquise, le locataire devra libérer immédiatement les lieux. S'il s'y refuse, le bailleur pourra l'y contraindre par simple ordonnance de référé. Une indemnité d'occupation égale au dernier loyer mensuel majoré de 50 % sera due jusqu'à libération complète des lieux.</p>
        </div>
    </div>

    <div class="section avoid-break">
        <h2>XI. CLAUSE DE SOLIDARITÉ ET INDIVISIBILITÉ</h2>
        <p>En cas de pluralité de locataires, il est expressément stipulé que ceux-ci sont tenus solidairement et indivisiblement de l'exécution de toutes les obligations découlant du présent contrat (paiement des loyers, charges, indemnités d'occupation et réparations locatives). Le bailleur pourra s'adresser à n'importe lequel des locataires pour exiger la totalité du paiement.</p>
    </div>

    <div class="section avoid-break">
        <h2>XII. ANNEXES AU CONTRAT</h2>
        <p>Le locataire reconnaît avoir reçu, lors de la signature des présentes, les documents suivants :</p>
        <ul>
            <li>L'état des lieux d'entrée établi contradictoirement.</li>
            <li>Le Dossier de Diagnostic Technique (DPE, ERP).</li>
            <li>La notice d'information relative aux droits et obligations des locataires et des bailleurs.</li>
            @if($guarantors->count() > 0)
                <li>L'acte de cautionnement solidaire.</li>
            @endif
        </ul>
    </div>

    <h2>XIII. REMISE DES CLÉS</h2>
        <p>Le bailleur remet ce jour au locataire les clés suivantes, que ce dernier s'oblige à restituer en fin de jouissance :</p>
        <div class="highlight-box">
            <table class="dotted-table">
                <tr>
                    <td class="dotted-label"><span class="strong">Clés de l'immeuble (entrée principale) :</span></td>
                    <td class="{{ is_null($lease->keys_building_count) ? 'dotted-line' : '' }}" style="width: 99%; padding-left: 5px;">
                        {{ $lease->keys_building_count }}
                    </td>
                </tr>
            </table>
            <table class="dotted-table">
                <tr>
                    <td class="dotted-label"><span class="strong">Clés du logement :</span></td>
                    <td class="{{ is_null($lease->keys_apartment_count) ? 'dotted-line' : '' }}" style="width: 99%; padding-left: 5px;">
                        {{ $lease->keys_apartment_count }}
                    </td>
                </tr>
            </table>
            <table class="dotted-table" style="margin-bottom: 0;">
                <tr>
                    <td class="dotted-label"><span class="strong">Clés de la boîte aux lettres :</span></td>
                    <td class="{{ is_null($lease->keys_mailbox_count) ? 'dotted-line' : '' }}" style="width: 99%; padding-left: 5px;">
                        {{ $lease->keys_mailbox_count }}
                    </td>
                </tr>
            </table>
        </div>

    <div class="section avoid-break">
        <h2>XIV. SIGNATURES</h2>
        <p class="small-text">Fait à ........................................, le {{ date('d/m/Y') }}, en deux exemplaires originaux.</p>
        
        <table class="signature-table">
            <tr>
                <td>
                    <span class="strong">Le Bailleur</span><br>
                    <span class="small-text">(Signature)</span>
                </td>
                <td>
                    <span class="strong">Le(s) Locataire(s)</span><br>
                    <span class="small-text">(Faire précéder la signature de la mention manuscrite "Lu et approuvé")</span>
                </td>
            </tr>
        </table>
        @if($guarantors->count() > 0)
        <table class="signature-table">
            <tr>
                <td colspan="2">
                    <span class="strong">La (ou les) Caution(s) Solidaire(s)</span><br>
                    <span class="small-text">(Faire précéder la signature de la mention manuscrite "Lu et approuvé")</span>
                </td>
            </tr>
        </table>
        @endif
    </div>

</body>
</html>