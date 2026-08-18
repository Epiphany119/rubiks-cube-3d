import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import Cube from "./Cube";

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [7, 6, 8], fov: 35 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} />
      <Suspense fallback={null}>
        <Cube />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={16}
        enableDamping
        dampingFactor={0.08}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
