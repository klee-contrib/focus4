import docgen from "react-docgen-typescript";
import {glob} from "glob";
import fs from "fs";
import {fileURLToPath} from "url";
import path from "path";
import _ from "lodash";
import {parse, findAll, walk} from "css-tree";

const __filename = fileURLToPath(import.meta.url);

function getName(name, type) {
    if (["string", "number", "boolean", "enum"].includes(type)) {
        return type;
    } else if (type == "ReactNode" && name.includes("icon")) {
        return "string";
    } else if (name.startsWith("on")) {
        return "function";
    } else {
        return "other";
    }
}

function getType(p) {
    return p.type.raw ?? p.type.name;
}

/**
 * @param {string} css
 * @returns {{property: string, value: {main: string, dark?: string}}[]}
 */
function getCssVariables(css) {
    const ast = parse(css);
    const variables = findAll(
        ast,
        node =>
            node.type === "Rule" &&
            node.prelude.type === "SelectorList" &&
            node.prelude.children.first?.type === "Selector" &&
            node.prelude.children.first.children.first?.type === "PseudoClassSelector" &&
            node.prelude.children.first.children.first.name === "root" &&
            node.prelude.children.first.children.size === 1
    )
        .flatMap(node => (node.type === "Rule" && node.block.children.toArray()) || [])
        .map(node => ({
            property: node.property,
            value: {
                main: node.value.value?.trim().replaceAll('"', '\\"')
            }
        }));

    walk(ast, node => {
        if (
            node.type === "Rule" &&
            node.prelude.type === "SelectorList" &&
            node.prelude.children.first?.type === "Selector" &&
            node.prelude.children.first.children.first?.type === "PseudoClassSelector" &&
            node.prelude.children.first.children.first.name === "root" &&
            node.prelude.children.first.children.size === 2
        ) {
            for (const n of node.block.children.toArray().flat()) {
                const prop = variables.find(v => v.property === n.property);
                if (prop) {
                    prop.value.dark = n.value.value?.trim().replaceAll('"', '\\"');
                }
            }
        }
    });

    return variables;
}

const globalCssVariables = ["variables", "colors"].flatMap(file =>
    getCssVariables(
        fs.readFileSync(path.resolve(__filename, `../../packages/styling/src/variables/${file}.css`)).toString()
    )
);

const commonCssVariables = getCssVariables(
    fs
        .readFileSync(path.resolve(__filename, `../../packages/toolbox/src/components/__style__/variables.css`))
        .toString()
);

function generateDocFile(module, globPath, componentFilter) {
    if (!fs.existsSync(path.resolve(__filename, `../../packages/docs/${module}/metas`))) {
        fs.mkdirSync(path.resolve(__filename, `../../packages/docs/${module}/metas`), {recursive: true});
    }

    // Parse a file for docgen info
    for (const component of docgen
        .parse(glob.sync(globPath), {
            shouldExtractLiteralValuesFromEnum: true,
            propFilter: prop =>
                !(
                    prop.name == "ref" ||
                    prop.name == "key" ||
                    prop.name.startsWith("aria-") ||
                    prop.name.startsWith("onPointer")
                )
        })
        .filter(
            c =>
                c.displayName[0] === c.displayName[0].toUpperCase() &&
                (!componentFilter || componentFilter.includes(c.displayName))
        )) {
        const cssFilePaths = fs
            .readFileSync(component.filePath)
            .toString()
            .split("\n")
            .filter(l => l.includes(".css"))
            .map(cssImport => /from "(.+)"/.exec(cssImport)[1])
            .map(cssImport => path.resolve(path.dirname(component.filePath), cssImport));

        const usedVariables = [];
        const localCssVariables = cssFilePaths.flatMap(cssFilePath => {
            const css = fs.readFileSync(cssFilePath).toString();
            usedVariables.push(...Array.from(css.matchAll(/var\(([a-z0-9-]+)\)/g)).map(m => m[1]));
            return getCssVariables(css);
        });

        const usedCommonVariables = commonCssVariables.filter(v => usedVariables.includes(v.property));
        usedVariables.push(
            ...usedCommonVariables.flatMap(({value: {main}}) =>
                Array.from(main.matchAll(/var\(([a-z0-9-]+)\)/g)).map(m => m[1])
            )
        );
        const usedGlobalVariables = globalCssVariables.filter(v => usedVariables.includes(v.property));
        usedVariables.push(
            ...usedGlobalVariables.flatMap(({value: {main}}) =>
                Array.from(main.matchAll(/var\(([a-z0-9-]+)\)/g)).map(m => m[1])
            )
        );

        fs.writeFileSync(
            path.resolve(__filename, `../../packages/docs/${module}/metas/${_.kebabCase(component.displayName)}.ts`),
            `import {${component.displayName}} from "@focus4/${module.split("/")[module.split("/").length - 1]}";

import type {Meta} from "@storybook/react";

export const ${component.displayName}Meta = {
    component: ${component.displayName},
    parameters: {
        docs: {
            description: {component: \`${escape(component.description)}\`}
        },
        cssVariables: {
            global: {
                ${globalCssVariables
                    .filter(v => usedVariables.includes(v.property))
                    .map(
                        css =>
                            `"${css.property}": {main: "${css.value.main}"${
                                css.value.dark ? `, dark: "${css.value.dark}"` : ""
                            }}`
                    )
                    .join(",\n                ")}
            },
            common: {
                ${commonCssVariables
                    .filter(v => usedVariables.includes(v.property))
                    .map(
                        css =>
                            `"${css.property}": {main: "${css.value.main}"${
                                css.value.dark ? `, dark: "${css.value.dark}"` : ""
                            }}`
                    )
                    .join(",\n                ")}
            },
            local: {
                ${localCssVariables
                    .map(
                        css =>
                            `"${css.property}": {main: "${css.value.main}"${
                                css.value.dark ? `, dark: "${css.value.dark}"` : ""
                            }}`
                    )
                    .join(",\n                ")}
            }
        }
    },
    argTypes: {
        ${Object.keys(component.props)
            .sort((a, b) => a.localeCompare(b))
            .map(
                prop =>
                    `${prop}: {
            description: \`${escape(component.props[prop].description)}\`,
            type: {
                name: "${getName(prop, component.props[prop].type.name)}",
                required: ${component.props[prop].required}${
                        component.props[prop].type.value
                            ? `,
                value: [${component.props[prop].type.value.map(value => value.value).join(", ")}]`
                            : getName(prop, component.props[prop].type.name) === "other"
                            ? `,
                value: "${component.props[prop].type.name.replaceAll('"', '\\"')}"`
                            : ""
                    }
            },
            table: {type: {summary: \`${getType(component.props[prop])}\`}}
        }`
            )
            .join(",\n        ")}
    }
} satisfies Meta<typeof ${component.displayName}>;`.replaceAll("\n", "\r\n")
        );
    }
}

generateDocFile("components/toolbox", "./packages/toolbox/src/components/*.tsx");
generateDocFile("components/forms", "./packages/forms/src/components/*.tsx");
generateDocFile("collections", "./packages/collections/src/**/*.tsx", [
    "ActionBar",
    "AdvancedSearch",
    "FacetBox",
    "List",
    "Results",
    "SearchBar",
    "Summary",
    "Table",
    "Timeline"
]);
generateDocFile("layout", "./packages/layout/src/**/*.tsx", [
    "Content",
    "Dialog",
    "HeaderActions",
    "HeaderContent",
    "HeaderItem",
    "HeaderScrolling",
    "HeaderTopRow",
    "LateralMenu",
    "Layout",
    "LayoutBase",
    "MainMenuItem",
    "MainMenu",
    "Panel",
    "PanelButtons",
    "Popin",
    "Scrollable",
    "ScrollspyContainer",
    "ScrollspyMenu"
]);

function escape(text) {
    return text.replaceAll("\\", "\\\\").replaceAll("`", "\\`").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
