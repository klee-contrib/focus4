import {readFile, writeFile} from "fs";
import {resolve} from "path";

// Enlève la dépréciation sur "useObserver".
[
    resolve(import.meta.dirname, "./node_modules/mobx-react-lite/es/index.js"),
    resolve(import.meta.dirname, "../../node_modules/mobx-react-lite/es/index.js"),
    resolve(import.meta.dirname, "../../mobx-react-lite/es/index.js")
].forEach(typeFile => {
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
                err2 => console.log(err2 ?? "useObserver undeprecated")
            );
        }
    });
});
