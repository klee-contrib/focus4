const fs = require("fs");
const glob = require("glob");
const rimraf = require("rimraf");

glob("packages/**/.rpt2_cache", null, (_, files) => files && files.forEach(f => rimraf.sync(f)));
glob("packages/**/lib", null, (_, files) => files && files.forEach(f => rimraf.sync(f)));
if (fs.existsSync("packages/styling/src/variables/variables.ts")) {
    fs.unlinkSync("packages/styling/src/variables/variables.ts");
}
glob("packages/**/src/**/*.css.d.ts", null, (_, files) => files && files.forEach(f => fs.unlinkSync(f)));
