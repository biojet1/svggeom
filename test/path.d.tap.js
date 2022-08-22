'uses strict';
import test from 'tap';
import { Path, PathLS } from 'svggeom';
import { enum_path_data, test_segment } from './path.utils.js';
import './utils.js';
const CI = !!process.env.CI;

test.test(`path parse`, { bail: !CI }, function (t) {
    // let p = Path.parse("M3");
    t.throws(() => Path.parse('M3'));

    t.end();
});

test.test(`path segmentAt`, { bail: !CI }, function (t) {
    let p = PathLS.parse('M 10,10 l 30, -40 h -30 v 30 z');
    // console.log(p._tail?.pathLen())
    t.same(p._tail.length, 10);
    t.same(p._tail._prev.length, 30);
    t.same(p._tail._prev._prev.length, 30);
    t.same(p._tail._prev._prev._prev.length, 50);
    t.same(p.length, 50 + 30 + 40);
    let [seg, j] = p.segmentAt(0.25); // 0.25 == 30/120
    t.same(seg.constructor.name, 'LineLS');
    t.same(seg.length, 50);
    t.same(j, 0.6); // 0.6 == 30/50
    t.same([...seg.end], [40, -30, 0]);
    t.end();
});
