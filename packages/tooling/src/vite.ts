import dns from "dns";
import {existsSync, promises as fs} from "fs";
import path from "path";

import nesting from "postcss-nesting";
import {PluginOption, ResolvedConfig, UserConfigExport} from "vite";

dns.setDefaultResultOrder("verbatim");

export const baseConfig = {
    build: {
        chunkSizeWarningLimit: 5000
    },
    css: {
        modules: {
            generateScopedName(name, filename) {
                /*
                 * Le but est d'obtenir un hash en 6 caractères du nom de chaque fichier (son chemin inclus).
                 * Pour ce faire, on va commencer par convertir le nom en base64, puis on va construire récursivement un entier
                 * de hash en y intégrant tour à tour la valeur de chaque caractère.
                 * Méthode de hash : https://www.cs.hmc.edu/~geoff/classes/hmc.cs070.200101/homework10/hashfuncs.html
                 * (On applique la méthode CRC mais avec 6 bits, puisque nous sommes en base64.)
                 * Enfin, pour convertir notre hash en un suffixe applicable à une classe css, nous allons utiliser les 26
                 * caractères minuscules (les sélecteurs css ne sont pas sensibles à la casse) et les 10 chiffres, pour
                 * arriver à 36 caractères différent. Une suite de 6 caractères parmi ces 36 possibles a donc 36^6 états
                 * possibles, soit plus de deux milliards, ce qui devrait être suffisant. Nous allons donc calculer le résultat
                 * de notre hash modulo un nombre premier juste en-dessous de 36^6 (on choisit 2176782103) puis convertir
                 * ce résultat en notre suite de 6 caractères.
                 */
                const base64FileName = Buffer.from(filename.replace(".module.css", "")).toString("base64");
                const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                let h = 0;
                for (const char of base64FileName) {
                    // Le signe égale est un caractère de complétion à la fin d'une chaîne de caractère en base64
                    if (char === "=") break;
                    const charValue = base64Chars.indexOf(char);
                    const highorder = h & 0xfc000000;
                    h <<= 26;
                    h ^= highorder >> 26;
                    h ^= charValue;
                }
                // On déssigne l'entier au cas où il est négatif :
                h >>>= 0;
                h %= 2176782103;
                const hash = h.toString(36);
                return `${path.basename(filename).replace(".module.css", "")}_${name}__${hash}`;
            }
        },
        postcss: {plugins: [nesting()]}
    }
} satisfies UserConfigExport;

/**
 * Plugin pour que Vite considère tous les fichiers CSS du projet qui matchent la regex en tant que modules CSS (au lieu de ne gérer que les fichiers en `.module.css`).
 * @param regex Regex pour identifier les modules CSS.
 */
export function cssAutoModules(regex: RegExp) {
    let config: ResolvedConfig;

    return {
        name: "css-auto-modules",
        enforce: "pre",
        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },
        resolveId(id, importer) {
            id = id.replace("?used", "");

            if (id.startsWith(".") && id.endsWith(".css") && !id.endsWith(".module.css")) {
                const fixedId = `/${path.relative(
                    config.root,
                    path.resolve(importer ? path.dirname(importer) : "", id)
                )}`.replace(/\\/g, "/");

                if (regex.test(fixedId)) {
                    return fixedId.replace(".css", ".module.css");
                }
            }
        },
        async load(id) {
            id = id.replace("?used", "");

            if (id.endsWith(".module.css") && regex.test(id)) {
                const fileName = config.root + id.replace(".module.css", ".css").replace("?used", "");
                if (existsSync(fileName)) {
                    return (await fs.readFile(fileName)).toString();
                }
            }
        },
        handleHotUpdate(context) {
            if (
                context.modules.length === 0 &&
                context.file.endsWith(".css") &&
                !context.file.endsWith(".module.css")
            ) {
                const id = `/${path
                    .relative(config.root, context.file.replace(".css", ".module.css"))
                    .replace(/\\/g, "/")}`;
                const module = context.server.moduleGraph.getModuleById(id);
                return module ? [module] : [];
            }
        }
    } satisfies PluginOption;
}

/**
 * Plugin Vite pour remplacer les variables SSI (pour nginx par exemple) en mode serveur. Ne fait rien en mode bundle.
 * @param vars Variables à remplacer.
 */
export function ssiVariables(vars: Record<string, string>) {
    return {
        name: "ssi-variables",
        transformIndexHtml(html, ctx) {
            if (!ctx.bundle) {
                return html.replace(/<!--#echo var='(\w+)'-->/g, (_, varName) => vars[varName] ?? "");
            }

            return html;
        }
    } satisfies PluginOption;
}
