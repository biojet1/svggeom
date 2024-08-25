'uses strict';
import { PathLC, Vector } from 'svggeom';
import test from 'tap';
const CI = !!process.env.CI;

test.test(`PathLC etc`, { bail: !CI }, function (t) {
    let p = PathLC.parse(`m 100,45 h 125 v 80 h -125 z`);

    let segs = Array.from(p);
    console.log(p.toString())

    t.same(segs[4].to.slice(0, 2), [100, 45]);

    t.same(segs[3].from.slice(0, 2), [100, 45]);
    t.same(segs[3].to.slice(0, 2), [225, 45]);

    t.same(segs[2].from.slice(0, 2), [225, 45]);
    t.same(segs[2].to.slice(0, 2), [225, 125]);

    t.same(segs[1].from.slice(0, 2), [225, 125]);
    t.same(segs[1].to.slice(0, 2), [100, 125]);

    t.same(segs[0].from.slice(0, 2), [100, 125]);
    t.same(segs[0].to.slice(0, 2), [100, 45]);

    t.same(p.first.to.slice(0, 2), [225, 45]);
    t.same(p.first.from.slice(0, 2), [100, 45]);
    t.same(p.last.from.slice(0, 2), [100, 125]);
    t.same(p.last.to.slice(0, 2), [100, 45]);

    t.strictSame(segs.length, 5);



    t.end();
});
