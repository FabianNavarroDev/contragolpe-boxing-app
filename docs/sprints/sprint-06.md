# Sprint 6 — Gamificación: retos, duelos y premios

Entregable: Actividad 3.4 (Sexto sprint) · Código al cierre: rama [`release/sprint-6`](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-6)

## Meta del sprint

Al cierre del Sprint 6 los socios ganan insignias, cumplen retos, se retan en duelos, compiten en el ranking y canjean sus golpes por premios; el gym administra retos, inventario y entregas.

## Contexto

El Sprint 6 se planeó con menos alcance (43 horas), como se acordó en la retrospectiva del Sprint 5.

## Sprint Backlog y resultado

| ID | Tarea | Horas est. | Estado | Resultado |
|---|---|---|---|---|
| S6.1 | Reglas de niveles e insignias | 5 | Completada | 12 insignias (rachas, sesiones, madrugador, sparrings, primer canje, embajador, entre otras). |
| S6.2 | Retos del mes y cobro del premio | 6 | Completada | Progreso por reto y botón para cobrar al llegar a la meta. |
| S6.3 | Duelos entre socios con gráfica | 7 | Parcial | Se crean, se apuestan golpes y se sigue el avance con gráfica. Pendiente: liquidar el duelo en automático al cierre del mes. |
| S6.4 | Ranking del gym | 3 | Completada | Por asistencias, rounds, XP o racha; muestra la posición del socio. |
| S6.5 | Tienda de premios y canje con código | 6 | Completada | El canje descuenta golpes y stock y genera un código para recepción. |
| S6.6 | Entregas e inventario (gym) | 4 | Completada | Lista de canjes por entregar, entregados recientes y ajuste de stock. |
| S6.7 | Alta y baja de retos (gym) | 3 | Completada | El gym publica retos con métrica, meta y premio. |
| S6.8 | Pruebas, revisión y documentación | 4 | Completada | Pruebas de cada flujo; Fernando envió sus observaciones por mensaje. |
| S6.9 | Coordinación, review y retrospectiva | 5 | Parcial | Review asíncrona; las dailies siguieron siendo irregulares. |

Horas estimadas comprometidas: **43** · completadas: **31** (72 %).

## Reuniones

| Reunión | Cómo se realizó | Observaciones |
|---|---|---|
| Sprint Planning | Realizada, por mensajes | Se acordó un alcance de 43 horas y se priorizaron retos y premios sobre duelos. |
| Daily asíncrona | Parcial | Irregular. |
| Sprint Review | Realizada, asíncrona | Fernando probó los retos, la tienda y los duelos y envió sus observaciones. Observación: el duelo no se cierra solo al terminar el mes. |
| Retrospectiva | Realizada, breve, por mensajes | Resultados en la sección de retrospectiva. |

## Retrospectiva

**Qué salió bien**

- El alcance comprometido fue más realista y casi se cumplió completo.
- Las observaciones de la review llegaron antes del cierre del sprint.

**Qué se puede mejorar**

- La liquidación automática de duelos quedó pendiente.
- Las dailies siguen sin ser constantes.

**Acciones**

- Intentar una llamada corta de review en el Sprint 7. _(Responsable: Ambos)_
- Pasar la liquidación de duelos al backlog de producción, porque requiere un proceso programado en el servidor. _(Responsable: Ricardo (PO))_

## Ajustes para el siguiente sprint

- Sprint 7 (panel del gym y cierre): métricas del negocio, riesgo de abandono, avisos, tarjeta para redes, funcionamiento sin conexión y despliegue en GitHub Pages.
- El alcance se mantiene alrededor de 40 horas.
- La liquidación de duelos no entra en el Sprint 7; queda para la fase con backend.
