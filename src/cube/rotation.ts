// 魔方旋转算法：对某一层做顺时针 90° 旋转，更新所有 cubie 的位置与颜色

import { Cubie, Color, Face, Vec3, faceForNormal } from "./state";

export type Move = {
  face: Face;
  // 90° 的倍数，正数顺时针，负数逆时针（从该面外侧看）
  times: number;
};

// 每个面对应的旋转轴
const AXIS: Record<Face, "x" | "y" | "z"> = {
  U: "y", D: "y", F: "z", B: "z", L: "x", R: "x",
};

// 每个面法线方向（层方向）
const NORMAL: Record<Face, Vec3> = {
  U: [0, 1, 0], D: [0, -1, 0], F: [0, 0, 1],
  B: [0, 0, -1], L: [-1, 0, 0], R: [1, 0, 0],
};

function layerValue(pos: Vec3, axis: "x" | "y" | "z"): number {
  return axis === "x" ? pos[0] : axis === "y" ? pos[1] : pos[2];
}

// 绕轴旋转向量（标准右手旋转矩阵，CCW 为正）
export function rotateVector(v: Vec3, axis: "x" | "y" | "z", times: number): Vec3 {
  const t = ((times % 4) + 4) % 4;
  const [x, y, z] = v;
  if (t === 0) return [x, y, z];
  if (axis === "x") {
    if (t === 2) return [x, -y, -z];
    return t === 1 ? [x, z, -y] : [x, -z, y];
  }
  if (axis === "y") {
    if (t === 2) return [-x, y, -z];
    return t === 1 ? [z, y, -x] : [-z, y, x];
  }
  if (t === 2) return [-x, -y, z];
  return t === 1 ? [y, -x, z] : [-y, x, z];
}

function rotateCubie(cubie: Cubie, axis: "x" | "y" | "z", times: number): Cubie {
  const position = rotateVector(cubie.position, axis, times);
  const colors: Partial<Record<Face, Color>> = {};
  for (const [face, color] of Object.entries(cubie.colors)) {
    const normal = rotateVector(NORMAL[face as Face], axis, times);
    const newFace = faceForNormal(normal);
    colors[newFace] = color as Color;
  }
  return { position, colors };
}

// 对一个面应用旋转
// 关键修复：负方向层（D/L/B）的顺时针 = 正方向层的逆时针
export function applyRotation(cubies: Cubie[], face: Face, times: number): Cubie[] {
  const axis = AXIS[face];
  const normal = NORMAL[face];
  const layer = layerValue(normal, axis);

  // 负方向层需要反转旋转方向
  const effectiveTimes = layer > 0 ? times : ((4 - ((times % 4) + 4) % 4) % 4);

  const next = cubies.map(c => ({
    ...c,
    position: [...c.position] as Vec3,
    colors: { ...c.colors },
  }));

  for (let i = 0; i < next.length; i++) {
    if (Math.abs(layerValue(next[i].position, axis) - layer) < 0.5) {
      next[i] = rotateCubie(next[i], axis, effectiveTimes);
    }
  }
  return next;
}

// 计算某层旋转在 3D 渲染中的有效角度（弧度）
// axis='y' 时方向为正，axis='x' 或 'z' 时方向为负
export function rotationAngle(
  axis: "x" | "y" | "z",
  layer: number,
  times: number,
  progress: number
): number {
  const effectiveTimes = layer > 0 ? times : ((4 - ((times % 4) + 4) % 4) % 4);
  const raw = effectiveTimes * progress;
  const signed = axis === "y" ? raw : -raw;
  return signed * (Math.PI / 2);
}

// 应用一串动作
// 连续旋转（任意角度，用于渲染插值）
export function rotateContinuous(v: Vec3, axis: "x" | "y" | "z", angle: number): Vec3 {
  const [x, y, z] = v;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  if (axis === "x") return [x, y * c - z * s, y * s + z * c];
  if (axis === "y") return [z * s + x * c, y, z * c - x * s];
  return [x * c - y * s, x * s + y * c, z];
}

export function applyMoves(cubies: Cubie[], moves: Move[]): Cubie[] {
  let state = cubies;
  for (const m of moves) {
    state = applyRotation(state, m.face, m.times);
  }
  return state;
}

// 生成随机打乱序列
export function generateScramble(count = 20): Move[] {
  const faces: Face[] = ["U", "D", "F", "B", "L", "R"];
  const opposite: Record<Face, Face> = { U: "D", D: "U", F: "B", B: "F", L: "R", R: "L" };
  const moves: Move[] = [];
  let last: Face | null = null;
  for (let i = 0; i < count; i++) {
    let face: Face;
    do {
      face = faces[Math.floor(Math.random() * faces.length)];
    } while (face === last || (last !== null && face === opposite[last]));
    const times = Math.random() < 0.5 ? 1 : 2;
    moves.push({ face, times });
    last = face;
  }
  return moves;
}

export function movesToString(moves: Move[]): string {
  return moves
    .map((m) => {
      if (m.times === 1) return m.face;
      if (m.times === 2) return `${m.face}2`;
      return `${m.face}'`;
    })
    .join(" ");
}
