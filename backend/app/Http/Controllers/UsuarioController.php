<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json(DB::select('SELECT u.id_usuario, u.identificacion, u.nombre, u.apellido, u.email, u.telefono, u.activo, u.fecha_registro, r.nombre as rol FROM usuario u JOIN rol r ON u.id_rol = r.id_rol'));
    }

    public function crear(Request $request)
    {
        $request->validate([
            'id_rol'         => 'required|integer',
            'identificacion' => 'nullable|string|max:20',
            'nombre'         => 'required|string|max:60',
            'apellido'       => 'nullable|string|max:60',
            'email'          => 'required|email|unique:usuario,email',
            'telefono'       => 'nullable|string|max:20',
            'contrasena'     => 'required|string|min:6',
        ]);

        DB::table('usuario')->insert([
            'id_rol'          => $request->id_rol,
            'identificacion'  => $request->identificacion,
            'nombre'          => $request->nombre,
            'apellido'        => $request->apellido,
            'email'           => $request->email,
            'telefono'        => $request->telefono,
            'contrasena_hash' => Hash::make($request->contrasena),
            'activo'          => 1,
        ]);

        return response()->json(['message' => 'Usuario creado'], 201);
    }

    public function actualizar(Request $request, $id)
    {
        $request->validate([
            'id_rol'         => 'required|integer',
            'identificacion' => 'nullable|string|max:20',
            'nombre'         => 'required|string|max:60',
            'apellido'       => 'nullable|string|max:60',
            'email'          => 'required|email',
            'telefono'       => 'nullable|string|max:20',
            'activo'         => 'nullable|boolean',
        ]);

        DB::table('usuario')->where('id_usuario', $id)->update([
            'id_rol'         => $request->id_rol,
            'identificacion' => $request->identificacion,
            'nombre'         => $request->nombre,
            'apellido'       => $request->apellido,
            'email'          => $request->email,
            'telefono'       => $request->telefono,
            'activo'         => $request->activo ?? 1,
        ]);

        return response()->json(['message' => 'Usuario actualizado']);
    }

    public function eliminar($id)
    {
        DB::table('usuario')->where('id_usuario', $id)->update(['activo' => 0]);
        return response()->json(['message' => 'Usuario desactivado']);
    }
}
