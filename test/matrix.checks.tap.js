'uses strict';
import './utils.js';
import test from 'tap';
import {Matrix, MatrixMut} from 'svggeom';
import {SVGTransformList, SVGTransform} from 'svggeom';

const CI = !!process.env.CI;

test.test(`logic`, {bail: !CI}, function (t) {
    const m1 = Matrix.parse('rotate(60)');
    const m2 = Matrix.parse('translate(3,4)rotate(30)translate(-3,-4)');
    console.log(m1.cat(m2.inverse()).describe())

    t.end();
});
