// 控制面板：打乱、复原、撤销、求解、单层旋转按钮

import { motion } from "framer-motion";
import { Face } from "../cube/state";
import { Move, movesToString } from "../cube/rotation";
import { useCubeStore } from "../store/cubeStore";

const FACE_LABEL: Record<Face, string> = {
  U: "U",
  D: "D",
  F: "F",
  B: "B",
  L: "L",
  R: "R",
};

const FACE_DESC: Record<Face, string> = {
  U: "上",
  D: "下",
  F: "前",
  B: "后",
  L: "左",
  R: "右",
};

const FACES: Face[] = ["U", "D", "F", "B", "L", "R"];

export default function ControlPanel() {
  const history = useCubeStore((s) => s.history);
  const isAnimating = useCubeStore((s) => s.isAnimating);
  const isSolved = useCubeStore((s) => s.isSolved);
  const scrambleMoves = useCubeStore((s) => s.scrambleMoves);
  const playMove = useCubeStore((s) => s.playMove);
  const playMoves = useCubeStore((s) => s.playMoves);
  const undo = useCubeStore((s) => s.undo);
  const reset = useCubeStore((s) => s.reset);
  const scramble = useCubeStore((s) => s.scramble);

  const onSolve = () => {
    // 基于记录的打乱序列求逆完成复原
    if (scrambleMoves.length === 0) {
      reset();
      return;
    }
    const inverse: Move[] = scrambleMoves
      .slice()
      .reverse()
      .map((m) => ({ face: m.face, times: (4 - ((m.times % 4) + 4) % 4) % 4 }));
    playMoves(inverse);
  };

  const btn =
    "select-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl"
    >
      {/* 状态 */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-neutral-500">状态</span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isSolved ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
          }`}
        >
          {isSolved ? "已还原" : "已打乱"}
        </span>
      </div>

      {/* 操作按钮 */}
      <div className="grid grid-cols-3 gap-2">
        <button className={btn} onClick={scramble} disabled={isAnimating}>
          打乱
        </button>
        <button className={btn} onClick={onSolve} disabled={isAnimating || isSolved}>
          求解
        </button>
        <button className={btn} onClick={undo} disabled={isAnimating || history.length === 0}>
          撤销
        </button>
      </div>
      <button
        className={`${btn} mt-2 w-full`}
        onClick={reset}
        disabled={isAnimating}
      >
        复原
      </button>

      {/* 单层旋转 */}
      <div className="mt-5">
        <div className="mb-2 text-xs uppercase tracking-widest text-neutral-500">旋转层 · 顺时针</div>
        <div className="grid grid-cols-3 gap-2">
          {FACES.map((face) => (
            <button
              key={face}
              className={btn}
              onClick={() => playMove({ face, times: 1 })}
              disabled={isAnimating}
            >
              {FACE_LABEL[face]}
              <span className="ml-1 text-[10px] text-neutral-500">{FACE_DESC[face]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 历史 */}
      <div className="mt-5">
        <div className="mb-2 text-xs uppercase tracking-widest text-neutral-500">历史动作</div>
        <div className="min-h-[3rem] rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-neutral-400">
          {history.length === 0 && !isAnimating ? (
            <span className="text-neutral-600">暂无动作</span>
          ) : (
            movesToString(history)
          )}
        </div>
      </div>
    </motion.div>
  );
}