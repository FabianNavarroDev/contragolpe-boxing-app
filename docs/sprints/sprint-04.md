# Sprint 4 — Perfil de los miembros (ficha de peleador)

Entregable: Actividad 3.2 (Cuarto sprint) · Código al cierre: rama [`release/sprint-4`](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-4)

## Meta del sprint

Al cierre del Sprint 4 cada socio autenticado consulta y edita su ficha de peleador, sube su foto con el fondo quitado y registra su video del mes para girarlo en el visor 360 y comparar su progreso.

## Contexto

El Sprint 4 partió de la base del Sprint 3 (acceso y datos). Se retomó el backlog planeado para el perfil y se le sumaron las historias del diferenciador acordadas en la retrospectiva anterior.

Seguimos trabajando de forma compactada, con la integración concentrada al cierre del sprint.

## Sprint Backlog y resultado

| ID | Tarea | Horas est. | Estado | Resultado |
|---|---|---|---|---|
| S4.1 | Revisar estructura de perfiles y dependencias | 3 | Completada | Campos de la ficha definidos: alias, edad, nacionalidad, peso y categoría, experiencia, guardia, alcance, estatura, antigüedad y récord. |
| S4.2 | Definir estructura visual del perfil | 3 | Completada | Ficha estilo cartelera de pelea, en negro y verde lima. |
| S4.3 | Implementar pantalla de perfil | 7 | Completada | Vista Mi ficha con estadísticas, nivel y membresía. |
| S4.4 | Conectar perfil con autenticación y datos | 6 | Completada | La ficha muestra los datos del socio de la sesión activa. |
| S4.5 | Manejar carga, errores y datos faltantes | 4 | Completada | Sin foto se muestra una silueta de demostración; los errores de archivo muestran un mensaje. |
| S4.6 | Verificar permisos y privacidad de datos | 4 | Parcial | En el prototipo cada socio solo ve su propia ficha; faltan reglas en servidor, que llegarán con el backend. |
| S4.7 | Pruebas, correcciones y documentación | 5 | Completada | Pruebas de navegación y de cada formulario; README actualizado. |
| S4.8 | Coordinación, review y retrospectiva | 6 | Parcial | Daily asíncrona realizada solo algunas veces. |
| S4.9 | Video del mes con visor 360 y comparación (agregada) | 8 | Completada | El video se separa en 24 a 72 cuadros; se gira arrastrando el dedo y se comparan dos meses al mismo ángulo. |
| S4.10 | Foto de ficha con quitado de fondo (agregada) | 5 | Completada | Quitado de fondo y recorte automático, con controles de sensibilidad y suavizado. |
| S4.11 | Edición de ficha y registro de peso (agregada) | 4 | Completada | Formulario de edición; la categoría se recalcula con el peso; gráfica de peso. |

Horas estimadas comprometidas: **55** · completadas: **45** (82 %).

## Reuniones

| Reunión | Cómo se realizó | Observaciones |
|---|---|---|
| Sprint Planning | Realizada, por mensajes | Se agregaron S4.9, S4.10 y S4.11 por acuerdo de la retrospectiva. |
| Daily asíncrona (plantilla de 3 preguntas) | Parcial | Se enviaron algunas; no se sostuvo la frecuencia de dos por semana. |
| Sprint Review | Realizada, asíncrona | Fernando probó la ficha, la foto y el video del mes y envió sus observaciones. Observación: con fondos de muchos colores el recorte deja bordes. |
| Retrospectiva | Realizada, breve | Resultados en la sección de retrospectiva. |

## Retrospectiva

**Qué salió bien**

- El diferenciador del producto (ficha y video 360) ya se puede mostrar.
- La daily asíncrona se usó por primera vez.
- Las observaciones de Fernando en la review fueron concretas y útiles.

**Qué se puede mejorar**

- La daily asíncrona no se sostuvo.
- El alcance volvió a crecer: 55 horas estimadas contra una capacidad de 40.
- El quitado de fondo depende mucho del tipo de fondo de la foto.

**Acciones**

- Fijar dos días de la semana para la daily asíncrona y recordarla en el grupo. _(Responsable: Ricardo (SM))_
- Documentar en la app cómo tomar la foto (fondo liso) mientras se evalúa un servicio de segmentación. _(Responsable: Ricardo)_
- Probar en el celular cada incremento antes del merge y dejar el resultado por escrito. _(Responsable: Fernando)_

## Ajustes para el siguiente sprint

- Sprint 5 (asistencia con QR): se mantiene el backlog planeado y se agregan el banner "preparándose para entrenar" con la ficha del socio y el kiosco de recepción.
- Se agregan clases con reservas y la racha, XP y golpes por cada check-in, porque son la entrada de la gamificación del Sprint 6.
- Se agrega el timer de rounds, que suma rounds a la ficha.
- Mejora posterior: un servicio de segmentación para el quitado de fondo (queda en el backlog de producción).
