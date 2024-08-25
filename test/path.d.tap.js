'uses strict';
import test from 'tap';
import { Vector } from 'svggeom';
// import { PathLS as PathYY, SegmentLS as SegYY, Vector } from 'svggeom';
import { PathSE as PathXX } from '../dist/path/segment/pathse.js';
import { PathCL as PathYY, CommandLink as SegYY } from '../dist/path/pathcl.js';
import './utils.js';
const CI = !!process.env.CI;

test.test(`path parse`, { bail: !CI }, function (t) {
    // let p = PathXX.parse("M3");
    t.throws(() => PathXX.parse('M3'));
    t.end();
});

test.test(`path parse`, { bail: !CI }, function (t) {
    let p = PathXX.parse('M 10,10 l 30, -40 h -30 v 30 z');
    let kind = p.firstSegment.constructor.name;
    t.ok(kind.startsWith("Line"), kind);
    kind = p.lastSegment.constructor.name;
    t.ok(kind.startsWith("Close"), kind);

    t.end();
});

test.test(`PathLS.segment_at`, { bail: !CI }, function (t) {
    let p = PathYY.parse('M 10,10 l 30, -40 h -30 v 30 z');
    // console.log(p._tail?.pathLen())
    t.same(p._tail.length, 10);
    t.same(p._tail._prev.length, 30);
    t.same(p._tail._prev._prev.length, 30);
    t.same(p._tail._prev._prev._prev.length, 50);
    t.same(p.length, 50 + 30 + 40);
    let i = 0;
    for (const [T, cname, len, sT, x, y, z] of [
        [0.25, 'Line', 50, 0.6, 40, -30, 0],
        // 0.25 == 30/120
        // 0.6 == 30/50
        [0.95, 'Close', 10, 0.4, 10, 10, 0],
        [0.75, 'Line', 30, 0.333, 10, 0, 0],
        [1, 'Close', 10, 1, 10, 10, 0],
        [0, 'Line', 50, 0, 40, -30, 0],
        [0.4167, 'Line', 30, 0, 10, -30, 0],
        [0.4166, 'Line', 50, 1, 40, -30, 0],
    ]) {
        const [seg, j] = p.segment_at(T);
        const tag = `[${i} ${T} ${cname} ${seg ? seg.to.toString() : ''}]`;
        t.ok(seg.constructor.name.indexOf(cname) === 0, tag);
        t.same(seg.length, len, tag);
        t.same([...seg.to], [x, y, z], tag);
        t.same((j * 1000).toFixed(), (sT * 1000).toFixed(), tag);
        ++i;
    }
    t.same([...p.point_at(0)], [10, 10, 0]);
    t.same([...p.point_at(1)], [10, 10, 0]);
    t.same([...p.point_at(0.9583333333333334)], [10, 5, 0]);
    t.same([...p.point_at(0.4166666666666667)], [40, -30, 0]);
    t.same([...p.point_at(0.9166666666666666)], [10, 0, 0]);

    for (i = 0; i < 11; i++) {
        const j = i / 10;
        const tag = `[${i} ${j}]`;
        const slope = p.slope_at(j).degrees;
        const tangent = p.tangent_at(j).degrees;
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
        t.same([b.left, b.top], [10, -30]);
    }

    {
        const [a, b] = p.split_at(0.08333333333333333);
        t.same(a.describe(), 'M10,10L16,2');
        t.same(b.describe({ short: true }), 'M16,2L40,-30H10V0Z');
        t.same(p.cut_at(-0.9166666666666666).describe({ short: true }), 'M16,2L40,-30H10V0Z');
    }

    t.end();
});

test.test(`PathLS empty`, { bail: !CI }, function (t) {
    const p = new PathYY();
    for (const f of [-2, 0, 0.5, 1, 2]) {
        t.same(p.segment_at(f), [undefined, NaN]);
        t.same(p.segment_at_length(f), [undefined, NaN, NaN]);
        t.strictSame(p.point_at_length(f), undefined);
        const [a, b] = p.split_at(f);
        t.same(a.describe(), '');
        t.same(b.describe(), '');
        t.same(a.lineTo(3, 4).describe(), 'M0,0L3,4');
        t.same(b.lineTo(3, 4).describe(), 'M0,0L3,4');
    }

    t.strictSame(p.reversed(), p);
    t.same(p.terms(), []);
    t.same(p.length, 0);
    t.end();
});

test.test(`SegmentLS extra`, { bail: !CI }, function (t) {
    const p = SegYY.move_to([3, 4]);
    t.throwsRE(function () {
        p.prev;
    }, /No prev/);
    t.throwsRE(function () {
        p.from;
    }, /No prev/);
    t.ok(SegYY.lineTo(3, 4).with_prev(undefined).reversed().constructor.name.indexOf('Move') === 0);
    {
        const l = SegYY.lineTo(3, 4).with_prev(undefined);
        t.strictSame(l.Z(), l);
        t.notOk(l.bbox().is_valid());
        t.same([...l.to], [3, 4, 0]);
    }
    {
        t.notOk(SegYY.move_to([3, 4]).bbox().is_valid());
    }
    {
        const [a, b] = SegYY.move_to([0, 0]).move_to([3, 4]).split_at(0.5);
        t.same([...a.to], [(2.5 * 3) / 5, (2.5 * 4) / 5, 0]);
        t.same([...b.to], [3, 4, 0]);
        t.same([...b.from], [1.5, 2, 0]);
    }
    {
        t.same(SegYY.move_to([3, 4]).with_prev(SegYY.move_to([5, 6])).describe(), 'M5,6M3,4');
    }
    {
        const s = SegYY.move_to([3, 4]).arc(100, 100, 50, 0, -1e-16, false);
        const segs = [...s.walk()];
        const matc = ['Arc', 'Arc', 'Line', 'Move'];
        segs.forEach((seg, i) => {
            t.ok(seg.constructor.name.indexOf(matc[i]) === 0, [i, s.describe()]);
        });
    }
    t.same(SegYY.bezierCurveTo(100, 50, 0, 24, 200, 100).describe(), 'M0,0C100,50,0,24,200,100');
    t.same(SegYY.quadraticCurveTo(100, 50, 200, 100).describe(), 'M0,0Q100,50,200,100');
    t.same(SegYY.arcd(0, 0, 50, 0, 360).describe(), 'M50,0A50,50,0,1,1,-50,0A50,50,0,1,1,50,0');

    t.end();
});
