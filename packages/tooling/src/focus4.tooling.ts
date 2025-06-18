#!/usr/bin/env node
import path from "node:path";

import {generateCSSTypings} from "./generator";
import {install} from "./install";

export {generateCSSTypings};

export {baseConfig, cssAutoModules, ssiVariables} from "./vite";

if (process.argv?.[1]?.includes("focus4.tooling")) {
    if (process.argv[2] === "cssgen") {
        const rootDir = process.argv[3];
        const regex = process.argv[4] ? new RegExp(process.argv[4]) : undefined;
        if (!rootDir) {
            throw new Error("Veuillez fournir un dossier racine pour 'cssgen'");
        }
        (async () => {
            // Pour forcer node à ne pas kill le process avant la fin de la promise.
            const timer = setTimeout(() => {
                /* */
            }, 10_000);
            await generateCSSTypings(rootDir, regex);
            clearTimeout(timer);
        })();
    } else if (process.argv[2] === "install" || process.argv[2] === "update") {
        const appPackageJsonPath = path.resolve(process.cwd(), "package.json");
        (async () => {
            // Pour forcer node à ne pas kill le process avant la fin de la promise.
            const timer = setTimeout(() => {
                /* */
            }, 100_000);
            await install(appPackageJsonPath, process.argv[3] ?? "latest");
            clearTimeout(timer);
        })();
    } else {
        throw new Error(
            "Seules les fonctionnalités 'cssgen' ou 'install'/'update' est supportée par l'utilitaire 'focus4'."
        );
    }
}
