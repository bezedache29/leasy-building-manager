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
];
