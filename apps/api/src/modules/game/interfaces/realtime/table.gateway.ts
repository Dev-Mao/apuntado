import { Inject } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import type { ActionResult, RoomResult } from "@apuntado/contracts";
import type { Server } from "socket.io";
import type { OriginPolicy } from "../../../../shared/origin-policy.js";
import type { PlayerIdentity, TableNotifier } from "../../application/ports/index.js";
import type { GameComponents } from "../../game.composition.js";
import { playerOf, type SocketRegistry, type TableSocket } from "./socket-registry.js";
import { GAME_COMPONENTS, ORIGIN_POLICY, PLAYER_IDENTITY, SOCKET_REGISTRY, TABLE_NOTIFIER } from "./tokens.js";

@WebSocketGateway()
export class TableGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(GAME_COMPONENTS) private readonly game: GameComponents,
    @Inject(PLAYER_IDENTITY) private readonly identity: PlayerIdentity,
    @Inject(SOCKET_REGISTRY) private readonly registry: SocketRegistry,
    @Inject(TABLE_NOTIFIER) private readonly notifier: TableNotifier,
    @Inject(ORIGIN_POLICY) private readonly origins: OriginPolicy,
  ) {}

  afterInit(server: Server): void {
    server.use((socket, next) => {
      const { origin, host } = socket.handshake.headers;
      if (!this.origins.allows(origin, host)) return next(new Error("Origen no permitido"));
      const player = this.identity.resolve(socket.handshake.headers.cookie);
      if (!player) return next(new Error("No hay una sesión activa"));
      (socket as TableSocket).data.player = player;
      next();
    });
  }

  handleConnection(socket: TableSocket): void {
    const { id } = playerOf(socket);
    const cameOnline = this.registry.add(id, socket);
    const code = this.game.queries.currentRoomOf(id);
    if (!code) return;
    if (!cameOnline) return this.sendStateTo(socket, code);
    this.game.lobby.presenceChanged(code);
    this.announce(code);
  }

  handleDisconnect(socket: TableSocket): void {
    const player = playerOf(socket);
    if (!player || !this.registry.remove(player.id, socket)) return;
    const code = this.game.queries.currentRoomOf(player.id);
    if (!code) return;
    this.game.lobby.presenceChanged(code);
    this.announce(code);
  }

  @SubscribeMessage("room:create")
  create(@ConnectedSocket() socket: TableSocket, @MessageBody() settings: unknown): RoomResult {
    return this.game.lobby.create(playerOf(socket), settings);
  }

  @SubscribeMessage("room:join")
  join(@ConnectedSocket() socket: TableSocket, @MessageBody() code: unknown): RoomResult {
    return this.game.lobby.join(playerOf(socket), code);
  }

  @SubscribeMessage("room:leave")
  leave(@ConnectedSocket() socket: TableSocket): ActionResult {
    return this.game.lobby.leave(playerOf(socket).id);
  }

  @SubscribeMessage("room:addBot")
  addBot(@ConnectedSocket() socket: TableSocket): ActionResult {
    return this.game.lobby.addBot(playerOf(socket).id);
  }

  @SubscribeMessage("room:start")
  start(@ConnectedSocket() socket: TableSocket): ActionResult {
    return this.game.lobby.start(playerOf(socket).id);
  }

  @SubscribeMessage("game:draw")
  draw(@ConnectedSocket() socket: TableSocket, @MessageBody() source: unknown): ActionResult {
    return this.game.table.draw(playerOf(socket).id, source);
  }

  @SubscribeMessage("game:discard")
  discard(@ConnectedSocket() socket: TableSocket, @MessageBody() card: unknown): ActionResult {
    return this.game.table.discard(playerOf(socket).id, card);
  }

  @SubscribeMessage("game:declare")
  declare(@ConnectedSocket() socket: TableSocket, @MessageBody() declaration: unknown): ActionResult {
    return this.game.table.declare(playerOf(socket).id, declaration);
  }

  private announce(code: string): void {
    this.notifier.lobbyChanged(code);
    this.notifier.tableChanged(code);
  }

  private sendStateTo(socket: TableSocket, code: string): void {
    const lobby = this.game.queries.lobby(code);
    if (lobby) socket.emit("lobby:update", lobby);
    const snapshot = this.game.queries.snapshot(code, playerOf(socket).id);
    if (snapshot) socket.emit("table:snapshot", snapshot);
  }
}
