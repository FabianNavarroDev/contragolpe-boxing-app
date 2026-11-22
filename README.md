# Contragolpe Boxing App

App de gestión y fidelización de miembros para **Contragolpe Boxing Gym** (Guadalajara).
Proyecto VII · UDG Virtual · Licenciatura en Desarrollo de Sistemas Web · Metodología Scrum.

Equipo: Ricardo Fabián Navarro González · Fernando Tonatiuh Espinosa

## Avance por sprint

| Sprint | Objetivo | Estado | Código del sprint | Documento |
|---|---|---|---|---|
| 1 | Fundamentos y arquitectura | Cerrado | [`release/sprint-1`](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-1) | [sprint-01.md](docs/sprints/sprint-01.md) |
| 2 | Base técnica y planeación (organizacional) | Cerrado | [`release/sprint-2`](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-2) | [sprint-02.md](docs/sprints/sprint-02.md) |
| 3 | Registro e inicio de sesión + base de la app | Cerrado | [`release/sprint-3`](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-3) | [sprint-03.md](docs/sprints/sprint-03.md) |
| 4 | Perfil de los miembros (ficha de peleador) | Cerrado | [`release/sprint-4`](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-4) | [sprint-04.md](docs/sprints/sprint-04.md) |
| 5 | Registro de asistencia mediante QR | Cerrado | [`release/sprint-5`](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-5) | [sprint-05.md](docs/sprints/sprint-05.md) |
| 6 | Gamificación: retos, duelos y premios | Pendiente | — | — |
| 7 | Panel del gym, contenido para redes y despliegue | Pendiente | — | — |

Cada sprint cerrado tiene una rama **`release/sprint-N`** que congela el código tal como quedó al cierre y dos **Pull Requests**: el del trabajo del sprint (`feature → develop`) y el del cierre (`develop → main`).

## Estructura

```
apps/pwa   Prototipo funcional (PWA: app del socio + panel del gym)
docs       Arquitectura, documentos por sprint y entregables
```

Detalle técnico: [docs/arquitectura.md](docs/arquitectura.md)

## Cómo ejecutarlo

No requiere instalar dependencias. Desde la raíz del repositorio:

```
cd apps/pwa
python -m http.server 8080
```

Abre http://localhost:8080 en el navegador (o la IP de tu computadora desde el celular en la misma red).

Accesos de demostración:
- **Socio:** el teléfono que aparece en la pantalla de inicio de sesión, o crea tu cuenta.
- **Gym:** PIN `2026`.

## Flujo de ramas

- `main`: versión estable; solo recibe el cierre de cada sprint.
- `develop`: integración.
- `feature/sprint-N-nombre`: trabajo de cada sprint; entra a `develop` mediante Pull Request.
- `release/sprint-N`: copia fija del código al cierre de cada sprint (no se modifica).
