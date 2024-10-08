'uses strict';
import './utils.js';
import test from 'tap';
import { Matrix, MatrixMut } from 'svggeom';
import { SVGTransformList, SVGTransform } from 'svggeom';

const CI = !!process.env.CI;

test.test(`Matrix.scale`, { bail: !CI }, function (t) {
    t.ok(Matrix.matrix(2, 0, 0, 2, 0, 0).equals(Matrix.scale(2)), 'x2 scale');
    t.ok(Matrix.matrix(-1, 0, 0, 1, 0, 0).equals(Matrix.scale(-1, 1)), 'hflip');
    t.ok(Matrix.matrix(1, 0, 0, -1, 0, 0).equals(Matrix.scale(1, -1)), 'vflip');
    t.same(Matrix.parse('scale(2,3)').toString(), Matrix.scale(2, 3).toString(), 'scale x y');
    t.same(Matrix.parse('scale(3)').toString(), Matrix.scale(3).toString(), 'scale x y');
    t.same(
        Matrix.parse('scale(2)translate(0,60)').toString(),
        Matrix.scale(2).translate(0, 60).toString(),
        'scale x y'
    );
    t.match(Matrix.scale(2), { a: 2, d: 2 }, 'scale x x');
    t.match(Matrix.scale(2, 3), { a: 2, d: 3 }, 'scale x y');
    t.same(
        Matrix.parse('scale(2)').inverse().toString(),
        Matrix.scale(0.5).toString(),
        'reverse_scale'
    );
    t.end();
});

test.test(`Matrix.skew`, { bail: !CI }, function (t) {
    t.ok(Matrix.parse('skewX(1)').inverse().equals(Matrix.skewX(-1)), 'reverse_skewx');
    t.ok(Matrix.parse('skewY(-1)').inverse().equals(Matrix.skewY(1)), 'reverse_skewy');
    t.end();
});

test.test(`Matrix.rotate`, { bail: !CI }, function (t) {
    t.ok(Matrix.parse('rotate(30)').inverse().equals(Matrix.rotate(-30)), 'reverse_rotate');
    t.ok(Matrix.matrix(0, 1, -1, 0, 0, 0), Matrix.rotate(90));
    t.end();
});

test.test(`Matrix.identity`, { bail: !CI }, function (t) {
    t.ok(Matrix.matrix(1, 0, 0, 1, 0, 0).isIdentity);
    t.notOk(Matrix.matrix(1, 0, 0, 2, 0, 0).isIdentity);
    t.ok(Matrix.identity().equals(Matrix.parse('matrix(1 0 0 1 0 0)')), 'identity');
    t.ok(Matrix.parse('scale(1 1)').isIdentity);
    t.ok(Matrix.parse('rotate(0)').isIdentity);
    t.ok(Matrix.parse('translate(0 0)').isIdentity);
    t.ok(
        Matrix.identity()
            .cat(Matrix.matrix(1, 2, 3, 4, 5, 6))
            .equals(Matrix.parse('matrix(1 2 3 4 5 6)'))
    );
    t.end();
});

test.test(`Matrix.preMultiply`, { bail: !CI }, function (t) {
    const m1 = Matrix.translate(-20, -20).cat(Matrix.scale(2));
    const m2 = Matrix.parse('matrix(2, 0, 0, 2, -20, -20)');
    t.ok(m1.equals(m2), `preMultiply ${m1} ${m2}`);
    t.end();
});

test.test(`Matrix.translateYX`, { bail: !CI }, function (t) {
    const m1 = Matrix.translate(30, -40);
    const m2 = Matrix.translateY(-40).translateX(30);
    const m3 = Matrix.translateX(30).translateY(-40);
    t.ok(m2.equals(m1));
    t.ok(m3.equals(m1));
    t.ok(m2.equals(Matrix.parse('matrix(1 0 0 1 30 -40)')));
    t.end();
});

test.test(`Matrix.inverse`, { bail: !CI }, function (t) {
    const a = Matrix.parse('matrix(1 2 3 4 5 6)');
    const b = Matrix.parse('matrix(7 8 9 0 1 2)');
    const c = Matrix.parse('matrix(3 4 5 6 7 8)');
    const d = a.cat(b).cat(c);
    const e = c.cat(b).cat(a);
    const I = Matrix.identity();
    t.ok(d.is2D);
    t.ok(
        e.equals(e.inverse().inverse(), 1e-9),
        `.inverse().inverse() ${e} ${e.inverse().inverse()}`
    );
    t.ok(a.cat(b.cat(c)).equals(d), `assoc ${d} ${a.cat(b.cat(c))}`);
    t.ok(a.post_cat(b).post_cat(c).equals(e), `assoc ${e} ${a.post_cat(b).post_cat(c)}`);
    t.notOk(b.cat(c).equals(c.cat(b)), `assoc ${c.cat(b)} ${b.cat(c)}`);
    t.ok(b.cat(c).equals(c.post_cat(b)), `assoc ${c.cat(b)} ${b.cat(c)}`);
    // The identity matrix
    t.ok(I.cat(I).cat(I).equals(I), `I When multiplied by itself, the result is itself ${I}`);
    // Suppose A is an m×n matrix and I is the n×n identity matrix
    t.ok(a.cat(I).equals(a), `A*I = A, ${a} ${I}`);
    // A square n×n matrix A is said to have an inverse A⁻¹ if and only if
    t.ok(d.inverse().cat(d).equals(I, 1e-9), `A⁻¹*A = I, ${d} ${d.inverse()}`);
    t.ok(d.cat(d.inverse()).equals(I, 1e-9), `A*A⁻¹ = I, ${d} ${d.inverse()}`);
    // If A and B are invertible matrices, then AB is invertible and (A*B)⁻¹ = B⁻¹*A⁻¹
    t.ok(
        a.cat(b).inverse().equals(b.inverse().cat(a.inverse()), 1e-9),
        `(A*B)⁻¹ = B⁻¹*A⁻¹ ${a} ${b}`
    );
    // I is invertible and I⁻¹=I
    t.ok(I.inverse().equals(I), `I⁻¹=I ${I}`);

    t.end();
});

test.test(`logic`, { bail: !CI }, function (t) {
    const m1 = Matrix.parse('translate(0,60)scale(2)');
    const m2 = Matrix.parse('scale(2)translate(0,60)');
    // console.log(m1.describe(), m1.inverse());
    // console.log(m2.describe(), m2.inverse());
    t.notOk(m1.equals(m2), `${m1} ${m2}`);
    t.end();
});

test.test(`SVGTransform`, { bail: !CI }, function (t) {
    const m1 = new SVGTransform();
    m1.setMatrix(Matrix.matrix(1, 2, 3, 4, 5, 6));
    t.same(m1.type, 1);
    t.ok(m1.matrix.equals(Matrix.parse('matrix(1 2 3 4 5 6)')));
    t.same(m1.toString(), `matrix(1 2 3 4 5 6)`);
    m1.setTranslate(3, 4);
    t.same(m1.type, 2);
    t.match(m1.describe(), /^translate\(3[, ]4\)$/);
    t.match(m1.matrix.describe(), /^translate\(3[, ]4\)$/);
    t.same(m1.toString(), `translate(3 4)`);
    m1.setScale(5, 6);
    t.same(m1.type, 3);
    t.match(m1.describe(), /^scale\(5[, ]6\)$/);
    t.match(m1.matrix.describe(), /^scale\(5[, ]6\)$/);
    t.same(m1.toString(), `scale(5 6)`);
    m1.setRotate(90, 0, 0);
    t.same(m1.type, 4);
    t.same(m1.angle, 90);
    t.match(m1.describe(), /^rotate\(90\)$/);
    t.same(m1.toString(), `rotate(90)`);
    m1.setSkewX(10);
    t.same(m1.type, 5);
    t.same(m1.angle, 10);
    t.ok(m1.matrix.equals(Matrix.new('matrix(1 0 0.176327 1 0 0)'), 1e-5));
    t.same(m1.toString(), `skewX(10)`);
    m1.setSkewY(10);
    t.same(m1.type, 6);
    t.same(m1.angle, 10);
    t.ok(m1.matrix.equals(Matrix.new('matrix(1 0.176327 0 1 0 0)'), 1e-5));
    t.same(m1.toString(), `skewY(10)`);

    m1.setRotate(45, 3, 4);
    t.same(m1.type, 4);
    t.same(m1.angle, 45);
    // t.match(m1.toString(), /^rotate\(45[, ]3[, ]4\)$/);
    t.match(m1.toString(), /^rotate\(45[, ]3[, ]4\)$/);
    m1.setRotate(45, 3);
    t.same(m1.type, 4);
    t.same(m1.angle, 45);
    t.match(m1.toString(), /^rotate\(45[, ]3(?:[, ]0)?\)$/);
    m1.setRotate(45, 0, 4);
    t.same(m1.type, 4);
    t.same(m1.angle, 45);
    t.match(m1.toString(), /^rotate\(45[, ]0(?:[, ]4)?\)$/);
    m1.setTranslate(3);
    t.same(m1.type, 2);
    t.match(m1.matrix.describe(), /^translate\(3[, ]0\)$/);
    t.same(m1.toString(), `translate(3)`);
    m1.setTranslate(0, 3);
    t.same(m1.type, 2);
    t.match(m1.matrix.describe(), /^translate\(0[, ]3\)$/);
    t.same(m1.toString(), `translate(0 3)`);
    m1.setScale(2, 2);
    t.same(m1.type, 3);
    t.match(m1.matrix.describe(), /^scale\(2\)$/);
    t.same(m1.toString(), `scale(2)`);
    {
        //
        t.same(SVGTransform.translate(4, 5).constructor.name, `SVGTransform`);
        t.same(SVGTransform.scale(4, 5).constructor.name, `SVGTransform`);
        t.same(SVGTransform.rotate(4).constructor.name, `SVGTransform`);
        t.same(SVGTransform.skewX(4).constructor.name, `SVGTransform`);
        t.same(SVGTransform.skewY(4).constructor.name, `SVGTransform`);
        // t.same(SVGTransform.matrix(1, 2, 3, 4, 5, 6).constructor.name, `SVGTransform`);
        t.same(SVGTransform.parse(``).constructor.name, `SVGTransform`);
        t.same(SVGTransform.parse(`scale(2)`).constructor.name, `SVGTransform`);
    }
    t.end();
});

test.test(`SVGTransformList`, { bail: !CI }, function (t) {
    {
        const tl = SVGTransformList._parse(`translate(3 4)`);
        t.same(tl.numberOfItems, 1);
        t.same(tl.toString(), `translate(3 4)`);
    }
    {
        const tl = new SVGTransformList();
        t.same(tl.numberOfItems, 0);
        t.same(tl.toString(), ``);
    }
    {
        const tl = SVGTransformList._parse('translate(10 10) rotate(90)');
        const t1 = tl.getItem(0);
        const t2 = tl.getItem(1);
        t.same(tl.numberOfItems, 2);
        t.ok(t1.matrix.equals(Matrix.new('matrix(1, 0, 0, 1, 10, 10)'), 1e-5));
        t.ok(t2.matrix.equals(Matrix.new('matrix(0, 1, -1, 0, 0, 0)'), 1e-5));
        t.match(tl.toString(), /^translate\(10\s*10\)\s*rotate\(90\)$/);
        const tfm = tl.consolidate();
        t.ok(tfm.matrix.equals(Matrix.new('matrix(0, 1, -1, 0, 10, 10)'), 1e-5));
        t.ok(t1.matrix.equals(Matrix.new('matrix(1, 0, 0, 1, 10, 10)'), 1e-5));
        t.ok(t2.matrix.equals(Matrix.new('matrix(0, 1, -1, 0, 0, 0)'), 1e-5));
        // check that modifying t1 has no effect on the consolidated transform
        t1.setTranslate(10, 200);
        t.ok(t1.matrix.equals(Matrix.new('matrix(1, 0, 0, 1, 10, 200)'), 1e-5));
        t.ok(tfm.matrix.equals(Matrix.new('matrix(0, 1, -1, 0, 10, 10)'), 1e-5));
        const t4 = new SVGTransform();
        const t5 = new SVGTransform();
        t4.setRotate(-90);
        t5.setTranslate(-10, -10);
        tl.appendItem(t4);
        tl.appendItem(t5);
        const tfm2 = tl.consolidate();
        // console.dir(tfm2);
        t.ok(tfm2.matrix.equals(Matrix.identity(), 1e-5));
    }
    {
        t.ok(
            SVGTransformList._parse('scale(10, 5)')
                .consolidate()
                .matrix.equals(Matrix.parse('scale(10, 5)'), 1e-5)
        );
        t.ok(
            SVGTransformList._parse('translateX(3)translateY(4)')
                .consolidate()
                .matrix.equals(Matrix.new('matrix(1, 0, 0, 1, 3, 4)'), 1e-5)
        );
    }
    {
        const tl = SVGTransformList._parse('translate(10 10) rotate(90)');
        tl.removeItem(0);
        t.same(tl.numberOfItems, 1);
        t.same(tl.toString(), `rotate(90)`);
    }
    {
        const tl = SVGTransformList._parse('translate(10 10) rotate(90)');
        tl.removeItem(1);
        t.same(tl.numberOfItems, 1);
        t.same(tl.toString(), `translate(10 10)`);
    }

    {
        const tl = SVGTransformList._parse('translate(10 10) rotate(90)');
        const t4 = new SVGTransform();
        t4.setTranslate(-10, -10);
        tl.replaceItem(t4, 1);
        t.same(tl.toString(), `translate(10 10)translate(-10 -10)`);
        t.same(tl.numberOfItems, 2);
        t.ok(tl.consolidate().matrix.equals(Matrix.identity(), 1e-5));
    }
    {
        const tl = SVGTransformList._parse('translate(10 10) rotate(90)');
        const t4 = new SVGTransform();
        t4.setRotate(-90);
        tl.insertItemBefore(t4, 1);
        t.same(tl.toString(), `translate(10 10)rotate(-90)rotate(90)`);
        t.same(tl.numberOfItems, 3);
        t.ok(tl.consolidate().matrix.equals(Matrix.translate(10, 10), 1e-5));
    }

    {
        const tl = SVGTransformList._parse(' skewY(60) matrix(1, 0, 0, 1, 3, 4) skewX(30)');
        t.same(tl.numberOfItems, 3);
        t.ok(tl.consolidate().matrix.equals(Matrix.skewY(60).translate(3, 4).skewX(30), 1e-5));

        {
            // https://github.com/michielbdejong/gecko-dev/blob/4ca96f2eee849a7c3a7f9ad1838c95fe9b5cba2b/dom/svg/test/test_SVGTransformList.xhtml
            const m = new SVGTransform();
            m.setMatrix(Matrix.matrix(1, 2, 3, 4, 5, 6));

            // "Creates an SVGTransform object which is initialized to transform of type
            // SVG_TRANSFORM_MATRIX and whose values are the given matrix. The values from
            // the parameter matrix are copied, the matrix parameter is not adopted as
            // SVGTransform::matrix."
            tl.clear();
            const tr = tl.createSVGTransformFromMatrix(m);

            // Check that list hasn't changed
            t.same(tl.numberOfItems, 0);

            // Check return value
            t.same(tr.type, SVGTransform.SVG_TRANSFORM_MATRIX);
            t.same(tr.toString(), `matrix(1 2 3 4 5 6)`);

            // Check values are copied
            t.notStrictEqual(tr.matrix, m, 'Matrix should be copied not adopted');
            m.setTranslate(0, 5);
            t.same(
                tr.toString(),
                `matrix(1 2 3 4 5 6)`,
                'Changing source matrix should not affect newly created transform'
            );
        }
    }

    t.end();
});

test.test(`Matrix Sub Class`, { bail: !CI }, function (t) {
    class MatrixSubClass extends Matrix { }
    t.same(MatrixSubClass.skewX(4).constructor.name, `MatrixSubClass`);
    t.same(MatrixSubClass.fromArray([1, 2, 3, 4, 5, 6]).constructor.name, `MatrixSubClass`);
    t.same(MatrixSubClass.parse().constructor.name, `MatrixSubClass`);
    t.same(MatrixSubClass.parse(`\t`).constructor.name, `MatrixSubClass`);
    t.same(MatrixSubClass.parse(`matrix(7 8 9 0 1 2)`).constructor.name, `MatrixSubClass`);
    t.same(MatrixSubClass.matrix(1, 2, 3, 4, 5, 6).constructor.name, `MatrixSubClass`);
    t.same(MatrixSubClass.identity().constructor.name, `MatrixSubClass`);
    t.same(MatrixSubClass.translate(4, 5).constructor.name, `MatrixSubClass`);
    t.same(MatrixSubClass.scale(4, 5).constructor.name, `MatrixSubClass`);
    t.same(MatrixSubClass.rotate(4).constructor.name, `MatrixSubClass`);
    t.same(MatrixSubClass.skewX(4).constructor.name, `MatrixSubClass`);
    t.same(MatrixSubClass.skewY(4).constructor.name, `MatrixSubClass`);
    t.end();
});

test.test(`case rotate(90,400,300)`, { bail: !CI }, function (t) {
    const tl = SVGTransformList._parse('rotate(90,400,300)');
    t.same(tl.numberOfItems, 1);
    // console.dir(tl);
    t.same(tl.toString(), `rotate(90 400 300)`);
    t.same(tl.toString(), `rotate(90 400 300)`);
    t.ok(Matrix.parse("matrix(0 1 -1 0 700 -100)").equals(tl.consolidate()));
    t.end();
});

test.test(`MatrixMut`, { bail: !CI }, function (t) {
    // const m1 = MatrixMut.parse('translate(3,4)');
    const a = Matrix.parse('matrix(1 2 3 4 5 6)');
    const b = Matrix.parse('matrix(0 0 0 0 9 7)');
    const c = a.inverse()
    const d = a.cat(b).cat(c);
    console.log(d);
    t.end();
});
