export class WriteQueue {
  private tail: Promise<void> = Promise.resolve();

  constructor(private readonly onError: (error: unknown) => void) {}

  enqueue(task: () => Promise<void>): void {
    this.tail = this.tail.then(task).catch(this.onError);
  }

  idle(): Promise<void> {
    return this.tail;
  }
}
