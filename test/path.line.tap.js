'uses strict';
import { enum_path_data, test_segment, testSegment } from './path.utils.js';
import './utils.js';
import { Line, PathLS } from 'svggeom';
import test from 'tap';
const CI = !!process.env.CI;

for await (const item of enum_path_data({ SEGMENTS: 'Line' })) {
    test.test(`<${item.d}>`, { bail: CI }, function (t) {
        let seg = new Line(item.start, item.end);
        test_segment(t, seg, item);
        testSegment(t, seg, item);
        t.end();
    });
    test.test(`PathLS<${item.d}>`, { bail: CI }, function (t) {
        {
            const cur = PathLS.moveTo(item.start).lineTo(item.end);
            testSegment(t, cur, item);
        }

        if (CI) {
            const [[x1, y1], [x2, y2]] = [item.start, item.end];
            testSegment(t, PathLS.parse(`M ${x1},${y1} L ${x2},${y2}`), item);
            testSegment(t, PathLS.parse(`m ${x1},${y1} l ${x2 - x1},${y2 - y1}`), item);
        }

        t.end();
    });
}
