export function fillObject(dest, src) {
    for (let key in src) {
        if (!dest.hasOwnProperty(key)) {
            dest[key] = src[key];
        }
    }
    return dest;
}
