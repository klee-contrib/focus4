import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import z from "zod";

import {makeReferenceList} from "@focus4/stores";

import {setupComponentTest} from "../../__tests__/test-utils";
import {Select} from "../select";

const selectTheme = {
    dropdown: "dropdown-root",
    field: "supporting-field"
};

function refs() {
    return makeReferenceList([
        {code: "A", label: "ref.a"},
        {code: "B", label: "ref.b"}
    ]);
}

describe("Select component", () => {
    setupComponentTest({
        "ref.a": "Alpha",
        "ref.b": "Beta",
        "focus.select.unselected": "Non renseigné"
    });

    test("Affiche le libellé traduit de la valeur sélectionnée", () => {
        const {container} = render(
            <Select onChange={() => undefined} schema={z.string()} theme={selectTheme} value="A" values={refs()} />
        );

        expect(container.textContent).toContain("Alpha");
    });

    test("data-value contient la clé brute de la valeur sélectionnée", () => {
        const {container} = render(
            <Select onChange={() => undefined} schema={z.string()} theme={selectTheme} value="B" values={refs()} />
        );

        expect(container.querySelector("[data-value='B']")).not.toBeNull();
    });

    test("Rend une option par valeur de référence sans hasUndefined", () => {
        render(
            <Select
                hasUndefined={false}
                onChange={() => undefined}
                schema={z.string()}
                theme={selectTheme}
                values={refs()}
            />
        );

        expect(screen.getAllByRole("option")).toHaveLength(2);
    });

    test("Appelle onChange avec la clé de l'option cliquée", () => {
        const onChange = vi.fn();
        render(<Select onChange={onChange} schema={z.string()} theme={selectTheme} values={refs()} />);

        fireEvent.click(screen.getByRole("option", {name: "Beta"}));

        expect(onChange).toHaveBeenCalledWith("B");
    });

    test("Appelle onChange avec undefined quand on clique sur l'option de désélection", () => {
        const onChange = vi.fn();
        render(
            <Select
                hasUndefined
                onChange={onChange}
                schema={z.string()}
                theme={selectTheme}
                value="A"
                values={refs()}
            />
        );

        fireEvent.click(screen.getByRole("option", {name: "Non renseigné"}));

        expect(onChange).toHaveBeenCalledWith(undefined);
    });

    test("Utilise l'undefinedLabel personnalisé", () => {
        const {container} = render(
            <Select
                onChange={() => undefined}
                schema={z.string()}
                theme={selectTheme}
                undefinedLabel="Aucun"
                value={undefined}
                values={refs()}
            />
        );

        expect(container.textContent).toContain("Aucun");
    });

    test("Affiche l'erreur en supportingText", () => {
        render(
            <Select error="Requis" onChange={() => undefined} schema={z.string()} theme={selectTheme} values={refs()} />
        );

        expect(screen.getByText("Requis")).toBeTruthy();
    });

    test("Ajoute aria-disabled quand disabled=true", () => {
        const {container} = render(
            <Select disabled onChange={() => undefined} schema={z.string()} theme={selectTheme} values={refs()} />
        );

        expect(container.querySelector("[aria-disabled='true']")).not.toBeNull();
    });

    test("disabled sous forme de liste ne désactive pas le champ global", () => {
        const {container} = render(
            <Select
                disabled={["A"]}
                onChange={() => undefined}
                schema={z.string()}
                theme={selectTheme}
                values={refs()}
            />
        );

        expect(container.querySelector("[aria-disabled='true']")).toBeNull();
    });
});
