import {DocsContainer as BaseContainer} from "@storybook/addon-docs";
import {DARK_MODE_EVENT_NAME} from "@vueless/storybook-dark-mode";
import {useEffect, useState} from "react";
import {addons} from "storybook/preview-api";

import {darkTheme, lightTheme} from "../themes";

const channel = addons.getChannel();

export function useDarkMode() {
    const [isDark, setDark] = useState(window.matchMedia("(prefers-color-scheme: dark)"));

    useEffect(() => {
        channel.on(DARK_MODE_EVENT_NAME, setDark);
        return () => channel.off(DARK_MODE_EVENT_NAME, setDark);
    }, [channel, setDark]);

    return isDark;
}

export function DocsContainer(props: any) {
    const dark = useDarkMode();
    return <BaseContainer {...props} theme={dark ? darkTheme : lightTheme} />;
}
