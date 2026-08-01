"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { loadAllSVGScripts, ParsedSVGScript } from "./SVGLoader";
import { HelloPlayer } from "./HelloPlayer";

interface HelloAnimationProps {
  holdDurationMs?: number;
  drawDurationSec?: number;
}

export const HelloAnimation: React.FC<HelloAnimationProps> = ({
  holdDurationMs = 1000,
  drawDurationSec = 1.9,
}) => {
  const [scripts, setScripts] = useState<ParsedSVGScript[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initSVGs() {
      try {
        const loaded = await loadAllSVGScripts();
        setScripts(loaded);
      } catch (err) {
        console.error("Failed auto-discovering SVG assets:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initSVGs();
  }, []);

  const handleSequenceComplete = useCallback(() => {
    setIsHolding(true);
  }, []);

  useEffect(() => {
    if (!isHolding || scripts.length === 0) return;

    const timer = setTimeout(() => {
      setIsHolding(false);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % scripts.length);
    }, holdDurationMs);

    return () => clearTimeout(timer);
  }, [isHolding, holdDurationMs, scripts.length]);

  if (isLoading || scripts.length === 0) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-green-500 flex items-center justify-center z-50 text-zinc-600 font-sans text-xs tracking-widest uppercase">
        Loading
      </div>
    );
  }

  const currentScript = scripts[currentIndex];

  return (
    <div className="fixed inset-0 w-screen h-screen bg-green-500 text-white flex flex-col items-center justify-center overflow-hidden select-none z-50">
      <div className="relative flex items-center justify-center w-full h-full">
        <AnimatePresence mode="wait" intial={false}>
          <HelloPlayer
            key={currentScript.id}
            script={currentScript}
            drawDuration={drawDurationSec}
            onSequenceComplete={handleSequenceComplete}
          />
        </AnimatePresence>
      </div>

      <div className="absolute bottom-10 text-zinc-500 font-sans tracking-[0.25em] text-xs uppercase font-medium pointer-events-none">
        {currentScript.language}
      </div>
    </div>
  );
};