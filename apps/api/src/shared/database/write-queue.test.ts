import { describe, expect, it } from "vitest";
import { WriteQueue } from "./write-queue.js";

describe("Cola de escritura", () => {
  it("ejecuta las tareas en orden y sigue después de una que falla", async () => {
    const done: string[] = [];
    const errors: unknown[] = [];
    const queue = new WriteQueue((error) => errors.push(error));
    queue.enqueue(async () => void done.push("a"));
    queue.enqueue(async () => Promise.reject(new Error("b")));
    queue.enqueue(async () => void done.push("c"));
    await queue.idle();
    expect(done).toEqual(["a", "c"]);
    expect(errors).toHaveLength(1);
  });

  it("al esperar a que se vacíe incluye las tareas encoladas mientras tanto", async () => {
    const done: string[] = [];
    const queue = new WriteQueue(() => {});
    queue.enqueue(async () => {
      done.push("primera");
      queueMicrotask(() => queue.enqueue(async () => void done.push("tardía")));
    });
    await queue.idle();
    expect(done).toEqual(["primera", "tardía"]);
  });
});
