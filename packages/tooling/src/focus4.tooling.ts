#!/usr/bin/env node

import {generateCSSTypings} from "./generator";
export {generateCSSTypings};

export {baseConfig, cssAutoModules, ssiVariables} from "./vite";
export {webpackConfigWithDefaults} from "./webpack";

if (process.argv?.[1]?.includes("focus4.tooling")) {
    if (process.argv[2] === "cssgen") {
        const rootDir = process.argv[3];
        if (!rootDir) {
            throw new Error("Veuillez fournir un dossier racine pour 'cssgen'");
        }
        (async () => {
            // Pour forcer node à ne pas kill le process avant la fin de la promise.
            const timer = setTimeout(() => {
                /* */
            }, 10000);
            await generateCSSTypings(rootDir);
            clearTimeout(timer);
        })();
    } else {
        throw new Error("Seule la fonctionnalité 'cssgen' est supportée par l'utilitaire 'focus4'.");
    }
}
