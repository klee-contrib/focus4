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
        render(<Label label="form.name" theme={labelTheme} />);

        expect(screen.getByText("Nom")).toBeInstanceOf(HTMLLabelElement);
    });

    test("Affiche une chaîne vide quand aucun libellé n'est fourni", () => {
        const {container} = render(<Label theme={labelTheme} />);

        const labels = container.querySelectorAll("label");
        expect(labels).toHaveLength(1);
        expect(labels.item(0).textContent).toBe("");
    });

    test.each([
        {edit: true, expectedFor: "my-id"},
        {edit: false, expectedFor: ""}
    ])("Associe le champ en édition : $edit", ({edit, expectedFor}) => {
        render(<Label edit={edit} id="my-id" label="form.name" theme={labelTheme} />);

        expect((screen.getByText("Nom") as HTMLLabelElement).htmlFor).toBe(expectedFor);
    });

    test.each([
        {edit: true, required: true, visible: true},
        {edit: false, required: true, visible: false},
        {edit: true, required: false, visible: false}
    ])("Affiche le marqueur requis en édition : $edit, required : $required", ({edit, required, visible}) => {
        const {container} = render(<Label edit={edit} label="form.name" required={required} theme={labelTheme} />);

        const markers = container.querySelectorAll(".label-required");
        expect(markers).toHaveLength(Number(visible));
        expect(markers.item(0)?.textContent).toBe(visible ? "*" : undefined);
    });

    test.each([
        {comment: "form.tooltip", showTooltip: true, visible: true},
        {comment: "form.tooltip", showTooltip: false, visible: false},
        {comment: undefined, showTooltip: true, visible: false}
    ])("Affiche la tooltip avec commentaire : $comment, visible : $showTooltip", ({comment, showTooltip, visible}) => {
        const {container} = render(
            <Label comment={comment} label="form.name" showTooltip={showTooltip} theme={labelTheme} />
        );

        expect(container.querySelectorAll(".label-icon")).toHaveLength(Number(visible));
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

        screen.getByRole("button").click();
        expect(onTooltipClick).toHaveBeenCalledOnce();
    });

    test("Utilise un FontIcon (pas de bouton) quand onTooltipClick n'est pas fourni", () => {
        render(<Label comment="form.tooltip" label="form.name" showTooltip theme={labelTheme} />);

        expect(screen.queryByRole("button")).toBeNull();
    });

    test.each([
        {edit: true, error: "Champ requis", invalid: true},
        {edit: false, error: "Champ requis", invalid: false},
        {edit: true, error: undefined, invalid: false}
    ])("Marque le libellé en erreur en édition : $edit, erreur : $error", ({edit, error, invalid}) => {
        const {container} = render(<Label edit={edit} error={error} label="form.name" theme={labelTheme} />);

        expect(container.firstElementChild?.classList.contains("label-error")).toBe(invalid);
    });
});
