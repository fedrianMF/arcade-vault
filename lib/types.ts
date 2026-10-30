export type Route =
  | { name: "biblioteca" }
  | { name: "detalle"; id: string }
  | { name: "player"; id: string }
  | { name: "auth" }
  | { name: "salon" };

export interface User {
  name: string; // mayúsculas, máx. 10 caracteres
}
