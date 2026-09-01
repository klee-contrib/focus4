import {renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {screen} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {makeRouter, param} from "@focus4/core";

import {i18nLayout} from "../../translation";
import {FilAriane} from "../fil-ariane";

const theme = {container: "breadcrumb", item: "breadcrumb-item", separator: "breadcrumb-separator"};

const routerTranslations = {
    router: {
        root: "Accueil",
        users: {root: "Utilisateurs", id: {root: "Utilisateur {{param}}"}}
    }
};

setupComponentTest({focus: {...i18nLayout.fr, icons: i18nLayout.icons}, ...routerTranslations});

describe("FilAriane", () => {
    test("affiche le chemin de route et résout le paramètre", async () => {
        const router = makeRouter({users: param("id", builder => builder.number())});
        await router.start();
        router.to(route => route("users")(12));

        renderWithTheme(<FilAriane router={router} theme={theme} paramResolver={(_, value) => `#${value}`} />);

        expect(["Utilisateurs", "Utilisateur #12"].map(text => screen.getByText(text).textContent)).toEqual([
            "Utilisateurs",
            "Utilisateur #12"
        ]);
        expect(screen.getAllByText("keyboard_arrow_right")).toHaveLength(1);
    });

    test("affiche la racine quand aucune route n'est active", async () => {
        const router = makeRouter({users: {}});
        await router.start();

        renderWithTheme(<FilAriane router={router} theme={theme} />);

        expect(screen.getByText("Accueil").textContent).toBe("Accueil");
        expect(screen.queryByText("keyboard_arrow_right")).toBeNull();
    });

    test("respecte la profondeur maximale et masque les libellés vides", async () => {
        const router = makeRouter({users: param("id", builder => builder.string())});
        await router.start();
        router.to(route => route("users")("abc"));

        renderWithTheme(<FilAriane maxDepth={1} router={router} theme={theme} />);

        expect(screen.queryByRole("link")).toBeNull();
        expect(screen.getByText("Utilisateurs").textContent).toBe("Utilisateurs");
    });

    test("gère une route objet et une profondeur nulle", async () => {
        const router = makeRouter({users: {}});
        await router.start();
        router.to(route => route("users"));

        renderWithTheme(<FilAriane router={router} theme={theme} />);
        expect(screen.getByText("Utilisateurs").textContent).toBe("Utilisateurs");
        expect(screen.queryByRole("link")).toBeNull();

        const emptyRouter = makeRouter({users: {}});
        await emptyRouter.start();
        renderWithTheme(<FilAriane maxDepth={0} router={emptyRouter} theme={theme} />);
        expect(screen.queryByText("Accueil")).toBeNull();
    });

    test("utilise la valeur du paramètre si le resolver ne renvoie rien", async () => {
        const router = makeRouter({users: param("id", builder => builder.number())});
        await router.start();
        router.to(route => route("users")(7));

        renderWithTheme(<FilAriane paramResolver={() => undefined} router={router} theme={theme} />);
        expect(screen.getByText("Utilisateur 7").textContent).toBe("Utilisateur 7");
    });
});
