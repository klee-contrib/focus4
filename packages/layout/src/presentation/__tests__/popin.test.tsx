import {renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen, waitFor} from "@testing-library/react";
import {useState} from "react";
import {describe, expect, test, vi} from "vitest";

import {Popin} from "../popin";
import {Scrollable} from "../scrollable";

setupComponentTest();

const scrollableTheme = {
    backToTop: "scrollable-back-to-top",
    container: "scrollable-container",
    scrollable: "scrollable"
};

const popinTheme = {
    enter: "popin-enter",
    enterActive: "popin-enter-active",
    exit: "popin-exit",
    exitActive: "popin-exit-active",
    popin: "popin"
};

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

function PopinHost() {
    const [opened, setOpened] = useState(true);
    return (
        <>
            <button type="button" onClick={() => setOpened(false)}>
                close
            </button>
            <Popin
                closePopin={() => setOpened(false)}
                opened={opened}
                scrollableTheme={scrollableTheme}
                theme={popinTheme}
                type="from-left"
            >
                <span>popin content</span>
            </Popin>
        </>
    );
}

describe("Popin", () => {
    test("affiche une popin ouverte dans le Scrollable parent", async () => {
        vi.stubGlobal("ResizeObserver", ResizeObserverStub);
        vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
        HTMLElement.prototype.scrollTo ??= () => undefined;
        renderWithTheme(
            <Scrollable theme={scrollableTheme}>
                <PopinHost />
            </Scrollable>
        );

        expect((await screen.findByText("popin content")).textContent).toBe("popin content");
        fireEvent.click(screen.getByRole("button", {name: "close"}));
        await waitFor(() => expect(screen.queryByText("popin content")).not.toBeNull());
    });

    test("n'affiche rien quand la popin est fermée", () => {
        vi.stubGlobal("ResizeObserver", ResizeObserverStub);
        vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
        renderWithTheme(
            <Scrollable theme={scrollableTheme}>
                <Popin closePopin={vi.fn()} opened={false} theme={popinTheme} />
            </Scrollable>
        );

        expect(screen.queryByText("popin content")).toBeNull();
    });
});
