// 魔方核心数据结构与状态

export type Face = "U" | "D" | "F" | "B" | "L" | "R";
export type Color = "white" | "yellow" | "red" | "orange" | "blue" | "green";

// 每个面的中心颜色
export const FACE_COLOR: Record<Face, Color> = {
  U: "white",
  D: "yellow",
  F: "green",
  B: "blue",
  L: "orange",
  R: "red",
};

// 每个 cubie 在 3D 空间中的坐标（-1, 0, 1 三个轴）
export type Vec3 = [number, number, number];

export interface Cubie {
  position: Vec3;
  colors: Partial<Record<Face, Color>>;
}

// 坐标轴方向对应的面
// 沿 +X 的面是 R，-X 是 L，+Y 是 U，-Y 是 D，+Z 是 F，-Z 是 B
export function faceForNormal(n: Vec3): Face {
  const [x, y, z] = n;
  if (Math.abs(x) > 0.5) return x > 0 ? "R" : "L";
  if (Math.abs(y) > 0.5) return y > 0 ? "U" : "D";
  return z > 0 ? "F" : "B";
}

// 生成一个已还原的 27 个 cubie
export function createSolvedCube(): Cubie[] {
  const cubies: Cubie[] = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const position: Vec3 = [x, y, z];
        const colors: Partial<Record<Face, Color>> = {};
        const normals: Vec3[] = [
          [1, 0, 0],
          [-1, 0, 0],
          [0, 1, 0],
          [0, -1, 0],
          [0, 0, 1],
          [0, 0, -1],
        ];
        for (const n of normals) {
          const face = faceForNormal(n);
          // 只有该 cubie 位于对应面上时，才贴中心颜色
          const dot = position[0] * n[0] + position[1] * n[1] + position[2] * n[2];
          if (dot > 0.5) {
            colors[face] = FACE_COLOR[face];
          }
        }
        cubies.push({ position, colors });
      }
    }
  }
  return cubies;
}

// 判断魔方是否已还原
export function isSolved(cubies: Cubie[]): boolean {
  const expected = createSolvedCube();
  return expected.every((c) => {
    const target = cubies.find(
      (o) =>
        Math.abs(o.position[0] - c.position[0]) < 0.5 &&
        Math.abs(o.position[1] - c.position[1]) < 0.5 &&
        Math.abs(o.position[2] - c.position[2]) < 0.5
    );
    if (!target) return false;
    return facesEqual(target.colors, c.colors);
  });
}

// 比较两个面的颜色映射（忽略 key 顺序）
function facesEqual(
  a: Partial<Record<Face, Color>>,
  b: Partial<Record<Face, Color>>
): boolean {
  const ak = Object.keys(a).sort() as Face[];
  const bk = Object.keys(b).sort() as Face[];
  if (ak.length !== bk.length) return false;
  return ak.every((k, i) => bk[i] === k && a[k] === b[k]);
}