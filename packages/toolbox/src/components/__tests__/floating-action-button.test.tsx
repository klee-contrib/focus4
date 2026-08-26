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
        expect(button.tagName).toBe("BUTTON");
        expect(button.getAttribute("type")).toBe("button");
        expect(container.textContent).toContain("add");
    });

    test("Rend un lien quand href est renseigné", () => {
        render(<FloatingActionButton href="/create" icon="add" label="Créer" target="_blank" theme={fabTheme} />);

        const link = screen.getByRole("link", {name: "Créer"});
        expect(link.getAttribute("href")).toBe("/create");
        expect(link.getAttribute("target")).toBe("_blank");
        expect(link.hasAttribute("type")).toBe(false);
    });

    test("Etend automatiquement le bouton quand il n'a pas d'icône", () => {
        const {container} = render(<FloatingActionButton color="accent" label="Créer" lowered theme={fabTheme} />);

        expect(screen.getByRole("button", {name: "Créer"})).toBeTruthy();
        expect(container.querySelector("button")?.className).toContain("fab-extended");
        expect(container.querySelector("button")?.className).toContain("fab-accent");
        expect(container.querySelector("button")?.className).toContain("fab-lowered");
    });

    test("Déclenche onClick sauf quand disabled=true", () => {
        const onClick = vi.fn();
        const {rerender} = render(
            <FloatingActionButton icon="add" label="Ajouter" onClick={onClick} theme={fabTheme} />
        );

        fireEvent.click(screen.getByRole("button", {name: "Ajouter"}));
        expect(onClick).toHaveBeenCalledTimes(1);

        rerender(<FloatingActionButton disabled icon="add" label="Ajouter" onClick={onClick} theme={fabTheme} />);
        fireEvent.click(screen.getByRole("button", {name: "Ajouter"}));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
