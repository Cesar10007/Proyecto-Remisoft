<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'     => 'required|email',
            'contrasena' => 'required',
        ]);

        $usuario = Usuario::with('rol')
            ->where('email', $request->email)
            ->first();

        if (!$usuario || !Hash::check($request->contrasena, $usuario->contrasena_hash)) {
            return response()->json([
                'message' => 'Correo o contraseña incorrectos'
            ], 401);
        }

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'rol'   => $usuario->rol->nombre,
            'user'  => $usuario,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada'
        ]);
    }
}