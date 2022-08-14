'uses strict';
import { enum_path_data, test_segment, testSegment } from './path.utils.js';
import './utils.js';
import { Line, PathLS } from 'svggeom';
import test from 'tap';
const CI = !!process.env.CI;
test.test(`PathLS.parse`, { bail: CI }, function (t) {
    let cur = PathLS.parse('M 10,10            90,90            V 10            H 50');
    t.same(cur.descArray(), ['M', 10, 10, 'L', 90, 90, 'L', 90, 10, 'L', 50, 10]);
    cur = PathLS.parse(' m 110,10            80,80           v -80           h -40');
    t.same(cur.descArray(), [
        'M',
        100 + 10,
        10,
        'L',
        100 + 90,
        90,
        'L',
        100 + 90,
        10,
        'L',
        100 + 50,
        10,
    ]);

    t.end();
});
for await (const item of enum_path_data({ SEGMENTS: 'Line' })) {
    test.test(`<${item.d}>`, { bail: CI }, function (t) {
        let seg = new Line(item.start, item.end);
        test_segment(t, seg, item);
        testSegment(t, seg, item);
        t.end();
    });
    test.test(`PathLS<${item.d}>`, { bail: CI }, function (t) {
        const [[x1, y1], [x2, y2]] = [item.start, item.end];
        {
            const cur = PathLS.moveTo(item.start).lineTo(item.end);
            testSegment(t, cur, item);
            const cur2 = PathLS.moveTo(x1, y1).lineTo(x2, y2);
            t.same(cur.toString(), cur2.toString());
        }
        // if (CI)
        {
            testSegment(t, PathLS.parse(`M ${x1},${y1} L ${x2},${y2}`), item);
            testSegment(t, PathLS.parse(`m ${x1},${y1} l ${x2 - x1},${y2 - y1}`), item);
        }

        t.end();
    });
}
