import {camelCase, sortBy, upperFirst} from "es-toolkit";
import {glob} from "glob";
import {promises as fs} from "node:fs";
import path from "node:path";
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
    const root = path.join(process.cwd(), rootDir).replaceAll("\\", "/");
    const pattern = `${root}/**/*.css`;
    console.info(`Recherche des fichiers dans ${pattern}...`);
    const files = glob
        .sync(pattern)
        .map(file => {
            if (regex && !regex.test(file)) {
                return {file: "", interfaceName: ""};
            }
            const parts = file.replaceAll("\\", "/").split("/");
            const fileName = parts[parts.length - 1];
            const interfaceName = camelCase(fileName.slice(0, -4));
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
                    const Element = upperFirst(camelCase(element));
                    elements.add(Element);
                    if (modifier) {
                        hasModifier = true;
                        return [token, `CSSMod<"${modifier}", ${Element}>`] as [string, string];
                    } else {
                        return [token, `CSSElement<${Element}>`] as [string, string];
                    }
                }),
                [([name]) => name]
            );

            if (!tokens.length) {
                return;
            }

            const output = `import {CSSElement${hasModifier ? ", CSSMod" : ""}} from "@focus4/styling";

${[...elements]
    .sort()
    .map(
        element =>
            `interface ${element} { _${hashCode(filePath.replaceAll("\\", "/").replace(root, "") + element)}: void }`
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
        hash = (hash * 33) ^ str.codePointAt(--i)!;
    }
    // oxlint-disable-next-line prefer-math-trunc
    return (hash >>> 0).toString(16).slice(0, 5);
}
