var fs = require("fs");
var {rm} = require("shelljs");
var glob = require("glob");

rm("-rf", "packages/**/.rpt2_cache/**");
rm("-rf", "packages/**/lib/**");
glob("packages/**/*.css.d.ts", null, (_, files) => {
    files.forEach(f => {
        fs.unlinkSync(f);
    });
});
