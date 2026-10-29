"use client";

import { useCallback, useEffect, useState } from "react";
import { GAMES } from "@/lib/data";
import type { Route } from "@/lib/types";

const DEFAULT_ROUTE: Route = { name: "biblioteca" };

function parseHash(hash: string): Route {
  try {
    const raw = hash.replace(/^#/, "");
    if (!raw) return DEFAULT_ROUTE;
    const r = JSON.parse(decodeURIComponent(raw));
    switch (r?.name) {
      case "biblioteca":
      case "auth":
      case "salon":
        return { name: r.name };
      case "detalle":
      case "player":
        return GAMES.some((g) => g.id === r.id) ? { name: r.name, id: r.id } : DEFAULT_ROUTE;
    }
  } catch {
    // Hash con JSON inválido: cae a la biblioteca.
  }
  return DEFAULT_ROUTE;
}

export function AppShell() {
  const [route, setRoute] = useState<Route>(DEFAULT_ROUTE);

  // El hash se lee tras montar para evitar mismatch de hidratación con el prerender.
  useEffect(() => {
    const sync = () => {
      setRoute(parseHash(location.hash));
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura inicial tras montar, exigida por el spec
    setRoute(parseHash(location.hash));
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const navigate = useCallback((r: Route) => {
    location.hash = encodeURIComponent(JSON.stringify(r));
  }, []);

  return (
    <>
      <main className="av-main">
        <Placeholder route={route} navigate={navigate} />
      </main>
      <footer
        style={{
          borderTop: "1px solid var(--line)",
          padding: "20px 32px",
          textAlign: "center",
          color: "var(--ink-faint)",
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.16em",
        }}
      >
        © 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0
      </footer>
    </>
  );
}

// Marcador temporal por ruta; se reemplaza por las pantallas reales en los pasos 5-10.
function Placeholder({ route, navigate }: { route: Route; navigate: (r: Route) => void }) {
  const links: Route[] = [
    { name: "biblioteca" },
    { name: "detalle", id: "caida" },
    { name: "player", id: "caida" },
    { name: "auth" },
    { name: "salon" },
  ];
  return (
    <div style={{ padding: 32, fontFamily: "var(--mono)" }}>
      <p>RUTA: {route.name}{"id" in route ? ` · ${route.id}` : ""}</p>
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        {links.map((l) => (
          <button key={l.name} onClick={() => navigate(l)}>
            {l.name}
          </button>
        ))}
      </div>
    </div>
  );
}
