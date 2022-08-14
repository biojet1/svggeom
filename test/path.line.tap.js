'uses strict';
import { enum_path_data, test_segment, testSegment } from './path.utils.js';
import './utils.js';
import { Line, PathLS } from 'svggeom';
import test from 'tap';
const CI = !!process.env.CI;


for await (const item of enum_path_data({ SEGMENTS: 'Line' })) {
    const cur = PathLS.moveTo(item.start).lineTo(item.end);
    // console.log(x.d(), item.length, item.start, item.end);
    // console.dir(item.end);
    // console.dir(cur);
    test.test(`<${item.d}>`, { bail: CI }, function (t) {
        testSegment(t, cur, item);
        t.end();
    });
}

for await (const item of enum_path_data({ SEGMENTS: 'Line' })) {
    test.test(`<${item.d}>`, { bail: CI }, function (t) {
        let seg = new Line(item.start, item.end);
        test_segment(t, seg, item);
        testSegment(t, seg, item);
        t.end();
    });
}
