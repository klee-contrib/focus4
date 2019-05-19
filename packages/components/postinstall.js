const fs = require("fs");
const path = require("path");

// Corrige l'autocomplete qui renvoie l'id du champ si on appuie sur Entrée sans suggestions.
[
    path.resolve(__dirname, "./node_modules/react-toolbox/lib/autocomplete/Autocomplete.js"),
    path.resolve(__dirname, "../../react-toolbox/lib/autocomplete/Autocomplete.js")
].forEach(typeFile => {
    fs.readFile(typeFile, "utf8", function(err, data) {
        if (!err) {
            fs.writeFile(
                typeFile,
                data.replace("var newValue = target === void 0 ? event.target.id : target;", "var newValue = target;"),
                "utf8",
                err => console.log(err || "react-toolbox patché")
            );
        }
    });
});
