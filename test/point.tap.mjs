'uses strict';
import { spawn } from 'child_process';
import { Vec } from 'svggeom';
import './utils.js';

import test from 'tap';
const CI = !!process.env.CI;

test.test(`point properties`, { bail: !CI }, function (t) {
    let p = Vec.new(3, 4, 5);
    t.strictSame(p.x, 3);
    t.strictSame(p.y, 4);
    t.notOk(p.equals());
    t.notOk(p.equals(null));
    t.notOk(p.equals(undefined));
    t.notOk(p.equals(Vec.new(3, 4, -5)));
    t.notOk(p.equals([3, 4, 5.00001]));
    t.ok(p.equals(p));
    t.ok(p.equals([3, 4, 5]));
    t.ok(p.clone().equals(p));
    t.not(p.clone(), p);
    t.same(p.reflect_at(Vec.new()).toArray(), [-3, -4, -5], 'reflect_at');
    t.end();
});

test.test(`point construct`, { bail: !CI }, function (t) {
    t.throws(() => Vec.new(5, NaN), TypeError, 'must be finite');
    t.same(Array.from(Vec.new([42, 72])), [42, 72, 0], 'fromArray');
    t.strictSame(Vec.new(0, 0, 0).toString(), '0, 0, 0', 'Vec.new()');
    t.strictSame(Vec.new(-1).toString(), '-1, 0, 0', 'Vec.new(number)');
    t.strictSame(Vec.new(-2, -3, -5).toString(), '-2, -3, -5', 'Vec.new(...)');
    t.strictSame(Vec.new([42, 72]).toString(), '42, 72, 0', 'Vec.new(array)');
    t.strictSame(Vec.add([2, 4, 6], [-2, -4, 1]).toString(), '0, 0, 7', 'Vec.add(...)');
    t.throws(() => Vec.new(NaN), TypeError, 'must be finite');
    t.end();
});

test.test(`point extra`, { bail: !CI }, function (t) {
    t.throws(() => Vec.new(0, 0).normalize(), TypeError, 'normalize vector of zero length');
    t.same(Vec.new(5, 7).normalize(), Vec.new(0.5812381937190965, 0.813733471206735));
    t.same(Vec.new(0, 7).normalize(), Vec.new(0, 1));
    t.same([...Vec.new(8, 0).normalize()], [1, 0, 0]);
    if (Vec.new(8, 6).normal().x < 0) {
        t.same(Vec.new(8, 6).normal(), Vec.new(-6, 8));
    } else {
        t.same(Vec.new(8, 6).normal(), Vec.new(6, -8));
    }
    let A = Vec.polar(4, (337.11417665550067 / 180) * Math.PI);
    let [X, Y, Z] = A;

    t.almostEqual(X, 3.6851266321570497, 1e-11);
    t.almostEqual(Y, -1.5555840398277552, 1e-11);
    t.equals(Z, 0);

    const { PI, E, LN10, LOG2E } = Math;
    t.almostEqual((Vec.new(0, 0).angle_to(Vec.new(3, 4)) * 180) / PI, 53.13010235415598, 1e-11);
    t.almostEqual((Vec.new(42, 42).angle * 180) / PI, 45, 1e-11);
    const r = Vec.new(-2.1830320757712625, -2.057758721559409).angle_to(Vec.new(0, 0));
    console.log(r);
    t.almostEqual((r / PI) * 180, 90 - (270 - 223.30796939966595), 1e-11);
    t.almostEqual(Vec.grade(33.33333333333333333).angle, (30 / 180) * PI, 1e-11);
    t.almostEqual(Vec.polar(0, PI / 2 / 3).angle, 0, 1e-11);
    t.almostEqual(Vec.polar(2, PI / 2 / 3).grade, 33.33333333333333333, 1e-11);

    t.almostEqual(Vec.new(3, 4).distance([0, 0]), 5, 1e-11);

    t.end();
});

test.test(`pentagon extra`, { bail: !CI }, function (t) {
    const { PI, E, LN10, LOG2E, sqrt } = Math;
    function degrees(r) {
        const d = (r / PI) * 180;
        return ((d % 360) + 360) % 360;
    }
    // https://mathworld.wolfram.com/RegularPentagon.html
    const c1 = (sqrt(5) - 1) / 4;
    const c2 = (sqrt(5) + 1) / 4;
    const s1 = sqrt(10 + 2 * sqrt(5)) / 4;
    const s2 = sqrt(10 - 2 * sqrt(5)) / 4;
    t.almostEqual(degrees(Vec.new(s1, c1).angle_to(Vec.new(s2, -c2))), 72 + 180, 1e-11);
    t.almostEqual(degrees(Vec.new(-s2, -c2).angle_to(Vec.new(0, 1))), 72, 1e-11);
    t.almostEqual(degrees(Vec.new(-s2, -c2).angle_to(Vec.new(s2, -c2))), 0, 1e-11);
    t.end();
});

test.test(`cross`, { bail: !CI }, function (t) {
    {
        const a = Vec.new(1, 3, 4);
        const b = Vec.new(2, 7, -5);
        t.same(Array.from(a.cross(b)), [-43, 13, 1]);
        t.same(Array.from(b.cross(a)), [43, -13, -1]);
    }
    {
        const a = Vec.new(1, 2, 3);
        const b = Vec.new(4, 5, 6);
        t.same(Array.from(a.cross(b)), [-3, 6, -3]);
    }
    // import numpy as np

    // x = [1, 2, 3]

    // y = [4, 5, 6]

    // np.cross(x, y)
    // array([-3,  6, -3])

    t.end();
});

test.test(`Vec.degrees`, { bail: !CI }, function (t) {
    t.same(Array.from(Vec.degrees(0)), [1, 0, 0]);
    t.same(Array.from(Vec.degrees(90)), [0, 1, 0]);
    t.same(Array.from(Vec.degrees(-90)), [0, -1, 0]);
    t.same(Array.from(Vec.degrees(180)), [-1, 0, 0]);
    t.same(Array.from(Vec.degrees(-180)), [-1, 0, 0]);
    t.same(Array.from(Vec.degrees(270)), [0, -1, 0]);
    t.same(Array.from(Vec.degrees(-270)), [0, 1, 0]);
    t.almostEqual(Array.from(Vec.degrees(45)), [0.7071067811865475, 0.7071067811865475, 0]);

    t.same(Vec.grade(0).degrees, 0);
    t.same(Vec.grade(100).degrees, 90);
    t.same(Vec.grade(200).degrees, 180);
    t.same(Vec.grade(300).degrees, 270);
    t.same(Vec.grade(400).degrees, 360);
    t.almostEqual(Vec.grade(25).degrees, 22.5);
    t.almostEqual(Vec.grade(160).degrees, 144);
    // t.same(Array.from(Vec.degrees(360)), [1, 0, 0]);

    [Vec.degrees(30, -2), Vec.degrees(210, 2), Vec.degrees(-150, 2)].forEach((e, i, a) => {
        i > 0 && t.ok(a[i].close_to(a[i - 1], 1e-9), [a[i], a[i - 1]]);
    });
    [Vec.degrees(30, -2), Vec.degrees(30, 2), Vec.degrees(-30, 2)].forEach((e, i, a) => {
        i > 0 && t.not(a[i].close_to(a[i - 1], 1e-9), [a[i], a[i - 1]]);
    });
    [Vec.degrees(180, -3), Vec.degrees(0, 3), Vec.degrees(-180, -3)].forEach((e, i, a) => {
        i > 0 && t.ok(a[i].close_to(a[i - 1], 1e-9), [a[i], a[i - 1]]);
    });

    [
        Vec.degrees(-90, 4),
        Vec.degrees(90, -4),
        Vec.degrees(-270, -4),
        Vec.degrees(270, 4),
        Vec.grade(100, -4),
        Vec.radians(-Math.PI / 2, 4),
    ].forEach((e, i, a) => {
        i > 0 && t.ok(a[i].close_to(a[i - 1], 1e-9), [a[i], a[i - 1]]);
    });

    t.end();
});

test.test(`with/only/shift/flip`, { bail: !CI }, function (t) {
    const v = Vec.new(3, -4, 5);

    t.same(Array.from(v.with_x(-6)), [-6, -4, 5]);
    t.same(Array.from(v.with_y(7)), [3, 7, 5]);
    t.same(Array.from(v.with_z(8)), [3, -4, 8]);

    t.same(Array.from(v.only_x()), [3, 0, 0]);
    t.same(Array.from(v.only_y()), [0, -4, 0]);
    t.same(Array.from(v.only_z()), [0, 0, 5]);

    t.same(Array.from(v.shift_z(-5)), [3, -4, 0]);
    t.same(Array.from(v.shift_y(4)), [3, 0, 5]);
    t.same(Array.from(v.shift_x(-3)), [0, -4, 5]);

    t.same(Array.from(v.flip_z()), [3, -4, -5]);
    t.same(Array.from(v.flip_y()), [3, 4, 5]);
    t.same(Array.from(v.flip_x()), [-3, -4, 5]);

    t.end();
});

test.test(`parse`, { bail: !CI }, function (t) {
    const v = Vec.parse(`3, -4, 5`);

    t.same(Array.from(Vec.parse(`3, -4, 5`)), [3, -4, 5]);
    t.same(Array.from(Vec.parse(`3 -4\t5`)), [3, -4, 5]);
    t.same(Array.from(Vec.parse(`3\n-4,5`)), [3, -4, 5]);
    t.same(Array.from(Vec.parse(`3,\n-45`)), [3, -45, 0]);
    t.same(Array.from(Vec.parse(`3,-45`)), [3, -45, 0]);
    t.same(Array.from(Vec.parse(`3,-4,5`)), [3, -4, 5]);
    t.same(Array.from(Vec.parse(`3,,5`)), [3, 0, 5]);
    {
        const x = [Vec.parse(`1.4142135623730951<45`), Vec.new(1, 1, 0)];
        t.ok(x[0].close_to(x[1]), x);
    }
    {
        const x = [Vec.parse(`  5  <  36.86989765 `), Vec.new(4, 3, 0)];
        t.ok(x[0].close_to(x[1], 1e-9), x);
    }

    {
        const x = [Vec.parse(`  5  <53.13010235`), Vec.new(3, 4, 0)];
        t.ok(x[0].close_to(x[1], 1e-9), x);
    }
    {
        const x = [Vec.new(`5<53.13010235`), Vec.new(3, 4, 0)];
        t.ok(x[0].close_to(x[1], 1e-9), x);
    }
    {
        const x = [Vec.new(`1.4142135623730951<45`), Vec.new(`1 1 0`)];
        t.ok(x[0].close_to(x[1]), x);
    }
    {
        const x = [Vec.new(`  5  <  36.86989765 `), Vec.new(`4, 3, 0`)];
        t.ok(x[0].close_to(x[1], 1e-9), x);
    }
    [
        Vec.new(`5<36.86989765`),
        Vec.new(`4, 3, 0`),
        Vec.new(4, 3, 0),
        Vec.degrees(36.86989765, 5),
        Vec.radians(0.6435011088658199, 5),
    ].forEach((e, i, a) => {
        i > 0 && t.ok(a[i].close_to(a[i - 1], 1e-9), [a[i], a[i - 1]]);
    });
    t.end();
});
