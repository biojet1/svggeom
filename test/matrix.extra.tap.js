'uses strict';
import './utils.js';
import test from 'tap';
import {Matrix} from 'svggeom';

const CI = !!process.env.CI;

test.test(`Matrix.scale`, {bail: !CI}, function (t) {
    t.ok(Matrix.hexad(2, 0, 0, 2, 0, 0).equals(Matrix.scale(2)), 'x2 scale');
    t.ok(Matrix.hexad(-1, 0, 0, 1, 0, 0).equals(Matrix.scale(-1, 1)), 'hflip');
    t.ok(Matrix.hexad(1, 0, 0, -1, 0, 0).equals(Matrix.scale(1, -1)), 'vflip');
    t.same(Matrix.parse('scale(2,3)').toString(), Matrix.scale(2, 3).toString(), 'scale x y');
    t.same(Matrix.parse('scale(3)').toString(), Matrix.scale(3).toString(), 'scale x y');
    t.same(Matrix.parse('scale(2)translate(0,60)').toString(), Matrix.scale(2).translate(0, 60).toString(), 'scale x y');
    t.match(Matrix.scale(2), {a: 2, d: 2}, 'scale x x');
    t.match(Matrix.scale(2, 3), {a: 2, d: 3}, 'scale x y');
    t.same(Matrix.parse('scale(2)').inverse().toString(), Matrix.scale(0.5).toString(), 'reverse_scale');
    t.end();
});

test.test(`Matrix.skew`, {bail: !CI}, function (t) {
    t.ok(Matrix.parse('skewX(1)').inverse().equals(Matrix.skewX(-1)), 'reverse_skewx');
    t.ok(Matrix.parse('skewY(-1)').inverse().equals(Matrix.skewY(1)), 'reverse_skewy');
    t.end();
});

test.test(`Matrix.rotate`, {bail: !CI}, function (t) {
    t.ok(Matrix.parse('rotate(30)').inverse().equals(Matrix.rotate(-30)), 'reverse_rotate');
    t.ok(Matrix.hexad(0, 1, -1, 0, 0, 0), Matrix.rotate(90));
    t.end();
});

test.test(`Matrix.identity`, {bail: !CI}, function (t) {
    t.ok(Matrix.hexad(1, 0, 0, 1, 0, 0).isIdentity);
    t.notOk(Matrix.hexad(1, 0, 0, 2, 0, 0).isIdentity);
    t.ok(Matrix.identity().equals(Matrix.parse('matrix(1 0 0 1 0 0)')), 'identity');
    t.ok(Matrix.parse('scale(1 1)').isIdentity);
    t.ok(Matrix.parse('rotate(0)').isIdentity);
    t.ok(Matrix.parse('translate(0 0)').isIdentity);
    t.ok(Matrix.identity().cat(Matrix.hexad(1, 2, 3, 4, 5, 6)).equals(Matrix.parse('matrix(1 2 3 4 5 6)')));
    t.end();
});

test.test(`Matrix.preMultiply`, {bail: !CI}, function (t) {
    const m1 = Matrix.translate(-20, -20).cat(Matrix.scale(2));
    const m2 = Matrix.parse('matrix(2, 0, 0, 2, -20, -20)');
    t.ok(m1.equals(m2), `preMultiply ${m1} ${m2}`);
    t.end();
});

test.test(`Matrix.translateYX`, {bail: !CI}, function (t) {
    const m1 = Matrix.translate(30, -40);
    const m2 = Matrix.translateY(-40).translateX(30);
    const m3 = Matrix.translateX(30).translateY(-40);
    t.ok(m2.equals(m1));
    t.ok(m3.equals(m1));
    t.ok(m2.equals(Matrix.parse('matrix(1 0 0 1 30 -40)')));
    t.end();
});

test.test(`Matrix.inverse`, {bail: !CI}, function (t) {
    const a = Matrix.parse('matrix(1 2 3 4 5 6)');
    const b = Matrix.parse('matrix(7 8 9 0 1 2)');
    const c = Matrix.parse('matrix(3 4 5 6 7 8)');
    const d = a.cat(b).cat(c);
    const e = c.cat(b).cat(a);
    const I = Matrix.identity();
    t.ok(d.is2D);
    t.ok(e.equals(e.inverse().inverse(), 1e-9), `.inverse().inverse() ${e} ${e.inverse().inverse()}`);
    t.ok(a.cat(b.cat(c)).equals(d), `assoc ${d} ${a.cat(b.cat(c))}`);
    t.ok(a.postCat(b).postCat(c).equals(e), `assoc ${e} ${a.postCat(b).postCat(c)}`);
    t.notOk(b.cat(c).equals(c.cat(b)), `assoc ${c.cat(b)} ${b.cat(c)}`);
    t.ok(b.cat(c).equals(c.postCat(b)), `assoc ${c.cat(b)} ${b.cat(c)}`);
    // The identity matrix
    t.ok(I.cat(I).cat(I).equals(I), `I When multiplied by itself, the result is itself ${I}`);
    // Suppose A is an m×n matrix and I is the n×n identity matrix
    t.ok(a.cat(I).equals(a), `A*I = A, ${a} ${I}`);
    // A square n×n matrix A is said to have an inverse A⁻¹ if and only if
    t.ok(d.inverse().cat(d).equals(I, 1e-9), `A⁻¹*A = I, ${d} ${d.inverse()}`);
    t.ok(d.cat(d.inverse()).equals(I, 1e-9), `A*A⁻¹ = I, ${d} ${d.inverse()}`);
    // If A and B are invertible matrices, then AB is invertible and (A*B)⁻¹ = B⁻¹*A⁻¹
    t.ok(a.cat(b).inverse().equals(b.inverse().cat(a.inverse()), 1e-9), `(A*B)⁻¹ = B⁻¹*A⁻¹ ${a} ${b}`);
    // I is invertible and I⁻¹=I
    t.ok(I.inverse().equals(I), `I⁻¹=I ${I}`);

    t.end();
});

test.test(`logic`, {bail: !CI}, function (t) {
    const m1 = Matrix.parse('translate(0,60)scale(2)');
    const m2 = Matrix.parse('scale(2)translate(0,60)');
    console.log(m1.describe(), m1.inverse());
    console.log(m2.describe(), m2.inverse());
    t.notOk(m1.equals(m2), `${m1} ${m2}`);
    t.end();
});
