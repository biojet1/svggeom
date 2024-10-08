'uses strict';
import './utils.js';
import test from 'tap';
import { Matrix, MatrixMut } from 'svggeom';
import { SVGTransformList, SVGTransform } from 'svggeom';

const CI = !!process.env.CI;

test.test(`logic`, { bail: !CI }, function (t) {
    const m1 = Matrix.parse('rotate(60)');
    const m2 = Matrix.parse('translate(3,4)rotate(30)translate(-3,-4)');
    console.log(m1.cat(m2.inverse()).describe());
    console.log(m1.cat(m2.inverse()).describe());

    t.end();
});

test.test(`skewX anchor`, { bail: !CI }, function (t) {
    const x = -3;
    const y = 42;
    const θ = 36;

    const m1 = Matrix.translate(x, y).skewX(θ).translate(-x, -y);
    const m2 = (function () {
        const A = (θ * Math.PI) / 180;
        const tanθ = Math.tan(A);
        return Matrix.matrix(1, 0, tanθ, 1, -y * tanθ, 0);
    })();

    t.ok(m1.equals(m2), [m1, m2]);
    t.not(m1.equals(Matrix.translate(-x, -y).skewX(θ).translate(x, y)));

    t.end();
});

test.test(`skewY anchor`, { bail: !CI }, function (t) {
    const x = -3;
    const y = 42;
    const θ = 36;

    const m1 = Matrix.translate(x, y).skewY(θ).translate(-x, -y);
    const m2 = (function () {
        const tanθ = Math.tan((θ * Math.PI) / 180);
        return Matrix.matrix(1, tanθ, 0, 1, 0, -x * tanθ);
    })();

    t.ok(m1.equals(m2, 1e-14), [m1, m2]);
    t.not(m1.equals(Matrix.translate(-x, -y).skewY(θ).translate(x, y)));

    t.end();
});
test.test(`take_apart`, { bail: !CI }, function (t) {
    const m = Matrix.identity();
    {
        const { rotation, scale, skew, skew_axis, translation } = m.take_apart();
        t.same(scale, [1, 1]);
        t.same(rotation, 0);
        t.same(skew, 0);
        t.same(skew_axis, 0);
        t.same(translation, [0, 0]);
    }
    {
        const { rotation, scale, skew, skew_axis, translation } = Matrix.translate(10, 23).take_apart();
        t.same(scale, [1, 1]);
        t.same(rotation, 0);
        t.same(skew, 0);
        t.same(skew_axis, 0);
        t.same(translation, [10, 23]);
    }
    {
        const { rotation, scale, skew, skew_axis, translation } = Matrix.scale(2, -3).take_apart();
        t.same(scale, [2, -3]);
        t.same(rotation, 0);
        t.same(skew, 0);
        t.same(skew_axis, 0);
        t.same(translation, [0, 0]);
    }
    {
        const m = Matrix.rotate(-9);
        // console.log(m);
        const { rotation, scale, skew, skew_axis, translation } = m.take_apart();
        t.same(scale, [1, 1]);
        t.almostEqual(rotation, -9, 0.00001);
        t.same(skew, 0);
        t.same(skew_axis, 0);
        t.same(translation, [0, 0]);
    }
    {
        for (const deg of [0, 45, 90, -0, -55, -90, -1, 1, -359, -181]) {
            const m = Matrix.rotate(deg);
            // console.log(m);
            const { rotation, scale, skew, skew_axis, translation } = m.take_apart();
            t.almostEqual(scale[0], 1);
            t.almostEqual(scale[1], 1);
            t.almostEqual(rotation, (deg < -180) ? (deg + 360) : deg, 0.00001, `deg=${deg}`);
            t.same(skew, 0);
            t.same(skew_axis, 0);
            t.same(translation, [0, 0]);
        }
    }
    {
        for (const deg of [0, 45, 90, -0, -55, -90, -1, 1]) {
            const m = Matrix.skew(deg, 0);
            // console.log(m);
            const { rotation, scale, skew, skew_axis, translation } = m.take_apart();
            t.almostEqual(scale[0], 1);
            t.almostEqual(scale[1], 1);
            t.almostEqual(rotation, 0);
            t.same(skew, deg);
            t.same(skew_axis, 0);
            t.same(translation, [0, 0]);
        }

    }
    t.end();
});