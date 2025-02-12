import {spawn} from "child_process";
import {readFileSync, writeFileSync} from "fs";
import os from "os";

import {sortBy} from "es-toolkit";
import packageJson from "package-json";

export async function install(appPackageJsonPath: string, version: string) {
    console.info(`Mise à jour des dépendances Focus pour la version '${version}'...`);
    console.info();

    const appPackageJson = JSON.parse(readFileSync(appPackageJsonPath).toString());

    const focusPackages = Object.keys({
        ...(appPackageJson.dependencies ?? {}),
        ...(appPackageJson.devDependencies ?? {})
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
        const focusPackageJson = await packageJson(focusPackage, {version});
        if (focusPackage === "@focus4/tooling" && !(focusPackage in (appPackageJson.dependencies ?? {}))) {
            devDependencies[focusPackage] = focusPackageJson.version;

            if (devDependencies[focusPackage] !== appPackageJson?.devDependencies?.[focusPackage]) {
                console.info(`Ajout de ${focusPackage}@${devDependencies[focusPackage]}`);
                hasUpdate = true;
            }
        } else {
            dependencies[focusPackage] = focusPackageJson.version;

            if (dependencies[focusPackage] !== appPackageJson?.dependencies?.[focusPackage]) {
                console.info(`Ajout de ${focusPackage}@${dependencies[focusPackage]}`);
                hasUpdate = true;
            }
        }

        for (const peerDep in focusPackageJson.peerDependencies) {
            if (!(peerDep in dependencies)) {
                dependencies[peerDep] = (
                    await packageJson(peerDep, {version: focusPackageJson.peerDependencies[peerDep]})
                ).version;

                if (dependencies[peerDep] !== appPackageJson?.dependencies?.[peerDep]) {
                    console.info(`Ajout de ${peerDep}@${dependencies[peerDep]}`);
                    hasUpdate = true;
                }
            }
        }
    }

    dependencies = sortBy(Object.entries({...(appPackageJson.dependencies ?? {}), ...dependencies}), [
        o => o[0]
    ]).reduce((a, [b, c]) => ({...a, [b]: c}), {});
    devDependencies = sortBy(Object.entries({...(appPackageJson.devDependencies ?? {}), ...devDependencies}), [
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
