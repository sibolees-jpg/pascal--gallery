import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function buildBrandAssets(sourcePath, outputDirectory) {
  await mkdir(outputDirectory, { recursive: true });
  const source = await readFile(sourcePath, "utf8");
  const openTag = source.match(/^<svg\b[^>]*>/)?.[0];
  const viewBox = openTag?.match(/viewBox="([^"]+)"/)?.[1]
    .split(/\s+/)
    .map(Number);

  if (!openTag || viewBox?.length !== 4 || viewBox.some(Number.isNaN)) {
    throw new Error("无法读取正式标志的 SVG 画布");
  }

  const [x, y, width, height] = viewBox;
  const squareY = y - (width - height) / 2;
  const body = source.slice(openTag.length, source.lastIndexOf("</svg>"));
  const favicon = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="${x} ${squareY} ${width} ${width}">`,
    `<rect x="${x}" y="${squareY}" width="${width}" height="${width}" fill="#ffffff"/>`,
    body,
    "</svg>"
  ].join("");

  await copyFile(sourcePath, join(outputDirectory, "pascal-gallery-logo.svg"));
  await writeFile(join(outputDirectory, "favicon.svg"), favicon);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildBrandAssets(process.argv[2], process.argv[3] ?? "assets/brand");
}
