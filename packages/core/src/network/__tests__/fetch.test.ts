import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";

import {downloadFile} from "../fetch";

describe("downloadFile", () => {
    const createObjectURL = vi.fn(() => "blob:test-url");
    const revokeObjectURL = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(URL, "createObjectURL").mockImplementation(createObjectURL);
        vi.spyOn(URL, "revokeObjectURL").mockImplementation(revokeObjectURL);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        document.body.innerHTML = "";
    });

    test("télécharge avec le nom extrait de content-disposition", async () => {
        const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

        const response = new Response(new Blob(["content"]), {
            headers: {
                "content-disposition": "attachment; filename*=UTF-8''mon%20fichier.txt"
            }
        });

        await downloadFile(response);

        expect(createObjectURL).toHaveBeenCalledTimes(1);
        expect(clickSpy).toHaveBeenCalledTimes(1);

        const anchor = document.querySelector("a")!;
        expect(anchor).toBeInstanceOf(HTMLAnchorElement);
        expect(anchor.href).toBe("blob:test-url");
        expect(anchor.download).toBe("mon fichier.txt");

        vi.advanceTimersByTime(100);

        expect(document.querySelector("a")).toBeNull();
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:test-url");
    });

    test("utilise le nom par défaut quand le header est absent", async () => {
        vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

        const response = new Response(new Blob(["content"]));

        await downloadFile(response);

        const anchor = document.querySelector("a")!;
        expect(anchor).toBeInstanceOf(HTMLAnchorElement);
        expect(anchor.download).toBe("file");
    });
});
