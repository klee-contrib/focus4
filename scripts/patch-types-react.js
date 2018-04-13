const fs = require('fs');
const path = require('path');

[path.resolve(__dirname, "../node_modules/@types/react/index.d.ts"), path.resolve(__dirname, "../../@types/react/index.d.ts")]
    .forEach(typeFile => {
        fs.readFile(typeFile, 'utf8', function (err, data) {
            if (!err) {
                fs.writeFile(typeFile, data.replace(/Readonly<P>/g, 'P'), 'utf8', err => console.log(err || "@types/react surchargé"));
            }
        });
    });