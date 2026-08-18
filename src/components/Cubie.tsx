import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Cubie as CubieData, Color, Face } from "../cube/state";
import {
  useCubeStore,
  animationProgress,
  getAxisAndLayer,
} from "../store/cubeStore";
import { rotationAngle, rotateContinuous } from "../cube/rotation";

const COLOR_HEX: Record<Color, string> = {
  white: "#f8f8f8",
  yellow: "#ffd60a",
  red: "#e53935",
  orange: "#ff8f00",
  blue: "#1e3a8a",
  green: "#1b5e20",
};

const FACE_ROTATION: Record<Face, [number, number, number]> = {
  R: [0, Math.PI / 2, 0],
  L: [0, -Math.PI / 2, 0],
  U: [-Math.PI / 2, 0, 0],
  D: [Math.PI / 2, 0, 0],
  F: [0, 0, 0],
  B: [0, Math.PI, 0],
};

export const GAP = 1.02;
const CUBIE_SIZE = 0.96;
const STICKER_SIZE = 0.88;
const STICKER_OFFSET = CUBIE_SIZE / 2 + 0.005;

export default function Cubie({ cubie, index }: { cubie: CubieData; index: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const animation = useCubeStore((s) => s.animation);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;

    if (animation.status === "animating") {
      const p = animationProgress(animation);
      const prev = animation.prevPositions[index];
      const target = animation.targetPositions[index];
      const { axis, layer } = getAxisAndLayer(animation.face);
      const angle = rotationAngle(axis, layer, animation.times, p);

      if (p >= 0.999) {
        g.position.set(target[0] * GAP, target[1] * GAP, target[2] * GAP);
        g.rotation.set(
          axis === "x" ? angle : 0,
          axis === "y" ? angle : 0,
          axis === "z" ? angle : 0
        );
        return;
      }

      const layerVal = axis === "x" ? prev[0] : axis === "y" ? prev[1] : prev[2];
      const inLayer = Math.abs(layerVal - layer) < 0.5;

      if (inLayer) {
        const [px, py, pz] = rotateContinuous(prev, axis, angle);
        g.position.set(px * GAP, py * GAP, pz * GAP);
        g.rotation.set(
          axis === "x" ? angle : 0,
          axis === "y" ? angle : 0,
          axis === "z" ? angle : 0
        );
      } else {
        g.position.set(prev[0] * GAP, prev[1] * GAP, prev[2] * GAP);
        g.rotation.set(0, 0, 0);
      }
    } else {
      g.position.set(
        cubie.position[0] * GAP,
        cubie.position[1] * GAP,
        cubie.position[2] * GAP
      );
      g.rotation.set(0, 0, 0);
    }
  });

  const faces = (Object.keys(cubie.colors) as Face[]).filter(
    (f) => cubie.colors[f] !== undefined
  );

  return (
    <group ref={groupRef}>
      {/* 黑色主体 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]} />
        <meshStandardMaterial color="#0a0a0e" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* 贴纸：用 group 包装，先旋转方向再平移到面的位置 */}
      {faces.map((face) => {
        const color = cubie.colors[face]!;
        return (
          <group key={face} rotation={FACE_ROTATION[face]}>
            <mesh position={[0, 0, STICKER_OFFSET]}>
              <planeGeometry args={[STICKER_SIZE, STICKER_SIZE]} />
              <meshStandardMaterial
                color={COLOR_HEX[color]}
                roughness={0.3}
                metalness={0.05}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
