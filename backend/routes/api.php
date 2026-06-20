<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ClienteController;


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
    Route::get('/productos/vista', [ProductoController::class, 'listarVista']);
    Route::get('/productos/sp', [ProductoController::class, 'listarProcedimiento']);
    Route::post('/productos', [ProductoController::class, 'crear']);
    Route::put('/productos/{id}', [ProductoController::class, 'actualizar']);
    Route::delete('/productos/{id}', [ProductoController::class, 'eliminar']);
    Route::get('/cliente', [ClienteController::class, 'index']);
});