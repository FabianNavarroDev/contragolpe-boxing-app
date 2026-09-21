# Contragolpe Boxing App

App móvil de miembros y panel administrativo para Contragolpe Boxing Gym.
Proyecto VII · UDG Virtual · LDSW.

## Estructura

```
apps/mobile   App de miembros (React Native + Expo)
apps/admin    Panel administrativo (React + Vite)
docs          Documentación y arquitectura
```

## Requisitos
- Node.js LTS y Git
- Expo Go en tu celular (para probar la app móvil)

## Ejecutar la app móvil
```
cd apps/mobile
npm install
cp .env.example .env    # y llena tus valores
npx expo start
```

## Ejecutar el panel admin
```
cd apps/admin
npm install
cp .env.example .env    # y llena tus valores
npm run dev
```

## Flujo de ramas
- `main`: versión estable (solo al cierre de cada sprint)
- `develop`: integración
- `feature/tX-Y-nombre`: una rama por tarea