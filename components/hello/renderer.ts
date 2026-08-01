export function computeHandwritingSequence(
  script: ParsedSVGScript,
  pixelsPerSecond: number = 700
): ComputedStrokeTiming[] {
  if (script.paths.length === 0) return [];

  let accumulatedDelay = 0;
  const interStrokePauseSec = 0.02;

  return script.paths.map((path) => {
    // Create temporary SVG path to measure its real length
    const temp = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );

    temp.setAttribute("d", path.d);

    const length = temp.getTotalLength();

    // Constant writing speed
    const duration = Math.max(length / pixelsPerSecond, 0.05);

    const delay = accumulatedDelay;
    accumulatedDelay += duration + interStrokePauseSec;

    return {
      strokeId: path.id,
      duration,
      delay,
      ease: [0.42, 0.0, 0.18, 1.0],
    };
  });
}