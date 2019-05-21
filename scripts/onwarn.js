// @ts-check
import chalk from "chalk";

/**
 * Handler de warnings
 * @param {import("rollup").RollupWarning} warning
 */
export function onwarn({code, message, plugin}) {
    if (code === "CIRCULAR_DEPENDENCY") {
        return;
    }
    if (plugin == "rpt2" && process.env.CI) {
        const [
            _,
            path,
            line,
            col,
            type,
            code,
            detail
        ] = /(.+)\((.+),(.+)\): \w+ (\w+) (.+): \u001b\[31m(.+)\u001b\[39m/.exec(message);
        console.error(
            `##vso[task.logissue type=${type};sourcepath=${path};linenumber=${line};columnnumber=${col};code=${code}]${detail}`
        );
        return;
    }
    console.warn((plugin == "rpt2" ? chalk.red : chalk.yellow)(`(!) ${message}`));
}
