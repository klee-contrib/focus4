import {useEffect, useState} from "react";

export function useLoaded(disabled?: boolean, value?: boolean) {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        if (value !== undefined) {
            setLoaded(true);
        }
    }, [value, disabled]);
    return loaded;
}
