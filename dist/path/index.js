export function tCheck(t) {
    if (t > 1) {
        return 1;
    }
    else if (t < 0) {
        return 0;
    }
    return t;
}
export function tNorm(t) {
    if (t < 0) {
        t = 1 + (t % 1);
    }
    else if (t > 1) {
        if (0 == (t = t % 1)) {
            t = 1;
        }
    }
    return t;
}
//# sourceMappingURL=index.js.map