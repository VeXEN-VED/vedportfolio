"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ParsedSVGScript } from "./SVGLoader";
import { computeHandwritingSequence } from "./renderer";

interface HelloPlayerProps {
  script: ParsedSVGScript;
  onSequenceComplete?: () => void;
  drawDuration?: number;
}

export const HelloPlayer: React.FC<HelloPlayerProps> = ({
  script,
  onSequenceComplete,
  drawDuration = 2.0,
}) => {
  const strokeTimings = useMemo(() => {
    return computeHandwritingSequence(script, drawDuration);
  }, [script, drawDuration]);

  const lastPathIndex = script.paths.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex items-center justify-center w-full h-full"
    >
      <svg
        viewBox={script.viewBox}
        aria-label={`Apple Hello in ${script.language}`}
        className="w-[85vw] max-w-[680px] h-auto overflow-visible"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {script.defsHTML && (
          <g dangerouslySetInnerHTML={{ __html: script.defsHTML }} />
        )}

        {script.paths.map((path, index) => {
          const timing = strokeTimings[index];
          const isLast = index === lastPathIndex;

          return (
            <motion.path
              key={path.id}
              d={path.d}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={path.strokeWidth}
              strokeMiterlimit={10}
              transform={path.transform}
              clipPath={path.clipPath}
              mask={path.mask}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: {
                  duration: timing ? timing.duration : 0.2,
                  delay: timing ? timing.delay : 0,
                  ease: timing
  ? (timing.ease as [number, number, number, number])
  : "easeInOut",
                },
                opacity: {
                  duration: 0.01,
                  delay: timing ? timing.delay : 0,
                },
              }}
              onAnimationComplete={() => {
                if (isLast && onSequenceComplete) {
                  onSequenceComplete();
                }
              }}
            />
          );
        })}
      </svg>
    </motion.div>
  );
};