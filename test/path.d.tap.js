'uses strict';
import test from 'tap';
import { PathLS, SegmentLS, Vec } from 'svggeom';
import { Path } from '../dist/path.js';
import { enum_path_data, test_segment } from './path.utils.js';
import './utils.js';
const CI = !!process.env.CI;

test.test(`path parse`, { bail: !CI }, function (t) {
    // let p = Path.parse("M3");
    t.throws(() => Path.parse('M3'));
    t.end();
});

test.test(`path parse`, { bail: !CI }, function (t) {
    let p = Path.parse('M 10,10 l 30, -40 h -30 v 30 z');
    let kind = p.firstSegment.constructor.name;
    t.ok(kind.startsWith("Line"), kind);
    kind = p.lastSegment.constructor.name;
    t.ok(kind.startsWith("Close"), kind);

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
        const tag = `[${i} ${T} ${cname} ${seg ? seg.to.toString() : ''}]`;
        t.same(seg.constructor.name, cname, tag);
        t.same(seg.length, len, tag);
        t.same([...seg.to], [x, y, z], tag);
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

test.test(`PathLS empty`, { bail: !CI }, function (t) {
    const p = new PathLS();
    for (const f of [-2, 0, 0.5, 1, 2]) {
        t.same(p.segmentAt(f), [undefined, NaN]);
        t.same(p.segmentAtLength(f), [undefined, NaN, NaN]);
        t.strictSame(p.pointAtLength(f), undefined);
        const [a, b] = p.splitAt(f);
        t.same(a.describe(), '');
        t.same(b.describe(), '');
        t.same(a.lineTo(3, 4).describe(), 'M0,0L3,4');
        t.same(b.lineTo(Vec.new(3, 4)).describe(), 'M0,0L3,4');
    }

    t.strictSame(p.reversed(), p);
    t.same(p.descArray(), []);
    t.same(p.length, 0);
    t.end();
});

test.test(`SegmentLS extra`, { bail: !CI }, function (t) {
    const p = SegmentLS.moveTo(3, 4);
    t.throwsRE(function () {
        p.prev;
    }, /No prev/);
    t.throwsRE(function () {
        p.from;
    }, /No prev/);
    t.same(SegmentLS.lineTo(3, 4).withPrev(undefined).reversed().constructor.name, 'MoveLS');
    {
        const l = SegmentLS.lineTo(3, 4).withPrev(undefined);
        t.strictSame(l.Z(), l);
        t.notOk(l.bbox().isValid());
        t.same([...l.lastPoint], [3, 4, 0]);
    }
    {
        t.notOk(SegmentLS.moveTo(3, 4).bbox().isValid());
    }
    {
        const [a, b] = SegmentLS.moveTo(0, 0).moveTo(3, 4).splitAt(0.5);
        t.same([...a.to], [(2.5 * 3) / 5, (2.5 * 4) / 5, 0]);
        t.same([...b.to], [3, 4, 0]);
        t.same([...b.firstPoint], [1.5, 2, 0]);
    }
    {
        t.same(SegmentLS.moveTo(3, 4).withPrev(SegmentLS.moveTo(5, 6)).describe(), 'M5,6M3,4');
    }
    {
        const s = SegmentLS.moveTo(3, 4).arc(100, 100, 50, 0, -1e-16, false);
        const segs = [...s.enum()];
        const matc = ['ArcLS', 'ArcLS', 'LineLS', 'MoveLS'];
        segs.forEach((seg, i) => {
            t.same(seg.constructor.name, matc[i], [i, s.describe()]);
        });
    }
    t.same(SegmentLS.bezierCurveTo(100, 50, 0, 24, 200, 100).describe(), 'M0,0C100,50,0,24,200,100');
    t.same(SegmentLS.quadraticCurveTo(100, 50, 200, 100).describe(), 'M0,0Q100,50,200,100');
    t.same(SegmentLS.arcd(0, 0, 50, 0, 360).describe(), 'M50,0A50,50,0,1,1,-50,0A50,50,0,1,1,50,0');

    t.end();
});
