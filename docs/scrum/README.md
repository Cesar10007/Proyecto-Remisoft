# Documentación Scrum — RemiSoft

Carpeta con las evidencias del proceso ágil del proyecto. Cumple los puntos de la checklist académica
relacionados con Scrum.

| Documento | Qué contiene | Criterio que cubre |
|---|---|---|
| [`01-backlog.md`](01-backlog.md) | Las 30 HUs con puntos (Fibonacci), MoSCoW, RF, sprint y estado verificado. Totales y Definition of Ready/Done | Asignar puntos a las HUs |
| [`02-sprints.md`](02-sprints.md) | Ficha de cada sprint (S0 a S7): fechas, objetivo, alcance, entregado, aceptado, impedimentos y ceremonias | Documentar los sprints |
| [`03-planning-y-poker.md`](03-planning-y-poker.md) | Capacidad por sprint, escala de puntos, tres rondas de Planning Poker con votos por integrante y un planning completo de ejemplo | Documentar Sprint Planning y Planning Poker |
| [`04-informe-scrum.md`](04-informe-scrum.md) | Velocidad, burndown por sprint, distribución por persona y por RF, defectos, riesgos y conclusiones | Informe Scrum (velocidad y burndown) |
| [`05-retrospectiva-y-feedback.md`](05-retrospectiva-y-feedback.md) | Retrospectiva Start/Stop/Continue de los 7 sprints, acciones con responsable y feedback consolidado | Consolidar retroalimentación |

## Cifras clave

- **196 puntos** en total: 175 de las 30 HUs + 21 de spikes de soporte.
- **162 puntos aceptados** (95 % de lo comprometido en sprints de 4 semanas).
- **26 de 30 HUs entregadas**; la deuda (HU-014 DIAN y HU-028 a HU-030 de IA) está declarada con puntos y motivo.
- **Velocidad promedio: 26,2 puntos** por sprint de 4 semanas.

## Cómo se generaron estas cifras

No son inventadas: se reconstruyeron con evidencia del repositorio.

```bash
# volumen y ritmo de trabajo real
git log --format=%ad --date=format:%Y-%m origin/develop | sort | uniq -c
git log --merges --oneline origin/develop | wc -l     # 233 fusiones de PR

# estado verificado de cada historia
grep -oE "app\.use\('/api[^']*'" backend/src/app.js   # 29 grupos de rutas montados
ls backend/src/controllers                            # módulos implementados
node --test                                           # 24 casos + 35 subcasos
```

Lo único que aporta el equipo es la **estimación** (los puntos) y los **votos** del Poker, que son
decisiones humanas y no se pueden deducir del código.
