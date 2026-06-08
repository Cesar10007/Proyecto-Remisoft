<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;


class Usuario extends Authenticatable

{
    use HasApiTokens, Notifiable;

    protected $table = 'usuario';
    protected $primaryKey = 'id_usuario';

    public $timestamps = false;

    protected $fillable = [
        'id_rol', 'identificacion', 'nombre',
        'apellido', 'email', 'telefono',
        'contrasena_hash', 'activo'
    ];

    protected $hidden = [
        'contrasena_hash'
    ];

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol');
    }

    public function getAuthPassword()
    {
        return $this->contrasena_hash;
        
    }
}