#!/usr/bin/env node

import {generateCSSTypings} from "./generator";
export {generateCSSTypings};

export {webpackConfigWithDefaults} from "./webpack";

if (process.argv?.[1]?.includes("focus4.tooling")) {
    if (process.argv[2] === "cssgen") {
        const rootDir = process.argv[3];
        if (!rootDir) {
            throw new Error("Veuillez fournir un dossier racine pour 'cssgen'");
        }
        generateCSSTypings(rootDir);
    } else {
        throw new Error("Seule la fonctionnalité 'cssgen' est supportée par l'utilitaire 'focus4'.");
    }
}
