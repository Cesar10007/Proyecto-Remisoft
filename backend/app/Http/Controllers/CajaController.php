<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CajaController extends Controller
{
    public function index()
    {
        return response()->json(DB::select('SELECT * FROM caja'));
    }

    public function crear(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:40',
            'estado' => 'nullable|string|max:20',
        ]);

        DB::table('caja')->insert([
            'nombre' => $request->nombre,
            'estado' => $request->estado ?? 'ACTIVA',
        ]);

        return response()->json(['message' => 'Caja creada'], 201);
    }

    public function actualizar(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:40',
            'estado' => 'nullable|string|max:20',
        ]);

        DB::table('caja')->where('id_caja', $id)->update([
            'nombre' => $request->nombre,
            'estado' => $request->estado ?? 'ACTIVA',
        ]);

        return response()->json(['message' => 'Caja actualizada']);
    }

    public function eliminar($id)
    {
        DB::table('caja')->where('id_caja', $id)->update(['estado' => 'INACTIVA']);
        return response()->json(['message' => 'Caja desactivada']);
    }
}