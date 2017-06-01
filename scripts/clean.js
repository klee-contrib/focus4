var fs = require("fs");
var {rm} = require("shelljs");
var glob = require("glob");

rm("-rf", "dist/**");
glob("src/**/*.css.d.ts", null, (_, files) => {
    files.forEach(f => {
        fs.unlinkSync(f);
    });
});
