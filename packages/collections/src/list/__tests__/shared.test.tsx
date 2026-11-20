import {defaultAppTheme, renderWithTheme} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen} from "@testing-library/react";
import type {ReactElement} from "react";
import {describe, expect, test, vi} from "vitest";

import {ThemeProvider} from "@focus4/styling";

import {setupCollectionsTest} from "../../../test-utils";
import {DefaultAddItemComponent, DefaultEmptyComponent} from "../shared";

setupCollectionsTest();

function renderShared(ui: ReactElement) {
    return renderWithTheme(
        <ThemeProvider
            appTheme={{
                ...defaultAppTheme,
                listBase: {
                    empty: "list-empty",
                    mosaicAdd: "list-mosaic-add",
                    mosaicAddIcon: "list-mosaic-add-icon",
                    mosaicAddLabel: "list-mosaic-add-label"
                }
            }}
        >
            {ui}
        </ThemeProvider>
    );
}

describe("Composants partagés des listes", () => {
    test.each(["search", "timeline"] as const)("affiche le bouton d'ajout en mode %s", mode => {
        const addItemHandler = vi.fn();
        renderShared(<DefaultAddItemComponent addItemHandler={addItemHandler} mode={mode} />);

        const button = screen.getByRole("button", {name: /Ajouter/});
        fireEvent.click(button);
        expect(addItemHandler).toHaveBeenCalledTimes(1);
    });

    test("affiche le bouton d'ajout en mode mosaïque", () => {
        const addItemHandler = vi.fn();
        renderShared(<DefaultAddItemComponent addItemHandler={addItemHandler} mode="mosaic" />);

        fireEvent.click(screen.getByRole("button", {name: /Ajouter/}));
        expect(addItemHandler).toHaveBeenCalledTimes(1);
    });

    test("affiche l'état vide traduit", () => {
        renderShared(<DefaultEmptyComponent />);

        expect(screen.getByText("Aucun élément").textContent).toBe("Aucun élément");
    });
});
