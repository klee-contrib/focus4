/** Merges passed themes by concatenating string keys */
export function themeable<T extends {}>(...themes: T[]) {
    return themes.reduce(merge, {}) as T;
}

function merge<T extends {[key: string]: string}>(original = {} as T, mixin = {} as T) {
    // make a copy to avoid mutations of nested objects
    // also strip all functions injected by isomorphic-style-loader
    const result = Object.keys(original).reduce((acc, key) => {
        const value = original[key];
        if (typeof value !== "function") {
            acc[key] = value;
        }
        return acc;
    }, {} as {[key: string]: string});

    // traverse mixin keys and merge them to resulting theme
    Object.keys(mixin).forEach(key => {
        // there's no need to set any defaults here
        const originalValue = result[key];
        const mixinValue = mixin[key];

        switch (typeof mixinValue) {
            case "undefined": // fallthrough - handles accidentally unset values which may come from props
            case "function": {
                // this handles issue when isomorphic-style-loader addes helper functions to css-module
                break; // just skip
            }

            default: {
                // plain values
                switch (typeof originalValue) {
                    case "undefined": {
                        // mixin key is new to original theme - take it as is
                        result[key] = mixinValue;
                        break;
                    }
                    case "function": {
                        // this handles issue when isomorphic-style-loader addes helper functions to css-module
                        break; // just skip
                    }

                    default: {
                        // finally we can merge
                        result[key] = originalValue
                            .split(" ")
                            .concat(mixinValue.split(" "))
                            .filter((item, pos, self) => self.indexOf(item) === pos && item !== "")
                            .join(" ");
                        break;
                    }
                }
                break;
            }
        }
    });

    return result;
}
