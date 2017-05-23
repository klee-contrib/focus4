const chalk = require("chalk");
const glob = require("glob");
const DtsCreator = require("typed-css-modules");

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