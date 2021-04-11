const fs = require("fs");
const path = require("path");

// Ajoute un "stopPropagation" sur le click du IconMenu pour compat avec React 17.
[
    path.resolve(__dirname, "./node_modules/react-toolbox/lib/menu/IconMenu.js"),
    path.resolve(__dirname, "../../node_modules/react-toolbox/lib/menu/IconMenu.js"),
    path.resolve(__dirname, "../../react-toolbox/lib/menu/IconMenu.js")
].forEach(typeFile => {
    fs.readFile(typeFile, "utf8", function (err, data) {
        if (!err) {
            fs.writeFile(
                typeFile,
                data.replace(
                    "_this.handleButtonClick = function (event) {",
                    "_this.handleButtonClick = function (event) {\n        event.stopPropagation();"
                ),
                "utf8",
                err => console.log(err || "react-toolbox IM patché")
            );
        }
    });
});

// Ajoute un "stopPropagation" sur le click du Dropdown pour compat avec React 17.
[
    path.resolve(__dirname, "./node_modules/react-toolbox/lib/dropdown/Dropdown.js"),
    path.resolve(__dirname, "../../node_modules/react-toolbox/lib/dropdown/Dropdown.js"),
    path.resolve(__dirname, "../../react-toolbox/lib/dropdown/Dropdown.js")
].forEach(typeFile => {
    fs.readFile(typeFile, "utf8", function (err, data) {
        if (!err) {
            fs.writeFile(
                typeFile,
                data.replace(
                    "_this.handleSelect = function (item, event) {",
                    "_this.handleSelect = function (item, event) {\n        _events2.default.pauseEvent(event);"
                ),
                "utf8",
                err => console.log(err || "react-toolbox DD patché")
            );
        }
    });
});
