import {render} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {SupportingText} from "../supporting-text";

const supportingTextTheme = {
    supportingText: "st"
};

describe("SupportingText component", () => {
    setupComponentTest();

    test("Affiche le texte quand supportingText est renseigné", () => {
        const {container} = render(<SupportingText supportingText="Champ obligatoire" theme={supportingTextTheme} />);

        expect(container.textContent).toContain("Champ obligatoire");
    });

    test("N'affiche rien par défaut quand pas de supportingText ni maxLength", () => {
        const {container} = render(<SupportingText theme={supportingTextTheme} />);

        expect(container.querySelector("div")).toBeNull();
    });

    test("Affiche le compteur length/maxLength quand maxLength est renseigné", () => {
        const {container} = render(<SupportingText length={4} maxLength={10} theme={supportingTextTheme} />);

        expect(container.textContent).toContain("4/10");
    });

    test("Affiche 0/maxLength quand length n'est pas fourni", () => {
        const {container} = render(<SupportingText maxLength={5} theme={supportingTextTheme} />);

        expect(container.textContent).toContain("0/5");
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
        const {container} = render(<SupportingText id="my" supportingText="txt" theme={supportingTextTheme} />);

        expect(container.querySelector("#my-st")).not.toBeNull();
    });
});
