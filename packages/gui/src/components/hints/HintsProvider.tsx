import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useSettingsStore } from "../../stores/settingsStore.js";
import { resolveHintElement, getHintLabel } from "./hintTarget.js";

export function HintsProvider({ children }: { children: ReactNode }) {
  const hints = useSettingsStore((s) => s.hints);
  const loaded = useSettingsStore((s) => s.loaded);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const [label, setLabel] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const activeTarget = useRef<HTMLElement | null>(null);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-hints", hints);
  }, [hints, loaded]);

  useEffect(() => {
    if (!hints) {
      setLabel(null);
      activeTarget.current = null;
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      const target = resolveHintElement(event.target);
      if (!target) {
        if (activeTarget.current) {
          activeTarget.current = null;
          setLabel(null);
        }
        return;
      }

      if (target !== activeTarget.current) {
        activeTarget.current = target;
        setLabel(getHintLabel(target));
      }

      setPosition({ x: event.clientX, y: event.clientY });
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (event.relatedTarget === null) {
        activeTarget.current = null;
        setLabel(null);
      }
    };

    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerleave", onPointerLeave, true);
    return () => {
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerleave", onPointerLeave, true);
    };
  }, [hints]);

  return (
    <>
      {children}
      {hints && label
        ? createPortal(
            <div
              data-no-hint
              className="hints-tooltip"
              style={{ left: position.x + 14, top: position.y + 14 }}
              role="tooltip"
            >
              {label}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
