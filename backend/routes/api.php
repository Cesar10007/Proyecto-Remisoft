<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\IngredienteController;
use App\Http\Controllers\CajaController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\DomicilioController;

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

    // Productos
    Route::get('/productos/vista', [ProductoController::class, 'listarVista']);
    Route::get('/productos/sp', [ProductoController::class, 'listarProcedimiento']);
    Route::post('/productos', [ProductoController::class, 'crear']);
    Route::put('/productos/{id}', [ProductoController::class, 'actualizar']);
    Route::delete('/productos/{id}', [ProductoController::class, 'eliminar']);

    // Clientes
    Route::get('/clientes', [ClienteController::class, 'index']);
    Route::post('/clientes', [ClienteController::class, 'crear']);
    Route::put('/clientes/{id}', [ClienteController::class, 'actualizar']);
    Route::delete('/clientes/{id}', [ClienteController::class, 'eliminar']);

    // Usuarios
    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::post('/usuarios', [UsuarioController::class, 'crear']);
    Route::put('/usuarios/{id}', [UsuarioController::class, 'actualizar']);
    Route::delete('/usuarios/{id}', [UsuarioController::class, 'eliminar']);

    // Proveedores
    Route::get('/proveedores', [ProveedorController::class, 'index']);
    Route::post('/proveedores', [ProveedorController::class, 'crear']);
    Route::put('/proveedores/{id}', [ProveedorController::class, 'actualizar']);
    Route::delete('/proveedores/{id}', [ProveedorController::class, 'eliminar']);

    // Ingredientes
    Route::get('/ingredientes', [IngredienteController::class, 'index']);
    Route::post('/ingredientes', [IngredienteController::class, 'crear']);
    Route::put('/ingredientes/{id}', [IngredienteController::class, 'actualizar']);
    Route::delete('/ingredientes/{id}', [IngredienteController::class, 'eliminar']);

    // Cajas
    Route::get('/cajas', [CajaController::class, 'index']);
    Route::post('/cajas', [CajaController::class, 'crear']);
    Route::put('/cajas/{id}', [CajaController::class, 'actualizar']);
    Route::delete('/cajas/{id}', [CajaController::class, 'eliminar']);

    // Pedidos
    Route::get('/pedidos', [PedidoController::class, 'index']);
    Route::post('/pedidos', [PedidoController::class, 'crear']);
    Route::put('/pedidos/{id}', [PedidoController::class, 'actualizar']);
    Route::delete('/pedidos/{id}', [PedidoController::class, 'eliminar']);

    // Domicilios
    Route::get('/domicilios', [DomicilioController::class, 'index']);
    Route::post('/domicilios', [DomicilioController::class, 'crear']);
    Route::put('/domicilios/{id}', [DomicilioController::class, 'actualizar']);
    Route::delete('/domicilios/{id}', [DomicilioController::class, 'eliminar']);
});