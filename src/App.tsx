import Scene from "./components/Scene";
import ControlPanel from "./components/ControlPanel";

export default function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#08090c] text-neutral-100">
      {/* 3D 场景 */}
      <div className="absolute inset-0">
        <Scene />
      </div>

      {/* 顶部标题 */}
      <header className="pointer-events-none absolute left-1/2 top-6 z-10 -translate-x-1/2 text-center">
        <h1 className="text-2xl font-semibold tracking-wide text-white/90 drop-shadow">
          3D 魔方
        </h1>
        <p className="mt-1 text-xs tracking-widest text-white/40">
          RUBIK'S CUBE SIMULATOR
        </p>
      </header>

      {/* 控制面板 */}
      <div className="pointer-events-none absolute bottom-6 right-6 z-10 flex items-end justify-end">
        <ControlPanel />
      </div>

      {/* 操作提示 */}
      <footer className="pointer-events-none absolute bottom-6 left-6 z-10 text-xs text-white/30">
        🖱 拖拽旋转视角 · 滚轮缩放
      </footer>
    </div>
  );
}
