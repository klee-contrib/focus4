const {mkdir, find, cp} = require("shelljs");
const {existsSync} = require("fs");

find("-Rf", "./packages/**/*.css*", "./packages/styling/src/style/*.d.ts").forEach(file => {
    const destFile = file.replace("src", process.argv[2]);
    if (file.includes("css")) {
        const styleFolder = destFile.replace(/\/([a-z-]+).css(.d.ts)?/, "");
        if (!existsSync(styleFolder)) {
            mkdir(styleFolder);
        }
    }
    cp(file, destFile);
});
