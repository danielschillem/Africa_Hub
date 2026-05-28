<?php
return [
    'facebook' => [
        'app_id'     => env('FACEBOOK_APP_ID'),
        'app_secret' => env('FACEBOOK_APP_SECRET'),
    ],
    'tiktok' => [
        'client_key'    => env('TIKTOK_CLIENT_KEY'),
        'client_secret' => env('TIKTOK_CLIENT_SECRET'),
        'redirect_uri'  => env('TIKTOK_REDIRECT_URI'),
    ],
    'termii' => [
        'api_key'  => env('TERMII_API_KEY'),
        'base_url' => env('TERMII_BASE_URL', 'https://api.ng.termii.com/api'),
    ],
    'meta_ads' => [
        'account_id'   => env('META_ADS_ACCOUNT_ID'),
        'access_token' => env('META_ADS_ACCESS_TOKEN'),
    ],
];
