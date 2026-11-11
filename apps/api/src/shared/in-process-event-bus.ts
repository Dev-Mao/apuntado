export type EventHandler = (payload: Record<string, unknown>) => void;

export class InProcessEventBus {
  private readonly handlers = new Map<string, EventHandler[]>();

  subscribe(eventName: string, handler: EventHandler): void {
    this.handlers.set(eventName, [...(this.handlers.get(eventName) ?? []), handler]);
  }

  publish(eventName: string, payload: Record<string, unknown>): void {
    for (const handler of this.handlers.get(eventName) ?? []) queueMicrotask(() => handler(payload));
  }
}
