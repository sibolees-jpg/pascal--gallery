import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicArtworkData } from "../public-works-build.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "_site");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && /\.(html|js|mjs|css)$/.test(entry.name)) {
    await cp(path.join(root, entry.name), path.join(output, entry.name));
  }
}
for (const directory of ["admin", "services", "assets/brand", "assets/cases"]) {
  await cp(path.join(root, directory), path.join(output, directory), { recursive: true });
}
await mkdir(path.join(output, "data"), { recursive: true });
for (const file of ["cases.json", "categories.json", "xu-services.json"]) {
  await cp(path.join(root, "data", file), path.join(output, "data", file));
}

const fullData = JSON.parse(await readFile(path.join(root, "data/works-for-sale.json"), "utf8"));
const publicData = createPublicArtworkData(fullData);
await writeFile(path.join(output, "data/works-for-sale.json"), `${JSON.stringify(publicData, null, 2)}\n`);
for (const work of publicData.works) {
  if (!work.image) continue;
  const destination = path.join(output, work.image);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(root, work.image), destination);
}
