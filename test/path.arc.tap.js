'uses strict';
import { enum_path_data, test_segment } from './path.utils.js';
import './utils.js';
import { Arc, Cubic, Path, PathLS } from 'svggeom';
import test from 'tap';
import os from 'os';
import fs from 'fs';
const CI = !!process.env.CI;
function dbgwrite(name, pC, pX) {
    function* gen() {
        const b = Path.parse(pC).bbox().merge(Path.parse(pX).bbox());

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
for await (const item of enum_path_data({ SEGMENTS: 'Arc' })) {
    ++I;
    test.test(item.d, { bail: !CI }, function (t) {
        let seg = Arc.fromEndPoint(
            item.start,
            item.radius[0],
            item.radius[1],
            item.rotation,
            item.large_arc,
            item.sweep,
            item.end,
        );

        test_segment(t, seg, item, {
            len_epsilon: 1e-5,
            slope_epsilon: 5e-5,
            point_epsilon: 1.5e-6,
        });

        const cubic_segs = new Path(seg.asCubic());
        const sp = seg.toPath();
        switch (sp) {
            case 'M 110 215 A 36 60 0 0 1 150.71 170.29':
            case 'M 396 140 A 176 112 0 1 1 44 140':
            case 'M 44 140 A 176 112 0 1 1 396 140':
            case 'M 73.80539100000001 104.29492999999998 A 71.059525 34.395832 0 0 1 163.68116000000003 109.79075999999998':
            case 'M 45.81146500000001 145.99823999999998 A 71.059525 34.395832 0 0 1 73.80539100000001 104.29492999999998':
            case 'M 125.19616 167.12288999999998 A 71.059525 34.395832 0 0 1 45.81146500000001 145.99823999999998':
            case 'M 182.94048 133.3363 A 71.059525 34.395832 0 0 1 125.19616 167.12288999999998':
            case 'M 172.55 152.45 A 30.08739353948759 50.14565589914598 -45 0 1 215.1 109.9':
                break;
            default:
                // const arc_seg = Path.parse(seg.toPath());
                // console.dir(arc_seg);
                // console.dir(cubic_segs, {depth:null});
                const box = seg.bbox();
                const dd = Math.max(box.width, box.height);
                const opt = {
                    test_descs: false,
                    test_tangents: false,
                    len_epsilon: 0.082,
                    slope_epsilon: 5e-5,
                    point_epsilon: 0.8,
                    // point_epsilon: 1.5,
                    on_fail: function () {
                        console.error(`[${sp}]`);

                        dbgwrite(`fail${I}.svg`, cubic_segs.describe(), seg.toPath());
                    },
                };
                test_segment(t, cubic_segs, item, opt);
                ++as_cubic;
        }
        t.end();
    });
    // test.test(`PathLS<${item.d}>`, { bail: CI }, function (t) {
    //     const cur = PathLS.moveTo(item.start).arcTo(item.end);
    //     testSegment(t, cur, item);
    //     t.end();
    // });    
}
console.error(`${I} arcs, ${as_cubic} as_cubic`);
