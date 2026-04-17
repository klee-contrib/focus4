import {readFile, writeFile} from "node:fs";
import {resolve} from "node:path";

// Fix le nombre d'espaces généré par beachball lors de l'écriture du package.json lors du bump (...)
const file = resolve(import.meta.dirname, "../node_modules/beachball/lib/object/writeJson.js");
readFile(file, "utf8", (err, data) => {
    if (!err) {
        writeFile(file, data.replace("2", "4"), "utf8", err2 =>
            console.info(err2 ?? "Fix beachball bump package.json indentation")
        );
    }
});
