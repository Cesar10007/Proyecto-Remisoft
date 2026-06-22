<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClienteController extends Controller
{
    public function index()
    {
        return response()->json(DB::select('SELECT * FROM Cliente'));
    }

    public function crear(Request $request)
    {
        $request->validate([
            'Nombre'         => 'required|string|max:50',
            'Apellido'       => 'nullable|string|max:50',
            'Email'          => 'required|email|max:60|unique:Cliente,Email',
            'Telefono'       => 'nullable|string|max:20',
            'Direccion'      => 'nullable|string|max:120',
            'tipo_documento' => 'nullable|string|max:30',
            'Num_documento'  => 'nullable|string|max:30',
        ]);

        DB::table('Cliente')->insert([
            'Nombre'         => $request->Nombre,
            'Apellido'       => $request->Apellido,
            'Email'          => $request->Email,
            'Telefono'       => $request->Telefono,
            'Direccion'      => $request->Direccion,
            'tipo_documento' => $request->tipo_documento,
            'Num_documento'  => $request->Num_documento,
        ]);

        return response()->json(['message' => 'Cliente creado'], 201);
    }

    public function actualizar(Request $request, $id)
    {
        $request->validate([
            'Nombre'         => 'required|string|max:50',
            'Apellido'       => 'nullable|string|max:50',
            'Email'          => 'required|email|max:60',
            'Telefono'       => 'nullable|string|max:20',
            'Direccion'      => 'nullable|string|max:120',
            'tipo_documento' => 'nullable|string|max:30',
            'Num_documento'  => 'nullable|string|max:30',
        ]);

        DB::table('Cliente')->where('id_cliente', $id)->update([
            'Nombre'         => $request->Nombre,
            'Apellido'       => $request->Apellido,
            'Email'          => $request->Email,
            'Telefono'       => $request->Telefono,
            'Direccion'      => $request->Direccion,
            'tipo_documento' => $request->tipo_documento,
            'Num_documento'  => $request->Num_documento,
        ]);

        return response()->json(['message' => 'Cliente actualizado']);
    }

    public function eliminar($id)
    {
        DB::table('Cliente')->where('id_cliente', $id)->delete();
        return response()->json(['message' => 'Cliente eliminado']);
    }
}