export interface ExtractedPath {
  id: string;
  d: string;
  strokeWidth: number;
  transform?: string;
  clipPath?: string;
  mask?: string;
}

export interface ParsedSVGScript {
  id: string;
  language: string;
  viewBox: string;
  paths: ExtractedPath[];
  defsHTML?: string;
}

export interface DiscoveredSVGAsset {
  id: string;
  language: string;
  filename: string;
}

function extractPathsRecursive(
  element: Element,
  parentTransform: string = "",
  parentClipPath: string = "",
  parentMask: string = "",
  collectedPaths: ExtractedPath[] = [],
  scriptId: string
): ExtractedPath[] {
  const currentTransform = element.getAttribute("transform") || "";
  const combinedTransform = [parentTransform, currentTransform]
    .filter(Boolean)
    .join(" ");

  const currentClipPath =
    element.getAttribute("clip-path") ||
    element.getAttribute("clipPath") ||
    parentClipPath;

  const currentMask = element.getAttribute("mask") || parentMask;

  const tagName = element.tagName.toLowerCase();

  if (tagName === "defs") {
    return collectedPaths;
  }

  if (tagName === "path") {
    const d = element.getAttribute("d") || "";

    if (d.trim().length > 0) {
      const fill = element.getAttribute("fill");
      const stroke = element.getAttribute("stroke");
      const rawStrokeWidth =
        element.getAttribute("stroke-width") ||
        element.getAttribute("strokeWidth") ||
        (element as HTMLElement).style?.strokeWidth;

        let strokeWidth = Number.parseFloat(rawStrokeWidth ?? "5");

      if ((!stroke || stroke === "none") && fill && fill !== "none") {
        strokeWidth = strokeWidth || 4.0;
      }

      collectedPaths.push({
        id: `${scriptId}-path-${collectedPaths.length}`,
        d,
        strokeWidth,
        transform: combinedTransform || undefined,
        clipPath: currentClipPath || undefined,
        mask: currentMask || undefined,
      });
    }
  }

  for (let i = 0; i < element.children.length; i++) {
    extractPathsRecursive(
      element.children[i],
      combinedTransform,
      currentClipPath,
      currentMask,
      collectedPaths,
      scriptId
    );
  }

  return collectedPaths;
}

export async function loadSVGScript(
  item: DiscoveredSVGAsset
): Promise<ParsedSVGScript> {
  const response = await fetch(`/assets/svg/${item.filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load SVG file: ${item.filename}`);
  }

  const svgText = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");

  const svgElement = doc.querySelector("svg");
  if (!svgElement) {
    throw new Error(`Invalid SVG markup in ${item.filename}`);
  }

  const viewBox = svgElement.getAttribute("viewBox") || "0 0 500 200";

  const defsElement = doc.querySelector("defs");
  const defsHTML = defsElement?.outerHTML;

  const extractedPaths = extractPathsRecursive(
    svgElement,
    "",
    "",
    "",
    [],
    item.id
  );

  return {
    id: item.id,
    language: item.language,
    viewBox,
    paths: extractedPaths,
    defsHTML,
  };
}

export async function loadAllSVGScripts(): Promise<ParsedSVGScript[]> {
  const res = await fetch("/api/hello-assets");
  if (!res.ok) {
    throw new Error("Failed to auto-discover SVG assets from API");
  }

  const data: { assets?: DiscoveredSVGAsset[] } = await res.json();
  const assets: DiscoveredSVGAsset[] = data.assets || [];

  const loadedScripts = await Promise.all(
    assets.map(async (asset) => {
      try {
        return await loadSVGScript(asset);
      } catch (err) {
        console.error(`Error loading SVG asset "${asset.filename}":`, err);
        return null;
      }
    })
  );

  return loadedScripts.filter(
    (script): script is ParsedSVGScript => script !== null
  );
}