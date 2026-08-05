import {render} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {FontIcon} from "../font-icon";

describe("FontIcon component", () => {
    setupComponentTest({
        "custom.icon": {
            name: "star",
            className: "custom-font"
        }
    });

    test("Rend le nom de l'icône passé en children", () => {
        const {container} = render(<FontIcon>arrow_drop_down</FontIcon>);

        const span = container.querySelector("span")!;
        expect(span.textContent).toBe("arrow_drop_down");
        expect(span.className).toContain("material-symbols-outlined");
    });

    test("Rend le nom via la prop icon quand elle est une chaîne", () => {
        const {container} = render(<FontIcon icon="menu" />);

        expect(container.querySelector("span")?.textContent).toBe("menu");
    });

    test("Utilise className et name quand icon est un objet", () => {
        const {container} = render(<FontIcon icon={{className: "fa", name: "check"}} />);

        const span = container.querySelector("span")!;
        expect(span.className).toContain("fa");
        expect(span.textContent).toBe("check");
    });

    test("Remplace {name} dans iconClassName au lieu de rendre le nom en enfant", () => {
        const {container} = render(<FontIcon icon={{className: "icon-{name}", name: "save"}} />);

        const span = container.querySelector("span")!;
        expect(span.className).toContain("icon-save");
        // Quand la classe est un template, le nom n'est pas posé comme enfant.
        expect(span.textContent).toBe("");
    });

    test("Résout icon via une clé i18n", () => {
        const {container} = render(<FontIcon icon={{i18nKey: "custom.icon"}} />);

        const span = container.querySelector("span")!;
        expect(span.textContent).toBe("star");
        expect(span.className).toContain("custom-font");
    });

    test("Pose alt comme aria-label", () => {
        const {container} = render(<FontIcon alt="Icône Sauvegarder" icon="save" />);

        expect(container.querySelector("span")?.getAttribute("aria-label")).toBe("Icône Sauvegarder");
    });
});
