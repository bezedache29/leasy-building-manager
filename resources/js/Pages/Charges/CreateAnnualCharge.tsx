import React, { useState } from 'react';

// definition des types pour les tarifs d'eau
interface WaterRates {
  distrib_inf: number;
  distrib_sup: number;
  usees_inf: number;
  usees_sup: number;
  abonnement_distrib: number;
  abonnement_usees_suez: number;
  abonnement_usees_iroise: number;
  orga_modernisation: number;
  orga_agence: number;
}

export default function CreateAnnualCharge() {
  const [year, setYear] = useState<number>(new Date().getFullYear() - 1);
  const [rates, setRates] = useState<WaterRates>({
    distrib_inf: 0,
    distrib_sup: 0,
    usees_inf: 0,
    usees_sup: 0,
    abonnement_distrib: 0,
    abonnement_usees_suez: 0,
    abonnement_usees_iroise: 0,
    orga_modernisation: 0.16,
    orga_agence: 0.3,
  });

  // gestion de la soumission du formulaire vers le backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: construire le payload et appeler leases/annual-charges
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Nouvelle Campagne de Charges Annuelles
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* section annee */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Année de référence</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* section facture d'eau detaillee */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Détail Facture d'Eau (Suez)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tarif Distrib. Inférieur (€)
              </label>
              <input
                type="number"
                step="0.0001"
                value={rates.distrib_inf}
                onChange={(e) => setRates({ ...rates, distrib_inf: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tarif Distrib. Supérieur (€)
              </label>
              <input
                type="number"
                step="0.0001"
                value={rates.distrib_sup}
                onChange={(e) => setRates({ ...rates, distrib_sup: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {/* tu peux dupliquer ces blocs pour usees_inf, usees_sup, abonnements, etc. */}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Générer la matrice
          </button>
        </div>
      </form>
    </div>
  );
}
