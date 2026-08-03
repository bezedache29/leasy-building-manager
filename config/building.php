<?php

return [
    'address' => env('BUILDING_ADDRESS', ''),
    'zip' => env('BUILDING_ZIP', ''),
    'city' => env('BUILDING_CITY', ''),
    // variables pour le bailleur
    'landlord_name' => env('LANDLORD_NAME', ''),
    'landlord_address' => env('LANDLORD_ADDRESS', ''),
    'landlord_phone_number' => env('LANDLORD_PHONE_NUMBER', ''),
    'landlord_mail' => env('LANDLORD_MAIL', ''),
    // Informations détaillées du bailleur (pour le bail commercial)
    'landlord_first_name'     => env('LANDLORD_FIRST_NAME', ''),
    'landlord_last_name'      => env('LANDLORD_LAST_NAME', ''),
    'landlord_profession'     => env('LANDLORD_PROFESSION', ''),
    'landlord_birth_date'     => env('LANDLORD_BIRTH_DATE', ''),
    'landlord_birth_place'    => env('LANDLORD_BIRTH_PLACE', ''),
    'landlord_nationality'    => env('LANDLORD_NATIONALITY', ''),
    'landlord_marital_regime' => env('LANDLORD_MARITAL_REGIME', ''),
    'landlord_marriage_city'  => env('LANDLORD_MARRIAGE_CITY', ''),
    'landlord_marriage_date'  => env('LANDLORD_MARRIAGE_DATE', ''),
    // Cadastre de l'immeuble
    'building_cadastre'       => env('BUILDING_CADASTRE', ''),
];
