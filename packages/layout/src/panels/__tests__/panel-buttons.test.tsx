import {renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {i18nLayout} from "../../translation";
import {PanelButtons} from "../panel-buttons";

setupComponentTest({focus: {...i18nLayout.fr, icons: i18nLayout.icons}});

describe("PanelButtons", () => {
    test("affiche Modifier puis Enregistrer et Annuler en édition", () => {
        const onClickEdit = vi.fn();
        const onClickCancel = vi.fn();
        const save = vi.fn();
        renderWithTheme(<PanelButtons onClickCancel={onClickCancel} onClickEdit={onClickEdit} save={save} />);

        fireEvent.click(screen.getByRole("button", {name: /Modifier/}));
        expect(onClickEdit).toHaveBeenCalledOnce();

        renderWithTheme(<PanelButtons editing onClickCancel={onClickCancel} onClickEdit={onClickEdit} save={save} />);
        fireEvent.click(screen.getByRole("button", {name: /Enregistrer/}));
        fireEvent.click(screen.getByRole("button", {name: /Annuler/}));
        expect(save).toHaveBeenCalledOnce();
        expect(onClickCancel).toHaveBeenCalledOnce();
    });

    test("soumet le formulaire et désactive les boutons pendant le chargement", () => {
        const save = vi.fn();
        const submit = vi.fn(event => event.preventDefault());
        renderWithTheme(
            <form onSubmit={submit}>
                <PanelButtons collapsible editing onClickCancel={vi.fn()} onClickEdit={vi.fn()} save={save} />
            </form>
        );

        fireEvent.click(screen.getByRole("button", {name: /Enregistrer/}));
        expect(submit).toHaveBeenCalledOnce();
        expect(save).not.toHaveBeenCalled();

        renderWithTheme(<PanelButtons editing loading onClickCancel={vi.fn()} onClickEdit={vi.fn()} save={save} />);
        expect((screen.getAllByRole("button", {name: /Enregistrer/}).at(-1) as HTMLButtonElement).disabled).toBe(true);
    });

    test("ne rend rien sans les handlers d'édition", () => {
        const {container} = renderWithTheme(<PanelButtons />);
        expect(container.childElementCount).toBe(0);
    });
});
