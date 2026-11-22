# Sprint 5 — Registro de asistencia mediante QR

Entregable: Actividad 3.3 (Quinto sprint) · Código al cierre: rama [`release/sprint-5`](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-5)

## Meta del sprint

Al cierre del Sprint 5 el socio registra su entrada escaneando el QR de recepción, ve su banner "preparándose para entrenar" y el gym lleva el control de asistencias, clases y reservas.

## Contexto

El Sprint 5 retoma el backlog planeado para la asistencia con QR, más las historias agregadas en la retrospectiva del Sprint 4.

## Sprint Backlog y resultado

| ID | Tarea | Horas est. | Estado | Resultado |
|---|---|---|---|---|
| S5.1 | Definir flujo de asistencia y datos mínimos | 3 | Completada | El socio escanea con su app el QR que muestra recepción. El código cambia cada 30 s y no contiene datos personales. |
| S5.2 | Diseñar pantalla de asistencia | 3 | Completada | Estados: buscando código, cámara activa, código inválido o caducado y entrada registrada. |
| S5.3 | Preparar estructura para registros de asistencia | 5 | Completada | Cada check-in guarda socio, fecha y hora, y origen (app, kiosco o recepción). |
| S5.4 | Investigar e implementar lectura básica de QR | 7 | Completada | Lectura con la cámara (biblioteca jsQR) y con foto del QR; simulación para demostración. |
| S5.5 | Conectar lectura con identificación y registro | 6 | Completada | Un código válido registra la entrada del socio de la sesión. |
| S5.6 | Probar errores, duplicados y permisos | 4 | Completada | Probados: QR ajeno, código caducado, entrada repetida el mismo día, membresía vencida y cámara denegada. |
| S5.7 | Revisión de código y documentación | 3 | Parcial | Fernando probó el flujo y dejó comentarios por mensaje; la aprobación en GitHub no quedó registrada. |
| S5.8 | Coordinación, review y retrospectiva | 6 | Parcial | Daily asíncrona en los días fijados, aunque no todas las semanas. |
| S5.9 | Banner de entrada y kiosco de recepción (agregada) | 5 | Completada | Tras el check-in, la ficha del socio aparece con la leyenda "preparándose para entrenar"; el tiempo de espera es configurable. |
| S5.10 | Racha, XP y golpes por check-in (agregada) | 3 | Completada | Cada entrada suma XP y golpes; la racha cuenta días seguidos (el domingo no la rompe). |
| S5.11 | Clases con reservas y lista de espera; agenda del gym (agregada) | 6 | Completada | Si se libera un lugar, entra el primero de la lista de espera. |
| S5.12 | Timer de rounds (agregada) | 4 | Completada | Rounds, trabajo y descanso configurables, con avisos sonoros; los rounds se suman a la ficha. |

Horas estimadas comprometidas: **55** · completadas: **46** (84 %).

## Reuniones

| Reunión | Cómo se realizó | Observaciones |
|---|---|---|
| Sprint Planning | Realizada, por mensajes | Se agregaron S5.9 a S5.12. Se discutió que el alcance seguía alto. |
| Daily asíncrona | Parcial | Mejoró frente al Sprint 4: se cumplieron varios de los días fijados. |
| Sprint Review | Realizada, asíncrona | Fernando probó el flujo de check-in y envió sus observaciones. Observación: en algunos visores la cámara no abre; se cubre con la lectura por foto y con la publicación en HTTPS. |
| Retrospectiva | Realizada, breve | Resultados en la sección de retrospectiva. |

## Retrospectiva

**Qué salió bien**

- El flujo principal del producto (entrar al gym y ver la ficha en pantalla) funciona de punta a punta.
- La daily asíncrona se hizo con más constancia.
- Las pruebas de casos de error se hicieron antes de dar por terminada la historia.

**Qué se puede mejorar**

- El alcance sigue por encima de la capacidad (55 horas contra 40).
- La revisión cruzada sigue sin quedar registrada en GitHub.
- Seguimos sin una reunión en vivo de todo el equipo.

**Acciones**

- Comprometer en el Sprint 6 un alcance cercano a 40 horas. _(Responsable: Ricardo (PO))_
- Intentar al menos una llamada corta de review por videollamada. _(Responsable: Ambos)_
- Registrar por escrito el resultado de las pruebas de Fernando antes de cerrar el sprint. _(Responsable: Fernando)_

## Ajustes para el siguiente sprint

- Sprint 6 (gamificación): insignias, retos del mes, duelos entre socios con gráfica, ranking y tienda de premios (agua, electrolitos, merch).
- Se reduce el alcance a unas 43 horas, por debajo de los sprints anteriores.
- La gestión de premios y retos del lado del gym entra en el mismo sprint para que el flujo quede completo.
