import {render, screen} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {HeaderItem} from "../item";

const headerTheme = {
    actions: "header-actions",
    content: "header-content",
    item: "header-item",
    "item--fillWidth": "header-item-fill",
    "item--stickyOnly": "header-item-sticky",
    scrolling: "header-scrolling",
    "scrolling--sticky": "header-scrolling-sticky",
    topRow: "header-top-row"
};

describe("HeaderItem", () => {
    test("Rend ses enfants dans un item de header", () => {
        const {container} = render(<HeaderItem theme={headerTheme}>Titre</HeaderItem>);

        expect(screen.getByText("Titre").textContent).toBe("Titre");
        expect(container.firstElementChild?.classList.contains("header-item")).toBe(true);
    });

    test("Applique les classes de variantes", () => {
        const {container} = render(
            <HeaderItem fillWidth stickyOnly theme={headerTheme}>
                Actions
            </HeaderItem>
        );

        expect(container.firstElementChild?.classList.contains("header-item-fill")).toBe(true);
        expect(container.firstElementChild?.classList.contains("header-item-sticky")).toBe(true);
    });
});
