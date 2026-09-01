# RNF-005 — Cumplimiento Legal y Facturación (DIAN)
**Tipo:** Requisito No Funcional de Cumplimiento

## Descripción
El sistema debe garantizar que la facturación cumpla con la normativa colombiana vigente.

## Requisitos Específicos
- **RNF-005.1** — Cada factura generada debe incluir el CUFE según la resolución DIAN vigente (000042 de 2020 o la que aplique).
- **RNF-005.2** — Las facturas deben almacenarse también en formato XML, además del registro en base de datos.
- **RNF-005.3** — Los valores monetarios deben mostrarse siempre en COP con el formato correcto (separador de miles con punto, decimales con coma).
- **RNF-005.4** — El sistema debe soportar pagos mixtos (efectivo, tarjeta, Nequi, Daviplata, PSE) trazables en cada factura.

## Método de medición y trazabilidad
- **Medición:** validación del CUFE generado contra el algoritmo oficial DIAN; verificación de existencia del archivo XML por cada factura creada.
- **Trazabilidad:** cada factura debe permitir consultar su CUFE, su XML asociado y el desglose de pagos mixtos aplicados, todo enlazado al `id_factura`.
