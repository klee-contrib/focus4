// @ts-check
const fs = require("fs");
const {glob} = require("glob");
const rimraf = require("rimraf");

glob.sync("packages/*/lib").forEach(f => rimraf.sync(f));
glob.sync("packages/*/node_modules").forEach(f => rimraf.sync(f));
glob.sync("packages/*/src/**/*.css.d.ts").forEach(f => fs.unlinkSync(f));
glob.sync("packages/docs/**/metas").forEach(f => rimraf.sync(f));
rimraf.sync("docs");
rimraf.sync("node_modules");
