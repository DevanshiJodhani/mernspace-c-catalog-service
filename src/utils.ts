export function mapToObject(map: Map<string, unknown>) {
    const obj: Record<string, unknown> = {};
    for (const [key, value] of map) {
        // todo: fix this type error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        obj[key] = value instanceof Map ? mapToObject(value) : value;
    }
    return obj;
}
