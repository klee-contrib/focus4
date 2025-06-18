/** Merges passed themes by concatenating string keys */
export function themeable<T extends {}>(...themes: T[]) {
    return themes.reduce(merge, {}) as T;
}

function merge<T extends {[key: string]: string}>(original = {} as T, mixin = {} as T) {
    /*
     * Make a copy to avoid mutations of nested objects
     * also strip all functions injected by isomorphic-style-loader
     */
    const result = Object.keys(original).reduce(
        (acc, key) => {
            const value = original[key];
            if (typeof value !== "function") {
                acc[key] = value;
            }
            return acc;
        },
        {} as {[key: string]: string}
    );

    // Traverse mixin keys and merge them to resulting theme
    for (const key in mixin) {
        // There's no need to set any defaults here
        const originalValue = result[key];
        const mixinValue = mixin[key];

        switch (typeof mixinValue) {
            case "undefined": // Fallthrough - handles accidentally unset values which may come from props
            case "function":
                // This handles issue when isomorphic-style-loader addes helper functions to css-module
                break; // Just skip

            default:
                // Plain values
                switch (typeof originalValue) {
                    case "undefined":
                        // Mixin key is new to original theme - take it as is
                        result[key] = mixinValue;
                        break;

                    case "function":
                        // This handles issue when isomorphic-style-loader addes helper functions to css-module
                        break; // Just skip

                    default:
                        // Finally we can merge
                        result[key] = [...originalValue.split(" "), ...mixinValue.split(" ")]
                            .filter((item, pos, self) => self.indexOf(item) === pos && item !== "")
                            .join(" ");
                        break;
                }
                break;
        }
    }

    return result;
}
