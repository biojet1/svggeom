'uses strict';
import { Vector } from 'svggeom';
import './utils.js';

import test from 'tap';
const CI = !!process.env.CI;

test.test(`point properties`, { bail: !CI }, function (t) {
    let p = Vector.new(3, 4, 5);
    t.strictSame(p.x, 3);
    t.strictSame(p.y, 4);
    t.notOk(p.equals());
    t.notOk(p.equals(null));
    t.notOk(p.equals(undefined));
    t.notOk(p.equals(Vector.new(3, 4, -5)));
    t.notOk(p.equals([3, 4, 5.00001]));
    t.ok(p.equals(p));
    t.ok(p.equals([3, 4, 5]));
    t.ok(p.clone().equals(p));
    t.not(p.clone(), p);
    t.same(p.reflect_at(Vector.new()).toArray(), [-3, -4, -5], 'reflect_at');
    t.same(p.toString(), "3, 4, 5");
    t.end();
});

test.test(`point construct`, { bail: !CI }, function (t) {
    t.throws(() => Vector.new(5, NaN), TypeError, 'must be finite');
    t.same(Array.from(Vector.new([42, 72])), [42, 72, 0], 'fromArray');
    t.strictSame(Vector.new(0, 0, 0).toString(), '0, 0, 0', 'Vector.new()');
    t.strictSame(Vector.new(-1).toString(), '-1, 0, 0', 'Vector.new(number)');
    t.strictSame(Vector.new(-2, -3, -5).toString(), '-2, -3, -5', 'Vector.new(...)');
    t.strictSame(Vector.new([42, 72]).toString(), '42, 72, 0', 'Vector.new(array)');
    t.strictSame(Vector.add([2, 4, 6], [-2, -4, 1]).toString(), '0, 0, 7', 'Vector.add(...)');
    t.throws(() => Vector.new(NaN), TypeError, 'must be finite');
    t.end();
});

test.test(`point extra`, { bail: !CI }, function (t) {
    t.throws(() => Vector.new(0, 0).normalize(), TypeError, 'normalize vector of zero length');
    t.same(Vector.new(5, 7).normalize(), Vector.new(0.5812381937190965, 0.813733471206735));
    t.same(Vector.new(0, 7).normalize(), Vector.new(0, 1));
    t.same([...Vector.new(8, 0).normalize()], [1, 0, 0]);
    if (Vector.new(8, 6).normal().x < 0) {
        t.same(Vector.new(8, 6).normal(), Vector.new(-6, 8));
    } else {
        t.same(Vector.new(8, 6).normal(), Vector.new(6, -8));
    }
    let A = Vector.polar(4, (337.11417665550067 / 180) * Math.PI);
    let [X, Y, Z] = A;

    t.almostEqual(X, 3.6851266321570497, 1e-11);
    t.almostEqual(Y, -1.5555840398277552, 1e-11);
    t.equals(Z, 0);

    const { PI, E, LN10, LOG2E } = Math;
    t.almostEqual((Vector.new(0, 0).angle_to(Vector.new(3, 4)) * 180) / PI, 53.13010235415598, 1e-11);
    t.almostEqual((Vector.new(42, 42).angle * 180) / PI, 45, 1e-11);
    const r = Vector.new(-2.1830320757712625, -2.057758721559409).angle_to(Vector.new(0, 0));
    console.log(r);
    t.almostEqual((r / PI) * 180, 90 - (270 - 223.30796939966595), 1e-11);
    t.almostEqual(Vector.grade(33.33333333333333333).angle, (30 / 180) * PI, 1e-11);
    t.almostEqual(Vector.polar(0, PI / 2 / 3).angle, 0, 1e-11);
    t.almostEqual(Vector.polar(2, PI / 2 / 3).grade, 33.33333333333333333, 1e-11);

    t.almostEqual(Vector.new(3, 4).distance([0, 0]), 5, 1e-11);

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
    t.almostEqual(degrees(Vector.new(s1, c1).angle_to(Vector.new(s2, -c2))), 72 + 180, 1e-11);
    t.almostEqual(degrees(Vector.new(-s2, -c2).angle_to(Vector.new(0, 1))), 72, 1e-11);
    t.almostEqual(degrees(Vector.new(-s2, -c2).angle_to(Vector.new(s2, -c2))), 0, 1e-11);
    t.end();
});

test.test(`cross`, { bail: !CI }, function (t) {
    {
        const a = Vector.new(1, 3, 4);
        const b = Vector.new(2, 7, -5);
        t.same(Array.from(a.cross(b)), [-43, 13, 1]);
        t.same(Array.from(b.cross(a)), [43, -13, -1]);
    }
    {
        const a = Vector.new(1, 2, 3);
        const b = Vector.new(4, 5, 6);
        t.same(Array.from(a.cross(b)), [-3, 6, -3]);
    }
    // import numpy as np

    // x = [1, 2, 3]

    // y = [4, 5, 6]

    // np.cross(x, y)
    // array([-3,  6, -3])

    t.end();
});

test.test(`Vector.degrees`, { bail: !CI }, function (t) {
    t.same(Array.from(Vector.degrees(0)), [1, 0, 0]);
    t.same(Array.from(Vector.degrees(90)), [0, 1, 0]);
    t.same(Array.from(Vector.degrees(-90)), [0, -1, 0]);
    t.same(Array.from(Vector.degrees(180)), [-1, 0, 0]);
    t.same(Array.from(Vector.degrees(-180)), [-1, 0, 0]);
    t.same(Array.from(Vector.degrees(270)), [0, -1, 0]);
    t.same(Array.from(Vector.degrees(-270)), [0, 1, 0]);
    t.almostEqual(Array.from(Vector.degrees(45)), [0.7071067811865475, 0.7071067811865475, 0]);

    t.same(Vector.grade(0).degrees, 0);
    t.same(Vector.grade(100).degrees, 90);
    t.same(Vector.grade(200).degrees, 180);
    t.same(Vector.grade(300).degrees, 270);
    t.same(Vector.grade(400).degrees, 360);
    t.almostEqual(Vector.grade(25).degrees, 22.5);
    t.almostEqual(Vector.grade(160).degrees, 144);
    // t.same(Array.from(Vector.degrees(360)), [1, 0, 0]);

    [Vector.degrees(30, -2), Vector.degrees(210, 2), Vector.degrees(-150, 2)].forEach((e, i, a) => {
        i > 0 && t.ok(a[i].close_to(a[i - 1], 1e-9), [a[i], a[i - 1]]);
    });
    [Vector.degrees(30, -2), Vector.degrees(30, 2), Vector.degrees(-30, 2)].forEach((e, i, a) => {
        i > 0 && t.not(a[i].close_to(a[i - 1], 1e-9), [a[i], a[i - 1]]);
    });
    [Vector.degrees(180, -3), Vector.degrees(0, 3), Vector.degrees(-180, -3)].forEach((e, i, a) => {
        i > 0 && t.ok(a[i].close_to(a[i - 1], 1e-9), [a[i], a[i - 1]]);
    });

    [
        Vector.degrees(-90, 4),
        Vector.degrees(90, -4),
        Vector.degrees(-270, -4),
        Vector.degrees(270, 4),
        Vector.grade(100, -4),
        Vector.radians(-Math.PI / 2, 4),
    ].forEach((e, i, a) => {
        i > 0 && t.ok(a[i].close_to(a[i - 1], 1e-9), [a[i], a[i - 1]]);
    });

    t.end();
});

test.test(`with/only/shift/flip`, { bail: !CI }, function (t) {
    const v = Vector.new(3, -4, 5);

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
    const v = Vector.parse(`3, -4, 5`);

    t.same(Array.from(Vector.parse(`3, -4, 5`)), [3, -4, 5]);
    t.same(Array.from(Vector.parse(`3 -4\t5`)), [3, -4, 5]);
    t.same(Array.from(Vector.parse(`3\n-4,5`)), [3, -4, 5]);
    t.same(Array.from(Vector.parse(`3,\n-45`)), [3, -45, 0]);
    t.same(Array.from(Vector.parse(`3,-45`)), [3, -45, 0]);
    t.same(Array.from(Vector.parse(`3,-4,5`)), [3, -4, 5]);
    t.same(Array.from(Vector.parse(`3,,5`)), [3, 0, 5]);
    {
        const x = [Vector.parse(`1.4142135623730951<45`), Vector.new(1, 1, 0)];
        t.ok(x[0].close_to(x[1]), x);
    }
    {
        const x = [Vector.parse(`  5  <  36.86989765 `), Vector.new(4, 3, 0)];
        t.ok(x[0].close_to(x[1], 1e-9), x);
    }

    {
        const x = [Vector.parse(`  5  <53.13010235`), Vector.new(3, 4, 0)];
        t.ok(x[0].close_to(x[1], 1e-9), x);
    }
    {
        const x = [Vector.new(`5<53.13010235`), Vector.new(3, 4, 0)];
        t.ok(x[0].close_to(x[1], 1e-9), x);
    }
    {
        const x = [Vector.new(`1.4142135623730951<45`), Vector.new(`1 1 0`)];
        t.ok(x[0].close_to(x[1]), x);
    }
    {
        const x = [Vector.new(`  5  <  36.86989765 `), Vector.new(`4, 3, 0`)];
        t.ok(x[0].close_to(x[1], 1e-9), x);
    }
    [
        Vector.new(`5<36.86989765`),
        Vector.new(`4, 3, 0`),
        Vector.new(4, 3, 0),
        Vector.degrees(36.86989765, 5),
        Vector.radians(0.6435011088658199, 5),
    ].forEach((e, i, a) => {
        i > 0 && t.ok(a[i].close_to(a[i - 1], 1e-9), [a[i], a[i - 1]]);
    });
    t.end();
});

test.test(`new Vector`, { bail: !CI }, function (t) {
    let p = new Vector([-7]);
    t.same(p[0], -7);
    t.same(p[1], undefined);
    p = new Vector([-3, 5]);
    t.same(p[0], -3);
    t.same(p[1], 5);
    t.same(p[2], undefined);
    p = new Vector([-3, 5, 9]);
    t.same(p[0], -3);
    t.same(p[1], 5);
    t.same(p[2], 9);
    t.same(p[3], undefined);
    t.end();
});

test.test(`vec Vector`, { bail: !CI }, function (t) {
    function vec(...nums) {
        for (const n of nums) {
            if (isNaN(n)) {
                throw new TypeError(`must be finite <${nums}> <${[...arguments]}>`)
            }
        }
        return new Vector(nums);
    }
    t.same([...Vector.vec(-7, 3)], [-7, 3]);
    t.same([...Vector.vec(-7, 3, -5)], [-7, 3, -5]);
    t.same([...Vector.vec(-7, 3, -5, 0)], [-7, 3, -5, 0]);
    t.same([...Vector.vec(0)], [0]);
    t.same([...Vector.vec()], []);
    t.same(Vector.vec(-7, 3, -5, 0).toString(), '-7, 3, -5, 0');
    t.same(Vector.vec(0).toString(), '0');
    t.same(Vector.vec().toString(), '');
    t.end();
});



import { BoundingInterval, BoundingBox } from 'svggeom';


test.test(`BoundingInterval check`, { bail: !CI }, function (t) {
    let p = new BoundingInterval([4, 5]);
    t.ok(p[0] < p[1]);
    t.ok(p.is_valid());
    t.same([...p], [4, 5]);
    p = new BoundingInterval([5, 4]);
    t.notOk(p[0] < p[1]);
    t.notOk(p.is_valid());
    t.same([...p], [5, 4]);
    // p = new BoundingInterval();
    // t.ok(p[0] < p[1]);
    // t.same([...p], [Infinity, -Infinity]);
    t.end();
});
test.test(`BoundingBox extra`, { bail: !CI }, function (t) {
    const not = BoundingBox.not();
    t.notOk(not.is_valid());
    t.same(BoundingBox.new().dump(), [[Infinity, -Infinity], [Infinity, -Infinity]]);
    t.same(not.dump(), [[Infinity, -Infinity], [Infinity, -Infinity]]);
    t.same(not.toString(), `[Infinity, -Infinity], [Infinity, -Infinity]`);
    not.merge_self(BoundingBox.not());
    t.same(not.toString(), `[Infinity, -Infinity], [Infinity, -Infinity]`);
    // t.same(not.transform(Matrix.parse('translate(100, -100)')).toString(), `[Infinity, -Infinity], [Infinity, -Infinity]`);
    // t.strictSame(not.transform(Matrix.parse('translate(100, -100)')), not);
    t.throws(() => BoundingBox.new(false), TypeError, 'wrong new params');

    t.end();
});