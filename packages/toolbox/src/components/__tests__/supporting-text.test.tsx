import {render, screen} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {SupportingText} from "../supporting-text";

const supportingTextTheme = {
    supportingText: "st"
};

describe("SupportingText component", () => {
    setupComponentTest();

    test("Affiche le texte quand supportingText est renseigné", () => {
        render(<SupportingText supportingText="Champ obligatoire" theme={supportingTextTheme} />);

        expect(screen.getByText("Champ obligatoire").textContent).toBe("Champ obligatoire");
    });

    test("N'affiche rien par défaut quand pas de supportingText ni maxLength", () => {
        const {container} = render(<SupportingText theme={supportingTextTheme} />);

        expect(container.querySelector("div")).toBeNull();
    });

    test.each([
        {expected: "4/10", length: 4, maxLength: 10},
        {expected: "0/5", length: undefined, maxLength: 5}
    ])("Affiche le compteur $expected", ({expected, length, maxLength}) => {
        render(<SupportingText length={length} maxLength={maxLength} theme={supportingTextTheme} />);

        expect(screen.getByText(expected).textContent).toBe(expected);
    });

    test("showSupportingText='always' force l'affichage même sans contenu", () => {
        const {container} = render(<SupportingText showSupportingText="always" theme={supportingTextTheme} />);

        expect(container.querySelector("div")).not.toBeNull();
    });

    test("showSupportingText='never' masque l'affichage même si supportingText est renseigné", () => {
        const {container} = render(
            <SupportingText showSupportingText="never" supportingText="ignoré" theme={supportingTextTheme} />
        );

        expect(container.querySelector("div")).toBeNull();
    });

    test("Utilise l'id pour construire l'id du sous-élément", () => {
        render(<SupportingText id="my" supportingText="txt" theme={supportingTextTheme} />);

        expect(screen.getByText("txt").id).toBe("my-st");
    });
});
