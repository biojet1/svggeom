'uses strict';
import test from 'tap';
import { enum_path_data } from './path.utils.js';
// import { SegmentLS as PCX } from 'svggeom';
import { PathLC as PathXL } from 'svggeom';
import { PathSE } from '../dist/path/segment/pathse.js';
import './utils.js';
const { Unit: PCX } = PathXL;

test.test(`PCX Extra`, { bail: 1 }, function (t) {
    const cur = PCX.move_to([3, 4]).lineTo(5, 6).move_to([7, 8]).closePath();
    // console.dir(cur, { depth: 10 });

    t.same([...cur.first.to], [3, 4, 0]);
    t.same([...cur.prev.to], [7, 8, 0]);
    t.match(cur.first.constructor.name, /^Move../);
    t.match(cur.prev.constructor.name, /^Move../);

    // const seg = PCX.move_to(3, 4).lineTo(5, 6).lineTo(7, 8);
    const seg = PCX.move_to([3, 4]).lineTo(5, 6).move_to([1, 2]).move_to([0, 0]).lineTo(7, 8);
    // const seg = cur;
    const rev = seg.reversed();

    // console.dir();
    // console.log(seg.toString(), '-->', rev.toString());
    t.end();
});
// process.exit();

for await (const item of enum_path_data({ SEGMENTS: 'Parsed' })) {
    const { d } = item;
    let close = true;
    switch (d) {
        case 'M0,0L10,0m0,0L10,0':
            continue;
    }

    test.test(`SPTPaths<${d}>`, { bail: 1 }, function (t) {
        const p = PathSE.parse(d);
        const abs = p.terms({ relative: false, close: close, short: false });

        t.sameDescs(abs, item.abs, 5e-5, `ABS`, p);
        const rel = p.terms({ relative: true, close: close, short: false });
        t.sameDescs(rel, item.rel, 5e-5, `REL`, p);

        t.end();
    });
    test.test(`SPTPaths<${d}>`, { bail: 1 }, function (t) {
        const p = PCX.parse(d);
        const abs = p.terms({ relative: false, short: false });
        const rev = p.reversed();

        t.sameDescs(abs, item.abs, 5e-5, `ABS`, p);
        const rel = p.terms({ relative: true, short: false });
        t.sameDescs(rel, item.rel, 5e-5, `REL`, p);
        t.sameDescs(rev.terms(), item.rev, 5e-5, `REV`, p);
        t.sameDescs(rev.terms({ relative: true, short: false }), item.revr, 5e-5, `REV-REL`, p);

        t.end();
    });
}
for await (const item of enum_path_data({ SEGMENTS: 'SEPaths' })) {
    const { d } = item;
    switch (d) {
        case 'M0,0L10,0m0,0L10,0':
        // case 'M0,0L10,0M0,0L10,0':
        // case 'M0,0L10,0l10,0':
        // case 'M396 140a176 112 0 1 1 -352 0a176 112 0 1 1 352 0z':
        // d = ;
        // break;
        case 'm0,0h10z':
        case 'm0,0h10Z':
            continue;
    }
    const eps = 0.00005;
    test.test(`SEPaths<${d}>`, { bail: 1 }, function (t) {
        const p = PathSE.parse(item.d);
        const abs = p.terms({ relative: false, close: true });
        t.sameDescs(abs, item.abs, eps, `ABS`, p);
        const rel = p.terms({ relative: true });
        t.sameDescs(rel, item.rel, eps, `REL`, p);

        t.end();
    });
    test.test(`PCX:SEPaths<${d}>`, { bail: 1 }, function (t) {
        const cur = PCX.parse(item.d);
        // t.same(item.abs, cur.terms(), [`${cur.toString()}`, item.abs]);
        t.sameDescs(cur.terms(), item.abs, eps, `ABS`, cur);
        t.sameDescs(cur.terms({ relative: true, smooth: false }), item.rel, eps, `REL`, cur);

        t.end();
    });
}
