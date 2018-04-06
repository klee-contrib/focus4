import {observable} from "mobx";

/** Classe permettant de définir un ersatz observable de `document.activeElement`. */
export class DocumentHelper {

    @observable
    private _activeElement!: Element | null;

    // Clairement, on triche pas mal, mais il se trouve que ces évènements-là font parfaitement le boulot attendu.
    constructor() {
        window.addEventListener("focusin", () => this._activeElement = document.activeElement);
        window.addEventListener("mousedown", e => this._activeElement = e.srcElement);
    }

    /** `document.activeElement` (ou presque), observable. */
    get activeElement() {
        return this._activeElement;
    }

    /** Vérifie si l'élement actif est contenu dans l'élément demandé (ce qui rend ce même élément actif). */
    isElementActive(element?: Element) {
        if (element) {
            return !!Array.from(element.querySelectorAll("*"))
                .find(child => child === this._activeElement);
        } else  {
            return false;
        }
    }
}

/** Singleton du `DocumentHelper` */
export const documentHelper = new DocumentHelper();
