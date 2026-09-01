import {setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {Layout} from "../focus4.layout";

setupComponentTest();

class ResizeObserverStub {
    disconnect() {
        return undefined;
    }
    observe() {
        return undefined;
    }
}

class IntersectionObserverStub {
    disconnect() {
        return undefined;
    }
    observe() {
        return undefined;
    }
    unobserve() {
        return undefined;
    }
}

describe("Layout", () => {
    test("rend le contenu dans le layout racine", () => {
        vi.stubGlobal("ResizeObserver", ResizeObserverStub);
        vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
        HTMLElement.prototype.scrollTo ??= () => undefined;
        render(
            <Layout
                appTheme={{
                    layout: {layout: "layout", scrollable: "layout-scrollable"},
                    scrollable: {container: "scrollable-container", scrollable: "scrollable"}
                }}
            >
                <span>contenu</span>
            </Layout>
        );

        expect(screen.getByText("contenu").textContent).toBe("contenu");
    });
});
