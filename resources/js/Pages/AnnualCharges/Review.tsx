import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import { Property } from '@/Types/property';

interface ReviewProps {
  property: Property;
  settlement: unknown;
  reviewData: {
    consumption: number;
    distrib: {
      sub_ht: number;
      coef: number;
      cons_ht: number;
      details: { inf_formula: string; sup_formula: string; inf_res: number; sup_res: number };
    };
    wastewater: {
      sub_ht: number;
      coef: number;
      cons_ht: number;
      details: { inf_formula: string; sup_formula: string; inf_res: number; sup_res: number };
    };
    organismes: { mod_ht: number; mod_coef: number; agency_ht: number; agency_coef: number };
  };
}

export default function Review({
  property,
  reviewData,
}: Omit<ReviewProps, 'settlement'> & { settlement?: unknown }) {
  // on recalcule les totaux locaux pour le tableau
  const distribTotalHT = reviewData.distrib.sub_ht + reviewData.distrib.cons_ht;
  const distribTVA = distribTotalHT * 0.055;
  const distribTotalTTC = distribTotalHT + distribTVA;

  const wasteTotalHT = reviewData.wastewater.sub_ht + reviewData.wastewater.cons_ht;
  const wasteTVA = wasteTotalHT * 0.1;
  const wasteTotalTTC = wasteTotalHT + wasteTVA;

  const orgaTotalHT = reviewData.organismes.mod_ht + reviewData.organismes.agency_ht;
  const orgaTVA = orgaTotalHT * 0.1; // C'est ici qu'on verra le decallage avec ton excel
  const orgaTotalTTC = orgaTotalHT + orgaTVA;

  const totalGlobal = distribTotalTTC + wasteTotalTTC + orgaTotalTTC;

  const thClass =
    'px-4 py-3 text-left text-sm font-semibold text-muted bg-surface-2 border-b border-[rgb(var(--border))]';
  const tdClass = 'px-4 py-3 text-sm text-app border-b border-[rgb(var(--border))]';
  const tdNumClass =
    'px-4 py-3 text-sm font-medium text-app border-b border-[rgb(var(--border))] text-right';

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl pb-12">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-app">Révision du décompte d'eau</h1>
            <p className="text-muted mt-1 text-sm">Lot : {property.name}</p>
          </div>
        </header>

        <div className="rounded-xl border border-[rgb(var(--border))] bg-surface overflow-hidden shadow-sm mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Rubrique</th>
                <th className={thClass}>Détail du calcul</th>
                <th className={`${thClass} text-right`}>Montant HT</th>
                <th className={`${thClass} text-right`}>TVA</th>
                <th className={`${thClass} text-right`}>Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              {/* DISTRIBUTION */}
              <tr className="bg-surface-2">
                <td
                  colSpan={5}
                  className="px-4 py-2 text-sm font-bold text-app border-b border-[rgb(var(--border))]"
                >
                  1. Distribution d'Eau ({reviewData.consumption} m³)
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Abonnement</td>
                <td className={tdClass}>Divisé par 5 locataires</td>
                <td className={tdNumClass}>{reviewData.distrib.sub_ht.toFixed(2)} €</td>
                <td className={tdNumClass}></td>
                <td className={tdNumClass}></td>
              </tr>
              <tr>
                <td className={tdClass}>Consommation</td>
                <td className={tdClass}>
                  <div className="text-[rgb(var(--warning-600))] font-semibold">
                    {reviewData.consumption} m³ x {reviewData.distrib.coef.toFixed(4)} €
                  </div>
                  <div className="mt-2 text-xs text-muted font-mono bg-surface-3 p-2 rounded border border-[rgb(var(--border))]">
                    <div>
                      Inférieur : ({reviewData.distrib.details.inf_formula} / 2) / 2 ={' '}
                      {reviewData.distrib.details.inf_res} €
                    </div>
                    <div>
                      Supérieur : ({reviewData.distrib.details.sup_formula} / 2) / 2 ={' '}
                      {reviewData.distrib.details.sup_res} €
                    </div>
                  </div>
                </td>
                <td className={tdNumClass}>{reviewData.distrib.cons_ht.toFixed(2)} €</td>
                <td className={tdNumClass}></td>
                <td className={tdNumClass}></td>
              </tr>
              <tr className="bg-[rgb(var(--primary-500))]/5">
                <td colSpan={2} className={`${tdNumClass} font-bold`}>
                  Sous-total Distribution
                </td>
                <td className={`${tdNumClass} font-bold`}>{distribTotalHT.toFixed(2)} €</td>
                <td className={tdNumClass}>{distribTVA.toFixed(2)} € (5,5%)</td>
                <td className={`${tdNumClass} font-bold text-[rgb(var(--primary-600))]`}>
                  {distribTotalTTC.toFixed(2)} €
                </td>
              </tr>

              {/* EAUX USEES */}
              <tr className="bg-surface-2">
                <td
                  colSpan={5}
                  className="px-4 py-2 text-sm font-bold text-app border-b border-[rgb(var(--border))] mt-4"
                >
                  2. Collecte et Traitement ({reviewData.consumption} m³)
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Abonnement</td>
                <td className={tdClass}>Divisé par 5 locataires</td>
                <td className={tdNumClass}>{reviewData.wastewater.sub_ht.toFixed(2)} €</td>
                <td className={tdNumClass}></td>
                <td className={tdNumClass}></td>
              </tr>
              <tr>
                <td className={tdClass}>Consommation</td>
                <td className={tdClass}>
                  <div className="text-[rgb(var(--warning-600))] font-semibold">
                    {reviewData.consumption} m³ x {reviewData.wastewater.coef.toFixed(4)} €
                  </div>
                  <div className="mt-2 text-xs text-muted font-mono bg-surface-3 p-2 rounded border border-[rgb(var(--border))]">
                    <div>
                      Inférieur : ({reviewData.wastewater.details.inf_formula} / 2) / 2 ={' '}
                      {reviewData.wastewater.details.inf_res} €
                    </div>
                    <div>
                      Supérieur : ({reviewData.wastewater.details.sup_formula} / 2) / 2 ={' '}
                      {reviewData.wastewater.details.sup_res} €
                    </div>
                  </div>
                </td>
                <td className={tdNumClass}>{reviewData.wastewater.cons_ht.toFixed(2)} €</td>
                <td className={tdNumClass}></td>
                <td className={tdNumClass}></td>
              </tr>
              <tr className="bg-[rgb(var(--primary-500))]/5">
                <td colSpan={2} className={`${tdNumClass} font-bold`}>
                  Sous-total Eaux Usées
                </td>
                <td className={`${tdNumClass} font-bold`}>{wasteTotalHT.toFixed(2)} €</td>
                <td className={tdNumClass}>{wasteTVA.toFixed(2)} € (10%)</td>
                <td className={`${tdNumClass} font-bold text-[rgb(var(--primary-600))]`}>
                  {wasteTotalTTC.toFixed(2)} €
                </td>
              </tr>

              {/* ORGANISMES */}
              <tr className="bg-surface-2">
                <td
                  colSpan={5}
                  className="px-4 py-2 text-sm font-bold text-app border-b border-[rgb(var(--border))] mt-4"
                >
                  3. Organismes Publics
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Modernisation réseau</td>
                <td className={tdClass}>
                  {reviewData.consumption} m³ x {reviewData.organismes.mod_coef.toFixed(3)} €
                </td>
                <td className={tdNumClass}>{reviewData.organismes.mod_ht.toFixed(2)} €</td>
                <td className={tdNumClass}></td>
                <td className={tdNumClass}></td>
              </tr>
              <tr>
                <td className={tdClass}>Agence de l'eau</td>
                <td className={tdClass}>
                  {reviewData.consumption} m³ x {reviewData.organismes.agency_coef.toFixed(3)} €
                </td>
                <td className={tdNumClass}>{reviewData.organismes.agency_ht.toFixed(2)} €</td>
                <td className={tdNumClass}></td>
                <td className={tdNumClass}></td>
              </tr>
              <tr className="bg-[rgb(var(--primary-500))]/5">
                <td colSpan={2} className={`${tdNumClass} font-bold`}>
                  Sous-total Organismes
                </td>
                <td className={`${tdNumClass} font-bold`}>{orgaTotalHT.toFixed(2)} €</td>
                <td className={tdNumClass}>{orgaTVA.toFixed(2)} € (10%?)</td>
                <td className={`${tdNumClass} font-bold text-[rgb(var(--primary-600))]`}>
                  {orgaTotalTTC.toFixed(2)} €
                </td>
              </tr>

              {/* TOTAL GLOBAL */}
              <tr className="bg-[rgb(var(--primary-500))]/10 border-t-2 border-[rgb(var(--primary-500))]">
                <td
                  colSpan={4}
                  className="px-4 py-4 text-right text-lg font-bold text-app uppercase"
                >
                  Total Eau Décompté
                </td>
                <td className="px-4 py-4 text-right text-2xl font-black text-[rgb(var(--primary-700))]">
                  {totalGlobal.toFixed(2)} €
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <Button href={route('properties.show', property.id)} variant="primary" size="lg">
            Valider et retourner au lot
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
