import {promises as fs} from "fs";
import path from "path";

import {glob} from "glob";
import {camelCase, sortBy, upperFirst} from "lodash";
import postcss from "postcss";
import extractImports from "postcss-modules-extract-imports";
import localByDefault from "postcss-modules-local-by-default";
import scope from "postcss-modules-scope";

export async function loadCSS(sourceString: string) {
    const {root} = await postcss([localByDefault, extractImports, scope]).process(sourceString, {from: undefined});

    const exportTokens: string[] = [];
    root.each(node => {
        if (node.type === "rule" && node.selector === ":export") {
            node.each(decl => {
                if (decl.type === "decl") {
                    exportTokens.push(decl.prop);
                }
            });
            node.remove();
        }
    });

    return exportTokens;
}

export async function generateCSSTypings(rootDir: string, regex?: RegExp) {
    const root = path.join(process.cwd(), rootDir).replace(/\\/g, "/");
    const pattern = `${root}/**/*.css`;
    console.info(`Recherche des fichiers dans ${pattern}...`);
    const files = glob
        .sync(pattern)
        .map(file => {
            if (regex && !regex.test(file)) {
                return {file: ""};
            }
            const parts = file.replace(/\\/g, "/").split("/");
            const fileName = parts[parts.length - 1];
            const interfaceName = camelCase(fileName.substring(0, fileName.length - 4));
            return {file, interfaceName};
        })
        .filter(f => !!f.file);
    console.info(`${files.length} fichiers trouvés.`);
    await Promise.all(
        files.map(async ({file, interfaceName}) => {
            const content = await fs.readFile(file);
            const filePath = file.replace(root, rootDir);
            const exportTokens = await loadCSS(content.toString());
            const elements = new Set<string>();
            let hasModifier = false;
            const tokens = sortBy(
                exportTokens.map(token => {
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

            if (!tokens.length) {
                return;
            }

            const output = `import {CSSElement${hasModifier ? ", CSSMod" : ""}} from "@focus4/styling";

${Array.from(elements)
    .sort()
    .map(
        element =>
            `interface ${element} { _${hashCode(filePath.replace(/\\/g, "/").replace(root, "") + element)}: void }`
    )
    .join("\r\n")}

export interface ${upperFirst(interfaceName)}Css {
    ${tokens.map(([name, value]) => `${name.includes("-") ? `"${name}"` : name}: ${value};`).join("\r\n    ")}
}

declare const ${interfaceName}Css: ${upperFirst(interfaceName)}Css;
export default ${interfaceName}Css;
`;

            await fs.writeFile(`${file}.d.ts`, output);
            console.info(`${filePath}.d.ts généré.`);
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
