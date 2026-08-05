import {cleanup, render, screen} from "@testing-library/react";
import {useContext} from "react";
import {afterEach, describe, expect, test} from "vitest";

import {Form, FormContext, registerFormComponent} from "../form";

afterEach(() => {
    cleanup();
});

function ContextReader() {
    const context = useContext(FormContext);
    return <span data-testid="context-value">{context.errorDisplay ?? "undefined"}</span>;
}

describe("Form", () => {
    test("passe errorDisplay au contexte et au composant enregistré", () => {
        registerFormComponent(function RegisteredForm(props) {
            return (
                <>
                    <span data-testid="prop-value">{props.errorDisplay ?? "undefined"}</span>
                    <ContextReader />
                </>
            );
        });

        render(<Form errorDisplay="after-focus" />);

        expect(screen.getByTestId("prop-value").textContent).toBe("after-focus");
        expect(screen.getByTestId("context-value").textContent).toBe("after-focus");
    });

    test("laisse errorDisplay indéfini par défaut", () => {
        registerFormComponent(function RegisteredForm(props) {
            return (
                <>
                    <span data-testid="prop-default">{props.errorDisplay ?? "undefined"}</span>
                    <ContextReader />
                </>
            );
        });

        render(<Form />);

        expect(screen.getByTestId("prop-default").textContent).toBe("undefined");
        expect(screen.getByTestId("context-value").textContent).toBe("undefined");
    });
});
