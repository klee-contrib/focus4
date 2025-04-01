function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function _compilePattern(pattern: string) {
    let regexpSource = "";
    const paramNames = [];
    const tokens = [];

    let lastIndex = 0;
    let m;
    const matcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|\*\*|\*|\(|\)/g;
    while ((m = matcher.exec(pattern))) {
        if (m.index !== lastIndex) {
            tokens.push(pattern.slice(lastIndex, m.index));
            regexpSource += escapeRegExp(pattern.slice(lastIndex, m.index));
        }

        if (m[1]) {
            regexpSource += "([^/]+)";
            paramNames.push(m[1]);
        } else if (m[0] === "**") {
            regexpSource += "(.*)";
            paramNames.push("splat");
        } else if (m[0] === "*") {
            regexpSource += "(.*?)";
            paramNames.push("splat");
        } else if (m[0] === "(") {
            regexpSource += "(?:";
        } else if (m[0] === ")") {
            regexpSource += ")?";
        }

        tokens.push(m[0]);

        // eslint-disable-next-line @typescript-eslint/prefer-destructuring
        lastIndex = matcher.lastIndex;
    }

    if (lastIndex !== pattern.length) {
        tokens.push(pattern.slice(lastIndex, pattern.length));
        regexpSource += escapeRegExp(pattern.slice(lastIndex, pattern.length));
    }

    return {
        pattern,
        regexpSource,
        paramNames,
        tokens
    };
}

const CompiledPatternsCache = Object.create(null);

function compilePattern(pattern: string) {
    CompiledPatternsCache[pattern] ??= _compilePattern(pattern);
    return CompiledPatternsCache[pattern];
}

/**
 * If you have a `:paramName` you get an object {paramName:value}
 *
 * The last * or ** match is stored into `splat`
 *
 */
export interface MatchResultParams {
    splat: string;
    [paramName: string]: string;
}

export interface MatchResult {
    remainingPath: string;
    params: MatchResultParams;
}

/**
 * Attempts to match a pattern on the given pathname. Patterns may use
 * the following special characters:
 *
 * - :paramName     Matches a URL segment up to the next /, ?, or #. The
 *                  captured string is considered a "param"
 * - ()             Wraps a segment of the URL that is optional
 * - *              Consumes (non-greedy) all characters up to the next
 *                  character in the pattern, or to the end of the URL if
 *                  there is none
 * - **             Consumes (greedy) all characters up to the next character
 *                  in the pattern, or to the end of the URL if there is none
 */
export function match({pattern, path}: {pattern: string; path: string}): MatchResult | null {
    // Ensure pattern starts with leading slash for consistency with pathname.
    if (!pattern.startsWith("/")) {
        pattern = `/${pattern}`;
    }
    let {regexpSource} = compilePattern(pattern);
    const {paramNames, tokens} = compilePattern(pattern);

    if (!pattern.endsWith("/")) {
        regexpSource += "/?"; // Allow optional path separator at end.
    }

    // Special-case patterns like '*' for catch-all routes.
    if (tokens[tokens.length - 1] === "*") {
        regexpSource += "$";
    }

    const m = new RegExp(`^${regexpSource}`, "i").exec(path);
    if (!m) {
        return null;
    }

    const matchedPath = m[0];
    let remainingPath = path.substring(matchedPath.length);

    if (remainingPath) {
        /*
         * Require that the match ends at a path separator, if we didn't match
         * the full path, so any remaining pathname is a new path segment.
         */
        if (!matchedPath.endsWith("/")) {
            return null;
        }

        /*
         * If there is a remaining pathname, treat the path separator as part of
         * the remaining pathname for properly continuing the match.
         */
        remainingPath = `/${remainingPath}`;
    }

    /**
     * Compose the param names and values into an object
     */
    const paramValues: string[] = m.slice(1).map(v => v && decodeURIComponent(v));
    const params: any = {};
    paramNames.forEach((paramName: string, index: number) => {
        params[paramName] = paramValues[index];
    });

    return {
        remainingPath,
        params
    };
}
