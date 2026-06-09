<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;

// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::get('/reset-password/{token}', function () {
    return response()->json(['message' => 'Usa el enlace del correo para restablecer tu contraseña.']);
})->name('password.reset');
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});