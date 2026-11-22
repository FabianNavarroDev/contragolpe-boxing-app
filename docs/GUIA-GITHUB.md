# Guía del repositorio: cómo presentar cada sprint en GitHub

Repositorio: https://github.com/FabianNavarroDev/contragolpe-boxing-app

## 1. Cómo está organizado

| Qué | Dónde |
|---|---|
| Prototipo funcional (PWA) | `apps/pwa/` |
| Documento de cada sprint (backlog, reuniones, retrospectiva) | `docs/sprints/sprint-0N.md` |
| Arquitectura | `docs/arquitectura.md` |
| Entregables en PDF y Word | `docs/entregables/` |

Ramas:

| Rama | Para qué sirve |
|---|---|
| `main` | Versión estable. Solo recibe el cierre de cada sprint. |
| `develop` | Integración del trabajo. |
| `feature/sprint-N-…` | Trabajo de cada sprint. Entra a `develop` con un Pull Request. |
| `release/sprint-N` | **Copia fija del código al cierre del sprint N.** Es el enlace que se entrega en cada actividad. |
| `gh-pages` | Copia de `apps/pwa` publicada en GitHub Pages. |

## 2. Enlaces para cada actividad

| Actividad | Código del sprint | Pull Request del sprint | Cierre a `main` |
|---|---|---|---|
| 3.1 · Sprint 3 | [release/sprint-3](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-3) | [#4](https://github.com/FabianNavarroDev/contragolpe-boxing-app/pull/4) | [#5](https://github.com/FabianNavarroDev/contragolpe-boxing-app/pull/5) |
| 3.2 · Sprint 4 | [release/sprint-4](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-4) | [#6](https://github.com/FabianNavarroDev/contragolpe-boxing-app/pull/6) | [#7](https://github.com/FabianNavarroDev/contragolpe-boxing-app/pull/7) |
| 3.3 · Sprint 5 | [release/sprint-5](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-5) | [#8](https://github.com/FabianNavarroDev/contragolpe-boxing-app/pull/8) | [#9](https://github.com/FabianNavarroDev/contragolpe-boxing-app/pull/9) |
| 3.4 · Sprint 6 | [release/sprint-6](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-6) | [#10](https://github.com/FabianNavarroDev/contragolpe-boxing-app/pull/10) | [#11](https://github.com/FabianNavarroDev/contragolpe-boxing-app/pull/11) |
| 3.5 · Sprint 7 | [release/sprint-7](https://github.com/FabianNavarroDev/contragolpe-boxing-app/tree/release/sprint-7) | [#12](https://github.com/FabianNavarroDev/contragolpe-boxing-app/pull/12) | [#13](https://github.com/FabianNavarroDev/contragolpe-boxing-app/pull/13) |
| 3.6 y PI | [Repositorio completo](https://github.com/FabianNavarroDev/contragolpe-boxing-app) | [Todos los PR](https://github.com/FabianNavarroDev/contragolpe-boxing-app/pulls?q=is%3Apr+is%3Amerged) | — |

Los sprints 1 y 2 están en `release/sprint-1` y `release/sprint-2` (PR #2 y #3).

Para mostrar **qué cambió entre dos sprints**: `https://github.com/FabianNavarroDev/contragolpe-boxing-app/compare/release/sprint-4...release/sprint-5`

## 3. Activar GitHub Pages (una sola vez, 1 minuto)

1. Entra al repositorio → **Settings** → **Pages**.
2. En *Build and deployment*, en **Source** elige *Deploy from a branch*.
3. En **Branch** elige `gh-pages` y la carpeta `/ (root)`, y presiona **Save**.
4. Espera 1 o 2 minutos y abre https://fabiannavarrodev.github.io/contragolpe-boxing-app/

Accesos de demostración: socio con el teléfono que aparece en la pantalla de inicio de sesión; gym con el PIN `2026`.

## 4. Actualizar la carpeta en tu computadora

En la carpeta `contragolpe-boxing-app` (Git Bash o terminal de VS Code):

```
git fetch origin
git checkout main
git pull
git checkout develop
git pull
```

## 5. (Opcional) Crear releases con etiqueta para cada sprint

Si el asesor prefiere ver *Releases*: en GitHub → **Releases** → **Draft a new release** → en *Choose a tag* escribe `sprint-3`, en *Target* elige la rama `release/sprint-3`, título "Sprint 3", y **Publish release**. Repite del 3 al 7.

## 6. Cómo trabajar en equipo a partir de ahora

1. Crear la rama de la tarea desde `develop`: `git checkout develop && git pull && git checkout -b feature/nombre-tarea`
2. Hacer commits pequeños y subir la rama: `git push -u origin feature/nombre-tarea`
3. Abrir el Pull Request hacia `develop` en GitHub.
4. El otro integrante entra a **Files changed**, prueba la app y presiona **Review changes → Approve** (o *Request changes*). Esto deja evidencia de la revisión cruzada que faltó en la Unidad 3.
5. Al cerrar el sprint: Pull Request de `develop` a `main` y crear la rama `release/sprint-N` desde `main`.
