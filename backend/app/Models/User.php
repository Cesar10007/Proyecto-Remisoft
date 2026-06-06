<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'usuario';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;

    protected $fillable = [
        'id_rol',
        'identificacion',
        'nombre',
        'apellido',
        'email',
        'telefono',
        'contrasena_hash',
        'activo',
    ];

    protected $hidden = [
        'contrasena_hash',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'fecha_registro' => 'datetime',
    ];

    public function getAuthPassword()
    {
        return $this->contrasena_hash;
    }
}