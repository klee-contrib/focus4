const {mkdir, find, cp} = require("shelljs");
const {existsSync} = require("fs");

find("-Rf", "./src/**/*.css*").forEach(file => {
    const destFile = file.replace("src", process.argv[2]);
    const styleFolder = destFile.replace(/\/([a-z-]+).css(.d.ts)?/, "");
    if (!existsSync(styleFolder)) {
        mkdir(styleFolder);
    }
    cp(file, destFile);
});