import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface DiscoveredSVGAsset {
  id: string;
  language: string;
  filename: string;
}

export async function GET() {
  try {
    const assetsDir = path.join(process.cwd(), "public", "assets", "svg");

    if (!fs.existsSync(assetsDir)) {
      return NextResponse.json({ assets: [] });
    }

    const files = fs.readdirSync(assetsDir);
    const svgFiles = files.filter((file) => file.endsWith(".svg"));

    // Apple-style custom order
    const customOrder = [
      "hello-en.svg",
      "hello-fr.svg",
      "hello-de.svg",
      "hello-es.svg",
      "hello-it.svg",
      "hello-pt.svg",
      "hello-hi.svg",
      "hello-bn.svg",
      "hello-ta.svg",
      "hello-te.svg",
      "hello-kn.svg",
      "hello-ml.svg",
      "hello-ru.svg",
      "hello-uk.svg",
      "hello-el.svg",
      "hello-ja.svg",
      "hello-ko.svg",
      "hello-zh-Hans.svg",
      "hello-zh-Hant.svg",
    ];

    // Put custom-order files first
    const orderedSvgFiles = [
      ...customOrder.filter((file) => svgFiles.includes(file)),
      ...svgFiles.filter((file) => !customOrder.includes(file)),
    ];

    const assets: DiscoveredSVGAsset[] = orderedSvgFiles.map((filename) => {
      const nameWithoutExt = filename.replace(/\.svg$/i, "");

      const formattedLanguage = nameWithoutExt
        .replace(/^hello-/, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      return {
        id: nameWithoutExt.toLowerCase(),
        language: formattedLanguage,
        filename,
      };
    });

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Error auto-discovering SVG assets:", error);
    return NextResponse.json({ assets: [] }, { status: 500 });
  }
}