# SPEC 02 — Home

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-10-29
> **Objective:** Implementar en Next.js la pantalla Home (landing) de `references/templates/home-about/`, hacer de Home la ruta por defecto y sumar "Inicio" al nav.

---

## Por qué existe este spec

SPEC 01 portó las cinco pantallas de `references/templates/` y dejó la biblioteca como puerta de entrada. La carpeta `references/templates/home-about/` agrega la landing (`home.jsx`), un `nav.jsx` con el enlace "Inicio" y un `styles.css` ampliado.

Las primeras 929 líneas de `home-about/styles.css` son idénticas a `references/templates/styles.css`, que ya vive en `app/globals.css`. Solo hay que llevar los bloques nuevos que usa Home (HOME PAGE, actividad, precios, etc.). No hay `app.jsx` en esa carpeta, así que el cableado de rutas se define en este spec.

La carpeta también contiene `about.jsx` (Acerca de y contacto). Esa pantalla **no** entra aquí y queda para otro spec.

Este spec mantiene las decisiones de SPEC 01: routing por hash, sesión mock y todo el contenido en español.

---

## Scope

**In:**

- Pantalla `Home` fiel al template: hero con siluetas flotantes, "¿POR QUÉ ARCADE VAULT?", juegos disponibles, stats, actividad en vivo, precios con FAQ y CTA final.
- Hook de animación `reveal` (`IntersectionObserver` que agrega la clase `in`).
- Nueva ruta `{ name: "home" }`.
- Home pasa a ser la ruta por defecto: sin hash, con JSON inválido o con `id` inexistente se abre Home.
- Nav actualizado: enlaces "Inicio", "Biblioteca" y "Salón de la Fama" (barra y panel móvil); el logo lleva a Home.
- Datos mock de Home tipados en `lib/data.ts`.
- Estilos nuevos de Home de `home-about/styles.css` anexados a `app/globals.css`.

**Out of scope (para futuros specs):**

- La pantalla Acerca de (`about.jsx`): misión, highlights, divisor y formulario de contacto.
- El enlace "Acerca de" en el nav y la ruta `{ name: "about" }`.
- Los estilos exclusivos de Acerca de y contacto (`.about-*`, `.contact-*`, `.terminal-success`, `.highlight*`, etc.).
- Datos en vivo: actividad, ranking del día y stats son texto fijo, no se calculan desde `GAMES` ni `seededScores`.
- Rutas reales de App Router.
- Cualquier cambio a Biblioteca, Detalle, Reproductor, Auth o Salón más allá de lo que exige el nuevo routing.
- Pasar los estilos del template a utilidades de Tailwind.
- Tests automatizados (el repo no tiene test runner).

---

## Data model

Se amplía `Route` en `lib/types.ts`:

```ts
export type Route =
  | { name: "home" }
  | { name: "biblioteca" }
  | { name: "detalle"; id: string }
  | { name: "player"; id: string }
  | { name: "auth" }
  | { name: "salon" };
```

Se agregan a `lib/data.ts` los datos fijos de Home, copiados literalmente de `references/templates/home-about/home.jsx`:

```ts
export type NeonColor = "cyan" | "magenta" | "yellow" | "green";

export interface Feature {
  icon: "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET";
  title: string;
  desc: string;
  color: NeonColor;
}

export interface Stat {
  n: string;
  u: string;
  s: string;
}

export interface ActivityRow {
  player: string;
  game: string;   // nombre ya formateado, ej. "Bloque Buster"
  score: number;
  when: string;   // ej. "hace 2 min"
  color: NeonColor;
}

export interface TopPlayer {
  rank: number;
  player: string;
  score: number;
}

export interface Faq {
  q: string;
  a: string;
}

export const FEATURES: Feature[];       // 4 elementos
export const STATS: Stat[];             // 3 elementos
export const ACTIVITY: ActivityRow[];   // 7 elementos
export const TOP_PLAYERS: TopPlayer[];  // 5 elementos
export const FAQS: Faq[];               // 3 elementos
```

Convenciones:

- Los textos de pricing (`PLAN ÚNICO`, `JUGADOR VAULT`, `$0 / SIEMPRE`, la lista de 6 beneficios) se quedan en el JSX de `Home`: no se repiten ni se reutilizan.
- Los puntajes se muestran con `toLocaleString("es-ES")`, igual que el template.
- Los juegos de la sección "JUEGOS DISPONIBLES AHORA" salen de `GAMES.slice(0, 6)`; no se duplican datos.
- No se agregan claves a `localStorage`.

---

## Implementation plan

1. Anexar a `app/globals.css` los bloques nuevos de `references/templates/home-about/styles.css` que usa Home: `/* ===== HOME PAGE ===== */` (líneas 930–1147 del template) y los bloques de actividad en vivo y precios (`.activity-*`, `.ticker`, `.tick-row`, `.top-*`, `.pricing-*`, `.price-card`, `.faq-*`, etc., dentro de las líneas 1150–1725), sin los bloques de Acerca de y contacto y sin duplicar `/* misc */` ni `.divider`. Prueba: `npm run lint` y `npm run build` pasan, y la biblioteca y el salón se ven igual que antes.
2. Ampliar `Route` en `lib/types.ts` y agregar las constantes de Home a `lib/data.ts`. Prueba: `npm run lint` pasa.
3. Crear `components/use-reveal.ts` con el hook `useReveal` (`"use client"`; observa `.reveal` con umbral 0.12 y desconecta al desmontar; si no existe `IntersectionObserver` agrega `in` a todos). Prueba: `npm run lint` pasa.
4. Crear `components/screens/home.tsx` con `Home`, `FloatingSilhouettes`, `MiniCard` y `FeatureIcon`, y conectarlo en `components/app-shell.tsx`: caso `"home"` en `parseHash` y `renderScreen`, y `DEFAULT_ROUTE` pasa a `{ name: "home" }`. Prueba: `npm run dev`, `/` muestra Home y los CTA llevan a biblioteca, auth, detalle y salón.
5. Actualizar `components/nav.tsx`: enlace "Inicio" en la barra y en el panel móvil, el logo navega a `home` y `isActive` reconoce `home`. Prueba: "Inicio" abre Home y queda marcado como activo.
6. Revisar que los textos y comportamientos de otras pantallas que dependían de que Biblioteca fuera la default sigan correctos (ver criterios de aceptación) y borrar código muerto. Prueba: `npm run build` pasa.

---

## Acceptance criteria

- [ ] `npm run lint` y `npm run build` terminan sin errores.
- [ ] Abrir `/` sin hash muestra Home, no la biblioteca.
- [ ] Un hash con JSON inválido, o el detalle de un `id` inexistente, abre Home.
- [ ] Home muestra el título "EL ARCADE / CLÁSICO ESTÁ / DE VUELTA" y dos CTA: "EXPLORAR JUEGOS" y "CREAR CUENTA".
- [ ] "EXPLORAR JUEGOS" abre la biblioteca y "CREAR CUENTA" abre auth.
- [ ] "¿POR QUÉ ARCADE VAULT?" muestra 4 tarjetas: JUEGOS CLÁSICOS, 100% GRATIS, LADDER BOARDS y SIEMPRE CRECIENDO.
- [ ] "JUEGOS DISPONIBLES AHORA" muestra los 6 primeros juegos de `GAMES`; hacer clic en uno abre su detalle.
- [ ] "VER TODOS LOS JUEGOS →" abre la biblioteca.
- [ ] La franja de stats muestra "12+", "MILES" y "GLOBAL".
- [ ] "ÚLTIMAS PUNTUACIONES" muestra 7 filas y "TOP JUGADORES · HOY" muestra 5, con NEONFOX en el puesto `#01`.
- [ ] "VER SALÓN →" abre el salón de la fama.
- [ ] La sección de precios muestra "$0 / SIEMPRE", 6 beneficios y 3 preguntas frecuentes; "EMPEZAR GRATIS →" abre auth.
- [ ] "INSERTAR MONEDA →" del CTA final abre la biblioteca.
- [ ] Las secciones con clase `reveal` empiezan ocultas y reciben la clase `in` al entrar al viewport.
- [ ] El nav muestra "Inicio", "Biblioteca" y "Salón de la Fama", y no muestra "Acerca de"; el enlace de la pantalla actual aparece activo.
- [ ] Hacer clic en el logo desde cualquier pantalla abre Home.
- [ ] A 375 px de ancho el panel móvil lista "Inicio", "Biblioteca", "Salón de la Fama" e "Iniciar Sesión", y abre y cierra.
- [ ] A 375 px de ancho Home no tiene scroll horizontal.
- [ ] `app/globals.css` no contiene las clases exclusivas de Acerca de y contacto (`.about-hero`, `.contact-form`, `.terminal-success`).
- [ ] Los criterios de SPEC 01 sobre biblioteca, detalle, reproductor, auth y salón siguen cumpliéndose al llegar a ellos desde el nav.
- [ ] La consola del navegador no muestra errores ni warnings de hidratación al cargar Home.

---

## Decisions

- **Sí:** limitar este spec a Home. Fue decisión explícita del usuario.
- **No:** incluir Acerca de, su formulario de contacto ni el enlace del nav. Va en un spec propio; así el nav no muestra un enlace sin destino.
- **Sí:** Home es la ruta por defecto. Es una landing; la biblioteca sigue a un clic de "EXPLORAR JUEGOS" y desde el nav.
- **No:** mantener la biblioteca como default. Dejaría la landing alcanzable solo por el enlace "Inicio".
- **Sí:** el fallback de hash inválido o `id` inexistente cambia de biblioteca a Home. Es la misma ruta por defecto, y reemplaza lo que decía SPEC 01 en su tabla de riesgos.
- **Sí:** datos fijos de Home en `lib/data.ts`, junto a `GAMES`. Separan los textos del marcado y siguen el patrón de SPEC 01.
- **No:** calcular actividad, ranking o stats desde `seededScores`. Los nombres y puntajes del template son parte del diseño y no coinciden con esos datos.
- **Sí:** anexar solo el CSS que usa Home a `app/globals.css`, tal cual, sin reescribirlo a Tailwind. Es el mismo criterio de SPEC 01, y las primeras 929 líneas coinciden con lo ya portado.
- **No:** traer el CSS de Acerca de y contacto ahora. Sería código sin pantalla que lo use.
- **Sí:** los estilos mandan el template; si hay que ajustar algo visual, aplicar `/frontend-design` según `CLAUDE.md`.
- **Sí:** el hook `useReveal` vive en su propio archivo (`components/use-reveal.ts`), para que la pantalla de Acerca de lo reutilice en su spec en lugar de duplicarlo como hace el template.

---

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| El preflight de Tailwind resetea estilos que el template da por sentados; `globals.css` ya parchea `h1`–`h6` e `input` | Comparar Home con el template en el navegador y, si hace falta, ampliar los parches de `globals.css` en el mismo paso. |
| Mismatch de hidratación: Home se prerenderiza y usa `toLocaleString("es-ES")` | Usar el mismo formato que el template y verificar la consola; si falla, formatear con una función fija en `lib/data.ts`. |
| Contenido invisible: `.reveal` arranca con `opacity: 0` y depende de `IntersectionObserver` | El hook agrega `in` a todos los elementos si el API no existe; verificar que el CTA final se revela al hacer scroll. |
| `useReveal` solo observa lo que existe al montar | `Home` lo llama en su propio montaje (se remonta en cada cambio de ruta); no se usa para contenido que aparece después. |
| Cambiar la ruta por defecto rompe enlaces guardados al hash de la biblioteca | No aplica: el hash `{"name":"biblioteca"}` sigue siendo válido; solo cambia el caso sin hash. |
| Los bloques de CSS de Home y de Acerca de están intercalados en `home-about/styles.css` | Separarlos por prefijo de clase (`.about-*`, `.contact-*`, `.highlight*`, `.terminal-*`, `.term-*`, `.tip*`) y verificar con el criterio de aceptación sobre `globals.css`. |
| Existe una copia anidada `arcade-vault/` con otras versiones de dependencias | Trabajar solo en el proyecto raíz; no editar la copia anidada. |
| Next.js de esta versión tiene cambios respecto al conocimiento previo | Leer la guía correspondiente en `node_modules/next/dist/docs/` antes de escribir código, como indica `AGENTS.md`. |

---

## What is **not** in this spec

- La pantalla Acerca de, su formulario de contacto y el enlace "Acerca de" del nav.
- Actividad, ranking o stats calculados con datos reales.
- Rutas reales de App Router.
- Cambios de diseño o de contenido en las cinco pantallas de SPEC 01.
- Tests automatizados.

Cada uno de esos puntos, si se hace, va en su propio spec.
