import {defaultAppTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, render, screen} from "@testing-library/react";
import {createPortal} from "react-dom";
import {describe, expect, test, vi} from "vitest";

import {ThemeProvider} from "@focus4/styling";

import {ScrollableContext} from "../../utils";
import {Dialog} from "../dialog";

setupComponentTest();

const theme = {
    body: "dialog-body",
    dialog: "dialog",
    enter: "enter",
    enterActive: "enter-active",
    exit: "exit",
    exitActive: "exit-active",
    navigation: "dialog-navigation",
    title: "dialog-title",
    wrapper: "dialog-wrapper"
};

function renderDialog(ui: React.ReactElement) {
    return render(
        <ThemeProvider appTheme={{...defaultAppTheme, dialog: theme}}>
            <ScrollableContext.Provider
                value={{
                    headerHeight: 0,
                    level: 0,
                    portal: node => createPortal(node, document.body),
                    registerHeaderElement: () => () => undefined,
                    registerIntersect: () => () => undefined,
                    scrollTo: () => undefined
                }}
            >
                {ui}
            </ScrollableContext.Provider>
        </ThemeProvider>
    );
}

describe("Dialog", () => {
    test("affiche le titre, le contenu et les actions", async () => {
        const onClick = vi.fn();
        renderDialog(
            <Dialog active actions={[{label: "Valider", onClick}]} title="Confirmation">
                Contenu
            </Dialog>
        );

        expect(await screen.findByRole("heading", {level: 5, name: "Confirmation"})).toBeInstanceOf(HTMLHeadingElement);
        expect(screen.getByText("Contenu").textContent).toBe("Contenu");
        fireEvent.click(screen.getByRole("button", {name: "Valider"}));
        expect(onClick).toHaveBeenCalledOnce();
    });

    test("ne rend rien lorsqu'il est inactif", () => {
        renderDialog(<Dialog>Contenu masqué</Dialog>);
        expect(screen.queryByText("Contenu masqué")).toBeNull();
    });
});
