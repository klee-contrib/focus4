import {defaultAppTheme, renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {i18nCollections} from "../../translation";
import {ContextualActions, type OperationListItem} from "../contextual-actions";

const theme = {
    ...defaultAppTheme,
    contextualActions: {
        fab: "contextual-actions-fab",
        item: "contextual-actions-item",
        text: "contextual-actions-text"
    }
};

function renderActions<T>(operationList: OperationListItem<T>[], data: T, isMosaic = false) {
    return renderWithTheme(
        <ContextualActions
            data={data}
            isMosaic={isMosaic}
            operationList={operationList}
            theme={{
                fab: theme.contextualActions.fab,
                item: theme.contextualActions.item,
                text: theme.contextualActions.text
            }}
        />
    );
}

describe("ContextualActions", () => {
    setupComponentTest({focus: {icons: i18nCollections.icons}});

    test("exécute une action principale avec ses données", () => {
        const action = vi.fn();
        renderActions([{action, label: "Apply", type: "label"}], ["selected"]);

        fireEvent.click(screen.getByRole("button", {name: "Apply"}));
        expect(action).toHaveBeenCalledWith(["selected"]);
    });

    test("affiche les actions secondaires dans un menu et exécute l'action sélectionnée", () => {
        const action = vi.fn();
        renderActions([{action, icon: "edit", label: "Edit", type: "secondary"}], [{id: 1}]);

        fireEvent.click(screen.getByRole("button"));
        fireEvent.click(screen.getByText("Edit"));
        expect(action).toHaveBeenCalledWith([{id: 1}]);
    });

    test("masque les actions sans données sauf si elles sont explicitement autorisées", () => {
        const hiddenAction = vi.fn();
        const visibleAction = vi.fn();
        renderActions(
            [
                {action: hiddenAction, label: "Hidden", type: "label"},
                {action: visibleAction, label: "Always", showIfNoData: true, type: "label"}
            ],
            []
        );

        fireEvent.click(screen.getByRole("button", {name: "Always"}));
        expect(visibleAction).toHaveBeenCalledWith([]);
        expect(hiddenAction).not.toHaveBeenCalled();
    });

    test("affiche les actions en mosaïque et l'action secondaire flottante", () => {
        const primary = vi.fn();
        const secondary = vi.fn();
        renderActions(
            [
                {action: primary, icon: "add", label: "Add", type: "icon-label"},
                {action: secondary, label: "Remove", type: "secondary"}
            ],
            {id: 1},
            true
        );

        fireEvent.click(screen.getAllByRole("button")[0]);
        expect(primary).toHaveBeenCalledWith({id: 1});
        const buttons = screen.getAllByRole("button");
        fireEvent.click(buttons.at(-1)!);
        fireEvent.click(screen.getByText("Remove"));
        expect(secondary).toHaveBeenCalledWith({id: 1});
    });

    test("affiche les actions avec icône et tooltip dans leur état désactivé", () => {
        const action = vi.fn();
        renderActions(
            [
                {action, disabled: true, icon: "edit", label: "Edit", type: "icon-tooltip"},
                {action, icon: "save", label: "Save", type: "icon"}
            ],
            {id: 1}
        );

        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(2);
        expect(buttons[0].hasAttribute("disabled")).toBe(true);
    });

    test("n'affiche pas de menu secondaire vide sans données", () => {
        const action = vi.fn();
        renderActions([{action, label: "Delete", type: "secondary"}], []);

        fireEvent.click(screen.getByRole("button"));
        expect(screen.queryByText("Delete")).toBeNull();
        expect(action).not.toHaveBeenCalled();
    });

    test("gère les options principales par défaut et ignore les options secondaires sans libellé", () => {
        const primary = vi.fn();
        const secondary = vi.fn();
        renderActions(
            [
                {action: primary, icon: "add"},
                {action: secondary, type: "secondary"}
            ],
            {id: 1}
        );

        fireEvent.click(screen.getByRole("button"));
        expect(primary).toHaveBeenCalledWith({id: 1});
        expect(screen.queryByText("More")).toBeNull();
        expect(secondary).not.toHaveBeenCalled();
    });
});
