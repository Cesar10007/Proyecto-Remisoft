<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PedidoController extends Controller
{
    public function index()
    {
        return response()->json(DB::select('SELECT p.*, c.Nombre as nombre_cliente, u.nombre as nombre_mesero FROM pedido p LEFT JOIN Cliente c ON p.id_cliente = c.id_cliente LEFT JOIN usuario u ON p.id_mesero = u.id_usuario'));
    }

    public function crear(Request $request)
    {
        $request->validate([
            'id_cliente'  => 'nullable|integer',
            'id_mesero'   => 'nullable|integer',
            'estado'      => 'nullable|string|max:20',
            'Tipo_pedido' => 'nullable|string|max:20',
            'Mesa_num'    => 'nullable|integer',
            'notas'       => 'nullable|string|max:500',
        ]);

        DB::table('pedido')->insert([
            'id_cliente'  => $request->id_cliente,
            'id_mesero'   => $request->id_mesero,
            'estado'      => $request->estado ?? 'ABIERTO',
            'Tipo_pedido' => $request->Tipo_pedido,
            'Mesa_num'    => $request->Mesa_num,
            'notas'       => $request->notas,
        ]);

        return response()->json(['message' => 'Pedido creado'], 201);
    }

    public function actualizar(Request $request, $id)
    {
        $request->validate([
            'id_cliente'  => 'nullable|integer',
            'id_mesero'   => 'nullable|integer',
            'estado'      => 'nullable|string|max:20',
            'Tipo_pedido' => 'nullable|string|max:20',
            'Mesa_num'    => 'nullable|integer',
            'notas'       => 'nullable|string|max:500',
        ]);

        DB::table('pedido')->where('id_pedido', $id)->update([
            'id_cliente'  => $request->id_cliente,
            'id_mesero'   => $request->id_mesero,
            'estado'      => $request->estado,
            'Tipo_pedido' => $request->Tipo_pedido,
            'Mesa_num'    => $request->Mesa_num,
            'notas'       => $request->notas,
        ]);

        return response()->json(['message' => 'Pedido actualizado']);
    }

    public function eliminar($id)
    {
        DB::table('pedido')->where('id_pedido', $id)->update(['estado' => 'CANCELADO']);
        return response()->json(['message' => 'Pedido cancelado']);
    }
}