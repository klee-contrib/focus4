import docgen from "react-docgen-typescript";
import {glob} from "glob";
import fs from "fs";
import {fileURLToPath} from "url";
import path from "path";
import _ from "lodash";

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
        fs.writeFileSync(
            path.resolve(__filename, `../../packages/docs/${module}/metas/${_.kebabCase(component.displayName)}.ts`),
            `import {${component.displayName}} from "@focus4/${module.split("/")[module.split("/").length - 1]}";

import type {Meta} from "@storybook/react";

export const ${component.displayName}Meta = {
    component: ${component.displayName},
    parameters: {
        docs: {
            description: {component: \`${component.description.replaceAll('"', '\\"').replaceAll("`", "\\`")}\`}
        }
    },
    argTypes: {
        ${Object.keys(component.props)
            .sort((a, b) => a.localeCompare(b))
            .map(
                prop =>
                    `${prop}: {
            description: \`${component.props[prop].description
                ?.replaceAll("`", "\\`")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")}\`,
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
