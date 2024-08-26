'uses strict';
import { Ray, LinkedRay, Vector, PathLC } from 'svggeom';
import './utils.js';
import test from 'tap';
const CI = !!process.env.CI;

test.test(`constructor`, { bail: !CI }, function (t) {
    let ray = Ray.home;
    const { x, y, h, v } = ray;
    t.match([x, y, h, v], [0, 0, 1, 0]);

    const {
        dir: { x: vx, y: vy, z: vz },
    } = ray;

    t.match([vx, vy, vz], [1, 0, 0]);
    t.end();
});

test.test(`clone`, { bail: !CI }, function (t) {
    let ray = Ray.home;
    let ray2 = ray.clone();
    t.ok(ray2);
    t.ok(ray2 instanceof Ray);
    t.not(ray, ray2);
    t.end();
});

test.test(`forward, back`, { bail: !CI }, function (t) {
    {
        let { x, y, h, v } = Ray.home.forward(3);
        t.match([x, y, h, v], [3, 0, 1, 0]);
    }
    {
        let { x, y, h, v } = Ray.home.forward(3).back(4);
        t.match([x, y, h, v], [-1, 0, 1, 0]);
    }
    t.end();
});

test.test(`left`, { bail: !CI }, function (t) {
    let ray = Ray.home;

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
    let ray = Ray.home;

    // 45°–45°–90° triangle
    let { x, y, dir } = ray
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
    let ray = Ray.home;

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
    let ray = Ray.home;

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
    let A = Ray.home;

    t.same([...A.delta([-3, 4])], [-3, 4, 0]);
    // t.almostEqual(ray.distance(Vector.new(-3, -4)), 5, 1e-11);
    // t.almostEqual(ray.distance(B.forward(-3).left().back(4)), 5, 1e-11);

    t.end();
});

test.test(`distance`, { bail: !CI }, function (t) {
    let ray = Ray.home;
    let B = Ray.home;

    t.almostEqual(ray.distance([8, 15]), 17, 1e-11);
    t.almostEqual(ray.distance(Vector.pos(-3, -4)), 5, 1e-11);
    t.almostEqual(ray.distance(B.forward(-3).left().back(4)), 5, 1e-11);

    t.end();
});

test.test(`goto`, { bail: !CI }, function (t) {
    let A = Ray.at([9, 8]).goto([1, Math.sqrt(3)]).towards([0, 0]);

    t.almostEqual(A.dir.degrees, 180 + 60, 1e-11);

    t.end();
});

test.test(`towards`, { bail: !CI }, function (t) {
    let A = Ray.home.towards([1, Math.sqrt(3)]);

    t.almostEqual(A.dir.degrees, 60, 1e-11);

    t.end();
});

test.test(`away`, { bail: !CI }, function (t) {
    let A = Ray.home.away([1, Math.sqrt(3)]);

    t.almostEqual(A.dir.degrees, 180 + 60, 1e-11);

    t.end();
});

function* spiralOfTheodorus(opt) {
    const { atan, cos, sin, sqrt } = Math;
    if (typeof opt !== 'object') {
        opt = { n: opt };
    }
    const { n: N, scale } = opt;

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
    let A = Ray.home;
    let B = Ray.home;
    let O = Vector.new(4, 4);
    for (const [n, r, x, y, φ, φsum] of spiralOfTheodorus({
        n: CI ? 444 : 13,
        scale: Math.E,
    })) {
        if (n === 1) {
            B = B.translate([x, y]).left();
            O = Ray.new([x, y]).left(φ).back(r).pos.clone();
        }
        const P = Vector.new(x, y);
        // console.log(n, r, x, y, (φ / PI) * 180, (φsum / PI) * 180);
        A = Ray.home.left(φsum).forward(r);

        t.almostEqual(A.x, x, 1e-11);
        t.almostEqual(A.y, y, 1e-11);
        t.almostEqual(B.x, x, 1e-11);
        t.almostEqual(B.y, y, 1e-11);
        t.almostEqual(B.distance(O), r, 1e-11);

        B = B.left(φ).forward(1);

        t.ok(B.clone().back(1).pos.close_to(P));
        t.almostEqual(B.distance_from_line(O, P), 1, 1e-11);
        t.ok(B.clone().nearest_point_of_line(P, O).close_to(P));
    }

    t.end();
});

test.test(`RegularPentagon`, { bail: !CI }, function (t) {
    const { PI, sqrt } = Math;
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

    let A = Ray.after([c1, s1]);
    let x, y;
    t.almostEqual(A.distance(Vector.new(0, 0)), R, 1e-11);
    t.almostEqual(A.distance(Vector.new(-c2, -s2)), a + a / φ, 1e-11);

    [x, y] = A.clone()
        .left((PI * 3) / 10)
        .forward(a)
        .pos;
    t.almostEqual(x, 1, 1e-11);
    t.almostEqual(y, 0, 1e-11);

    [x, y] = A.clone()
        .right((PI * 3) / 10)
        .forward(a)
        .pos;
    t.almostEqual(x, -c2, 1e-11);
    t.almostEqual(y, s2, 1e-11);

    [x, y] = A.clone().to_nearest_point_of_line(Vector.new(-c2, -s2), Vector.new(c1, -s1)).pos;

    A = A.to_mid_point(Vector.new(-c2, -s2), Vector.new(c1, -s1));
    t.almostEqual(A.x, x, 1e-11);
    t.almostEqual(A.y, y, 1e-11);
    A = A.to_nearest_point_from_point(Vector.new(c1, -s1));
    t.almostEqual(A.x, x, 1e-11);
    t.almostEqual(A.y, y, 1e-11);

    [x, y] = A.clone().back(r).pos;
    t.almostEqual(x, 0, 1e-11);
    t.almostEqual(y, 0, 1e-11);

    t.almostEqual(Ray.at([1, 0]).distance_from_line(Vector.new(-c2, s2), Vector.new(-c2, -s2)), r + R, 1e-11);
    t.almostEqual(Ray.at([0, 1]).distance_from_line(Vector.new(-s2, -c2), Vector.new(s2, -c2)), r + R, 1e-11);
    t.ok(isNaN(Ray.at([1, 0]).distance_from_line(Vector.new(-s2, -c2), Vector.new(-s2, -c2))));
    // console.log(Array.from(Ray.away(Vector.new(c1, s1)).leftd(72 / 2)))
    t.almostEqual(
        Array.from(
            Ray.away(Vector.new(c1, s1))
                .leftd(72 / 2)
                .forward(R)
        ),
        [c1, -s1, 0]
    );
    t.almostEqual(
        Array.from(
            Ray.before(Vector.new(-c2, -s2))
                .rightd(180 - 54)
                .forward(a)
        ),
        [-c2, s2, 0]
    );
    A = Ray.towards([s1, c1]);
    t.almostEqual(
        Array.from(A.intersect_of_line(Vector.new(-s1, c1), Vector.new(-s2, -c2))),
        Array.from(Ray.at([4, 4]).to_mid_point(Vector.new(-s1, c1), Vector.new(-s2, -c2)))
    );
    t.almostEqual(
        Array.from(A.nearest_point_from_point(Vector.new(-s2, -c2))),
        Array.from(Ray.at([4, 4]).to_mid_point(Vector.new(-s1, c1), Vector.new(-s2, -c2)))
    );

    A = Ray.at([-s1, c1])
        .turnd(-18)
        .back()
        .back(r + R);
    t.almostEqual(Array.from(A), Array.from(Ray.at([4, 4]).to_mid_point(Vector.pos(s1, c1), Vector.pos(s2, -c2))));
    t.almostEqual(Array.from(A.along(-1, [s1, c1])), Array.from(Vector.new(s2, -c2)));

    t.end();
});

test.test(`side`, { bail: !CI }, function (t) {
    const { PI, E, sqrt } = Math;
    let A;

    A = Ray.towards([0, 1]);
    t.equal(A.side([-E, +E]), 1);
    t.equal(A.side([-E, -E]), 1);
    t.equal(A.side([E, +E]), -1);
    t.equal(A.side([E, -E]), -1);
    t.equal(A.side([0, -PI]), 0);

    A = Ray.towards([0, -1]);
    t.equal(A.side([-E, +E]), -1);
    t.equal(A.side([-E, -E]), -1);
    t.equal(A.side([E, +E]), 1);
    t.equal(A.side([E, -E]), 1);
    t.equal(A.side([0, PI]), 0);

    A = Ray.towards([1 / 2, sqrt(3) / 2]).normal_to_side(Vector.new(-PI, E));
    t.almostEqual(A.h, -sqrt(3) / 2, 1e-11);
    t.almostEqual(A.v, 1 / 2, 1e-11);

    A = Ray.towards([1 / 2, sqrt(3) / 2]).normal_to_side(Vector.new(0, -E));
    t.almostEqual(A.h, sqrt(3) / 2, 1e-11);
    t.almostEqual(A.v, -1 / 2, 1e-11);

    t.end();
});

test.test(`draw`, { bail: !CI }, function (t) {
    const { PI, E, LN10, LOG2E, sqrt } = Math;
    let d;
    d = new PathLC();
    d.quadraticCurveTo(3, 4, 5, 6);
    const s = 'M1,2Q3,4,5,6';
    t.equal(PathLC.move_to([1, 2]).quadraticCurveTo(3, 4, 5, 6) + '', s);
    t.equal(PathLC.move_to(Vector.new(1, 2)).quadraticCurveTo(3, 4, 5, 6) + '', s);
    t.end();
});

test.test(`point_along`, { bail: !CI }, function (t) {
    const { PI, E, LN10, LOG2E, sqrt } = Math;
    let r = Ray.home.turnd(53.13010235415598);

    t.almostEqual(Array.from(r.point_along(+5)), [+3, +4, 0]);
    t.almostEqual(Array.from(r.point_along(-5)), [-3, -4, 0]);

    t.end();
});

test.test(`with*`, { bail: !CI }, function (t) {
    const { PI, E, LN10, LOG2E, sqrt } = Math;
    let r = Ray.new([1, 2], [3, 4]);

    {
        const { x, y, z, h, v } = r.with_h(5);
        t.match([x, y, z, h, v], [1, 2, 0, 5, 4]);
    }
    {
        const { x, y, z, h, v } = r.with_v(5);
        t.match([x, y, z, h, v], [1, 2, 0, 3, 5]);
    }
    {
        const { x, y, z, h, v } = r.with_x(5);
        t.match([x, y, z, h, v], [5, 2, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.with_y(5);
        t.match([x, y, z, h, v], [1, 5, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.with_z(5);
        t.match([x, y, z, h, v], [1, 2, 5, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.shift_x(-11);
        t.match([x, y, z, h, v], [-10, 2, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.shift_y(-11);
        t.match([x, y, z, h, v], [1, -9, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.shift_z(-11);
        t.match([x, y, z, h, v], [1, 2, -11, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.flip_x();
        t.match([x, y, z, h, v], [-1, 2, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.flip_y();
        t.match([x, y, z, h, v], [1, -2, 0, 3, 4]);
    }
    {
        const { x, y, z, h, v } = r.shift_z(-11).flip_z();
        t.match([x, y, z, h, v], [1, 2, 11, 3, 4]);
    }

    t.end();
});

test.test(`turn`, { bail: !CI }, function (t) {
    let r = Ray.new([1, 2], [3, 4]);
    const { x, y, z, h, v } = r.turn(Vector.degrees(-53.13010235415598));
    t.match([x, y, z, h, v], [1, 2, 0, 3 / 5, -4 / 5]);
    t.end();
});

test.test(`Ray.dir`, { bail: !CI }, function (t) {
    {
        const { x, y, z, h, v } = Ray.dir(0.9272952180016122);
        t.almostEqual([x, y, z, h, v], [0, 0, 0, 3 / 5, 4 / 5]);
    }
    {
        const { x, y, dir } = Ray.dir(Vector.new(3, 4));
        t.almostEqual([x, y, dir.degrees], [0, 0, 53.13010235415598]);
    }

    t.end();
});

test.test(`LinkedRay`, { bail: !CI }, function (t) {
    const r = LinkedRay.new([1, 2], [3, 4]);
    const a = r.shift_x(10);
    const b = a.shift_y(10);
    const c = b.with_dir(Vector.degrees(45));
    const d = c.with_x(30).with_y(40).before(Vector.new(0, 0));
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

test.test(`intersect_of_ray`, { bail: !CI }, function (t) {
    const r = LinkedRay.new([1, 2], [3, 4]);
    const a = r.with_x(4).with_h(0);
    {
        const [x, y] = a.intersect_of_ray(r);
        t.almostEqual([x, y], [1 + 3, 2 + 4]);
    }
    t.end();
});

test.test(`normal_to_line`, { bail: !CI }, function (t) {
    const r = LinkedRay.pos([3, 0]).normal_to_line([0, 0], [3, 4]);
    {
        const { x, y, z, dir } = r;
        t.almostEqual([x, y, z, dir.degrees], [3, 0, 0, 180 - (90 - 53.13010235415598)]);
    }
    t.end();
});

test.test(`normal_to_side`, { bail: !CI }, function (t) {
    const r = Ray.dir(Vector.new(3, 4));
    const b = r.normal_to_side(Vector.new(30, 40));
    t.strictSame(b, r);
    t.end();
});

test.test(`depreciated`, { bail: !CI }, function (t) {
    const r = Ray.pos(Vector.new(3, 4));
    const [x, y, z] = r.at();
    t.same([x, y, z], [3, 4, 0]);
    t.end();
});
