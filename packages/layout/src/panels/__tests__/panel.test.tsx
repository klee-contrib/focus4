import {render, screen} from "@testing-library/react";
import i18next from "i18next";
import {initReactI18next} from "react-i18next";
import {describe, expect, test} from "vitest";

import {Panel} from "../panel";

i18next.use(initReactI18next).init();

const panelTheme = {
    actions: "Actions",
    content: "Content",
    panel: "Panel",
    "panel--editing": "editing",
    "panel--loading": "loading",
    progress: "Progress",
    title: "Title",
    "title--bottom": "bottom",
    "title--top": "top"
};

describe("Panel", () => {
    test("Le titre est rendu dans une balise <h3> unique", () => {
        const panelTitle = "A title for a test";
        render(<Panel title={panelTitle} theme={panelTheme} />);

        expect(screen.getAllByRole("heading", {level: 3, name: panelTitle})).toHaveLength(1);
    });

    test.each([
        {position: "none", top: 1, bottom: 0},
        {position: "top", top: 1, bottom: 0},
        {position: "bottom", top: 1, bottom: 1},
        {position: "both", top: 1, bottom: 1}
    ])("Avec buttonsPosition=$position, on a $top zone haute et $bottom zone basse", ({position, top, bottom}) => {
        const {container} = render(
            <Panel
                title="my panel"
                buttonsPosition={position as "none" | "top" | "bottom" | "both"}
                theme={panelTheme}
            />
        );

        expect(container.querySelectorAll(".top").length).toBe(top);
        expect(container.querySelectorAll(".bottom").length).toBe(bottom);
    });
});
