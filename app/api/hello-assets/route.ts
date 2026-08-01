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

    const assets: DiscoveredSVGAsset[] = svgFiles.map((filename) => {
      const nameWithoutExt = filename.replace(/\.svg$/i, "");
      const formattedLanguage = nameWithoutExt
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