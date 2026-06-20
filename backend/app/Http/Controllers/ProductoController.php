<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductoController extends Controller
{
    public function listarVista()
    {
        $productos = DB::select('SELECT * FROM vista_listado_productos');
        return response()->json($productos);
    }

    public function listarProcedimiento()
    {
        $productos = DB::select('CALL sp_listar_productos()');
        return response()->json($productos);
    }

    public function crear(Request $request)
    {
        $request->validate([
            'Nombre'             => 'required|string|max:50',
            'Descripcion'        => 'nullable|string|max:500',
            'precio_venta'       => 'required|numeric',
            'Categoria'          => 'nullable|string|max:30',
            'Tiempo_preparacion' => 'nullable|string',
            'Estado'             => 'nullable|integer',
        ]);

        DB::table('Producto')->insert([
            'Nombre'             => $request->Nombre,
            'Descripcion'        => $request->Descripcion,
            'precio_venta'       => $request->precio_venta,
            'Categoria'          => $request->Categoria,
            'Tiempo_preparacion' => $request->Tiempo_preparacion,
            'Estado'             => $request->Estado ?? 1,
        ]);

        return response()->json(['message' => 'Producto creado'], 201);
    }

    public function actualizar(Request $request, $id)
    {
        $request->validate([
            'Nombre'             => 'required|string|max:50',
            'Descripcion'        => 'nullable|string|max:500',
            'precio_venta'       => 'required|numeric',
            'Categoria'          => 'nullable|string|max:30',
            'Tiempo_preparacion' => 'nullable|string',
            'Estado'             => 'nullable|integer',
        ]);

        DB::table('Producto')->where('id_producto', $id)->update([
            'Nombre'             => $request->Nombre,
            'Descripcion'        => $request->Descripcion,
            'precio_venta'       => $request->precio_venta,
            'Categoria'          => $request->Categoria,
            'Tiempo_preparacion' => $request->Tiempo_preparacion,
            'Estado'             => $request->Estado ?? 1,
        ]);

        return response()->json(['message' => 'Producto actualizado']);
    }

    public function eliminar($id)
    {
        $producto = DB::table('Producto')->where('id_producto', $id)->first();
        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }
        $nuevoEstado = $producto->Estado ? 0 : 1;
        DB::table('Producto')->where('id_producto', $id)->update(['Estado' => $nuevoEstado]);
        return response()->json(['message' => $nuevoEstado ? 'Producto activado' : 'Producto desactivado']);
    }
}