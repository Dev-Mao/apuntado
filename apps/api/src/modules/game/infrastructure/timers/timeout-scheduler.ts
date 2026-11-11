import type { Clock } from "../../../../shared/clock.js";
import type { TaskScheduler } from "../../application/ports/index.js";

export class TimeoutScheduler implements TaskScheduler {
  private readonly handles = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private readonly clock: Clock) {}

  schedule(key: string, at: Date, task: () => void): void {
    this.cancel(key);
    const delay = Math.max(0, at.getTime() - this.clock.now().getTime());
    this.handles.set(key, setTimeout(() => {
      this.handles.delete(key);
      task();
    }, delay));
  }

  cancel(key: string): void {
    const handle = this.handles.get(key);
    if (handle) clearTimeout(handle);
    this.handles.delete(key);
  }

  cancelAll(): void {
    for (const key of [...this.handles.keys()]) this.cancel(key);
  }
}
