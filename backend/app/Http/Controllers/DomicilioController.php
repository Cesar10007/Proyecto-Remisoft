<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DomicilioController extends Controller
{
    public function index()
    {
        return response()->json(DB::select('SELECT d.*, p.estado as estado_pedido, c.Nombre as nombre_cliente FROM domicilio d JOIN pedido p ON d.id_pedido = p.id_pedido LEFT JOIN Cliente c ON p.id_cliente = c.id_cliente'));
    }

    public function crear(Request $request)
    {
        $request->validate([
            'id_pedido'   => 'required|integer',
            'direccion'   => 'required|string|max:150',
            'estado'      => 'nullable|string|max:20',
            'id_repartidor' => 'nullable|integer',
        ]);

        DB::table('domicilio')->insert([
            'id_pedido'    => $request->id_pedido,
            'direccion'    => $request->direccion,
            'estado'       => $request->estado ?? 'ASIGNADO',
            'id_repartidor'=> $request->id_repartidor,
        ]);

        return response()->json(['message' => 'Domicilio creado'], 201);
    }

    public function actualizar(Request $request, $id)
    {
        $request->validate([
            'direccion'    => 'required|string|max:150',
            'estado'       => 'nullable|string|max:20',
            'id_repartidor'=> 'nullable|integer',
        ]);

        DB::table('domicilio')->where('id_domicilio', $id)->update([
            'direccion'    => $request->direccion,
            'estado'       => $request->estado,
            'id_repartidor'=> $request->id_repartidor,
        ]);

        return response()->json(['message' => 'Domicilio actualizado']);
    }

    public function eliminar($id)
    {
        DB::table('domicilio')->where('id_domicilio', $id)->update(['estado' => 'CANCELADO']);
        return response()->json(['message' => 'Domicilio cancelado']);
    }
}