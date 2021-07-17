const fs = require("fs");
const path = require("path");

// Enlève la dépréciation sur "useObserver".
[
    path.resolve(__dirname, "./node_modules/mobx-react-lite/es/index.js"),
    path.resolve(__dirname, "../../node_modules/mobx-react-lite/es/index.js"),
    path.resolve(__dirname, "../../mobx-react-lite/es/index.js")
].forEach(typeFile => {
    fs.readFile(typeFile, "utf8", function (err, data) {
        if (!err) {
            fs.writeFile(
                typeFile,
                data
                    .replace(
                        'import { useObserver as useObserverOriginal } from "./useObserver";',
                        'export { useObserver } from "./useObserver";'
                    )
                    .replace("export function useObserver", "export function useObserverDeprecated"),
                "utf8",
                err => console.log(err || "useObserver undeprecated")
            );
        }
    });
});
