// @ts-check
const fs = require("fs");
const {glob} = require("glob");
const rimraf = require("rimraf");

glob.sync("packages/*/lib").forEach(f => rimraf.sync(f));
glob.sync("packages/*/src/**/*.css.d.ts").forEach(f => fs.unlinkSync(f));
rimraf.sync("node_modules");
