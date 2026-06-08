<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_rol' => 'required|integer|exists:rol,id_rol',
            'identificacion' => 'required|string|max:20|unique:usuario,identificacion',
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:usuario,email',
            'telefono' => 'nullable|string|max:20',
            'contrasena' => 'required|string|min:8|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'id_rol.required' => 'El rol es obligatorio.',
            'id_rol.exists' => 'El rol seleccionado no existe.',
            'identificacion.required' => 'La identificación es obligatoria.',
            'identificacion.unique' => 'La identificación ya está registrada.',
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',
            'email.required' => 'El correo es obligatorio.',
            'email.email' => 'El correo no es válido.',
            'email.unique' => 'El correo ya está registrado.',
            'contrasena.required' => 'La contraseña es obligatoria.',
            'contrasena.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'contrasena.confirmed' => 'La confirmación de la contraseña no coincide.',
        ];
    }
}