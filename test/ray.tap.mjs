'uses strict';
import { Ray, RayL, Vec } from 'svggeom';
import { PathDraw } from '../dist/draw.js';
import './utils.js';
import test from 'tap';
const CI = !!process.env.CI;

test.test(`constructor`, { bail: !CI }, function (t) {
    let ray = Ray.new();
    const { x, y, h, v } = ray;
    t.match([x, y, h, v], [0, 0, 1, 0]);

    const {
        dir: { x: vx, y: vy, z: vz },
    } = ray;

    t.match([vx, vy, vz], [1, 0, 0]);
    t.end();
});

test.test(`clone`, { bail: !CI }, function (t) {
    let ray = Ray.new();
    let ray2 = ray.clone();
    t.ok(ray2);
    t.ok(ray2 instanceof Ray);
    t.not(ray, ray2);
    t.end();
});

test.test(`forward, back`, { bail: !CI }, function (t) {
    {
        let { x, y, h, v } = Ray.new().forward(3);
        t.match([x, y, h, v], [3, 0, 1, 0]);
    }
    {
        let { x, y, h, v } = Ray.new().forward(3).back(4);
        t.match([x, y, h, v], [-1, 0, 1, 0]);
    }
    t.end();
});

test.test(`left`, { bail: !CI }, function (t) {
    let ray = Ray.new();

    // 30°–60°–90° triangle
    let { x, y, h, v, dir } = ray
        .forward(1)
        .left((Math.PI * 2) / 3) // 120deg
        .forward(2)
        .left((Math.PI * 5) / 6); // 150deg

    t.almostEqual(x, 0, 1e-11);
    t.almostEqual(y, Math.sqrt(3), 1e-11);
    t.almostEqual(dir.degrees, 270, 1e-11);
    t.almostEqual(dir.radians, (Math.PI * 3) / 2, 1e-11);
    t.almostEqual(h, 0, 1e-11);
    t.almostEqual(v, -1, 1e-11);

    t.end();
});

test.test(`right`, { bail: !CI }, function (t) {
    let ray = Ray.new();

    // 45°–45°–90° triangle
    let { x, y, h, v, dir } = ray
        .right()
        .forward(1)
        .right()
        .forward(1)
        .right(Math.PI * (1 / 2 + 1 / 4))
        .forward(Math.sqrt(2));

    t.almostEqual(x, 0, 1e-11);
    t.almostEqual(y, 0, 1e-11);
    t.almostEqual(dir.degrees, 45, 1e-11);
    t.almostEqual(dir.radians, Math.PI * (1 / 4), 1e-11);
    // t.almostEqual(h, 0, 1e-11);
    // t.almostEqual(v, -1, 1e-11);

    t.end();
});

test.test(`leftd`, { bail: !CI }, function (t) {
    let ray = Ray.new();

    // 30°–60°–90° triangle
    ray = ray.leftd(60).forward(2);

    t.almostEqual(ray.x, 1, 1e-11);
    t.almostEqual(ray.y, Math.sqrt(3), 1e-11);
    t.almostEqual(ray.dir.radians, Math.PI / 3, 1e-11);

    ray = ray.leftd(30).back(Math.sqrt(3));
    t.almostEqual(ray.x, 1, 1e-11);
    t.almostEqual(ray.y, 0, 1e-11);
    t.almostEqual(ray.dir.degrees, 90, 1e-11);

    ray = ray.leftd(90).forward(1);
    t.almostEqual(ray.x, 0, 1e-11);
    t.almostEqual(ray.y, 0, 1e-11);
    t.almostEqual(ray.dir.degrees, 180, 1e-11);

    ray = ray.leftd(180);
    t.almostEqual(ray.x, 0, 1e-11);
    t.almostEqual(ray.y, 0, 1e-11);
    t.almostEqual(ray.dir.degrees % 360, 0, 1e-11);
    t.end();
});

test.test(`rightd`, { bail: !CI }, function (t) {
    let ray = Ray.new();

    // 45°–45°–90° triangle
    ray = ray.rightd(45).forward(Math.sqrt(2));

    t.almostEqual(ray.x, 1, 1e-11);
    t.almostEqual(ray.y, -1, 1e-11);
    t.almostEqual(ray.dir.radians, Math.PI * 2 - Math.PI / 4, 1e-11);

    ray = ray.rightd(180).back(Math.sqrt(2));
    t.almostEqual(ray.x, 2, 1e-11);
    t.almostEqual(ray.y, -2, 1e-11);

    ray = ray.rightd(90).forward(Math.sqrt(2) * 2);
    t.almostEqual(ray.x, 4, 1e-11);
    t.almostEqual(ray.y, 0, 1e-11);
    t.end();
});

test.test(`delta`, { bail: !CI }, function (t) {
    let A = Ray.new();
    let B = Ray.new();

    t.same(A.delta(-3, 4).toArray(), [-3, 4, 0]);
    // t.almostEqual(ray.distance(Vec.new(-3, -4)), 5, 1e-11);
    // t.almostEqual(ray.distance(B.forward(-3).left().back(4)), 5, 1e-11);

    t.end();
});

test.test(`distance`, { bail: !CI }, function (t) {
    let ray = Ray.new();
    let B = Ray.new();

    t.almostEqual(ray.distance(8, 15), 17, 1e-11);
    t.almostEqual(ray.distance(Vec.new(-3, -4)), 5, 1e-11);
    t.almostEqual(ray.distance(B.forward(-3).left().back(4)), 5, 1e-11);

    t.end();
});

test.test(`goto`, { bail: !CI }, function (t) {
    let A = Ray.at(9, 8).goto(1, Math.sqrt(3)).towards(0, 0);

    t.almostEqual(A.dir.degrees, 180 + 60, 1e-11);

    t.end();
});

test.test(`towards`, { bail: !CI }, function (t) {
    let A = Ray.new().towards(1, Math.sqrt(3));

    t.almostEqual(A.dir.degrees, 60, 1e-11);

    t.end();
});

test.test(`away`, { bail: !CI }, function (t) {
    let A = Ray.new().away(1, Math.sqrt(3));

    t.almostEqual(A.dir.degrees, 180 + 60, 1e-11);

    t.end();
});

function* spiralOfTheodorus(opt) {
    const { atan, cos, sin, sqrt } = Math;
    if (typeof opt !== 'object') {
        opt = { n: opt };
    }
    const { n: N, scale, rotate, transalteX, translateY } = opt;
    const sx = scale || 1;
    const sy = scale || 1;
    const tx = transalteX || 0;
    const ty = translateY || 0;
    const cosφ = rotate && cos(rotate);
    const sinφ = rotate && sin(rotate);

    const ONE = 1;

    let φsum = 0;
    for (let n = 1; n < N; ++n) {
        const φ = atan(ONE / sqrt(n));
        let r;
        if (scale) {
            // x *= scale;
            // y *= scale;
            // r *= scale;r
            r = sqrt(n + ONE);
        } else {
            r = sqrt(n + ONE);
        }
        φsum += φ;
        let x = r * cos(φsum);
        let y = r * sin(φsum);

        // // rotate
        // const xp = cos_phi * x - sin_phi * y;
        // const yp = sin_phi * x + cos_phi * y;

        // // translate
        // curve[i + 0] = xp + cx;
        // curve[i + 1] = yp + cy;

        yield [n, r, x, y, φ, φsum];
    }
}

test.test(`Spiral of Theodorus`, { bail: !CI }, function (t) {
    const { PI } = Math;
    let A = Ray.new();
    let B = Ray.new();
    let O = Vec.new(4, 4);
    for (const [n, r, x, y, φ, φsum] of spiralOfTheodorus({
        n: CI ? 444 : 13,
        scale: Math.E,
    })) {
        if (n === 1) {
            B = B.translate(x, y).left();
            O = Ray.new(x, y).left(φ).back(r).pos.clone();
        }
        const P = Vec.new(x, y);
        // console.log(n, r, x, y, (φ / PI) * 180, (φsum / PI) * 180);
        A = Ray.home.left(φsum).forward(r);

        t.almostEqual(A.x, x, 1e-11);
        t.almostEqual(A.y, y, 1e-11);
        t.almostEqual(B.x, x, 1e-11);
        t.almostEqual(B.y, y, 1e-11);
        t.almostEqual(B.distance(O), r, 1e-11);

        B = B.left(φ).forward(1);

        t.ok(B.clone().back(1).pos.closeTo(P));
        t.almostEqual(B.distanceFromLine(O, P), 1, 1e-11);
        t.ok(B.clone().nearestPointOfLine(P, O).closeTo(P));
    }

    t.end();
});

test.test(`RegularPentagon`, { bail: !CI }, function (t) {
    const { PI, E, LN10, LOG2E, sqrt } = Math;
    function degrees(r) {
        const d = (r / PI) * 180;
        return ((d % 360) + 360) % 360;
    }
    // https://mathworld.wolfram.com/RegularPentagon.html
    const φ = (1 + sqrt(5)) / 2;
    const c1 = (sqrt(5) - 1) / 4;
    const c2 = (sqrt(5) + 1) / 4;
    const s1 = sqrt(10 + 2 * sqrt(5)) / 4;
    const s2 = sqrt(10 - 2 * sqrt(5)) / 4;
    const R = 1;
    const a = (R * 10) / sqrt(50 + 10 * sqrt(5));
    const r = (sqrt(25 + 10 * sqrt(5)) * a) / 10;
    // console.log(c1, s1, c2, s2, r, R);

    let A = Ray.after(c1, s1);
    let x, y;
    t.almostEqual(A.distance(Vec.new(0, 0)), R, 1e-11);
    t.almostEqual(A.distance(Vec.new(-c2, -s2)), a + a / φ, 1e-11);

    [x, y] = A.clone()
        .left((PI * 3) / 10)
        .forward(a)
        .pos.toArray();
    t.almostEqual(x, 1, 1e-11);
    t.almostEqual(y, 0, 1e-11);

    [x, y] = A.clone()
        .right((PI * 3) / 10)
        .forward(a)
        .pos.toArray();
    t.almostEqual(x, -c2, 1e-11);
    t.almostEqual(y, s2, 1e-11);

    [x, y] = A.clone().toNearestPointOfLine(Vec.new(-c2, -s2), Vec.new(c1, -s1)).pos.toArray();

    A = A.toMidPoint(Vec.new(-c2, -s2), Vec.new(c1, -s1));
    t.almostEqual(A.x, x, 1e-11);
    t.almostEqual(A.y, y, 1e-11);
    A = A.toNearestPointFromPoint(Vec.new(c1, -s1));
    t.almostEqual(A.x, x, 1e-11);
    t.almostEqual(A.y, y, 1e-11);

    [x, y] = A.clone().back(r).pos.toArray();
    t.almostEqual(x, 0, 1e-11);
    t.almostEqual(y, 0, 1e-11);

    t.almostEqual(Ray.at(1, 0).distanceFromLine(Vec.new(-c2, s2), Vec.new(-c2, -s2)), r + R, 1e-11);
    t.almostEqual(Ray.at(0, 1).distanceFromLine(Vec.new(-s2, -c2), Vec.new(s2, -c2)), r + R, 1e-11);
    t.ok(isNaN(Ray.at(1, 0).distanceFromLine(Vec.new(-s2, -c2), Vec.new(-s2, -c2))));
    // console.log(Array.from(Ray.away(Vec.new(c1, s1)).leftd(72 / 2)))
    t.almostEqual(
        Array.from(
            Ray.away(Vec.new(c1, s1))
                .leftd(72 / 2)
                .forward(R)
        ),
        [c1, -s1, 0]
    );
    t.almostEqual(
        Array.from(
            Ray.before(Vec.new(-c2, -s2))
                .rightd(180 - 54)
                .forward(a)
        ),
        [-c2, s2, 0]
    );
    A = Ray.towards(s1, c1);
    t.almostEqual(
        Array.from(A.intersectOfLine(Vec.new(-s1, c1), Vec.new(-s2, -c2))),
        Array.from(Ray.at(4, 4).toMidPoint(Vec.new(-s1, c1), Vec.new(-s2, -c2)))
    );
    t.almostEqual(
        Array.from(A.nearestPointFromPoint(Vec.new(-s2, -c2))),
        Array.from(Ray.at(4, 4).toMidPoint(Vec.new(-s1, c1), Vec.new(-s2, -c2)))
    );

    A = Ray.at(-s1, c1)
        .turnd(-18)
        .back()
        .back(r + R);
    t.almostEqual(Array.from(A), Array.from(Ray.at(4, 4).toMidPoint(Vec.new(s1, c1), Vec.new(s2, -c2))));
    t.almostEqual(Array.from(A.along(-1, s1, c1)), Array.from(Vec.new(s2, -c2)));

    t.end();
});

test.test(`side`, { bail: !CI }, function (t) {
    const { PI, E, LN10, LOG2E, sqrt } = Math;
    let A;

    A = Ray.towards(0, 1);
    t.equal(A.side(-E, +E), 1);
    t.equal(A.side(-E, -E), 1);
    t.equal(A.side(E, +E), -1);
    t.equal(A.side(E, -E), -1);
    t.equal(A.side(0, -PI), 0);

    A = Ray.towards(0, -1);
    t.equal(A.side(-E, +E), -1);
    t.equal(A.side(-E, -E), -1);
    t.equal(A.side(E, +E), 1);
    t.equal(A.side(E, -E), 1);
    t.equal(A.side(0, PI), 0);

    A = Ray.towards(1 / 2, sqrt(3) / 2).normalToSide(Vec.new(-PI, E));
    t.almostEqual(A.h, -sqrt(3) / 2, 1e-11);
    t.almostEqual(A.v, 1 / 2, 1e-11);

    A = Ray.towards(1 / 2, sqrt(3) / 2).normalToSide(Vec.new(0, -E));
    t.almostEqual(A.h, sqrt(3) / 2, 1e-11);
    t.almostEqual(A.v, -1 / 2, 1e-11);

    t.end();
});

test.test(`draw`, { bail: !CI }, function (t) {
    const { PI, E, LN10, LOG2E, sqrt } = Math;
    let d;

    d = new PathDraw();
    d.quadraticCurveTo(3, 4, 5, 6);

    // console.log(d);
    const s = 'M1,2Q3,4,5,6';
    t.equal(PathDraw.moveTo(1, 2).quadraticCurveTo(3, 4, 5, 6) + '', s);
    t.equal(PathDraw.moveTo(Vec.new(1, 2)).quadraticCurveTo(3, 4, 5, 6) + '', s);
    t.equal(PathDraw.moveTo(Vec.new(1, 2)).quadraticCurveTo(3, 4, Vec.new(5, 6)) + '', s);
    t.equal(PathDraw.moveTo(Vec.new(1, 2)).quadraticCurveTo(Vec.new(3, 4), Vec.new(5, 6)) + '', s);

    t.end();
});

test.test(`pointAlong`, { bail: !CI }, function (t) {
    const { PI, E, LN10, LOG2E, sqrt } = Math;
    let r = Ray.new().turnd(53.13010235415598);

    t.almostEqual(Array.from(r.pointAlong(+5)), [+3, +4, 0]);
    t.almostEqual(Array.from(r.pointAlong(-5)), [-3, -4, 0]);

    t.end();
});

test.test(`with*`, { bail: !CI }, function (t) {
    const { PI, E, LN10, LOG2E, sqrt } = Math;
    let r = Ray.new([1, 2], [3, 4]);

    {
        const { x, y, z, h, v } = r.withH(5);
        t.match([x, y, z, h, v], [1, 2, 0, 5, 4]);
    }
    {
        const { x, y, z, h, v } = r.withV(5);
        t.match([x, y, z, h, v], [1, 2, 0, 3, 5]);
    }
    {
        const { x, y, z, h, v } = r.withX(5);
        t.match([x, y, z, h, v], [5, 2, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.withY(5);
        t.match([x, y, z, h, v], [1, 5, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.withZ(5);
        t.match([x, y, z, h, v], [1, 2, 5, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.shiftX(-11);
        t.match([x, y, z, h, v], [-10, 2, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.shiftY(-11);
        t.match([x, y, z, h, v], [1, -9, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.shiftZ(-11);
        t.match([x, y, z, h, v], [1, 2, -11, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.flipX();
        t.match([x, y, z, h, v], [-1, 2, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.flipY();
        t.match([x, y, z, h, v], [1, -2, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.shiftZ(-11).flipZ();
        t.match([x, y, z, h, v], [1, 2, 11, 3, 4]);
    }

    t.end();
});

test.test(`turn`, { bail: !CI }, function (t) {
    let r = Ray.new([1, 2], [3, 4]);
    const { x, y, z, h, v } = r.turn(Vec.degrees(-53.13010235415598));
    t.match([x, y, z, h, v], [1, 2, 0, 3 / 5, -4 / 5]);
    t.end();
});

test.test(`Ray.dir`, { bail: !CI }, function (t) {
    {
        const { x, y, z, h, v } = Ray.dir(0.9272952180016122);
        t.almostEqual([x, y, z, h, v], [0, 0, 0, 3 / 5, 4 / 5]);
    }
    {
        const { x, y, dir } = Ray.dir(Vec.new(3, 4));
        t.almostEqual([x, y, dir.degrees], [0, 0, 53.13010235415598]);
    }

    t.end();
});

test.test(`RayL`, { bail: !CI }, function (t) {
    const r = RayL.new([1, 2], [3, 4]);
    const a = r.shiftX(10);
    const b = a.shiftY(10);
    const c = b.withDir(Vec.degrees(45));
    const d = c.withX(30).withY(40).before(Vec.new(0, 0));
    {
        const { x, y, z, h, v } = b.prev();
        t.match([x, y, z, h, v], [11, 2, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = a.prev();
        t.match([x, y, z, h, v], [1, 2, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = b;
        t.match([x, y, z, h, v], [11, 12, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = c;
        t.almostEqual([x, y, z, h, v], [11, 12, 0, 0.7071067811865476, 0.7071067811865476]);
    }
    {
        const { x, y, dir } = d;
        t.almostEqual([x, y, dir.degrees], [0, 0, 180 + 53.13010235415598]);
    }

    t.strictNotSame(c, a);
    t.strictNotSame(b, a);
    t.strictNotSame(r, a);
    t.strictSame(a.prev(), r);
    t.strictSame(b.prev(), a);
    t.strictSame(c.prev(), b);
    t.strictSame(d.prev().prev().prev(), c);
    t.strictSame(r.prev(), undefined);
    t.end();
});

test.test(`intersectOfRay`, { bail: !CI }, function (t) {
    const r = RayL.new([1, 2], [3, 4]);
    const a = r.withX(4).withH(0);
    {
        const [x, y] = a.intersectOfRay(r);
        t.almostEqual([x, y], [1 + 3, 2 + 4]);
    }
    t.end();
});

test.test(`normalToLine`, { bail: !CI }, function (t) {
    const r = RayL.pos([3, 0]).normalToLine([0, 0], [3, 4]);
    {
        const { x, y, z, dir } = r;
        t.almostEqual([x, y, z, dir.degrees], [3, 0, 0, 180 - (90 - 53.13010235415598)]);
    }
    t.end();
});

test.test(`normalToSide`, { bail: !CI }, function (t) {
    const r = Ray.dir(Vec.new(3, 4));
    const b = r.normalToSide(Vec.new(30, 40));
    t.strictSame(b, r);
    t.end();
});

test.test(`depreciated`, { bail: !CI }, function (t) {
    const r = Ray.pos(Vec.new(3, 4));
    const [x, y, z] = r.at();
    t.same([x, y, z], [3, 4, 0]);
    t.end();
});
