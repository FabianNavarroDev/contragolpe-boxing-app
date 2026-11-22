# Sprint 7 — Panel del gym, contenido para redes y despliegue

Entregable: Actividad 3.5 (Séptimo sprint) · Código al cierre: rama [`release/sprint-7`](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-7)

## Meta del sprint

Al cierre del Sprint 7 el gym consulta sus métricas, detecta socios en riesgo de abandono y publica avisos; el socio comparte su tarjeta de peleador en redes, y la app queda publicada, instalable y funcionando sin conexión.

## Contexto

El Sprint 7 cierra el desarrollo planteado para el curso. Se mantuvo un alcance cercano a 40 horas.

## Sprint Backlog y resultado

| ID | Tarea | Horas est. | Estado | Resultado |
|---|---|---|---|---|
| S7.1 | Indicadores principales del panel | 5 | Completada | Socios activos, check-ins de hoy, ingresos del mes contra el mismo corte y membresías por vencer. |
| S7.2 | Asistencia de 30 días, horas pico y entradas en vivo | 5 | Completada | Gráficas de check-ins diarios y horas pico, más un feed en vivo con simulación de entradas. |
| S7.3 | Ingresos acumulados y lista por renovar | 4 | Completada | Gráfica de ingresos de 30 días y socios por renovar con acceso a su detalle. |
| S7.4 | Riesgo de abandono y mensaje por WhatsApp | 4 | Completada | Socios vigentes con 10 días o más sin venir y mensaje sugerido para invitarlos a regresar. |
| S7.5 | Avisos y configuración del gym | 5 | Completada | Publicar y borrar avisos, precios de planes y segundos de espera del banner. |
| S7.6 | Tarjeta de peleador para redes | 5 | Completada | Imagen de 1080 × 1920 con foto, estadísticas y el usuario de Instagram del gym. |
| S7.7 | Funcionamiento sin conexión y despliegue | 4 | Completada | Service worker, instalación como app y publicación en GitHub Pages. |
| S7.8 | Pruebas, README y guía del repositorio | 4 | Completada | Prueba de todas las vistas en navegador; documentación final. |
| S7.9 | Coordinación, review y retrospectiva | 5 | Parcial | Review asíncrona; las dailies siguieron incompletas. La llamada de review acordada no se concretó. |

Horas estimadas comprometidas: **41** · completadas: **36** (88 %).

## Reuniones

| Reunión | Cómo se realizó | Observaciones |
|---|---|---|
| Sprint Planning | Realizada, por mensajes | Se confirmó dejar fuera la liquidación de duelos. |
| Daily asíncrona | Parcial | Irregular. |
| Sprint Review | Realizada, asíncrona | Fernando probó el panel, la tarjeta para redes y la app desde la liga pública, y envió sus observaciones. |
| Retrospectiva | Realizada, por mensajes | Incluyó una retrospectiva de toda la unidad. |

## Retrospectiva

**Qué salió bien**

- Se completó el alcance planeado para el curso y la app quedó publicada.
- Las pruebas de Fernando antes de cada cierre se volvieron constantes.
- El repositorio ya muestra el avance sprint por sprint (etiquetas, Pull Requests y releases).

**Qué se puede mejorar**

- Nunca logramos dailies constantes ni una reunión en vivo en toda la unidad.
- Los sprints se ejecutaron compactados al final del periodo, no en su calendario.
- La carga de desarrollo no se repartió como se planeó.

**Acciones**

- Para la fase siguiente, definir desde el inicio un horario fijo semanal de 30 minutos para ambos. _(Responsable: Ambos)_
- Repartir historias completas entre los dos, no solo tareas de prueba. _(Responsable: Ricardo (PO))_
- Presentar el prototipo al gimnasio y registrar su retroalimentación como historias nuevas. _(Responsable: Ricardo (PO))_

## Ajustes para el siguiente sprint

- No hay un octavo sprint dentro del curso. Los ajustes pasan al backlog de la fase de producción:
- Migrar el prototipo a React Native (app del socio) y React (panel) con backend en Supabase: autenticación real, base de datos y reglas de acceso.
- Liquidación automática de duelos y notificaciones push.
- Pagos en línea con Stripe o Mercado Pago.
- Servicio de segmentación para el quitado de fondo de la foto.
- Presentar el prototipo a Contragolpe Boxing Gym y ajustar el backlog con su retroalimentación.
