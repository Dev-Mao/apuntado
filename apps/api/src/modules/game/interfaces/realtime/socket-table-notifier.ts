import type { TableNotifier } from "../../application/ports/index.js";
import type { TableQueries } from "../../application/table/table-queries.js";
import type { SocketRegistry } from "./socket-registry.js";

export class SocketTableNotifier implements TableNotifier {
  private queries: TableQueries | null = null;

  constructor(private readonly registry: SocketRegistry) {}

  connect(queries: TableQueries): void {
    this.queries = queries;
  }

  lobbyChanged(code: string): void {
    const lobby = this.queries?.lobby(code);
    if (!lobby) return;
    for (const playerId of this.queries!.playersOf(code)) {
      for (const socket of this.registry.socketsOf(playerId)) socket.emit("lobby:update", lobby);
    }
  }

  tableChanged(code: string): void {
    const queries = this.queries;
    if (!queries) return;
    for (const playerId of queries.playersOf(code)) {
      const snapshot = queries.snapshot(code, playerId);
      if (!snapshot) continue;
      for (const socket of this.registry.socketsOf(playerId)) socket.emit("table:snapshot", snapshot);
    }
  }
}
