import type { Rank } from "@apuntado/contracts";

export type Pip = readonly [x: number, y: number];

const L = 31;
const C = 50;
const R = 69;
const TOP = 19;
const BOTTOM = 81;

export const PIP_LAYOUT: Readonly<Partial<Record<Rank, readonly Pip[]>>> = {
  "2": [
    [C, TOP],
    [C, BOTTOM],
  ],
  "3": [
    [C, TOP],
    [C, 50],
    [C, BOTTOM],
  ],
  "4": [
    [L, TOP],
    [R, TOP],
    [L, BOTTOM],
    [R, BOTTOM],
  ],
  "5": [
    [L, TOP],
    [R, TOP],
    [C, 50],
    [L, BOTTOM],
    [R, BOTTOM],
  ],
  "6": [
    [L, TOP],
    [R, TOP],
    [L, 50],
    [R, 50],
    [L, BOTTOM],
    [R, BOTTOM],
  ],
  "7": [
    [L, TOP],
    [R, TOP],
    [C, 34.5],
    [L, 50],
    [R, 50],
    [L, BOTTOM],
    [R, BOTTOM],
  ],
  "8": [
    [L, TOP],
    [R, TOP],
    [C, 34.5],
    [L, 50],
    [R, 50],
    [C, 65.5],
    [L, BOTTOM],
    [R, BOTTOM],
  ],
  "9": [
    [L, TOP],
    [R, TOP],
    [L, 39.7],
    [R, 39.7],
    [C, 50],
    [L, 60.3],
    [R, 60.3],
    [L, BOTTOM],
    [R, BOTTOM],
  ],
  "10": [
    [L, TOP],
    [R, TOP],
    [C, 29.3],
    [L, 39.7],
    [R, 39.7],
    [L, 60.3],
    [R, 60.3],
    [C, 70.7],
    [L, BOTTOM],
    [R, BOTTOM],
  ],
};
