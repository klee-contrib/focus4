import {cleanup} from "@testing-library/react";
import {afterEach} from "vitest";

afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
});
