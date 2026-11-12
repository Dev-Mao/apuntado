export class WriteQueue {
  private tail: Promise<void> = Promise.resolve();

  constructor(private readonly onError: (error: unknown) => void) {}

  enqueue(task: () => Promise<void>): void {
    this.tail = this.tail.then(task).catch(this.onError);
  }

  async idle(): Promise<void> {
    let observed: Promise<void>;
    do {
      observed = this.tail;
      await observed;
      await Promise.resolve();
    } while (observed !== this.tail);
  }
}
