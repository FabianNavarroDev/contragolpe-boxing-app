# Arquitectura – Contragolpe Boxing App

> Tarea T2.6 (pendiente desde el Sprint 2). Se completa en el Sprint 3, después de la decisión de construir el prototipo como PWA.

## 1. Vista general

El prototipo es una **Progressive Web App (PWA)** escrita en HTML, CSS y JavaScript sin compilación. Una sola aplicación ofrece dos vistas:

| Vista | Usuario | Acceso |
|---|---|---|
| Socio | Miembros del gym (celular) | Teléfono registrado |
| Gym | Dueños y recepción | PIN del gym |

```
apps/pwa/
├── index.html          Punto de entrada; carga los módulos en orden
├── styles.css          Sistema visual (negro + verde lima)
├── data.js             Datos de demostración (socios, clases, pagos, retos…)
├── manifest.json       Instalación como app
├── sw.js               Service worker: funciona sin conexión (Sprint 7)
├── vendor/             jsQR (lectura de QR) y qrcode.js (generación)
└── js/
    ├── core.js         Iconos, utilidades, estado, reglas, capas, gráficas y router
    ├── acceso.js       Registro, inicio de sesión y sesión            (Sprint 3)
    ├── socio.js        Inicio del socio y membresía                    (Sprint 3)
    ├── gym.js          Gestión de socios                               (Sprint 3)
    ├── perfil.js       Ficha de peleador, foto, edición y peso         (Sprint 4)
    ├── visor360.js     Silueta y visor 360                             (Sprint 4)
    ├── video-mes.js    Video del mes y comparación                     (Sprint 4)
    ├── checkin.js      QR, banner, kiosco y timer de rounds            (Sprint 5)
    ├── clases.js       Clases, reservas y agenda                       (Sprint 5)
    ├── gamificacion.js Insignias, retos, duelos, ranking y premios     (Sprint 6)
    ├── panel.js        Métricas del gym, avisos y configuración        (Sprint 7)
    ├── compartir.js    Tarjeta para redes                              (Sprint 7)
    └── main.js         Rutas, acciones y arranque (se carga al final)
```

## 2. Decisiones técnicas

1. **PWA en lugar de React Native + React en esta etapa.** Con ≈10 h por semana de capacidad, inicializar dos proyectos y un backend consumía sprints completos sin entregar valor. La PWA corre en el celular, se instala y puede empaquetarse con Capacitor. React Native (socio), React (panel) y Supabase siguen siendo la **arquitectura objetivo de producción**.
2. **Estado en el navegador (`localStorage`).** Todos los datos viven en un objeto de estado `S` que se guarda localmente. Las funciones que leen y escriben datos están concentradas para reemplazarlas por llamadas a la API.
3. **Módulos por funcionalidad.** Cada sprint agrega módulos nuevos; las vistas comunes solo muestran un botón si su acción existe (`ACTIONS`).
4. **Sin dependencias de compilación.** Se abre con cualquier servidor estático (por ejemplo, GitHub Pages).

## 3. Modelo de datos (prototipo)

| Entidad | Campos principales |
|---|---|
| `members` | id, nombre, alias, teléfono, edad, peso, categoría, guardia, plan, vigencia, xp, golpes, racha, asistencias, foto, videos |
| `payments` | socio, plan, monto, método, fecha |
| `checkins` | socio, fecha y hora, origen (app, kiosco o recepción) |
| `classes` | nombre, coach, día, hora, cupo, reservados, lista de espera |
| `challenges` / `duels` | métrica, meta, premio / socios, métrica, apuesta, cierre |
| `rewards` / `redemptions` | premio, costo, stock / socio, código, estado |
| `notices` | título, mensaje, tipo, fecha |

## 4. Seguridad y privacidad (prototipo)

- El PIN del gym (`2026`) es **de demostración**; no hay secretos en el repositorio.
- El QR de entrada cambia cada 30 s y no contiene datos personales (`CONTRAGOLPE|CHECKIN|código`).
- Pendiente para producción: autenticación real y reglas de acceso por fila (RLS) en Supabase.

## 5. Arquitectura objetivo (producción)

```
App del socio (React Native) ─┐
                              ├──► Supabase (Auth · PostgreSQL + RLS · Storage · Edge Functions)
Panel del gym (React + Vite) ─┘                    │
                                     Pagos (Stripe / Mercado Pago) · Notificaciones push
```
