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
import type { SocketRegistry, TableSocket } from "./socket-registry.js";
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
    const { id } = socket.data.player;
    const cameOnline = this.registry.add(id, socket);
    const code = this.game.queries.currentRoomOf(id);
    if (!code) return;
    if (!cameOnline) return this.sendStateTo(socket, code);
    this.game.lobby.presenceChanged(code);
    this.announce(code);
  }

  handleDisconnect(socket: TableSocket): void {
    const player = socket.data.player;
    if (!player || !this.registry.remove(player.id, socket)) return;
    const code = this.game.queries.currentRoomOf(player.id);
    if (!code) return;
    this.game.lobby.presenceChanged(code);
    this.announce(code);
  }

  @SubscribeMessage("room:create")
  create(@ConnectedSocket() socket: TableSocket, @MessageBody() settings: unknown): RoomResult {
    return this.game.lobby.create(socket.data.player, settings);
  }

  @SubscribeMessage("room:join")
  join(@ConnectedSocket() socket: TableSocket, @MessageBody() code: unknown): RoomResult {
    return this.game.lobby.join(socket.data.player, code);
  }

  @SubscribeMessage("room:leave")
  leave(@ConnectedSocket() socket: TableSocket): ActionResult {
    return this.game.lobby.leave(socket.data.player.id);
  }

  @SubscribeMessage("room:addBot")
  addBot(@ConnectedSocket() socket: TableSocket): ActionResult {
    return this.game.lobby.addBot(socket.data.player.id);
  }

  @SubscribeMessage("room:start")
  start(@ConnectedSocket() socket: TableSocket): ActionResult {
    return this.game.lobby.start(socket.data.player.id);
  }

  @SubscribeMessage("game:draw")
  draw(@ConnectedSocket() socket: TableSocket, @MessageBody() source: unknown): ActionResult {
    return this.game.table.draw(socket.data.player.id, source);
  }

  @SubscribeMessage("game:discard")
  discard(@ConnectedSocket() socket: TableSocket, @MessageBody() card: unknown): ActionResult {
    return this.game.table.discard(socket.data.player.id, card);
  }

  @SubscribeMessage("game:declare")
  declare(@ConnectedSocket() socket: TableSocket, @MessageBody() declaration: unknown): ActionResult {
    return this.game.table.declare(socket.data.player.id, declaration);
  }

  private announce(code: string): void {
    this.notifier.lobbyChanged(code);
    this.notifier.tableChanged(code);
  }

  private sendStateTo(socket: TableSocket, code: string): void {
    const lobby = this.game.queries.lobby(code);
    if (lobby) socket.emit("lobby:update", lobby);
    const snapshot = this.game.queries.snapshot(code, socket.data.player.id);
    if (snapshot) socket.emit("table:snapshot", snapshot);
  }
}
