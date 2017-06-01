const chalk = require("chalk");
const fs = require("fs");
const glob = require("glob");
const DtsCreator = require("typed-css-modules");
const {camelCase, flatten} = require("lodash");

const creator = new DtsCreator({rootDir: "./", searchDir: "./"});

glob("src/!(style)/**/*.css", null, (_, files) => {
    files.forEach(f => {
        creator.create(f, null, false)
            .then(content => content.writeFile())
            .then(content => {
                console.log('Wrote ' + chalk.green(content.outputFilePath));
                content.messageList.forEach(message => console.warn(chalk.yellow('[Warn] ' + message)));
            })
            .catch(reason => console.error(chalk.red('[Error] ' + reason)));
    });
});

glob("src/style/*.css", null, (_, files) => {
    fs.writeFileSync("src/style/variables.d.ts", ["export interface CSSVariables {", ...flatten(files.map(f =>
        fs.readFileSync(f, "utf-8")
            .split("\r\n")
            .map(l => l.trim())
            .filter(l => l.startsWith("--"))
            .map(s => s.replace(/:.+/, ""))
            .map(camelCase)
            .map(s => `    ${s}: string;`)
        )
    ), "}", ""].join("\r\n"));
    console.log('Wrote ' + chalk.green("src/style/variables.d.ts"));
});
