import { useFrame } from "@react-three/fiber";
import Cubie from "./Cubie";
import { useCubeStore, animationProgress } from "../store/cubeStore";

export default function Cube() {
  const cubies = useCubeStore((s) => s.cubies);
  const animation = useCubeStore((s) => s.animation);
  const commitAnimation = useCubeStore((s) => s.commitAnimation);

  useFrame(() => {
    if (animation.status === "animating" && animationProgress(animation) >= 1) {
      commitAnimation();
    }
  });

  return (
    <group>
      {cubies.map((c, i) => (
        <Cubie key={i} cubie={c} index={i} />
      ))}
    </group>
  );
}
