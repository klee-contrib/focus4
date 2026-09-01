import {defaultAppTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {render, screen} from "@testing-library/react";
import {ReactElement} from "react";
import {describe, expect, test, vi} from "vitest";

import {ThemeProvider} from "@focus4/styling";

import {ScrollspyContext} from "../../utils";
import {Panel} from "../panel";
import type {PanelButtonsProps} from "../panel-buttons";

setupComponentTest({focus: {button: {cancel: "Annuler", collapse: "Réduire", edit: "Modifier", save: "Enregistrer"}}});

const panelTheme = {
    panel: "panel",
    "panel--loading": "panel-loading",
    actions: "panel-actions",
    content: "panel-content",
    icon: "panel-icon",
    progress: "panel-progress",
    title: "panel-title",
    "title--bottom": "panel-title-bottom",
    "title--top": "panel-title-top"
};

function Buttons(_props: PanelButtonsProps) {
    return <span>actions</span>;
}

function renderPanel(ui: ReactElement) {
    return render(<ThemeProvider appTheme={{...defaultAppTheme, panel: panelTheme}}>{ui}</ThemeProvider>);
}

describe("Panel coverage", () => {
    test("affiche l'icône, le contenu et les actions en bas", () => {
        renderPanel(
            <Panel Buttons={Buttons} buttonsPosition="bottom" icon="info" title="Détails" theme={panelTheme}>
                Contenu
            </Panel>
        );

        expect(screen.getByRole("heading", {level: 3, name: "infoDétails"}).textContent).toBe("infoDétails");
        expect(["info", "Contenu", "actions"].map(text => screen.getByText(text).textContent)).toEqual([
            "info",
            "Contenu",
            "actions"
        ]);
    });

    test("replie et déplie un panel initialement replié", () => {
        renderPanel(
            <Panel Buttons={Buttons} collapsible initiallyCollapsed title="Détails" theme={panelTheme}>
                Contenu
            </Panel>
        );

        const buttons = screen.getAllByRole<HTMLButtonElement>("button");
        expect(buttons).toHaveLength(1);
        const [collapse] = buttons;
        expect(collapse.type).toBe("button");
        collapse.click();
        expect(screen.getByText("Contenu").textContent).toBe("Contenu");
    });

    test("enregistre le panel dans le scrollspy", () => {
        const registerPanel = vi.fn(() => () => undefined);
        render(
            <ScrollspyContext.Provider value={{registerPanel}}>
                <Panel Buttons={Buttons} name="details" title="Détails" theme={panelTheme} />
            </ScrollspyContext.Provider>
        );

        expect(registerPanel).toHaveBeenCalledWith("details", expect.objectContaining({title: "Détails"}));
    });
});
