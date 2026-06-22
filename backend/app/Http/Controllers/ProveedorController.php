<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProveedorController extends Controller
{
    public function index()
    {
        return response()->json(DB::select('SELECT * FROM proveedor'));
    }

    public function crear(Request $request)
    {
        $request->validate([
            'nombre'          => 'required|string|max:100',
            'nombre_contacto' => 'nullable|string|max:100',
            'telefono'        => 'nullable|string|max:20',
            'email'           => 'nullable|email|max:100',
            'direccion'       => 'nullable|string|max:200',
            'nit'             => 'nullable|string|max:30',
            'tipo_proveedor'  => 'nullable|string|max:50',
            'estado'          => 'nullable|string|max:20',
        ]);

        DB::table('proveedor')->insert([
            'nombre'          => $request->nombre,
            'nombre_contacto' => $request->nombre_contacto,
            'telefono'        => $request->telefono,
            'email'           => $request->email,
            'direccion'       => $request->direccion,
            'nit'             => $request->nit,
            'tipo_proveedor'  => $request->tipo_proveedor,
            'estado'          => $request->estado ?? 'ACTIVO',
        ]);

        return response()->json(['message' => 'Proveedor creado'], 201);
    }

    public function actualizar(Request $request, $id)
    {
        $request->validate([
            'nombre'          => 'required|string|max:100',
            'nombre_contacto' => 'nullable|string|max:100',
            'telefono'        => 'nullable|string|max:20',
            'email'           => 'nullable|email|max:100',
            'direccion'       => 'nullable|string|max:200',
            'nit'             => 'nullable|string|max:30',
            'tipo_proveedor'  => 'nullable|string|max:50',
            'estado'          => 'nullable|string|max:20',
        ]);

        DB::table('proveedor')->where('id_proveedor', $id)->update([
            'nombre'          => $request->nombre,
            'nombre_contacto' => $request->nombre_contacto,
            'telefono'        => $request->telefono,
            'email'           => $request->email,
            'direccion'       => $request->direccion,
            'nit'             => $request->nit,
            'tipo_proveedor'  => $request->tipo_proveedor,
            'estado'          => $request->estado ?? 'ACTIVO',
        ]);

        return response()->json(['message' => 'Proveedor actualizado']);
    }

    public function eliminar($id)
    {
        DB::table('proveedor')->where('id_proveedor', $id)->update(['estado' => 'INACTIVO']);
        return response()->json(['message' => 'Proveedor desactivado']);
    }
}