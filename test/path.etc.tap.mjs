'uses strict';
import {spawn} from 'child_process';
import {PathLS, Vec} from 'svggeom';
import {Path} from '../dist/path.js';
import test from 'tap';
const CI = !!process.env.CI;

test.test(`Path etc`, {bail: !CI}, function (t) {
    let p = Path.new(`m 100,45 h 125 v 80 h -125 z`);

    // console.log( Array.from, p)
    let segs = Array.from(p);

    t.same(segs[0].from.toArray().slice(0, 2), [100, 45]);
    t.same(segs[0].to.toArray().slice(0, 2), [225, 45]);

    t.same(segs[1].from.toArray().slice(0, 2), [225, 45]);
    t.same(segs[1].to.toArray().slice(0, 2), [225, 125]);

    t.same(segs[2].from.toArray().slice(0, 2), [225, 125]);
    t.same(segs[2].to.toArray().slice(0, 2), [100, 125]);

    t.same(segs[3].from.toArray().slice(0, 2), [100, 125]);
    t.same(segs[3].to.toArray().slice(0, 2), [100, 45]);

    t.ok(p.isContinuous());
    t.strictSame(segs.length, 4);

    p = Path.parse(`m 755.16947,151.67245 h 16.66665 V 66.487356 h -9.25925`);
    segs = Array.from(p);
    t.same(segs[0].from.toArray().slice(0, 2), [755.16947, 151.67245]);
    t.same(segs[0].to.toArray().slice(0, 2), [771.83612, 151.67245]);
    t.same(segs[1].from.toArray().slice(0, 2), [771.83612, 151.67245]);
    t.same(segs[1].to.toArray().slice(0, 2), [771.83612, 66.487356]);
    t.same(segs[2].from.toArray().slice(0, 2), [771.83612, 66.487356]);

    t.ok(segs[2].to.closeTo(Vec.at(762.57684, 66.487356), 1e-4));
    t.same(p.firstPoint.toArray().slice(0, 2), [755.16947, 151.67245]);
    t.ok(p.lastPoint.closeTo(Vec.at(762.57684, 66.487356), 1e-4));

    t.ok(p.isContinuous());
    t.strictSame(segs.length, 3);
    // t.same(segs[0].to.toArray().slice(0, 2), [225, 45]);
    p = Path.parse(`m 0 0 h 200 v 300 h -200 Z`);
    t.ok(p.pointAtLength(300).closeTo(Vec.at(200, 100), 1e-12));

    t.end();
});

test.test(`PathLS etc`, {bail: !CI}, function (t) {
    let p = PathLS.parse(`m 100,45 h 125 v 80 h -125 z`);

    let segs = Array.from(p);
    console.log(  p.toString())

    t.same(segs[4].to.toArray().slice(0, 2), [100, 45]);

    t.same(segs[3].from.toArray().slice(0, 2), [100, 45]);
    t.same(segs[3].to.toArray().slice(0, 2), [225, 45]);

    t.same(segs[2].from.toArray().slice(0, 2), [225, 45]);
    t.same(segs[2].to.toArray().slice(0, 2), [225, 125]);

    t.same(segs[1].from.toArray().slice(0, 2), [225, 125]);
    t.same(segs[1].to.toArray().slice(0, 2), [100, 125]);

    t.same(segs[0].from.toArray().slice(0, 2), [100, 125]);
    t.same(segs[0].to.toArray().slice(0, 2), [100, 45]);

    t.same(p.firstSegment.to.toArray().slice(0, 2), [225, 45]);
    t.same(p.firstSegment.from.toArray().slice(0, 2), [100, 45]);
    t.same(p.lastSegment.from.toArray().slice(0, 2), [100, 125]);
    t.same(p.lastSegment.to.toArray().slice(0, 2), [100, 45]);

    t.strictSame(segs.length, 5);



    t.end();
});
