import { ParsedSVGScript } from "./SVGLoader";

export interface ComputedStrokeTiming {
  strokeId: string;
  duration: number;
  delay: number;
  ease: number[];
}

/**
 * Calculates progressive handwriting animation timings across dynamically extracted SVG paths.
 *
 * @param script The parsed SVG script object containing all path definitions.
 * @param totalTargetDurationSec Total duration (in seconds) for the handwriting sequence.
 * @returns Array of timing configurations per stroke/path.
 */
export function computeHandwritingSequence(
  script: ParsedSVGScript,
  totalTargetDurationSec: number = 2.0
): ComputedStrokeTiming[] {
  const pathCount = script.paths.length;
  if (pathCount === 0) return [];

  const durationPerPath = totalTargetDurationSec / pathCount;
  const interStrokePauseSec = 0.02;

  let accumulatedDelay = 0;

  return script.paths.map((path) => {
    const duration = Math.max(durationPerPath, 0.05);
    const delay = accumulatedDelay;

    accumulatedDelay += duration + interStrokePauseSec;

    return {
      strokeId: path.id,
      duration,
      delay,
      ease: [0.42, 0.0, 0.18, 1.0], // Fluid pen motion easing curve
    };
  });
}