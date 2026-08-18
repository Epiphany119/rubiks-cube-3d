import { create } from "zustand";
import { Cubie, createSolvedCube, isSolved, Vec3 } from "../cube/state";
import {
  Move,
  applyMoves,
  applyRotation as applyRotationOnce,
  generateScramble,
  rotationAngle,
} from "../cube/rotation";

export type AnimationState =
  | { status: "idle" }
  | {
      status: "animating";
      face: Move["face"];
      times: number;
      start: number;
      target: number;
      prevPositions: Vec3[];
      targetPositions: Vec3[];
    };

interface CubeState {
  cubies: Cubie[];
  history: Move[];
  queue: Move[];
  animation: AnimationState;
  isAnimating: boolean;
  isSolved: boolean;
  scrambleMoves: Move[];

  playMove: (move: Move) => void;
  playMoves: (moves: Move[]) => void;
  undo: () => void;
  reset: () => void;
  scramble: () => void;
  commitAnimation: () => void;
}

export const ANIMATION_MS = 300;

function computeTargetPositions(
  cubies: Cubie[],
  face: Move["face"],
  times: number
): Vec3[] {
  const target = applyRotationOnce(cubies, face, times);
  return target.map((c) => [...c.position] as Vec3);
}

export const useCubeStore = create<CubeState>((set, get) => ({
  cubies: createSolvedCube(),
  history: [],
  queue: [],
  animation: { status: "idle" },
  isAnimating: false,
  isSolved: true,
  scrambleMoves: [],

  playMove: (move) => {
    const { isAnimating, queue, cubies, history } = get();
    if (isAnimating) {
      set({ queue: [...queue, move] });
      return;
    }
    const prevPositions = cubies.map((c) => [...c.position] as Vec3);
    const targetPositions = computeTargetPositions(cubies, move.face, move.times);
    set({
      isAnimating: true,
      queue: [],
      history: [...history, move],
      animation: {
        status: "animating",
        face: move.face,
        times: move.times,
        start: performance.now(),
        target: performance.now() + ANIMATION_MS,
        prevPositions,
        targetPositions,
      },
    });
  },

  playMoves: (moves) => {
    if (moves.length === 0) return;
    const { isAnimating } = get();
    if (isAnimating) {
      set({ queue: [...get().queue, ...moves] });
      return;
    }
    const [first, ...rest] = moves;
    const { cubies } = get();
    const prevPositions = cubies.map((c) => [...c.position] as Vec3);
    const targetPositions = computeTargetPositions(cubies, first.face, first.times);
    set({
      isAnimating: true,
      queue: rest,
      history: [...get().history, first],
      animation: {
        status: "animating",
        face: first.face,
        times: first.times,
        start: performance.now(),
        target: performance.now() + ANIMATION_MS,
        prevPositions,
        targetPositions,
      },
    });
  },

  undo: () => {
    const { history, isAnimating } = get();
    if (isAnimating || history.length === 0) return;
    const last = history[history.length - 1];
    const inverseTimes = (4 - ((last.times % 4) + 4) % 4) % 4;
    const inverse: Move = { face: last.face, times: inverseTimes };
    const { cubies } = get();
    const prevPositions = cubies.map((c) => [...c.position] as Vec3);
    const targetPositions = computeTargetPositions(cubies, inverse.face, inverse.times);
    set({
      history: history.slice(0, -1),
      isAnimating: true,
      queue: [],
      animation: {
        status: "animating",
        face: inverse.face,
        times: inverse.times,
        start: performance.now(),
        target: performance.now() + ANIMATION_MS,
        prevPositions,
        targetPositions,
      },
    });
  },

  reset: () => {
    const { isAnimating } = get();
    if (isAnimating) return;
    set({
      cubies: createSolvedCube(),
      history: [],
      queue: [],
      scrambleMoves: [],
      isSolved: true,
    });
  },

  scramble: () => {
    const { isAnimating } = get();
    if (isAnimating) return;
    const moves = generateScramble(20);
    const cubies = applyMoves(get().cubies, moves);
    set({
      cubies,
      history: [],
      queue: [],
      scrambleMoves: moves,
      isSolved: false,
    });
  },

  commitAnimation: () => {
    const { animation, queue, cubies, history } = get();
    if (animation.status !== "animating") return;
    const newCubies = applyRotationOnce(cubies, animation.face, animation.times);
    const next = queue[0] ?? null;
    if (next) {
      const prevPositions = newCubies.map((c) => [...c.position] as Vec3);
      const targetPositions = computeTargetPositions(newCubies, next.face, next.times);
      set({
        cubies: newCubies,
        history: [...history, next],
        queue: queue.slice(1),
        animation: {
          status: "animating",
          face: next.face,
          times: next.times,
          start: performance.now(),
          target: performance.now() + ANIMATION_MS,
          prevPositions,
          targetPositions,
        },
      });
    } else {
      set({
        cubies: newCubies,
        queue: [],
        isAnimating: false,
        animation: { status: "idle" },
        isSolved: isSolved(newCubies),
      });
    }
  },
}));

export function animationProgress(anim: AnimationState): number {
  if (anim.status !== "animating") return 0;
  const total = anim.target - anim.start;
  const elapsed = performance.now() - anim.start;
  return Math.min(1, Math.max(0, elapsed / total));
}

export function getAxisAndLayer(face: Move["face"]): {
  axis: "x" | "y" | "z";
  layer: number;
} {
  switch (face) {
    case "U": return { axis: "y", layer: 1 };
    case "D": return { axis: "y", layer: -1 };
    case "R": return { axis: "x", layer: 1 };
    case "L": return { axis: "x", layer: -1 };
    case "F": return { axis: "z", layer: 1 };
    case "B": return { axis: "z", layer: -1 };
  }
}

export { rotationAngle };
