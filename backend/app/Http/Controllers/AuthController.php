<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterUsuarioRequest;
use App\Support\AuditLogger;
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
            // No se registra el email completo por RNF-001.8 ("sin email completo").
            AuditLogger::log('LOGIN_FAILED', [
                'email_hint' => $request->email ? substr($request->email, 0, 3) . '***' : null,
                'motivo'     => $usuario ? 'contrasena_incorrecta' : 'usuario_no_existe',
            ]);

            return response()->json([
                'message' => 'Correo o contraseña incorrectos'
            ], 401);
        }

        $token = $usuario->createToken('auth_token')->plainTextToken;

        AuditLogger::log('LOGIN_SUCCESS', [
            'id_usuario' => $usuario->id_usuario,
        ]);

        return response()->json([
            'token' => $token,
            'rol'   => $usuario->rol->nombre,
            'user'  => $usuario,
        ]);
    }

    public function register(RegisterUsuarioRequest $request)
    {
        $usuario = Usuario::create([
            'id_rol'          => 6,
            'identificacion'  => $request->identificacion,
            'nombre'          => $request->nombre,
            'apellido'        => $request->apellido,
            'email'           => $request->email,
            'telefono'        => $request->telefono,
            'contrasena_hash' => Hash::make($request->contrasena),
            'activo'          => 1,
        ]);

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'user'    => $usuario,
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
