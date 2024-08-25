'uses strict';
import { enum_path_data, testSegment } from './path.utils.js';
import './utils.js';
import { PathLC as PathChain } from 'svggeom';
import test from 'tap';
import os from 'os';
import fs from 'fs';
const { Unit: PathUnit } = PathChain

const CI = !!process.env.CI;
function dbgwrite(name, pC, pX) {
    function* gen() {
        const b = PathChain.parse(pC).bbox().merge(PathChain.parse(pX).bbox());

        let style;
        yield `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${b.left} ${b.top} ${b.width} ${b.height}" width="${b.width}" height="${b.height}">`;
        style = 'fill:firebrick;stroke:red;stroke-width:2;stroke-dasharray:none;fill-opacity:0.3';

        yield `<path id="calculated" d="${pC}" style="${style}"/>`;
        style = 'fill:none;stroke:green;stroke-width:1;stroke-dasharray:3,3;fill-opacity:0.3';
        yield `<path id="expected" d="${pX}" style="${style}"/>`;
        yield `</svg>`;
    }
    const file = os.tmpdir() + '/' + name;
    fs.writeFileSync(file, Array.from(gen()).join(''));
}
let I = 0,
    as_cubic = 0;
const deltp = {
    len_epsilon: 1e-5,
    slope_epsilon: 5e-5,
    point_epsilon: 1.5e-6,
};

for await (const item of enum_path_data({ SEGMENTS: 'Arc' })) {
    ++I;
    const { start, radius, rotation, large_arc, sweep, end } = item;
    const [[sx, sy], [rx, ry], [ex, ey]] = [start, radius, end];

    test.test(`PathU<${item.d}>`, { bail: CI }, function (t) {
        const cur = PathUnit.move_to(start).A(radius[0], radius[1], rotation, large_arc, sweep, [ex, ey]);
        testSegment(t, cur, item, deltp);
        testSegment(t, new PathChain(cur.as_curve()), item, {
            ...deltp,
            test_descs: false,
            slope_epsilon: 0.6,
            len_epsilon: 0.8,
            end_point_epsilon: 1e-7,
            point_epsilon: 6.5,
        });
        {
            testSegment(
                t,
                PathUnit.parse(`M ${sx},${sy} A ${rx},${ry} ${rotation} ${large_arc} ${sweep} ${ex},${ey}`),
                item,
                deltp
            );
            const rel = PathUnit.parse(`m ${sx},${sy} a ${rx},${ry} ${rotation} ${large_arc} ${sweep} ${ex - sx},${ey - sy}`);
            testSegment(t, rel, item, deltp);
        }
        t.end();
    });
}
console.error(`${I} arcs, ${as_cubic} as_cubic`);
