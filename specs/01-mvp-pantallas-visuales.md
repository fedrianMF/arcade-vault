# SPEC 01 — MVP visual: pantallas de Arcade Vault

> **Status:** Implementado
> **Depends on:** Ninguna
> **Date:** 2026-10-28
> **Objective:** Implementar en Next.js las cinco pantallas de `references/templates/` (biblioteca, detalle, reproductor, auth y salón de la fama) como MVP solo visual, sin ningún juego real.

---

## Por qué existe este spec

El diseño ya está resuelto en `references/templates/` (JSX con React por CDN, datos mock y `styles.css`). Este spec lo porta al proyecto Next.js real y respeta las decisiones tomadas en la fase de preguntas: el routing por hash se mantiene como en el template, aunque no sea lo idiomático en App Router.

El tema visual ya está portado: `app/globals.css` contiene las variables y clases del template, y `app/layout.tsx` ya carga las fuentes Press Start 2P, JetBrains Mono y Courier Prime. Este spec no lo rehace.

---

## Scope

**In:**

- Cinco pantallas fieles al template: biblioteca (`Library`), detalle (`GameDetail`), reproductor (`GamePlayer`), auth (`Auth`) y salón de la fama (`HallOfFame`).
- Componentes compartidos: `Nav` (con menú móvil) y footer.
- Navegación SPA con hash, con el mismo formato del template: `#` + `encodeURIComponent(JSON.stringify(route))`.
- Sesión simulada: `AuthProvider` (Context) que lee y escribe `av_user` en `localStorage`.
- Datos mock tipados en `lib/data.ts`: `GAMES`, `CATS` y `seededScores`.
- Reproductor como marco estático: HUD con valores fijos, pantalla CRT con la arena decorativa y un overlay "PRÓXIMAMENTE".
- Reemplazar el scaffold de `app/page.tsx` por la aplicación.
- Se reutilizan las clases CSS de `app/globals.css`; los estilos inline del template pasan tal cual a JSX.

**Out of scope (para futuros specs):**

- Cualquier juego jugable o su lógica.
- Puntaje simulado, pausa, fin de partida y modal de "FIN DEL JUEGO" en el reproductor.
- Guardado de puntuaciones (`av_scores`) y mezcla de puntajes guardados en el salón.
- Autenticación real, backend, base de datos, OAuth real (los botones Google/GitHub son decorativos).
- Rutas reales de App Router (`/juegos/[id]`, etc.).
- Tests automatizados (el repo no tiene test runner).

---

## Data model

Se portan los datos mock del template a TypeScript. Archivo: `lib/data.ts`.

```ts
export type GameColor = "cyan" | "magenta" | "yellow" | "green";
export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";

export interface Game {
  id: string;        // slug, ej. "bloque-buster"
  title: string;
  short: string;
  long: string;
  cat: Category;
  cover: string;     // clase CSS de globals.css, ej. "cover-bricks"
  color: GameColor;
  best: number;
  plays: string;     // ya formateado, ej. "12.4K"
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;      // "DD/MM/2026"
}

export const CATS = ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"] as const;
export function seededScores(seed: number, count?: number): ScoreRow[];
```

Tipos de estado de la app. Archivo: `lib/types.ts`.

```ts
export type Route =
  | { name: "biblioteca" }
  | { name: "detalle"; id: string }
  | { name: "player"; id: string }
  | { name: "auth" }
  | { name: "salon" };

export interface User {
  name: string; // mayúsculas, máx. 10 caracteres
}
```

Convenciones:

- `localStorage["av_user"]` guarda `User` como JSON, o no existe si no hay sesión.
- Los 8 juegos y sus textos se copian literalmente de `references/templates/data.jsx`.
- `seededScores` conserva el algoritmo del template; mismos seeds dan los mismos resultados.
- Seeds: detalle usa `id.length * 17 + 3` con 10 filas; salón usa `id.length * 23 + 7` con 12 filas.

---

## Implementation plan

1. Crear `lib/types.ts` y `lib/data.ts` con los tipos y los datos mock portados. Prueba: `npm run lint` pasa.
2. Crear `components/auth-provider.tsx` (`"use client"`) con `AuthProvider` y el hook `useAuth()`; leer `av_user` en un efecto para evitar mismatch de hidratación.
3. Crear `components/app-shell.tsx` (`"use client"`): estado `route` sincronizado con el hash, `navigate()`, scroll al inicio en cada cambio, `<main className="av-main">` y footer. Renderiza un placeholder por ruta. Conectar en `app/page.tsx` envolviendo con `AuthProvider`. Prueba: `npm run dev`, la home ya no muestra el scaffold y cambiar el hash cambia el placeholder.
4. Crear `components/nav.tsx` con el nav, el enlace activo, el botón de sesión y el panel móvil. Montarlo en `app-shell.tsx`. Prueba: los enlaces cambian de ruta.
5. Crear `components/screens/library.tsx` con `GameCard` (efecto tilt), búsqueda, chips de categoría y estado vacío. Prueba: filtrar por texto y categoría.
6. Crear `components/screens/game-detail.tsx` con portada, tags, stats, acciones y leaderboard. Prueba: entrar desde una tarjeta.
7. Crear `components/screens/auth.tsx` con pestañas, formulario, "jugar como invitado" y botones sociales decorativos. Prueba: iniciar sesión muestra el nombre en el nav.
8. Crear `components/screens/hall-of-fame.tsx` con tabs por juego, podio, tabla y fila "TU MEJOR MARCA" solo con sesión. Prueba: cambiar de juego cambia el ranking.
9. Crear `components/screens/game-player.tsx` con HUD estático, CRT, overlay "PRÓXIMAMENTE" y botón `SALIR`. Prueba: desde el detalle, "JUGAR AHORA" abre el marco.
10. Reemplazar cada placeholder del paso 3 por su pantalla real y borrar los assets del scaffold que ya no se usan. Prueba: `npm run build` pasa.

---

## Acceptance criteria

- [ ] `npm run lint` y `npm run build` terminan sin errores.
- [ ] `/` no muestra nada del scaffold de Create Next App.
- [ ] La biblioteca muestra los 8 juegos del template.
- [ ] Escribir "caí" en el buscador deja solo la tarjeta CAÍDA.
- [ ] Elegir la categoría SHOOTER muestra exactamente INVASORES y ROCAS.
- [ ] Una búsqueda sin coincidencias muestra "NO HAY RESULTADOS".
- [ ] Hacer clic en una tarjeta (o en JUGAR) abre el detalle de ese juego.
- [ ] El detalle muestra la descripción larga, partidas, mejor global y 10 filas de puntuaciones.
- [ ] "JUGAR AHORA" abre el reproductor del mismo juego; "VOLVER AL VAULT" vuelve a la biblioteca.
- [ ] El reproductor muestra el HUD con puntuación 0, 3 vidas y nivel 01, y el overlay "PRÓXIMAMENTE".
- [ ] El reproductor no cambia el puntaje ni abre modales; `SALIR` vuelve al detalle.
- [ ] En auth, la pestaña "CREAR CUENTA" muestra el campo de correo y "INICIAR SESIÓN" lo oculta.
- [ ] Enviar el formulario con usuario `px_kai` guarda `av_user` con `{"name":"PX_KAI"}` y navega a la biblioteca.
- [ ] Con sesión, el nav muestra `PX_KAI ▾`; hacer clic ahí borra `av_user` y el nav vuelve a "Iniciar Sesión".
- [ ] "JUGAR COMO INVITADO" navega a la biblioteca sin crear `av_user`.
- [ ] Recargar la página con sesión iniciada mantiene el nombre en el nav.
- [ ] El salón muestra un tab por juego, podio con 3 puestos y 12 filas; cambiar de tab cambia las filas.
- [ ] La fila "TU MEJOR MARCA" aparece solo con sesión iniciada.
- [ ] Recargar con el hash de una pantalla (ej. el detalle de `caida`) vuelve a abrir esa pantalla.
- [ ] A 375 px de ancho el nav muestra el botón hamburguesa y el panel móvil abre y cierra.
- [ ] La consola del navegador no muestra errores ni warnings de hidratación al cargar cada pantalla.

---

## Decisions

- **Sí:** SPA con hash como el template, en un único `app/page.tsx` que renderiza un componente client. Fue decisión explícita del usuario y mantiene la fidelidad con el template.
- **No:** rutas de App Router (`/juegos/[id]`, `/salon`). Son más idiomáticas y dan URLs compartibles, pero el usuario eligió el hash. Pasar a rutas reales queda para otro spec.
- **Sí:** formato de hash idéntico al template (`encodeURIComponent(JSON.stringify(route))`), para poder comparar ambos lado a lado.
- **Sí:** sesión mock en `localStorage` (`av_user`) con Context. Hace visible el estado "con sesión" en el nav y el salón sin backend.
- **No:** sesión real o cookies. Sin backend no tiene sentido; va en otro spec.
- **Sí:** leer `localStorage` y el hash dentro de `useEffect`, no en el inicializador de estado. Con el prerender de Next, leerlos al renderizar produce mismatch de hidratación.
- **Sí:** reproductor como marco estático con "PRÓXIMAMENTE". Se descartó replicar el puntaje simulado, la pausa y el modal de game over del template, porque sin juego real serían comportamiento falso que habría que retirar luego.
- **No:** guardar puntuaciones (`av_scores`). Sin juego no hay puntuaciones que guardar.
- **Sí:** datos mock tipados en `lib/data.ts`; el salón y el detalle usan solo puntuaciones sembradas.
- **No:** mezclar puntajes guardados en el salón. Era más alcance y depende de que existan juegos.
- **Sí:** reutilizar `app/globals.css` y las clases del template tal cual. No se reescribe a utilidades de Tailwind: el CSS ya está portado y verificado contra el diseño.
- **Sí:** componentes en `components/` y `components/screens/`; los textos se mantienen en español como en el template.
- **Sí:** el diseño visual manda el template; si hay que tocar estilos, aplicar `/frontend-design` según `CLAUDE.md`.

---

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| Mismatch de hidratación al leer hash o `localStorage` en el render inicial | Leerlos en `useEffect` y renderizar la biblioteca (ruta por defecto) hasta montar. |
| Next.js de esta versión tiene cambios respecto al conocimiento previo | Leer la guía correspondiente en `node_modules/next/dist/docs/` antes de escribir código, como indica `AGENTS.md`. |
| Existe una copia anidada `arcade-vault/` con otras versiones de dependencias | Trabajar solo en el proyecto raíz; no editar la copia anidada. |
| `localStorage` bloqueado (modo privado) | Envolver lecturas y escrituras en `try/catch`; la app funciona sin sesión persistente. |
| Hash manipulado a mano con JSON inválido o `id` inexistente | Ante JSON inválido caer a la biblioteca; ante `id` inexistente en detalle o reproductor, redirigir a la biblioteca. |

---

## What is **not** in this spec

- Ningún juego jugable ni su lógica.
- Puntaje, pausa o game over en el reproductor, ni guardado de puntuaciones.
- Autenticación real, backend o base de datos.
- Rutas reales de App Router.
- Tests automatizados.

Cada uno de esos puntos, si se hace, va en su propio spec.
