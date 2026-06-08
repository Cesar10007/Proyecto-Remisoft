<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterUsuarioRequest;
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

    public function register(RegisterUsuarioRequest $request)
    {
        $usuario = Usuario::create([
            'id_rol' => $request->id_rol,
            'identificacion' => $request->identificacion,
            'nombre' => $request->nombre,
            'apellido' => $request->apellido,
            'email' => $request->email,
            'telefono' => $request->telefono,
            'contrasena_hash' => Hash::make($request->contrasena),
            'activo' => 1,
        ]);

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'user' => $usuario,
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada'
        ]);
    }
}