import test from 'tap';
import os from 'os';
import fs from 'fs';

function almostEqual(value, expected, epsilon = 0.0000000000000001) {
    if (value === expected) {
        return 2;
    }
    const d = Math.abs(value - expected);
    if (d <= epsilon) {
        return 1;
    }
    return 0;
}

function isNumber(val) {
    return typeof val == 'number';
}

function checkClose(t, a, b, epsilon = 0.0000001, message, extra) {
    const v = almostEqual(a, b, epsilon);
    if (v < 1) {
        t.fail(`${a} not close to ${b}`, {
            ...t.context.extra,
            epsilon: epsilon,
            delta: Math.abs(a - b),
        });
    } else if (v > 1) {
        t.pass(`${a} same as ${b} ±${epsilon}`);
    } else {
        t.pass(`${a} close to ${b} ±${epsilon}`);
    }
}

test.Test.prototype.addAssert('sameBox', 3, function (box1, box2, epsilon = 0.0001, message, extra) {
    if (box1.bbox) {
        const {left, right, top, bottom} = box1.bbox();
        box1 = [left, right, top, bottom];
    }
    // console.error(box1, box2);
    for (const [i, k] of [`left`, `right`, `top`, `bottom`]) {
        if (!almostEqual(box1[i], box2[i], epsilon)) {
            this.fail(`Box ${k} ${box1[i]} not close to ${box2[i]} ${box1[i] - box2[i]}Δ ±${epsilon} : ${message}`);
            // this.end();
            return;
        }
    }
    this.pass(`Box ${box1} close to ${box2} ±${epsilon}`);
    // this.end();
});
test.Test.prototype.addAssert('almostEqual', 3, function (A, B, opt, message, extra) {
    opt = typeof opt == 'number' ? {epsilon: opt} : opt;
    const epsilon = opt?.epsilon || 1e-13;
    // console.error(Array.from(arguments));
    if (!Array.isArray(A)) {
        A = [A];
    }

    if (!Array.isArray(B)) {
        B = [B];
    }
    // console.error(A, B);

    const n = Math.max(A.length, B.length);
    let v,
        a,
        b,
        i = 0;
    for (; i < n; ++i) {
        a = A[i];
        b = B[i];
        v = almostEqual(a, b, epsilon);
        if (v < 1) {
            opt?.on_fail?.();
            this.fail(`<${a}> not close to <${b}> ${a - b}Δ @${i} ±${epsilon} ${message}`, extra);
            return;
        }
    }
    if (i > 1) {
        this.pass(`${A} same as ${B} ±${epsilon}`);
    } else if (i > 0) {
        if (v > 1) {
            this.pass(`${a} same as ${b} ±${epsilon}`);
        } else {
            this.pass(`${a} close to ${b} ±${epsilon}`);
        }
    } else {
        opt?.on_fail?.();

        this.fail(` nothing to compare close to ${A} ${B} ±${epsilon} ${message}`, extra);
    }
});

// <path d="M10 10"/>

function dbgwrite(dbg, pC, pX) {
    function* gen() {
        let style;
        yield `<svg xmlns="http://www.w3.org/2000/svg">`;
        if (dbg.path_source) {
            style = 'fill:yellow;stroke:orange;stroke-width:4;stroke-dasharray:none;opacity:0.6';

            yield `<path id="source" d="${dbg.path_source}" style="${style}"/>`;
            style = 'fill:skyblue;stroke:blue;stroke-width:4;stroke-dasharray:none;opacity:0.6';

            if (dbg.path_transform) {
                yield `<path id="transformed" d="${dbg.path_source}" transform="${dbg.path_transform}" style="${style}"/>`;
            }
        }
        style = 'fill:firebrick;stroke:red;stroke-width:2;stroke-dasharray:none;opacity:0.6';

        yield `<path id="calculated" d="${pC.join(' ')}" style="${style}"/>`;
        style = 'fill:palegreen;stroke:green;stroke-width:1;stroke-dasharray:none;opacity:0.6';
        yield `<path id="expected" d="${pX.join(' ')}" style="${style}"/>`;
        yield `</svg>`;
    }
    const file = os.tmpdir() + '/' + 'test.svg';
    fs.writeFileSync(file, Array.from(gen()).join(''));
}
function zip() {
    var args = [].slice.call(arguments);
    var shortest =
        args.length == 0
            ? []
            : args.reduce(function (a, b) {
                  return a.length < b.length ? a : b;
              });

    return shortest.map(function (_, i) {
        return args.map(function (array) {
            return array[i];
        });
    });
}
test.Test.prototype.addAssert('sameDescs', 3, function (a, b, opt, message, extra = {}, debug_svg = null) {
    opt = typeof opt == 'number' ? {epsilon: opt} : opt;
    const epsilon = opt?.epsilon || 1e-13;

    if (a.length !== b.length) {
        a = a.filter(v => !/[Zz]/.test(v));
        b = b.filter(v => !/[Zz]/.test(v));
        if (a.length !== b.length) {
            extra.desc1 = a.join(' ');
            extra.desc2 = b.join(' ');
            if (opt.write_svg) {
                dbgwrite(opt, a, b);
            }
            return this.fail(`desc len not same "${message}"`, extra);
        }
    }
    const n = a.length;
    let c; // last command index
    for (let i = 0; i < n; i++) {
        const A = a[i];
        const B = b[i];
        if (!isNumber(A)) {
            c = i;
        }
        if (A == B) {
            continue;
        } else if (isNumber(A) && isNumber(B)) {
            const d = Math.abs(A - B);
            if (d <= epsilon) {
                continue;
            } else {
                if (i - 3 >= 0) {
                    const x = a[i - 3];
                    if (x == 'a' || x == 'A') {
                        if (a[i - 2] === a[i - 1]) {
                            // phi is irrelevant if rx == ry
                            continue;
                        } else if (((A % 360) + 360) % 360 === ((B % 360) + 360) % 360) {
                            continue;
                        }
                    }
                }
                extra.desc1 = a.join(' ');
                extra.desc2 = b.join(' ');
                extra.descz = zip(a, b).map(v =>
                    v[0] == v[1] || (isNumber(v[0]) && isNumber(v[1]) && Math.abs(v[0] - v[1]) <= epsilon) ? v[0] : v
                );

                if (opt.write_svg) {
                    dbgwrite(opt, a, b);
                }

                return this.fail(`item #${i} ${d}Δ [${A}, ${B}] ±${epsilon} "${message}"`, extra);
            }
        }
        extra.desc1 = a.join(' ');
        extra.desc2 = b.join(' ');
        if (opt.write_svg) {
            dbgwrite(opt, a, b);
        }

        return this.fail(`item #${i} "${message}"`, extra);
    }
    return this.pass(`Same descs ${message}`);
});

test.Test.prototype.addAssert('sameTangent', 3, function (a, b, epsilon, message, extra = {}) {
    let delta_epsilon, slope_epsilon;
    if (!epsilon) {
        delta_epsilon = 1e-11;
        slope_epsilon = 1e-11;
    } else if (typeof epsilon == 'number') {
        delta_epsilon = epsilon;
        slope_epsilon = epsilon;
    } else {
        ({delta_epsilon = 1e-11, slope_epsilon = 1e-11} = epsilon);
    }

    if (a[0] === b[0]) {
        if (a[1] === b[1]) {
            return this.pass(`Tangent Equal ${a} === ${b}`);
        } else if (a[0] == 0) {
            return this.pass(`Tangent Horizontal ${a} ${b}`);
        } else if (!almostEqual(a[1], b[1], delta_epsilon)) {
            return this.fail(`Tangent @y ${a[1]} not close to ${b[1]} ${a[1] - b[1]}Δ ±${delta_epsilon} : ${message}`, extra);
        }
    } else if (a[1] === b[1]) {
        if (a[1] == 0) {
            return this.pass(`Tangent Vertical ${a} ${b}`);
        } else if (!almostEqual(a[0], b[0], delta_epsilon)) {
            return this.fail(`Tangent @x ${a[0]} not close to ${b[0]} ${a[0] - b[0]}Δ ±${delta_epsilon} : ${message}`, extra);
        }
    } else {
        if (almostEqual(a[1], b[1], 1e-12)) {
            if (almostEqual(a[1], 0, 1e-12)) {
                if (b[0] && a[0] && Math.sign(b[0]) == Math.sign(a[0])) {
                    return this.pass(`Tangent almost horizontal ${a} === ${b}`);
                }
            }
        }

        let A = a[0] / a[1];
        let B = b[0] / b[1];

        if (almostEqual(A, B, slope_epsilon)) {
            return this.pass(`Same Tangent x/y ${a}, ${b} ${message}`);
        }

        A = a[1] / a[0];
        B = b[1] / b[0];

        if (almostEqual(A, B, slope_epsilon)) {
            return this.pass(`Same Tangent y/x ${a}, ${b} ${message}`);
        }

        if (!almostEqual(A, B, slope_epsilon)) {
            return this.fail(
                `Tangent / ${A} not close to ${B} ${A - B}Δ ±${slope_epsilon}  [${a}], [${b}], Δ[${a[0] - b[0]}, ${
                    a[1] - b[1]
                }] : ${message}`,
                extra
            );
        }
    }
    return this.pass(`Same Tangent ${a}, ${b} ${message}`);
});

test.Test.prototype.addAssert('throwsRE', 2, function (fn, re, message, extra = {}) {
    try {
        fn();
    } catch (err) {
        if (err.message.search(re) < 0) {
            return this.fail(`Error message not match ${re}: ${err.message}`);
        }
        return this.pass(`Error message matches ${re}: ${err.message}`);
    }
    return this.fail(`Did not throw`, extra);
});
