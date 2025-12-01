// @ts-check
import fs from "node:fs";
import {glob} from "glob";
import rimraf from "rimraf";

for (const f of glob.sync("packages/*/lib")) {
  rimraf.sync(f);
}
for (const f of glob.sync("packages/*/node_modules")) {
  rimraf.sync(f);
}
for (const f of glob.sync("packages/*/src/**/*.css.d.ts")) {
  fs.unlinkSync(f);
}
for (const f of glob.sync("packages/docs/**/metas")) {
  rimraf.sync(f);
}
rimraf.sync("docs");
rimraf.sync("node_modules");
rimraf.sync("package-lock.json");
