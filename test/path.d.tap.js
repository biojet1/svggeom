'uses strict';
import test from 'tap';
import { Path, PathLS, Vec } from 'svggeom';
import { enum_path_data, test_segment } from './path.utils.js';
import './utils.js';
const CI = !!process.env.CI;

test.test(`path parse`, { bail: !CI }, function (t) {
    // let p = Path.parse("M3");
    t.throws(() => Path.parse('M3'));

    t.end();
});

test.test(`PathLS.segmentAt`, { bail: !CI }, function (t) {
    let p = PathLS.parse('M 10,10 l 30, -40 h -30 v 30 z');
    // console.log(p._tail?.pathLen())
    t.same(p._tail.length, 10);
    t.same(p._tail._prev.length, 30);
    t.same(p._tail._prev._prev.length, 30);
    t.same(p._tail._prev._prev._prev.length, 50);
    t.same(p.length, 50 + 30 + 40);
    let i = 0;
    for (const [T, cname, len, sT, x, y, z] of [
        [0.25, 'LineLS', 50, 0.6, 40, -30, 0],
        // 0.25 == 30/120
        // 0.6 == 30/50
        [0.95, 'CloseLS', 10, 0.4, 10, 10, 0],
        [0.75, 'LineLS', 30, 0.333, 10, 0, 0],
        [1, 'CloseLS', 10, 1, 10, 10, 0],
        [0, 'LineLS', 50, 0, 40, -30, 0],
        [0.4167, 'LineLS', 30, 0, 10, -30, 0],
        [0.4166, 'LineLS', 50, 1, 40, -30, 0],
    ]) {
        const [seg, j] = p.segmentAt(T);
        const tag = `[${i} ${T} ${cname} ${seg ? seg.end.toString() : ''}]`;
        t.same(seg.constructor.name, cname, tag);
        t.same(seg.length, len, tag);
        t.same([...seg.end], [x, y, z], tag);
        t.same((j * 1000).toFixed(), (sT * 1000).toFixed(), tag);
        ++i;
    }
    t.same([...p.pointAt(0)], [10, 10, 0]);
    t.same([...p.pointAt(1)], [10, 10, 0]);
    t.same([...p.pointAt(0.9583333333333334)], [10, 5, 0]);
    t.same([...p.pointAt(0.4166666666666667)], [40, -30, 0]);
    t.same([...p.pointAt(0.9166666666666666)], [10, 0, 0]);

    for (i = 0; i < 11; i++) {
        const j = i / 10;
        const tag = `[${i} ${j}]`;
        const slope = p.slopeAt(j).degrees;
        const tangent = p.tangentAt(j).degrees;
        if (j < 50 / 120) {
            t.same(slope, 306.86989764584405, tag);
            t.same(tangent, 306.86989764584405, tag);
        } else if (j < 80 / 120) {
            t.same(slope, 180, tag);
            t.same(tangent, 180, tag);
        } else if (j < 110 / 120) {
            t.same(slope, 90, tag);
            t.same(tangent, 90, tag);
        } else if (j <= 1) {
            t.same(slope, 90, tag);
            t.same(tangent, 90, tag);
        } else {
        }
    }
    {
        const b = p.bbox();
        t.same([b.width, b.height], [30, 40]);
        t.same([b.x, b.y], [10, -30]);
    }

    {
        const [a, b] = p.splitAt(0.08333333333333333);
        t.same(a.describe(), 'M10,10L16,2');
        t.same(b.describe({ short: true }), 'M16,2L40,-30H10V0Z');
        t.same(p.cutAt(-0.9166666666666666).describe({ short: true }), 'M16,2L40,-30H10V0Z');
    }

    t.end();
});
