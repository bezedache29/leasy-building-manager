<?php

return [
    'address' => env('BUILDING_ADDRESS', ''),
    'zip' => env('BUILDING_ZIP', ''),
    'city' => env('BUILDING_CITY', ''),
    // variables pour le bailleur
    'landlord_name' => env('LANDLORD_NAME', 'Eliane Salou'),
    'landlord_address' => env('LANDLORD_ADDRESS', '5 hent kerliver, 29890 Kerlouan'),
    'landlord_phone_number' => env('LANDLORD_PHONE_NUMBER', '06 61 71 80 19'),
    'landlord_mail' => env('LANDLORD_MAIL', 'eliane.salou@hotmail.fr'),
    // IRL — à mettre à jour chaque trimestre (source : INSEE)
    'irl_value'   => env('IRL_VALUE', '146,60'),
    'irl_quarter' => env('IRL_QUARTER', '1er trimestre 2026'),

    // Informations détaillées du bailleur (pour le bail commercial)
    'landlord_first_name'     => env('LANDLORD_FIRST_NAME', 'Eliane'),
    'landlord_last_name'      => env('LANDLORD_LAST_NAME', 'SALOU'),
    'landlord_profession'     => env('LANDLORD_PROFESSION', 'Retraitée'),
    'landlord_birth_date'     => env('LANDLORD_BIRTH_DATE', '24 mai 1961'),
    'landlord_birth_place'    => env('LANDLORD_BIRTH_PLACE', 'Algrange (57440)'),
    'landlord_nationality'    => env('LANDLORD_NATIONALITY', 'française'),
    'landlord_marital_regime' => env('LANDLORD_MARITAL_REGIME', 'la communauté de biens réduite aux acquêts à défaut de contrat de mariage préalable à leur union'),
    'landlord_marriage_city'  => env('LANDLORD_MARRIAGE_CITY', 'Landerneau (29800)'),
    'landlord_marriage_date'  => env('LANDLORD_MARRIAGE_DATE', '6 février 1981'),
    // Cadastre de l'immeuble
    'building_cadastre'       => env('BUILDING_CADASTRE', ''),
];
