import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {FloatingActionButton} from "../floating-action-button";

const fabTheme = {
    button: "fab",
    "button--accent": "fab-accent",
    "button--disabled": "fab-disabled",
    "button--extended": "fab-extended",
    "button--large": "fab-large",
    "button--light": "fab-light",
    "button--lowered": "fab-lowered",
    "button--primary": "fab-primary",
    "button--small": "fab-small",
    focus: "fab-focus",
    icon: "fab-icon",
    label: "fab-label"
};

describe("FloatingActionButton component", () => {
    setupComponentTest();

    test("Rend un bouton iconifié avec aria-label", () => {
        const {container} = render(<FloatingActionButton icon="add" label="Ajouter" theme={fabTheme} />);

        const button = screen.getByRole("button", {name: "Ajouter"});
        expect(button).toMatchObject({tagName: "BUTTON", type: "button"});
        expect([...container.querySelectorAll(".fab-icon")].map(icon => icon.textContent)).toEqual(["add"]);
    });

    test("Rend un lien quand href est renseigné", () => {
        render(<FloatingActionButton href="/create" icon="add" label="Créer" target="_blank" theme={fabTheme} />);

        expect(screen.getByRole("link", {name: "Créer"})).toMatchObject({
            pathname: "/create",
            target: "_blank",
            type: ""
        });
    });

    test("Etend automatiquement le bouton quand il n'a pas d'icône", () => {
        render(<FloatingActionButton color="accent" label="Créer" lowered theme={fabTheme} />);

        expect([...screen.getByRole("button", {name: "Créer"}).classList].sort()).toEqual(
            ["fab", "fab-accent", "fab-extended", "fab-lowered"].sort()
        );
    });

    test.each([
        {disabled: false, callCount: 1},
        {disabled: true, callCount: 0}
    ])("Déclenche onClick avec disabled : $disabled", ({disabled, callCount}) => {
        const onClick = vi.fn();
        render(
            <FloatingActionButton disabled={disabled} icon="add" label="Ajouter" onClick={onClick} theme={fabTheme} />
        );

        fireEvent.click(screen.getByRole("button", {name: "Ajouter"}));
        expect(onClick).toHaveBeenCalledTimes(callCount);
    });
});
