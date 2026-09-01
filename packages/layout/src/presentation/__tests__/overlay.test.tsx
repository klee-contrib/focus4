import {renderWithTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, screen} from "@testing-library/react";
import {useContext, useState} from "react";
import {describe, expect, test, vi} from "vitest";

import {OverlayContext} from "../../utils/contexts";
import {Overlay, OverlayProvider, useOverlay} from "../overlay";

setupComponentTest();

const theme = {
    enter: "enter",
    enterActive: "enter-active",
    exit: "exit",
    exitActive: "exit-active",
    overlay: "overlay"
};

function OverlayConsumer({close}: {close: () => void}) {
    const [active, setActive] = useState(false);
    useOverlay(active, close);

    return (
        <>
            <button type="button" onClick={() => setActive(value => !value)}>
                toggle
            </button>
            <Overlay active={active} close={close} theme={theme} />
        </>
    );
}

describe("Overlay", () => {
    test("affiche et ferme un overlay actif", () => {
        const close = vi.fn();
        renderWithTheme(
            <OverlayProvider>
                <OverlayConsumer close={close} />
            </OverlayProvider>
        );

        const toggle = screen.getByRole("button", {name: "toggle"});
        fireEvent.click(toggle);
        expect(toggle.tagName).toBe("BUTTON");
        fireEvent.click(toggle);
        expect(screen.queryByRole("button", {name: "toggle"})).toBe(toggle);
    });

    test("ferme le dernier overlay enregistré", () => {
        const close = vi.fn();
        function Controls() {
            useOverlay(true, close, true);
            const {close: closeTopOverlay} = useContext(OverlayContext);
            return (
                <button type="button" onClick={closeTopOverlay}>
                    close
                </button>
            );
        }

        renderWithTheme(
            <OverlayProvider>
                <Controls />
            </OverlayProvider>
        );

        fireEvent.click(screen.getByRole("button", {name: "close"}));
        expect(close).toHaveBeenCalledOnce();
    });
});
