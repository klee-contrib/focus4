import {DocsContainer as BaseContainer} from "@storybook/blocks";
import {useDarkMode} from "storybook-dark-mode";
import React from "react";

import {darkTheme, lightTheme} from "../themes";

export function DocsContainer(props) {
    const dark = useDarkMode();
    return <BaseContainer {...props} theme={dark ? darkTheme : lightTheme} />;
}
