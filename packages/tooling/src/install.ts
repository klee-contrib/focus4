import {sortBy} from "es-toolkit";
import {spawn} from "node:child_process";
import {readFileSync, writeFileSync} from "node:fs";
import os from "node:os";
import packageJson from "package-json";

export async function install(appPackageJsonPath: string, version: string) {
    console.info(`Mise à jour des dépendances Focus pour la version '${version}'...`);
    console.info();

    const appPackageJson = JSON.parse(readFileSync(appPackageJsonPath).toString());

    const focusPackages = Object.keys({
        ...appPackageJson.dependencies,
        ...appPackageJson.devDependencies
    }).filter(dep => dep.startsWith("@focus4/"));

    if (focusPackages.filter(p => p !== "@focus4/tooling").length === 0) {
        console.info("Aucune dépendances Focus détectée, ajout de tous les modules Focus...");
        console.info();

        focusPackages.push(
            "@focus4/collections",
            "@focus4/core",
            "@focus4/layout",
            "@focus4/form-toolbox",
            "@focus4/forms",
            "@focus4/stores",
            "@focus4/styling",
            "@focus4/toolbox"
        );
    } else {
        console.info(`Modules Focus détectés : ${focusPackages.join(", ")}`);
        console.info();
    }

    let dependencies: Record<string, string> = {};
    let devDependencies: Record<string, string> = {};
    let hasUpdate = false;

    for (const focusPackage of focusPackages) {
        const targetDependencies =
            focusPackage in (appPackageJson.dependencies ?? {})
                ? dependencies
                : focusPackage in (appPackageJson.devDependencies ?? {})
                  ? devDependencies
                  : focusPackage === "@focus4/tooling"
                    ? devDependencies
                    : dependencies;

        const targetDependenciesKey = targetDependencies === devDependencies ? "devDependencies" : "dependencies";

        const focusPackageJson = await packageJson(focusPackage, {version});
        targetDependencies[focusPackage] = focusPackageJson.version;

        if (targetDependencies[focusPackage] !== appPackageJson?.[targetDependenciesKey]?.[focusPackage]) {
            console.info(`Ajout de ${focusPackage}@${targetDependencies[focusPackage]}`);
            hasUpdate = true;
        }

        // Installation / mise à jour des peerDependencies des modules Focus.
        for (const peerDep in focusPackageJson.peerDependencies) {
            if (!(peerDep in dependencies) && !(peerDep in devDependencies)) {
                targetDependencies[peerDep] = (
                    await packageJson(peerDep, {version: focusPackageJson.peerDependencies[peerDep]})
                ).version;

                if (targetDependencies[peerDep] !== appPackageJson?.[targetDependenciesKey]?.[peerDep]) {
                    console.info(`Ajout de ${peerDep}@${targetDependencies[peerDep]}`);
                    hasUpdate = true;
                }
            }
        }

        // Mise à jour des dépendences du projet communes avec Focus (si installées manuellement).
        for (const dep in focusPackageJson.dependencies) {
            if (
                !dep.startsWith("@focus4/") &&
                dep in (appPackageJson?.[targetDependenciesKey] ?? {}) &&
                !(dep in dependencies) &&
                !(dep in devDependencies)
            ) {
                targetDependencies[dep] = (
                    await packageJson(dep, {version: focusPackageJson.dependencies[dep]})
                ).version;

                if (targetDependencies[dep] !== appPackageJson?.[targetDependenciesKey]?.[dep]) {
                    console.info(`Ajout de ${dep}@${targetDependencies[dep]}`);
                    hasUpdate = true;
                }
            }
        }
    }

    dependencies = sortBy(Object.entries({...appPackageJson.dependencies, ...dependencies}), [o => o[0]]).reduce(
        (a, [b, c]) => ({...a, [b]: c}),
        {}
    );
    devDependencies = sortBy(Object.entries({...appPackageJson.devDependencies, ...devDependencies}), [
        o => o[0]
    ]).reduce((a, [b, c]) => ({...a, [b]: c}), {});

    appPackageJson.dependencies = dependencies;
    appPackageJson.devDependencies = devDependencies;

    writeFileSync(appPackageJsonPath, JSON.stringify(appPackageJson, undefined, 4));

    if (hasUpdate) {
        console.info();
        console.info("Installation en cours...");
        console.info();
        await new Promise(resolve => {
            const npmi = spawn(os.platform() === "win32" ? "npm.cmd" : "npm", ["install"], {shell: true});
            npmi.stdout.on("data", b => console.info(b.toString().trim()));
            npmi.stderr.on("data", b => console.error(b.toString().trim()));
            npmi.on("close", resolve);
        });
        console.info();
        console.info("Dépendances mises à jour avec succès.");
    } else {
        console.info("Toutes les dépendences sont déjà à jour.");
    }
}
