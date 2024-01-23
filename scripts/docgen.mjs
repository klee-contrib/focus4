import docgen from "react-docgen-typescript";
import {glob} from "glob";
import fs from "fs";
import {fileURLToPath} from "url";
import path from "path";
import {markdownTable} from "markdown-table";
import _ from "lodash";

const __filename = fileURLToPath(import.meta.url);

function generateDocFile(fileName, globPath, lines) {
    // Parse a file for docgen info
    for (const component of docgen
        .parse(glob.sync(globPath), {
            propFilter: prop =>
                !(
                    prop.name == "ref" ||
                    prop.name == "key" ||
                    prop.name.startsWith("aria-") ||
                    prop.name.startsWith("onPointer")
                )
        })
        .reverse()) {
        lines.push(`## \`${component.displayName}\``);
        lines.push("");
        lines.push(component.description);
        lines.push("");
        lines.push("### Props");
        lines.push("");
        lines.push(
            markdownTable([
                ["Nom", "Obligatoire", "Type", "Description"],
                ..._.orderBy(Object.values(component.props), x => x.name.toLowerCase()).map(p => [
                    `\`${p.name}\``,
                    p.required ? "**Oui**" : "Non",
                    `<code>${p.type.name.replace(/\|/g, "&#124;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`,
                    p.description.replace(/\n/g, "<br />").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                ])
            ])
        );
        lines.push("");
    }

    if (!fs.existsSync(path.resolve(__filename, "../../docs/components"))) {
        fs.mkdirSync(path.resolve(__filename, "../../docs/components"));
    }
    fs.writeFileSync(path.resolve(__filename, `../../docs/components/${fileName}`), lines.join("\r\n"));
}

generateDocFile("toolbox.md", "./packages/toolbox/src/components/*.tsx", [
    "# Composants de `@focus4/toolbox` <!-- {docsify-ignore-all} -->",
    "",
    "`@focus4/toolbox` est une réimplémentation en React moderne de [React Toolbox](https://react-toolbox.io/#/components), une librairie qui implémentait Material Design pour le web. Cette librairie avait été choisie au lancement de la v4 de Focus (en 2016), mais son développement a été malheureusement abandonné 2 ans plus tard... Sans autre alternative viable, elle a fini par être intégralement intégrée dans Focus.",
    ""
]);

generateDocFile("forms.md", "./packages/forms/src/components/*.tsx", [
    "# Composants de `@focus4/forms` <!-- {docsify-ignore-all} -->",
    "",
    "`@focus4/forms` contient, en plus des [composants de formulaires](./model/form-usage.md), quelques composants supplémentaires qui s'ajoutent à ceux `@focus4/toolbox` et peuvent parfois les surcharger. Historiquement, ces composants n'étaient pas dans `react-toolbox`, ce qui est la principale raison pour laquelle ils sont dans un module différent...",
    ""
]);
