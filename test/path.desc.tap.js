'uses strict';
import test from 'tap';
import { PathLS, Vector } from 'svggeom';
import { PathDraw } from '../dist/draw.js';
import { dSplit } from '../dist/path/segment/pathse.js';
import './utils.js';
const CI = !!process.env.CI;
// https://github.com/d3/d3-path/blob/main/test/path-test.js
function D(p) {
    return p.toString();
}
function descSplit(p) {
    return dSplit(p); //.map((v) => (isNaN(+v) ? v : +v));
}

test.Test.prototype.addAssert('samePath', 2, function (p, s) {
    const d = typeof p === 'string' ? p : D(p);
    if (d == s) {
        this.pass();
    } else {
        this.fail(`Not same [${p.toString()}]->[${d}] != [${s}]`);
        console.dir(p);
    }
});

function testPath(test, PathClass) {
    const path = function () {
        return new PathClass();
    };

    test.test(`PathSE=${PathClass.name}`, { bail: 1 }, function (t) {
        const it = t.test;
        const path = function () {
            return new PathClass();
        };

        t.test('path.move_to(x, y) appends an M command', t => {
            const p = path();
            p.move_to(150, 50);
            t.samePath(p, 'M150,50');
            p.lineTo(200, 100);
            t.samePath(p, 'M150,50L200,100');
            p.move_to(100, 50);
            t.samePath(p, 'M150,50L200,100M100,50');
            t.end();
        });

        t.test('path.closePath() appends a Z command', t => {
            const p = path();
            p.move_to(150, 50);
            t.samePath(p, 'M150,50');
            p.closePath();
            t.samePath(p, 'M150,50Z');
            p.closePath();
            t.samePath(p, 'M150,50ZZ');
            t.end();
        });

        t.test('path.closePath() does nothing if the path is empty', t => {
            const p = path();
            t.samePath(p, '');
            p.closePath();
            t.samePath(p, '');
            t.end();
        });

        t.test('path.lineTo(x, y) appends an L command', t => {
            const p = path();
            p.move_to(150, 50);
            t.samePath(p, 'M150,50');
            p.lineTo(200, 100);
            t.samePath(p, 'M150,50L200,100');
            p.lineTo(100, 50);
            t.samePath(p, 'M150,50L200,100L100,50');
            t.end();
        });

        t.test('path.quadraticCurveTo(x1, y1, x, y) appends a Q command', t => {
            const p = path();
            p.move_to(150, 50);
            t.samePath(p, 'M150,50');
            p.quadraticCurveTo(100, 50, 200, 100);
            t.samePath(p, 'M150,50Q100,50,200,100');
            t.end();
        });

        t.test('path.bezierCurveTo(x1, y1, x, y) appends a C command', t => {
            const p = path();
            p.move_to(150, 50);
            t.samePath(p, 'M150,50');
            p.bezierCurveTo(100, 50, 0, 24, 200, 100);
            t.samePath(p, 'M150,50C100,50,0,24,200,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, startAngle, endAngle) throws an error if the radius is negative', t => {
            const p = path();
            p.move_to(150, 100);
            t.throwsRE(function () {
                p.arc(100, 100, -50, 0, Math.PI / 2);
            }, /negative radius/);
            t.end();
        });

        t.test('path.arc(x, y, radius, startAngle, endAngle) may append only an M command if the radius is zero', t => {
            const p = path();
            p.arc(100, 100, 0, 0, Math.PI / 2);
            t.samePath(p, 'M100,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, startAngle, endAngle) may append only an L command if the radius is zero', t => {
            const p = path();
            p.move_to(0, 0);
            p.arc(100, 100, 0, 0, Math.PI / 2);
            t.samePath(p, 'M0,0L100,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, startAngle, endAngle) may append only an M command if the angle is zero', t => {
            const p = path();
            p.arc(100, 100, 0, 0, 0);
            t.samePath(p, 'M100,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, startAngle, endAngle) may append only an M command if the angle is near zero', t => {
            const p = path();
            p.arc(100, 100, 0, 0, 1e-16);
            t.samePath(p, 'M100,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, startAngle, endAngle) may append an M command if the path was empty', t => {
            const p1 = path();
            p1.arc(100, 100, 50, 0, Math.PI * 2);
            t.samePath(p1, 'M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100');
            const p2 = path();
            p2.arc(0, 50, 50, -Math.PI / 2, 0);
            t.samePath(p2, 'M0,0A50,50,0,0,1,50,50');
            t.end();
        });

        t.test(
            'path.arc(x, y, radius, startAngle, endAngle) may append an L command if the arc doesn’t start at the current point',
            t => {
                const p = path();
                p.move_to(100, 100);
                p.arc(100, 100, 50, 0, Math.PI * 2);
                t.samePath(p, 'M100,100L150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100');
                t.end();
            }
        );

        t.test('path.arc(x, y, radius, startAngle, endAngle) appends a single A command if the angle is less than π', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, Math.PI / 2);
            t.samePath(p, 'M150,100A50,50,0,0,1,100,150');
            t.end();
        });

        t.test('path.arc(x, y, radius, startAngle, endAngle) appends a single A command if the angle is less than τ', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, Math.PI * 1);
            t.samePath(p, 'M150,100A50,50,0,1,1,50,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, startAngle, endAngle) appends two A commands if the angle is greater than τ', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, Math.PI * 2);
            t.samePath(p, 'M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 0, π/2, false) draws a small clockwise arc', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, Math.PI / 2, false);
            t.samePath(p, 'M150,100A50,50,0,0,1,100,150');
            t.end();
        });

        t.test('path.arc(x, y, radius, -π/2, 0, false) draws a small clockwise arc', t => {
            const p = path();
            p.move_to(100, 50);
            p.arc(100, 100, 50, -Math.PI / 2, 0, false);
            t.samePath(p, 'M100,50A50,50,0,0,1,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 0, ε, true) draws an anticlockwise circle', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, 1e-16, true);
            t.samePath(p, 'M150,100A50,50,0,1,0,50,100A50,50,0,1,0,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 0, ε, false) draws nothing', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, 1e-16, false);
            t.samePath(p, 'M150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 0, -ε, true) draws nothing', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, -1e-16, true);
            t.samePath(p, 'M150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 0, -ε, false) draws a clockwise circle', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, -1e-16, false);
            t.samePath(p, 'M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 0, τ, true) draws an anticlockwise circle', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, 2 * Math.PI, true);
            t.samePath(p, 'M150,100A50,50,0,1,0,50,100A50,50,0,1,0,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 0, τ, false) draws a clockwise circle', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, 2 * Math.PI, false);
            t.samePath(p, 'M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 0, τ + ε, true) draws an anticlockwise circle', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, 2 * Math.PI + 1e-13, true);
            t.samePath(p, 'M150,100A50,50,0,1,0,50,100A50,50,0,1,0,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 0, τ - ε, false) draws a clockwise circle', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, 2 * Math.PI - 1e-13, false);
            t.samePath(p, 'M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, τ, 0, true) draws an anticlockwise circle', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, 2 * Math.PI, true);
            t.samePath(p, 'M150,100A50,50,0,1,0,50,100A50,50,0,1,0,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, τ, 0, false) draws a clockwise circle', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, 2 * Math.PI, false);
            t.samePath(p, 'M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 0, 13π/2, false) draws a clockwise circle', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, (13 * Math.PI) / 2, false);
            t.samePath(p, 'M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 13π/2, 0, false) draws a big clockwise arc', t => {
            const p = path();
            p.move_to(100, 150);
            p.arc(100, 100, 50, (13 * Math.PI) / 2, 0, false);
            t.samePath(p, 'M100,150A50,50,0,1,1,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, π/2, 0, false) draws a big clockwise arc', t => {
            const p = path();
            p.move_to(100, 150);
            p.arc(100, 100, 50, Math.PI / 2, 0, false);
            t.samePath(p, 'M100,150A50,50,0,1,1,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 3π/2, 0, false) draws a small clockwise arc', t => {
            const p = path();
            p.move_to(100, 50);
            p.arc(100, 100, 50, (3 * Math.PI) / 2, 0, false);
            t.samePath(p, 'M100,50A50,50,0,0,1,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 15π/2, 0, false) draws a small clockwise arc', t => {
            const p = path();
            p.move_to(100, 50);
            p.arc(100, 100, 50, (15 * Math.PI) / 2, 0, false);
            t.samePath(p, 'M100,50A50,50,0,0,1,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 0, π/2, true) draws a big anticlockwise arc', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, Math.PI / 2, true);
            t.samePath(p, 'M150,100A50,50,0,1,0,100,150');
            t.end();
        });

        t.test('path.arc(x, y, radius, -π/2, 0, true) draws a big anticlockwise arc', t => {
            const p = path();
            p.move_to(100, 50);
            p.arc(100, 100, 50, -Math.PI / 2, 0, true);
            t.samePath(p, 'M100,50A50,50,0,1,0,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, -13π/2, 0, true) draws a big anticlockwise arc', t => {
            const p = path();
            p.move_to(100, 50);
            p.arc(100, 100, 50, (-13 * Math.PI) / 2, 0, true);
            t.samePath(p, 'M100,50A50,50,0,1,0,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, -13π/2, 0, false) draws a big clockwise arc', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, (-13 * Math.PI) / 2, false);
            t.samePath(p, 'M150,100A50,50,0,1,1,100,50');
            t.end();
        });

        t.test('path.arc(x, y, radius, 0, 13π/2, true) draws a big anticlockwise arc', t => {
            const p = path();
            p.move_to(150, 100);
            p.arc(100, 100, 50, 0, (13 * Math.PI) / 2, true);
            t.samePath(p, 'M150,100A50,50,0,1,0,100,150');
            t.end();
        });

        t.test('path.arc(x, y, radius, π/2, 0, true) draws a small anticlockwise arc', t => {
            const p = path();
            p.move_to(100, 150);
            p.arc(100, 100, 50, Math.PI / 2, 0, true);
            t.samePath(p, 'M100,150A50,50,0,0,0,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, 3π/2, 0, true) draws a big anticlockwise arc', t => {
            const p = path();
            p.move_to(100, 50);
            p.arc(100, 100, 50, (3 * Math.PI) / 2, 0, true);
            t.samePath(p, 'M100,50A50,50,0,1,0,150,100');
            t.end();
        });

        t.test('path.arc(x, y, radius, π/2, 0, truthy) draws a small anticlockwise arc', t => {
            for (const trueish of [1, '1', true, 10, '3', 'string']) {
                const p = path();
                p.move_to(100, 150);
                p.arc(100, 100, 50, Math.PI / 2, 0, trueish);
                t.samePath(p, 'M100,150A50,50,0,0,0,150,100');
            }
            t.end();
        });

        t.test('path.arc(x, y, radius, 0, π/2, falsy) draws a small clockwise arc', t => {
            for (const falseish of [0, null, undefined]) {
                const p = path();
                p.move_to(150, 100);
                p.arc(100, 100, 50, 0, Math.PI / 2, falseish);
                t.samePath(p, 'M150,100A50,50,0,0,1,100,150');
            }
            t.end();
        });

        t.test('path.arcTo(x1, y1, x2, y2, radius) throws an error if the radius is negative', t => {
            const p = path();
            p.move_to(150, 100);
            t.throwsRE(function () {
                p.arcTo(270, 39, 163, 100, -53);
            }, /negative radius/);
            t.end();
        });

        t.test('path.arcTo(x1, y1, x2, y2, radius) appends an M command if the path was empty', t => {
            const p = path();
            p.arcTo(270, 39, 163, 100, 53);
            t.samePath(p, 'M270,39');
            t.end();
        });

        t.test('path.arcTo(x1, y1, x2, y2, radius) does nothing if the previous point was ⟨x1,y1⟩', t => {
            const p = path();
            p.move_to(270, 39);
            p.arcTo(270, 39, 163, 100, 53);
            t.samePath(p, 'M270,39');
            t.end();
        });

        t.test(
            'path.arcTo(x1, y1, x2, y2, radius) appends an L command if the previous point, ⟨x1,y1⟩ and ⟨x2,y2⟩ are collinear',
            t => {
                const p = path();
                p.move_to(100, 50);
                p.arcTo(101, 51, 102, 52, 10);
                t.samePath(p, 'M100,50L101,51');
                t.end();
            }
        );

        t.test('path.arcTo(x1, y1, x2, y2, radius) appends an L command if ⟨x1,y1⟩ and ⟨x2,y2⟩ are coincident', t => {
            const p = path();
            p.move_to(100, 50);
            p.arcTo(101, 51, 101, 51, 10);
            t.samePath(p, 'M100,50L101,51');
            t.end();
        });

        t.test('path.arcTo(x1, y1, x2, y2, radius) appends an L command if the radius is zero', t => {
            const p = path();
            p.move_to(270, 182), p.arcTo(270, 39, 163, 100, 0);
            t.samePath(p, 'M270,182L270,39');
            t.end();
        });

        t.test(
            'path.arcTo(x1, y1, x2, y2, radius) appends L and A commands if the arc does not start at the current point',
            t => {
                const p1 = path();
                p1.move_to(270, 182), p1.arcTo(270, 39, 163, 100, 53);
                t.samePath(p1, 'M270,182L270,130.222686A53,53,0,0,0,190.750991,84.179342');
                const p2 = path();
                p2.move_to(270, 182), p2.arcTo(270, 39, 363, 100, 53);
                t.samePath(p2, 'M270,182L270,137.147168A53,53,0,0,1,352.068382,92.829799');
                t.end();
            }
        );

        t.test('path.arcTo(x1, y1, x2, y2, radius) appends only an A command if the arc starts at the current point', t => {
            const p = path();
            p.move_to(100, 100), p.arcTo(200, 100, 200, 200, 100);
            t.samePath(p, 'M100,100A100,100,0,0,1,200,200');
            t.end();
        });

        t.test('path.arcTo(x1, y1, x2, y2, radius) sets the last point to be the end tangent of the arc', t => {
            const p = path();
            p.move_to(100, 100), p.arcTo(200, 100, 200, 200, 50);
            p.arc(150, 150, 50, 0, Math.PI);
            t.samePath(p, 'M100,100L150,100A50,50,0,0,1,200,150A50,50,0,1,1,100,150');
            t.end();
        });

        t.test('path.rect(x, y, w, h) appends M, h, v, h, and Z commands', t => {
            const p = path();
            p.move_to(150, 100), p.rect(100, 200, 50, 25);
            if (p.constructor.name == 'PathLS') {
                t.samePath(p, 'M150,100M100,200L150,200L150,225L100,225Z');
                t.samePath(p.describe({ relative: true }), 'm150,100m-50,100l50,0l0,25l-50,0z');
                t.samePath(p.describe({ relative: true, short: true }), 'm150,100m-50,100h50v25h-50z');
                t.samePath(p.describe({ short: true }), 'M150,100M100,200H150V225H100Z');
            } else {
                t.samePath(p, 'M150,100M100,200h50v25h-50Z');
            }
            t.end();
        });

        /////
        t.test('path.arcd(x, y, radius, startAngle, endAngle) appends two A commands if the angle is greater than τ', t => {
            const p = path();
            p.move_to(150, 100);
            p.arcd(100, 100, 50, 0, 360);
            t.samePath(p, 'M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100');
            t.end();
        });
        t.end();
    });
    test.test(`PathSE<${PathClass.name}>:Font`, { bail: 1 }, async t =>
        import('opentype.js')
            .then(mod => mod.loadSync('test/CaviarDreams.ttf'))
            .then(font => {
                let s = '!';
                PathClass.digits = 2;
                const par = { font, fontSize: 42 };
                const d1 = par.font.getPath(s, 0, 0, par.fontSize).toPathData(PathClass.digits);
                const d2 = `M3,4` + par.font.getPath(s, 3, 4, par.fontSize).toPathData(PathClass.digits);
                // console.log(d1);
                // console.log(d2);
                const p1 = path().text(par, s).toString();
                const p2 = path().move_to(3, 4).text(par, s).toString();
                t.notSame(d1, d2);
                t.same(descSplit(p1), descSplit(d1));
                t.notSame(descSplit(p1), descSplit(d2));
                t.notSame(descSplit(p2), descSplit(d1));
                t.same(descSplit(p2), descSplit(d2));
            })
    );
    test.test(`PathSE<${PathClass.name}>:Extra`, { bail: 1 }, function (t) {
        const p = PathClass.lineTo(3, 4);
        t.same(p.d(), 'M0,0L3,4');
        t.ok(p.fillStyle);
        t.same(PathClass.move_to(Vector.new(3, 4)).toString(), 'M3,4');
        if (p.constructor.name == 'PathLS') {
            const p2 = PathClass.rect(Vector.new(3, 4), 5, 6);
            t.same(p2.describe({ relative: true, short: true }), 'm3,4h5v6h-5z');
            // console.log(p2.describe());
            t.same(p2.describe({ relative: false, short: false }), 'M3,4L8,4L8,10L3,10Z');

            {
                const [seg, part, len] = p2.segmentAtLength(10);
                t.same(seg?.constructor.name, 'LineLS');
                t.same(part, 5);
                t.same(len, 6);
            }
            {
                const [seg, part, len] = p2.segmentAtLength(21);
                t.same(seg?.constructor.name, 'CloseLS');
                t.same(part, 5);
                t.same(len, 6);
            }
            {
                const [seg, part, len] = p2.segmentAtLength(23);
                t.same(seg?.constructor.name, 'LineLS');
                t.same(part, 1);
                t.same(len, 5);
            }
            {
                const [seg, part, len] = p2.segmentAtLength(-1);
                t.same(seg?.constructor.name, 'CloseLS');
                t.same(part, 5);
                t.same(len, 6);
            }
            {
                const [seg, part, len] = p2.segmentAtLength(0);
                t.same(seg?.constructor.name, 'LineLS');
                t.same(part, 0);
                t.same(len, 5);
            }
            {
                const [seg, part, len] = p2.segmentAtLength(44);
                t.same(seg?.constructor.name, 'CloseLS');
                t.same(part, 6);
                t.same(len, 6);
            }
            {
                const [a, b] = p2.split_at(0);
                t.same(b.describe(), 'M3,4L8,4L8,10L3,10Z');
                t.same(a.describe(), 'M3,4');
            }
            {
                const [x, y] = p2.pointAtLength(5);
                t.same([x, y], [8, 4]);
            }
            {
                const [x, y] = p2.pointAtLength(22);
                t.same([x, y], [3, 4]);
            }
            {
                const [x, y] = p2.pointAtLength(0);
                t.same([x, y], [3, 4]);
            }

            t.same(p2.crop_at(0, 1).describe({ relative: true, short: true }), 'm3,4h5v6h-5z');
            t.same(p2.crop_at(0, 2).describe({ relative: true, short: true }), 'm3,4h5v6h-5z');
            t.same(p2.crop_at(0.5, 1).describe({ relative: false, short: false }), 'M8,10L3,10Z');
            t.same(p2.crop_at(1, 0.5).describe({ relative: false, short: false }), 'M8,10L3,10Z');
            t.same(p2.crop_at(0.5, 0.75).describe({ relative: false, short: false }), 'M8,10L3,10L3,9.5');
            t.same(p2.crop_at(0.75, 0.5).describe({ relative: false, short: false }), 'M8,10L3,10L3,9.5');
            t.same(p2.crop_at(-0.5, -0.25).describe({ relative: false, short: false }), 'M8,10L3,10L3,9.5');

            {
                const [seg, part, len] = PathLS.move_to(0, 0).lineTo(3, 4).segmentAtLength(2.5);
                t.same(seg?.constructor.name, 'LineLS');
                t.same(part, 2.5);
                t.same(len, 5);
            }
            {
                t.notOk(PathClass.parse('Z').bbox().is_valid());
                t.notOk(PathClass.parse('z').bbox().is_valid());
                t.same(
                    PathClass.parse('m 40,60 h 10 10 10 20 v 30 20').describe({ relative: true, short: true }),
                    'm40,60h10h10h10h20v30v20'
                );
                t.same(PathClass.parse('m1,2,3,4,5,6,7,8').describe({ relative: true, short: true }), 'm1,2l3,4l5,6l7,8');
            }
            // Test that additional parameters to pathdata commands are treated as additional calls to the most recent command
            [
                ['M20 20 H40 H60', 'M20 20 H40 60'],
                ['M20 40 h20 h20', 'M20 40 h20 20'],
                ['M120 20 V40 V60', 'M120 20 V40 60'],
                ['M140 20 v20 v20', 'M140 20 v20 20'],
                ['M220 20 L 240 20 L260 20', 'M220 20 L 240 20 260 20 '],
                ['M220 40 l 20 0 l 20 0', 'M220 40 l 20 0 20 0'],
                [
                    'M50 150 C50 50 200 50 200 150 C200 50 350 50 350 150',
                    'M50 150 C50 50 200 50 200 150 200 50 350 50 350 150',
                ],
                [
                    'M50, 200 c0,-100 150,-100 150,0 c0,-100 150,-100 150,0',
                    'M50, 200 c0,-100 150,-100 150,0 0,-100 150,-100 150,0',
                ],
                ['M50 250 S125 200 200 250 S275, 200 350 250', 'M50 250 S125 200 200 250 275, 200 350 250'],
                ['M50 275 s75 -50 150 0 s75, -50 150 0', 'M50 275 s75 -50 150 0 75, -50 150 0'],
                ['M50 300 Q 125 275 200 300 Q 275 325 350 300', 'M50 300 Q 125 275 200 300 275 325 350 300'],
                ['M50 325 q 75 -25 150 0 q 75 25 150 0', 'M50 325 q 75 -25 150 0 75 25 150 0'],
                ['M425 25 T 425 75 T 425 125', 'M425 25 T 425 75 425 125'],
                ['M450 25 t 0 50 t 0 50', 'M450 25 t 0 50 0 50'],
                ['M400,200 A25 25 0 0 0 425 150 A25 25 0 0 0 400 200', 'M400,200 A25 25 0 0 0 425 150 25 25 0 0 0 400 200'],
                ['M400,300 a25 25 0 0 0 25 -50 a25 25 0 0 0 -25 50', 'M400,300 a25 25 0 0 0 25 -50 25 25 0 0 0 -25 50'],
            ].forEach(([a, b]) => {
                t.notSame(a, b);
                const A = PathClass.parse(a).describe({ relative: true, short: true });
                const B = PathClass.parse(b).describe({ relative: true, short: true });
                t.same(A, B, [
                    [a, b],
                    [A, B],
                ]);
            });
        } else {
        }

        t.end();
    });
}

//     def test_wc3_examples19(self):
//         """
//         W3C_SVG_11_TestSuite Paths
//         Test that additional parameters to pathdata commands are treated as additional calls to the most recent command.
//         """
// parse_path = PathSE
// path19a = parse_path("""M20 20 H40 H60""")
// path19b = parse_path("""M20 20 H40 60""")
// self.assertEqual(path19a, path19b)
// path19a = parse_path("""M20 40 h20 h20""")
// path19b = parse_path("""M20 40 h20 20""")
// self.assertEqual(path19a, path19b)
// path19a = parse_path("""M120 20 V40 V60""")
// path19b = parse_path("""M120 20 V40 60""")
// self.assertEqual(path19a, path19b)
// path19a = parse_path("""M140 20 v20 v20""")
// path19b = parse_path("""M140 20 v20 20""")
// self.assertEqual(path19a, path19b)
// path19a = parse_path("""M220 20 L 240 20 L260 20""")
// path19b = parse_path("""M220 20 L 240 20 260 20 """)
// self.assertEqual(path19a, path19b)
// path19a = parse_path("""M220 40 l 20 0 l 20 0""")
// path19b = parse_path("""M220 40 l 20 0 20 0""")
// self.assertEqual(path19a, path19b)
// path19a = parse_path("""M50 150 C50 50 200 50 200 150 C200 50 350 50 350 150""")
// path19b = parse_path("""M50 150 C50 50 200 50 200 150 200 50 350 50 350 150""")
// self.assertEqual(path19a, path19b)
// path19a = parse_path(
//     """M50, 200 c0,-100 150,-100 150,0 c0,-100 150,-100 150,0"""
// )
// path19b = parse_path(
//     """M50, 200 c0,-100 150,-100 150,0 0,-100 150,-100 150,0"""
// )
// self.assertEqual(path19a, path19b)
// path19a = parse_path("""M50 250 S125 200 200 250 S275, 200 350 250""")
// path19b = parse_path("""M50 250 S125 200 200 250 275, 200 350 250""")
// self.assertEqual(path19a, path19b)
// path19a = parse_path("""M50 275 s75 -50 150 0 s75, -50 150 0""")
// path19b = parse_path("""M50 275 s75 -50 150 0 75, -50 150 0""")
// self.assertEqual(path19a, path19b)
// path19a = parse_path("""M50 300 Q 125 275 200 300 Q 275 325 350 300""")
// path19b = parse_path("""M50 300 Q 125 275 200 300 275 325 350 300""")
// self.assertEqual(path19a, path19b)
// path19a = parse_path("""M50 325 q 75 -25 150 0 q 75 25 150 0""")
// path19b = parse_path("""M50 325 q 75 -25 150 0 75 25 150 0""")
// self.assertEqual(path19a, path19b)
// path19a = parse_path("""M425 25 T 425 75 T 425 125""")
// path19b = parse_path("""M425 25 T 425 75 425 125""")
// self.assertEqual(path19a, path19b)
// path19a = parse_path("""M450 25 t 0 50 t 0 50""")
// path19b = parse_path("""M450 25 t 0 50 0 50""")
// self.assertEqual(path19a, path19b)
// path19a = parse_path("""M400,200 A25 25 0 0 0 425 150 A25 25 0 0 0 400 200""")
// path19b = parse_path("""M400,200 A25 25 0 0 0 425 150 25 25 0 0 0 400 200""")
// self.assertEqual(path19a, path19b)
// path19a = parse_path("""M400,300 a25 25 0 0 0 25 -50 a25 25 0 0 0 -25 50""")
// path19b = parse_path("""M400,300 a25 25 0 0 0 25 -50 25 25 0 0 0 -25 50""")
// self.assertEqual(path19a, path19b)

// class O(object):
//     pass

testPath(test, PathDraw);
testPath(test, PathLS);
