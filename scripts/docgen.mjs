import docgen from "react-docgen-typescript";
import {glob} from "glob";
import fs from "fs";
import {fileURLToPath} from "url";
import path from "path";
import {markdownTable} from "markdown-table";
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

function generateDocFile(fileName, globPath) {
    const module = fileName.substring(0, fileName.length - 3);

    if (!fs.existsSync(path.resolve(__filename, `../../packages/docs/components/${module}/metas`))) {
        fs.mkdirSync(path.resolve(__filename, `../../packages/docs/components/${module}/metas`), {recursive: true});
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
        .reverse()
        .filter(c => !c.displayName.startsWith("use"))) {
        fs.writeFileSync(
            path.resolve(
                __filename,
                `../../packages/docs/components/${module}/metas/${_.kebabCase(component.displayName)}.ts`
            ),
            `import {${component.displayName}} from "@focus4/${module}";

import type {Meta} from "@storybook/react";

export const ${component.displayName}Meta: Meta<typeof ${component.displayName}> = {
    component: ${component.displayName},
    parameters: {
        layout: "centered",
        docs: {
            description: {component: \`${component.description.replaceAll('"', '\\"').replaceAll("`", "\\`")}\`}
        }
    },
    argTypes: {
        ${Object.keys(component.props)
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
};`.replaceAll("\n", "\r\n")
        );
    }
}

generateDocFile("toolbox.md", "./packages/toolbox/src/components/*.tsx");

generateDocFile("forms.md", "./packages/forms/src/components/*.tsx");
