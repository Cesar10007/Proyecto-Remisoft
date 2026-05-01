<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'usuario';        // nombre exacto de tu tabla en BD

    protected $primaryKey = 'id_usuario'; // tu PK no es 'id' sino 'id_usuario'

    protected $fillable = [
        'id_rol', 'identificacion', 'nombre',
        'apellido', 'email', 'telefono',
        'contrasena_hash', 'activo'
    ];

    protected $hidden = [
        'contrasena_hash'   // nunca se envía en las respuestas JSON
    ];

    // Relación con la tabla rol
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol');
    }
}