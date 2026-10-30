"use client";

import { useAuth } from "@/components/auth-provider";
import { GAMES } from "@/lib/data";
import type { Route } from "@/lib/types";

export function GamePlayer({ id, navigate }: { id: string; navigate: (r: Route) => void }) {
  const { user } = useAuth();
  const game = GAMES.find((g) => g.id === id);
  if (!game) return null;

  return (
    <div className="av-player fade-in">
      <div className="player-hud">
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div className="hud-stat">
            <div className="l">Jugador</div>
            <div className="v" style={{ color: "var(--ink)" }}>
              {user ? user.name : "INVITADO"}
            </div>
          </div>
          <div className="hud-stat">
            <div className="l">Puntuación</div>
            <div className="v">0</div>
          </div>
          <div className="hud-stat lives">
            <div className="l">Vidas</div>
            <div className="v">♥ ♥ ♥</div>
          </div>
          <div className="hud-stat level">
            <div className="l">Nivel</div>
            <div className="v">01</div>
          </div>
        </div>
        <div className="hud-actions">
          <button className="btn ghost" onClick={() => navigate({ name: "detalle", id: game.id })}>
            SALIR
          </button>
        </div>
      </div>

      <div className="crt">
        <div className="crt-screen">
          <div className="game-arena">
            <div className="grid-floor"></div>
            <div className="enemy e1"></div>
            <div className="enemy e2"></div>
            <div className="enemy e3"></div>
            <div className="player-ship"></div>
          </div>
          <div className="crt-content" style={{ background: "rgba(0,0,0,0.6)", zIndex: 5 }}>
            <div>
              <div className="pixel neon-yellow" style={{ fontSize: 22 }}>
                PRÓXIMAMENTE
              </div>
              <div
                className="mono"
                style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 10, letterSpacing: "0.16em" }}
              >
                {game.title} AÚN NO ESTÁ DISPONIBLE
              </div>
            </div>
          </div>
        </div>
        <div className="crt-bottom">
          <span className="led">SEÑAL OK</span>
          <span>{game.title} · CRT-83 · 60 HZ</span>
          <span>CARGA · 1MB</span>
        </div>
      </div>
    </div>
  );
}
