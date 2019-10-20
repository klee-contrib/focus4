// @ts-check
// @ts-ignore
import pkg from "./package.json";
import {onwarn, abortOnError} from "../../scripts/rollup";

import postcssImport from "postcss-import";
import resolve from "rollup-plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";

/** @type {import("rollup").RollupOptions} */
const config = {
    input: "src/focus4.toolbox.ts",
    plugins: [
        postcss({extract: true, modules: true, plugins: [postcssImport({load: () => ""})]}),
        resolve(),
        typescript({abortOnError: false}),
        abortOnError
    ],
    treeshake: {
        moduleSideEffects: false
    },
    output: {
        format: "esm",
        file: pkg.main
    },
    external: [
        ...Object.keys(pkg.dependencies || {}),
        "classnames",
        "mobx",
        "mobx-react",
        "ramda/src/dissoc",
        "react",
        "react-dom",
        "react-toolbox/lib/app_bar/AppBar",
        "react-toolbox/lib/autocomplete/Autocomplete",
        "react-toolbox/lib/avatar/Avatar",
        "react-toolbox/lib/button/Button",
        "react-toolbox/lib/button/BrowseButton",
        "react-toolbox/lib/button/IconButton",
        "react-toolbox/lib/card/Card",
        "react-toolbox/lib/card/CardActions",
        "react-toolbox/lib/card/CardMedia",
        "react-toolbox/lib/card/CardText",
        "react-toolbox/lib/card/CardTitle",
        "react-toolbox/lib/checkbox/Check",
        "react-toolbox/lib/checkbox/Checkbox",
        "react-toolbox/lib/chip/Chip",
        "react-toolbox/lib/date_picker/Calendar",
        "react-toolbox/lib/dropdown/Dropdown",
        "react-toolbox/lib/font_icon",
        "react-toolbox/lib/identifiers",
        "react-toolbox/lib/input/Input",
        "react-toolbox/lib/link/Link",
        "react-toolbox/lib/list/List",
        "react-toolbox/lib/list/ListCheckbox",
        "react-toolbox/lib/list/ListDivider",
        "react-toolbox/lib/list/ListItem",
        "react-toolbox/lib/list/ListItemAction",
        "react-toolbox/lib/list/ListItemActions",
        "react-toolbox/lib/list/ListItemContent",
        "react-toolbox/lib/list/ListItemLayout",
        "react-toolbox/lib/list/ListItemText",
        "react-toolbox/lib/list/ListSubHeader",
        "react-toolbox/lib/menu/Menu",
        "react-toolbox/lib/menu/MenuItem",
        "react-toolbox/lib/menu/IconMenu",
        "react-toolbox/lib/menu/MenuDivider",
        "react-toolbox/lib/navigation/Navigation",
        "react-toolbox/lib/progress_bar/ProgressBar",
        "react-toolbox/lib/radio/Radio",
        "react-toolbox/lib/radio/RadioButton",
        "react-toolbox/lib/radio/RadioGroup",
        "react-toolbox/lib/slider/Slider",
        "react-toolbox/lib/snackbar/Snackbar",
        "react-toolbox/lib/switch/Thumb",
        "react-toolbox/lib/switch/Switch",
        "react-toolbox/lib/tabs/Tab",
        "react-toolbox/lib/tabs/TabContent",
        "react-toolbox/lib/tabs/Tabs",
        "react-toolbox/lib/time_picker/Clock",
        "react-toolbox/lib/utils/events",
        "react-toolbox/lib/utils/prefixer",
        "react-toolbox/lib/utils/utils",
        "tslib"
    ],
    onwarn
};

export default config;
