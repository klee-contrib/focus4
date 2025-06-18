import {readFile, writeFile} from "node:fs";
import {resolve} from "node:path";

// Enlève la dépréciation sur "useObserver".
for (const typeFile of [
    resolve(import.meta.dirname, "./node_modules/mobx-react-lite/es/index.js"),
    resolve(import.meta.dirname, "../../node_modules/mobx-react-lite/es/index.js"),
    resolve(import.meta.dirname, "../../mobx-react-lite/es/index.js")
]) {
    readFile(typeFile, "utf8", (err, data) => {
        if (!err) {
            writeFile(
                typeFile,
                data
                    .replace(
                        'import { useObserver as useObserverOriginal } from "./useObserver";',
                        'export { useObserver } from "./useObserver";'
                    )
                    .replace("export function useObserver", "export function useObserverDeprecated"),
                "utf8",
                err2 => console.info(err2 ?? "useObserver undeprecated")
            );
        }
    });
}
