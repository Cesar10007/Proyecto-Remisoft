<?php

namespace App\Http\Controllers;

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
}