import {renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {LateralMenu} from "../lateral-menu";

setupComponentTest();

const theme = {button: "lateral-button", menu: "lateral-menu"};

describe("LateralMenu", () => {
    test("affiche le contenu et bascule le bouton rétractable", () => {
        renderWithTheme(
            <LateralMenu headerHeight={48} theme={theme}>
                Contenu
            </LateralMenu>
        );

        expect(screen.getByText("Contenu").textContent).toBe("Contenu");
        const button = screen.getByRole("button");
        expect(screen.getByText("keyboard_arrow_left").parentElement).toBe(button);
        fireEvent.click(button);
        expect(screen.getByText("keyboard_arrow_right").parentElement).toBe(button);
    });

    test("ne rend pas de bouton quand le menu n'est pas rétractable", () => {
        renderWithTheme(
            <LateralMenu retractable={false} theme={theme}>
                Contenu fixe
            </LateralMenu>
        );

        expect(screen.getByText("Contenu fixe").textContent).toBe("Contenu fixe");
        expect(screen.queryByRole("button")).toBeNull();
    });
});
