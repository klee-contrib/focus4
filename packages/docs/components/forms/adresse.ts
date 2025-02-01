import {uniqBy} from "es-toolkit";

export async function searchAdresse(query: string): Promise<{key: string; label: string}[]> {
    if (query.length < 3) {
        return [];
    }
    const response = await fetch(
        `https://corsproxy.io/?https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=10`
    );
    const json = await response.json();
    return uniqBy(
        (json.features ?? [])
            .map((adr: any) => adr.properties)
            .map(({id, label}: any) => ({
                key: id,
                label
            })),
        p => p.key
    );
}
