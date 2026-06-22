<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IngredienteController extends Controller
{
    public function index()
    {
        return response()->json(DB::select('SELECT * FROM Ingrediente'));
    }

    public function crear(Request $request)
    {
        $request->validate([
            'nombre'             => 'required|string|max:50',
            'descripcion'        => 'nullable|string|max:500',
            'unidad_medida'      => 'nullable|string|max:20',
            'costo_unitario_ref' => 'nullable|numeric',
            'stock_minimo'       => 'nullable|numeric',
        ]);

        DB::table('Ingrediente')->insert([
            'nombre'             => $request->nombre,
            'descripcion'        => $request->descripcion,
            'unidad_medida'      => $request->unidad_medida,
            'costo_unitario_ref' => $request->costo_unitario_ref,
            'stock_minimo'       => $request->stock_minimo ?? 0,
        ]);

        return response()->json(['message' => 'Ingrediente creado'], 201);
    }

    public function actualizar(Request $request, $id)
    {
        $request->validate([
            'nombre'             => 'required|string|max:50',
            'descripcion'        => 'nullable|string|max:500',
            'unidad_medida'      => 'nullable|string|max:20',
            'costo_unitario_ref' => 'nullable|numeric',
            'stock_minimo'       => 'nullable|numeric',
        ]);

        DB::table('Ingrediente')->where('id_ingrediente', $id)->update([
            'nombre'             => $request->nombre,
            'descripcion'        => $request->descripcion,
            'unidad_medida'      => $request->unidad_medida,
            'costo_unitario_ref' => $request->costo_unitario_ref,
            'stock_minimo'       => $request->stock_minimo ?? 0,
        ]);

        return response()->json(['message' => 'Ingrediente actualizado']);
    }

    public function eliminar($id)
    {
        DB::table('Ingrediente')->where('id_ingrediente', $id)->delete();
        return response()->json(['message' => 'Ingrediente eliminado']);
    }
}