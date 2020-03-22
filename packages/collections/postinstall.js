const fs = require("fs");
const path = require("path");

// Retire le "Readonly" sur les props dans le typage React, parce que ça fait tout péter.
[
    path.resolve(__dirname, "./node_modules/@types/react/index.d.ts"),
    path.resolve(__dirname, "../../node_modules/@types/react/index.d.ts"),
    path.resolve(__dirname, "../../@types/react/index.d.ts")
].forEach(typeFile => {
    fs.readFile(typeFile, "utf8", function (err, data) {
        if (!err) {
            fs.writeFile(typeFile, data.replace(/Readonly<P>/g, "P"), "utf8", err =>
                console.log(err || "@types/react surchargé")
            );
        }
    });
});

// Corrige le comportement de transition sur react-pose (https://github.com/Popmotion/popmotion/pull/686)
[
    path.resolve(__dirname, "./node_modules/react-pose/dist/react-pose.es.js"),
    path.resolve(__dirname, "../../node_modules/react-pose/dist/react-pose.es.js"),
    path.resolve(__dirname, "../../react-pose/dist/react-pose.es.js")
].forEach(typeFile => {
    fs.readFile(typeFile, "utf8", function (err, data) {
        if (!err) {
            fs.writeFile(
                typeFile,
                data.replace(
                    "var insertionIndex = prevKeys.indexOf(key);",
                    "var prevIndex = prevKeys.indexOf(key), insertionIndex = prevIndex + Array.from(entering).filter(function(enteringKey) { return nextKeys.indexOf(enteringKey) < prevIndex; }).length;"
                ),
                "utf8",
                err => console.log(err || "react-pose patché")
            );
        }
    });
});
