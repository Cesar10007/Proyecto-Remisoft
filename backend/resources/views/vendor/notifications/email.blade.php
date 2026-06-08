<x-mail::message>
<div style="text-align: center; margin-bottom: 24px;">
<span style="display: inline-block; font-size: 38px; font-weight: 800; letter-spacing: -1px; line-height: 1; color: #9E3A1D; font-family: Arial, Helvetica, sans-serif;">
Remi<span style="color: #E39A1F;">Soft</span>
</span>
</div>

@if (! empty($greeting))
# {{ $greeting }}
@else
# Hola
@endif

@foreach ($introLines as $line)
{{ $line }}

@endforeach

@isset($actionText)
<?php
    $color = match ($level) {
        'success', 'error' => $level,
        default => 'primary',
    };
?>
<x-mail::button :url="$actionUrl" :color="$color">
{{ $actionText }}
</x-mail::button>
@endisset

@foreach ($outroLines as $line)
{{ $line }}

@endforeach

@if (! empty($salutation))
{{ $salutation }}
@else
Saludos,<br>
{{ config('app.name') }}
@endif

@isset($actionText)
<x-slot:subcopy>
Si tienes problemas para hacer clic en el botón, copia y pega esta URL en tu navegador:
<span class="break-all">[{{ $displayableActionUrl }}]({{ $actionUrl }})</span>
</x-slot:subcopy>
@endisset
</x-mail::message>