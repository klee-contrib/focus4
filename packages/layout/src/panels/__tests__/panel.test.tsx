// Libs
import {render} from "@testing-library/react";
import i18next from "i18next";
import React from "react";
import {describe, expect, test} from "vitest";

import {initReactI18next} from "react-i18next";
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

// Components
describe("Title", () => {
    test("with title", () => {
        // Arrange/Act
        const panelTitle = "A title for a test";
        const {container} = render(<Panel title={panelTitle} theme={panelTheme} />);

        // Assert that the title is present
        const h3List = container.querySelectorAll("h3");
        expect(h3List).toHaveLength(1);
        expect(h3List[0].textContent).toContain(panelTitle);
    });
});

// Top div wrapper is always present because the title is wrapped in it

test.each([
    ["none", 1, 0],
    ["top", 1, 0],
    ["bottom", 1, 1],
    ["both", 1, 1]
])("Buttons positions %s / expectedTop : %i / expectedBottom : %i", (position: any, expectedTop, expectedBottom) => {
    const {container} = render(<Panel title="my panel" buttonsPosition={position} theme={panelTheme} />);
    expect(container.querySelectorAll(".top").length).toBe(expectedTop);
    expect(container.querySelectorAll(".bottom").length).toBe(expectedBottom);
});
