<?php

use Illuminate\Support\Facades\Route;

// Backend API-only: no hay vistas Blade. Esta ruta solo confirma que el
// servidor Laravel está corriendo; la UI real vive en /frontend (React).
Route::get('/', function () {
    return response()->json(['status' => 'RemiSoft API online']);
});
