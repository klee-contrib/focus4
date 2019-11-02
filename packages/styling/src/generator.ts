import Core from "css-modules-loader-core";
import {promises as fs} from "fs";
import glob from "glob";
import {camelCase, sortBy, upperFirst} from "lodash";

export async function generateTypings(rootDir: string) {
    const cssLoader = new Core();
    const files = glob.sync(`${rootDir}/**/*.css`).map(file => {
        const parts = file.split("/");
        const fileName = parts[parts.length - 1];
        const interfaceName = camelCase(fileName.substring(0, fileName.length - 4));
        return {file, interfaceName};
    });
    await Promise.all(
        files.map(async ({file, interfaceName}) => {
            const content = await fs.readFile(file);
            const {exportTokens} = await cssLoader.load(content.toString());
            const elements = new Set();
            let hasModifier = false;
            const tokens = sortBy(
                Object.keys(exportTokens).map(token => {
                    const [element, modifier] = token.split("--");
                    const Element = upperFirst(element);
                    elements.add(Element);
                    if (modifier) {
                        hasModifier = true;
                        return [token, `CSSMod<"${modifier}", ${Element}>`];
                    } else {
                        return [token, `CSSElement<${Element}>`];
                    }
                }),
                ([name]) => name
            );
            const output = `import {CSSElement${hasModifier ? ", CSSMod" : ""}} from "@focus4/styling";

${Array.from(elements)
    .sort()
    .map(element => `interface ${element} { _${hashCode(file + element)}: void }`)
    .join("\r\n")}

export interface ${upperFirst(interfaceName)}Css {
    ${tokens.map(([name, value]) => `${name.includes("-") ? `"${name}"` : name}: ${value};`).join("\r\n    ")}
}

declare const ${interfaceName}Css: ${upperFirst(interfaceName)}Css;
export default ${interfaceName}Css;
`;

            await fs.writeFile(`${file}.d.ts`, output);
            console.info(`${file}.d.ts généré.`);
        })
    );
}

function hashCode(str: string) {
    let hash = 5381;
    let i = str.length;
    while (i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
    }
    return (hash >>> 0).toString(16).substring(0, 5);
}
