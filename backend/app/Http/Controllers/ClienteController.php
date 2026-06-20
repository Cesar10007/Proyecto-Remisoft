<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;

class ClienteController extends Controller
{
    public function index()
    {
        $productos = DB::select('SELECT * FROM Producto WHERE Estado = 1');
        return response()->json($productos);
    }
}