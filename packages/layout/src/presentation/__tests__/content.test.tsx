import {render, screen} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {Content} from "../content";

const layoutTheme = {
    content: "layout-content",
    layout: "layout",
    scrollable: "layout-scrollable"
};

describe("Content", () => {
    test("Rend ses enfants dans le conteneur de contenu", () => {
        const {container} = render(<Content theme={layoutTheme}>Mon contenu</Content>);

        expect(screen.getByText("Mon contenu")).toBeTruthy();
        expect(container.firstElementChild?.className).toContain("layout-content");
    });
});
