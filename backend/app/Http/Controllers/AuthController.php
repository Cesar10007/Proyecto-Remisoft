<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validar que llegaron los datos requeridos
        $request->validate([
            'email'      => 'required|email',
            'contrasena' => 'required',
        ]);

        // 2. Buscar el usuario por email
        $usuario = Usuario::where('email', $request->email)->first();

        // 3. Verificar que existe y que la contraseña es correcta
        if (!$usuario || !Hash::check($request->contrasena, $usuario->contrasena_hash)) {
            return response()->json([
                'message' => 'Correo o contraseña incorrectos'
            ], 401);
        }

        // 4. Generar token de acceso
        $token = $usuario->createToken('auth_token')->plainTextToken;

        // 5. Responder con el token y datos del usuario
        return response()->json([
            'token'  => $token,
            'rol'    => $usuario->rol->nombre,
            'user'   => $usuario,
        ]);
    }

    public function logout(Request $request)
    {
        // Elimina el token actual
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada']);
    }
}
