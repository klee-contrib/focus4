import {fireEvent, render} from "@testing-library/react";
import {useRef} from "react";
import {describe, expect, test} from "vitest";

import {useStickyClip} from "../sticky-clip";

function Fixture({sticky}: {sticky: boolean}) {
    const ref = useRef<HTMLDivElement>(null);
    useStickyClip(ref);
    return (
        <div style={{overflowY: "auto"}}>
            <div style={{position: sticky ? "sticky" : "static"}} />
            <div ref={ref} />
        </div>
    );
}

describe("useStickyClip", () => {
    test("calcule le clip et le recalcule au scroll du parent", () => {
        const {container, unmount} = render(<Fixture sticky />);
        const parent = container.firstElementChild as HTMLElement;
        const sticky = parent.children[0] as HTMLElement;
        const content = parent.children[1] as HTMLElement;
        Object.defineProperties(sticky, {offsetTop: {value: 10}, clientHeight: {value: 20}});
        Object.defineProperty(content, "offsetTop", {value: 5});

        fireEvent.scroll(parent);
        expect(content.style.clipPath).toBe("inset(25px 0 0)");
        unmount();
        fireEvent.scroll(parent);
    });

    test("ne fait rien si l'élément précédent n'est pas sticky", () => {
        const {container} = render(<Fixture sticky={false} />);
        const content = container.firstElementChild?.children[1] as HTMLElement;
        expect(content.style.clipPath).toBe("");
    });
});
