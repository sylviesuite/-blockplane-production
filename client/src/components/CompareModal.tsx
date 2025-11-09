import { useEffect } from "react";
import type { Material } from "../types";
import { LifecycleBar } from "./charts/LifecycleBar";

export function CompareModal({
  open,
  onClose,
  items,
  xDomain
}: {
  open: boolean;
  onClose: () => void;
  items: Material[];
  xDomain: [number, number];
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-x-0 top-10 mx-auto w-full max-w-6xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Compare Set ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((d) => (
            <article
              key={d.id}
              className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow p-5"
            >
              <div className="mb-2">
                <div className="text-sm font-semibold">{d.name}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {d.materialType}{d.sourceRegion ? ` · ${d.sourceRegion}` : ""}
                </div>
              </div>
              <LifecycleBar datum={d} xDomain={xDomain} />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
