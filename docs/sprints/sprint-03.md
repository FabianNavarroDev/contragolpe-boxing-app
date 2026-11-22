# Sprint 3 — Registro e inicio de sesión + base de la app

Entregable: Actividad 3.1 (Tercer sprint) · Código al cierre: rama [`release/sprint-3`](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-3)

## Meta del sprint

Al cierre del Sprint 3 el socio puede crear su cuenta e iniciar sesión, el personal del gym entra a su panel con un PIN, y la base técnica de la aplicación (estructura, datos, navegación y gestión de socios) queda funcionando y publicada en GitHub.

## Contexto

El Sprint 3 arrancó con retraso. En la Unidad 2, los sprints 1 y 2 se cubrieron sobre todo en lo organizacional: repositorio inicial, roles, herramientas (Trello, Jira, Canva) y acuerdos de trabajo, pero casi sin código. Las tareas técnicas del Sprint 2 (T2.2 a T2.6 y T1.1) quedaron pendientes.

Además, el equipo se integró tarde: la plataforma de estudio se migró y durante varias semanas presentó errores que impidieron comunicarnos con normalidad. Una vez en contacto, tampoco logramos coincidir en horarios para las reuniones.

Por eso, este sprint y los siguientes se ejecutaron de forma compactada al final del periodo. Las fechas de los commits en GitHub lo reflejan: el trabajo se integró de manera concentrada y no al ritmo de un sprint por cada cuatro semanas que se había planeado. Lo reconocemos en la retrospectiva.

## Decisiones del sprint

- **Construir el prototipo como PWA (HTML, CSS y JavaScript sin compilación).** Con unas 10 horas por semana entre los dos y el retraso acumulado, inicializar dos proyectos (React Native y React) más Supabase consumía el sprint completo sin dejar nada funcional. Una PWA corre en el celular desde el navegador, se instala como app y se puede empaquetar después con Capacitor. React Native y Supabase se mantienen como arquitectura objetivo para la versión de producción.
- **Datos en el navegador (localStorage) con datos de demostración.** Permite probar todos los flujos sin servidor. Cada módulo usa funciones de acceso a datos que después se cambiarán por llamadas a la API.
- **Una sola app con dos vistas: socio y gym.** Reduce el trabajo de mantener dos proyectos. El acceso a cada vista se controla con la sesión (teléfono para el socio, PIN para el gym).

## Sprint Backlog y resultado

| ID | Tarea | Horas est. | Estado | Resultado |
|---|---|---|---|---|
| S3.1 | Revisar configuración y pendientes de autenticación | 3 | Completada | Se confirmó que Supabase y las apps no estaban inicializadas; de aquí salió la decisión de construir una PWA. |
| S3.2 | Implementar registro de usuarios | 7 | Completada | Registro del socio desde la app. Ajuste: se guarda en el navegador (modo demo), no en un servicio externo. |
| S3.3 | Implementar inicio de sesión | 6 | Completada | El socio entra con su teléfono y el gym con un PIN. Las credenciales incorrectas muestran un error y no dan acceso. |
| S3.4 | Añadir validaciones de formularios | 4 | Completada | Campos obligatorios, teléfono de 10 dígitos y teléfono duplicado. |
| S3.5 | Manejar estados de sesión y navegación básica | 5 | Completada | La sesión persiste, las vistas sin sesión se bloquean y cambiar de rol pide credenciales. Botón para cerrar sesión. |
| S3.6 | Realizar pruebas y corregir defectos | 5 | Completada | Pruebas en navegador: acceso válido e inválido, registro y navegación por todas las vistas sin errores en consola. |
| S3.7 | Revisión de código y documentación | 4 | Parcial | Se documentó la arquitectura y el README. El Pull Request se integró sin la aprobación formal del segundo integrante. |
| S3.8 | Coordinación, review y retrospectiva | 6 | Parcial | Hubo planning, review y retrospectiva breves; las dailies no se realizaron. |
| S3.9 | Base de la PWA y gestión de socios (agregada en el planning) | 8 | Completada | Estructura modular, estado, router, datos de demostración; lista, alta, detalle y pagos de socios en el panel del gym. |

Horas estimadas comprometidas: **48** · completadas: **38** (79 %).

## Reuniones

| Reunión | Cómo se realizó | Observaciones |
|---|---|---|
| Sprint Planning | Realizada, breve, por mensajes de Discord | Se acordó el pivote a PWA y se agregó S3.9 al alcance. |
| Daily Scrum (2 por semana, acordadas) | No realizadas | No coincidimos en horarios. La coordinación fue por mensajes esporádicos. |
| Sprint Review | Realizada, asíncrona | Ricardo compartió el incremento; Fernando lo probó en su celular y confirmó el acceso y el registro. |
| Retrospectiva | Realizada, breve, por mensajes | Resultados en la sección de retrospectiva. |

## Retrospectiva

**Qué salió bien**

- Tomar la decisión del pivote a PWA destrabó el desarrollo: por primera vez hay un incremento que se puede usar.
- Las pruebas en el navegador antes de integrar evitaron subir errores.
- Fernando pudo probar la app en su celular sin instalar nada.

**Qué se puede mejorar**

- No hicimos dailies; la coordinación fue muy irregular.
- El trabajo se integró de golpe y tarde, no a lo largo del sprint.
- El Pull Request no tuvo revisión formal del otro integrante.
- El alcance creció en el planning (S3.9) sin quitar nada a cambio.

**Acciones**

- Sustituir las dailies en vivo por una daily asíncrona: un mensaje con tres preguntas (qué hice, qué haré, qué me bloquea). _(Responsable: Ambos)_
- Fernando deja su visto bueno en el Pull Request después de probar el incremento. _(Responsable: Fernando)_
- Integrar por tareas pequeñas, no todo al final. _(Responsable: Ricardo)_

## Ajustes para el siguiente sprint

- Sprint 4 (perfil de los miembros): se mantiene el plan original y se agregan dos historias del diferenciador del producto: la foto de ficha con quitado de fondo y el video del mes con visor 360.
- Se agrega la edición de la ficha y el registro de peso, porque son necesarios para que el perfil tenga datos reales.
- La privacidad por usuario (S4.6) se validará en el prototipo, pero las reglas de servidor quedan para cuando exista backend.
- Las dailies pasan a formato asíncrono con plantilla fija.
