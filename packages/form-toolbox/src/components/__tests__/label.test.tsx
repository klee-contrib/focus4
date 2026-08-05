import {render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {Label} from "../label";

const labelTheme = {
    label: "label-root",
    "label--error": "label-error",
    required: "label-required",
    icon: "label-icon"
};

describe("Label component", () => {
    setupComponentTest({
        "form.name": "Nom",
        "focus.label.required": "*",
        "form.tooltip": "Aide"
    });

    test("Affiche le libellé traduit", () => {
        const {container} = render(<Label label="form.name" theme={labelTheme} />);

        expect(container.querySelector("label")?.textContent).toBe("Nom");
    });

    test("Affiche une chaîne vide quand aucun libellé n'est fourni", () => {
        const {container} = render(<Label theme={labelTheme} />);

        expect(container.querySelector("label")?.textContent).toBe("");
    });

    test("Associe le htmlFor à l'id du champ uniquement en édition", () => {
        const {container, rerender} = render(<Label edit id="my-id" label="form.name" theme={labelTheme} />);
        expect(container.querySelector("label")?.getAttribute("for")).toBe("my-id");

        rerender(<Label id="my-id" label="form.name" theme={labelTheme} />);
        expect(container.querySelector("label")?.getAttribute("for")).toBeNull();
    });

    test("Affiche le marqueur required uniquement en édition et si required", () => {
        const {container, rerender} = render(<Label edit label="form.name" required theme={labelTheme} />);
        expect(container.querySelector(".label-required")?.textContent).toBe("*");

        rerender(<Label label="form.name" required theme={labelTheme} />);
        expect(container.querySelector(".label-required")).toBeNull();

        rerender(<Label edit label="form.name" theme={labelTheme} />);
        expect(container.querySelector(".label-required")).toBeNull();
    });

    test("Affiche la tooltip uniquement quand un commentaire et showTooltip sont fournis", () => {
        const {container, rerender} = render(
            <Label comment="form.tooltip" label="form.name" showTooltip theme={labelTheme} />
        );
        expect(container.querySelector(".label-icon")).toBeTruthy();

        rerender(<Label comment="form.tooltip" label="form.name" theme={labelTheme} />);
        expect(container.querySelector(".label-icon")).toBeNull();

        rerender(<Label label="form.name" showTooltip theme={labelTheme} />);
        expect(container.querySelector(".label-icon")).toBeNull();
    });

    test("Utilise un IconButton (bouton) quand onTooltipClick est fourni", () => {
        const onTooltipClick = vi.fn();
        render(
            <Label
                comment="form.tooltip"
                label="form.name"
                onTooltipClick={onTooltipClick}
                showTooltip
                theme={labelTheme}
            />
        );

        expect(screen.queryByRole("button")).toBeTruthy();
    });

    test("Utilise un FontIcon (pas de bouton) quand onTooltipClick n'est pas fourni", () => {
        render(<Label comment="form.tooltip" label="form.name" showTooltip theme={labelTheme} />);

        expect(screen.queryByRole("button")).toBeNull();
    });

    test("Marque le libellé en erreur uniquement quand edit et error sont présents", () => {
        const {container, rerender} = render(<Label edit error="Champ requis" label="form.name" theme={labelTheme} />);
        expect(container.firstElementChild?.className).toContain("label-error");

        rerender(<Label error="Champ requis" label="form.name" theme={labelTheme} />);
        expect(container.firstElementChild?.className).not.toContain("label-error");

        rerender(<Label edit label="form.name" theme={labelTheme} />);
        expect(container.firstElementChild?.className).not.toContain("label-error");
    });
});
