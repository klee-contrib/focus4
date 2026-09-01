import {renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {screen} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {makeLocalCollectionStore} from "@focus4/stores";

import {Results} from "..";

describe("Results", () => {
    setupComponentTest();

    test("affiche la liste injectée lorsqu'il n'y a pas de groupes", () => {
        const store = makeLocalCollectionStore<{name: string}>();
        store.list = [{name: "Alpha"}];

        renderWithTheme(
            <Results
                ListComponent={() => <div data-testid="result-list">results</div>}
                listProps={{itemKey: item => item.name}}
                store={store}
            />
        );

        expect(screen.getByTestId("result-list").textContent).toBe("results");
    });
});
