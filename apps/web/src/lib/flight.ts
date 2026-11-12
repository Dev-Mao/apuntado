const FLIGHT_MS = 460;
const ARC_PX = 34;
const GLIDE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const ROTATION_DEPTH = 3;
const CARD_VISUAL = "[data-card-visual]";

export interface Placement {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly rotate: number;
}

export interface Flight {
  readonly from: Placement;
  readonly target: HTMLElement;
  readonly back?: HTMLElement | null | undefined;
  readonly delay?: number | undefined;
}

export function motionAllowed(): boolean {
  return document.visibilityState === "visible" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function cardVisualOf(element: Element | null | undefined): HTMLElement | null {
  if (!element) return null;
  if (element.matches(CARD_VISUAL)) return element as HTMLElement;
  return element.querySelector<HTMLElement>(CARD_VISUAL);
}

function rotationOf(element: Element): number {
  let total = 0;
  let node: Element | null = element;
  for (let depth = 0; depth < ROTATION_DEPTH && node; depth += 1) {
    const rotate = getComputedStyle(node).rotate;
    total += rotate === "none" ? 0 : Number.parseFloat(rotate) || 0;
    node = node.parentElement;
  }
  return total;
}

export function placementOf(element: HTMLElement): Placement {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    width: element.offsetWidth || rect.width,
    rotate: rotationOf(element),
  };
}

function cloneAt(source: HTMLElement, to: Placement, height: number): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute("data-card-visual");
  Object.assign(clone.style, {
    position: "fixed",
    left: `${to.x - to.width / 2}px`,
    top: `${to.y - height / 2}px`,
    width: `${to.width}px`,
    height: `${height}px`,
    margin: "0",
    zIndex: "40",
    pointerEvents: "none",
    rotate: "none",
    translate: "none",
    scale: "none",
    transition: "none",
    animation: "none",
    visibility: "visible",
  });
  document.body.append(clone);
  return clone;
}

function frameAt(from: Placement, to: Placement, progress: number, flipX: number): string {
  const rest = 1 - progress;
  const dx = (from.x - to.x) * rest;
  const dy = (from.y - to.y) * rest - ARC_PX * Math.sin(Math.PI * progress);
  const scale = (from.width / to.width) * rest + progress;
  const rotate = from.rotate * rest + to.rotate * progress;
  return `translate(${dx}px, ${dy}px) rotate(${rotate}deg) scale(${scale * flipX}, ${scale})`;
}

function track(from: Placement, to: Placement, flips: readonly [number, number, number]): Keyframe[] {
  return [
    { offset: 0, transform: frameAt(from, to, 0, flips[0]) },
    { offset: 0.5, transform: frameAt(from, to, 0.5, flips[1]) },
    { offset: 1, transform: frameAt(from, to, 1, flips[2]) },
  ];
}

export function fly({ from, target, back, delay = 0 }: Flight): void {
  const to = placementOf(target);
  const height = target.offsetHeight;
  const timing: KeyframeAnimationOptions = { duration: FLIGHT_MS, delay, easing: GLIDE, fill: "backwards" };
  const face = cloneAt(target, to, height);
  const clones = [face];
  target.style.visibility = "hidden";
  if (back) {
    const backClone = cloneAt(back, to, height);
    clones.push(backClone);
    backClone.animate(track(from, to, [1, 0, 0]), timing);
  }
  const landing = face.animate(track(from, to, back ? [0, 0, 1] : [1, 1, 1]), timing);
  void landing.finished
    .catch(() => undefined)
    .finally(() => {
      clones.forEach((clone) => clone.remove());
      target.style.visibility = "";
    });
}
