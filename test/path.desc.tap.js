'uses strict';
import test from 'tap';
import {Path, PathData} from 'svggeom';
import './utils.js';
const CI = !!process.env.CI;

test.test(`moveTo`, {bail: CI}, function (t) {
    const p = PathData.moveTo(150, 50);
    t.same(p.toString(), 'M150,50');
    t.same(`${p}`, 'M150,50');
    t.same(`${p.lineTo(200, 100)}`, 'M150,50L200,100');
    t.same(`${p.moveTo(100, 50)}`, 'M150,50L200,100M100,50');
    t.end();
});

test.test('path.closePath() appends a Z command', {bail: CI}, function (t) {
    const p = PathData.moveTo(150, 50);
    t.same(p.toString(), 'M150,50');
    t.same(`${p.closePath()}`, 'M150,50Z');
    t.same(`${p.closePath()}`, 'M150,50ZZ');
    t.end();
});

test.test('path.closePath() does nothing if the path is empty', {bail: CI}, function (t) {
    const p = new PathData();
    t.same(p.toString(), '');
    t.same(`${p.closePath()}`, '');
    t.end();
});

test.test('path.lineTo(x, y) appends an L command', {bail: CI}, function (t) {
    const p = PathData.moveTo(150, 50);
    t.same(p.toString(), 'M150,50');
    t.same(`${p.lineTo(200, 100)}`, 'M150,50L200,100');
    t.same(`${p.lineTo(100, 50)}`, 'M150,50L200,100L100,50');
    t.end();
});

test.test('path.quadraticCurveTo(x1, y1, x, y) appends a Q command', {bail: CI}, function (t) {
    t.same(`${PathData.moveTo(150, 50).quadraticCurveTo(100, 50, 200, 100)}`, 'M150,50Q100,50,200,100');
    t.end();
});

test.test('path.bezierCurveTo(x1, y1, x, y) appends a C command', {bail: CI}, function (t) {
    t.same(`${PathData.moveTo(150, 50).bezierCurveTo(100, 50, 0, 24, 200, 100)}`, 'M150,50C100,50,0,24,200,100');
    t.end();
});

// it("path.arc(x, y, radius, startAngle, endAngle) throws an error if the radius is negative", () => {
//   const p = path(); p.moveTo(150, 100);
//   assert.throws(function() { p.arc(100, 100, -50, 0, Math.PI / 2); }, /negative radius/);
// });
test.test('path.arc(x, y, radius, startAngle, endAngle) throws an error if the radius is negative', {bail: CI}, function (t) {
    t.throwsRE(function () {
        PathData.moveTo(150, 100).arc(100, 100, -50, 0, Math.PI / 2);
    }, /negative radius/);
    t.end();
});

// it("path.arc(x, y, radius, startAngle, endAngle) may append only an M command if the radius is zero", () => {
//   const p = path(); p.arc(100, 100, 0, 0, Math.PI / 2);
//   assertPathEqual(p, "M100,100");
// });
test.test(
    'path.arc(x, y, radius, startAngle, endAngle) may append only an M command if the radius is zero',
    {bail: CI},
    function (t) {
        const p = new PathData();
        t.same(`${p.arc(100, 100, 0, 0, Math.PI / 2)}`, 'M100,100');
        t.end();
    }
);

// it("path.arc(x, y, radius, startAngle, endAngle) may append only an L command if the radius is zero", () => {
//   const p = path(); p.moveTo(0, 0); p.arc(100, 100, 0, 0, Math.PI / 2);
//   assertPathEqual(p, "M0,0L100,100");
// });
test.test(
    'path.arc(x, y, radius, startAngle, endAngle) may append only an L command if the radius is zero',
    {bail: CI},
    function (t) {
        t.same(`${PathData.moveTo(0, 0).arc(100, 100, 0, 0, Math.PI / 2)}`, 'M0,0L100,100');
        t.end();
    }
);

// it("path.arc(x, y, radius, startAngle, endAngle) may append only an M command if the angle is zero", () => {
//   const p = path(); p.arc(100, 100, 0, 0, 0);
//   assertPathEqual(p, "M100,100");
// });

test.test(
    'path.arc(x, y, radius, startAngle, endAngle) may append only an M command if the angle is zero',
    {bail: CI},
    function (t) {
        t.same(`${new PathData().arc(100, 100, 0, 0, 0)}`, 'M100,100');
        t.end();
    }
);

// it("path.arc(x, y, radius, startAngle, endAngle) may append only an M command if the angle is near zero", () => {
//   const p = path(); p.arc(100, 100, 0, 0, 1e-16);
//   assertPathEqual(p, "M100,100");
// });
test.test(
    'path.arc(x, y, radius, startAngle, endAngle) may append only an M command if the angle is near zero',
    {bail: CI},
    function (t) {
        t.same(`${new PathData().arc(100, 100, 0, 0, 1e-16)}`, 'M100,100');
        t.end();
    }
);

// it("path.arc(x, y, radius, startAngle, endAngle) may append an M command if the path was empty", () => {
//   const p1 = path(); p1.arc(100, 100, 50, 0, Math.PI * 2);
//   assertPathEqual(p1, "M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100");
//   const p2 = path(); p2.arc(0, 50, 50, -Math.PI / 2, 0);
//   assertPathEqual(p2, "M0,0A50,50,0,0,1,50,50");
// });

test.test(
    'path.arc(x, y, radius, startAngle, endAngle) may append an M command if the path was empty',
    {bail: CI},
    function (t) {
        t.same(`${new PathData().arc(100, 100, 50, 0, Math.PI * 2)}`, 'M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100');
        // t.same(`${new PathData().arc(0, 50, 50, -Math.PI / 2, 0)}`, "M0,0A50,50,0,0,1,50,50");
        t.end();
    }
);

// it("path.arc(x, y, radius, startAngle, endAngle) may append an L command if the arc doesn???t start at the current point", () => {
//   const p = path(); p.moveTo(100, 100); p.arc(100, 100, 50, 0, Math.PI * 2);
//   assertPathEqual(p, "M100,100L150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100");
// });

// it("path.arc(x, y, radius, startAngle, endAngle) appends a single A command if the angle is less than ??", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, Math.PI / 2);
//   assertPathEqual(p, "M150,100A50,50,0,0,1,100,150");
// });

// it("path.arc(x, y, radius, startAngle, endAngle) appends a single A command if the angle is less than ??", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, Math.PI * 1);
//   assertPathEqual(p, "M150,100A50,50,0,1,1,50,100");
// });

// it("path.arc(x, y, radius, startAngle, endAngle) appends two A commands if the angle is greater than ??", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, Math.PI * 2);
//   assertPathEqual(p, "M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100");
// });

// it("path.arc(x, y, radius, 0, ??/2, false) draws a small clockwise arc", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, Math.PI / 2, false);
//   assertPathEqual(p, "M150,100A50,50,0,0,1,100,150");
// });

// it("path.arc(x, y, radius, -??/2, 0, false) draws a small clockwise arc", () => {
//   const p = path(); p.moveTo(100, 50); p.arc(100, 100, 50, -Math.PI / 2, 0, false);
//   assertPathEqual(p, "M100,50A50,50,0,0,1,150,100");
// });

// it("path.arc(x, y, radius, 0, ??, true) draws an anticlockwise circle", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 1e-16, true);
//   assertPathEqual(p, "M150,100A50,50,0,1,0,50,100A50,50,0,1,0,150,100");
// });

// it("path.arc(x, y, radius, 0, ??, false) draws nothing", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 1e-16, false);
//   assertPathEqual(p, "M150,100");
// });

// it("path.arc(x, y, radius, 0, -??, true) draws nothing", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, -1e-16, true);
//   assertPathEqual(p, "M150,100");
// });

// it("path.arc(x, y, radius, 0, -??, false) draws a clockwise circle", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, -1e-16, false);
//   assertPathEqual(p, "M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100");
// });

// it("path.arc(x, y, radius, 0, ??, true) draws an anticlockwise circle", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 2 * Math.PI, true);
//   assertPathEqual(p, "M150,100A50,50,0,1,0,50,100A50,50,0,1,0,150,100");
// });

// it("path.arc(x, y, radius, 0, ??, false) draws a clockwise circle", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 2 * Math.PI, false);
//   assertPathEqual(p, "M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100");
// });

// it("path.arc(x, y, radius, 0, ?? + ??, true) draws an anticlockwise circle", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 2 * Math.PI + 1e-13, true);
//   assertPathEqual(p, "M150,100A50,50,0,1,0,50,100A50,50,0,1,0,150,100");
// });

// it("path.arc(x, y, radius, 0, ?? - ??, false) draws a clockwise circle", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 2 * Math.PI - 1e-13, false);
//   assertPathEqual(p, "M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100");
// });

// it("path.arc(x, y, radius, ??, 0, true) draws an anticlockwise circle", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 2 * Math.PI, true);
//   assertPathEqual(p, "M150,100A50,50,0,1,0,50,100A50,50,0,1,0,150,100");
// });

// it("path.arc(x, y, radius, ??, 0, false) draws a clockwise circle", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 2 * Math.PI, false);
//   assertPathEqual(p, "M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100");
// });

// it("path.arc(x, y, radius, 0, 13??/2, false) draws a clockwise circle", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 13 * Math.PI / 2, false);
//   assertPathEqual(p, "M150,100A50,50,0,1,1,50,100A50,50,0,1,1,150,100");
// });

// it("path.arc(x, y, radius, 13??/2, 0, false) draws a big clockwise arc", () => {
//   const p = path(); p.moveTo(100, 150); p.arc(100, 100, 50, 13 * Math.PI / 2, 0, false);
//   assertPathEqual(p, "M100,150A50,50,0,1,1,150,100");
// });

// it("path.arc(x, y, radius, ??/2, 0, false) draws a big clockwise arc", () => {
//   const p = path(); p.moveTo(100, 150); p.arc(100, 100, 50, Math.PI / 2, 0, false);
//   assertPathEqual(p, "M100,150A50,50,0,1,1,150,100");
// });

// it("path.arc(x, y, radius, 3??/2, 0, false) draws a small clockwise arc", () => {
//   const p = path(); p.moveTo(100, 50); p.arc(100, 100, 50, 3 * Math.PI / 2, 0, false);
//   assertPathEqual(p, "M100,50A50,50,0,0,1,150,100");
// });

// it("path.arc(x, y, radius, 15??/2, 0, false) draws a small clockwise arc", () => {
//   const p = path(); p.moveTo(100, 50); p.arc(100, 100, 50, 15 * Math.PI / 2, 0, false);
//   assertPathEqual(p, "M100,50A50,50,0,0,1,150,100");
// });

// it("path.arc(x, y, radius, 0, ??/2, true) draws a big anticlockwise arc", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, Math.PI / 2, true);
//   assertPathEqual(p, "M150,100A50,50,0,1,0,100,150");
// });

// it("path.arc(x, y, radius, -??/2, 0, true) draws a big anticlockwise arc", () => {
//   const p = path(); p.moveTo(100, 50); p.arc(100, 100, 50, -Math.PI / 2, 0, true);
//   assertPathEqual(p, "M100,50A50,50,0,1,0,150,100");
// });

// it("path.arc(x, y, radius, -13??/2, 0, true) draws a big anticlockwise arc", () => {
//   const p = path(); p.moveTo(100, 50); p.arc(100, 100, 50, -13 * Math.PI / 2, 0, true);
//   assertPathEqual(p, "M100,50A50,50,0,1,0,150,100");
// });

// it("path.arc(x, y, radius, -13??/2, 0, false) draws a big clockwise arc", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, -13 * Math.PI / 2, false);
//   assertPathEqual(p, "M150,100A50,50,0,1,1,100,50");
// });

// it("path.arc(x, y, radius, 0, 13??/2, true) draws a big anticlockwise arc", () => {
//   const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 13 * Math.PI / 2, true);
//   assertPathEqual(p, "M150,100A50,50,0,1,0,100,150");
// });

// it("path.arc(x, y, radius, ??/2, 0, true) draws a small anticlockwise arc", () => {
//   const p = path(); p.moveTo(100, 150); p.arc(100, 100, 50, Math.PI / 2, 0, true);
//   assertPathEqual(p, "M100,150A50,50,0,0,0,150,100");
// });

// it("path.arc(x, y, radius, 3??/2, 0, true) draws a big anticlockwise arc", () => {
//   const p = path(); p.moveTo(100, 50); p.arc(100, 100, 50, 3 * Math.PI / 2, 0, true);
//   assertPathEqual(p, "M100,50A50,50,0,1,0,150,100");
// });

// it("path.arc(x, y, radius, ??/2, 0, truthy) draws a small anticlockwise arc", () => {
//   for (const trueish of [1, "1", true, 10, "3", "string"]) {
//     const p = path(); p.moveTo(100, 150); p.arc(100, 100, 50, Math.PI / 2, 0, trueish);
//     assertPathEqual(p, "M100,150A50,50,0,0,0,150,100");
//   }
// });

// it("path.arc(x, y, radius, 0, ??/2, falsy) draws a small clockwise arc", () => {
//   for (const falseish of [0, null, undefined]) {
//     const p = path(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, Math.PI / 2, falseish);
//     assertPathEqual(p, "M150,100A50,50,0,0,1,100,150");
//   }
// });

// it("path.arcTo(x1, y1, x2, y2, radius) throws an error if the radius is negative", () => {
//   const p = path(); p.moveTo(150, 100);
//   assert.throws(function() { p.arcTo(270, 39, 163, 100, -53); }, /negative radius/);
// });

// it("path.arcTo(x1, y1, x2, y2, radius) appends an M command if the path was empty", () => {
//   const p = path(); p.arcTo(270, 39, 163, 100, 53);
//   assertPathEqual(p, "M270,39");
// });

// it("path.arcTo(x1, y1, x2, y2, radius) does nothing if the previous point was ???x1,y1???", () => {
//   const p = path(); p.moveTo(270, 39); p.arcTo(270, 39, 163, 100, 53);
//   assertPathEqual(p, "M270,39");
// });

// it("path.arcTo(x1, y1, x2, y2, radius) appends an L command if the previous point, ???x1,y1??? and ???x2,y2??? are collinear", () => {
//   const p = path(); p.moveTo(100, 50); p.arcTo(101, 51, 102, 52, 10);
//   assertPathEqual(p, "M100,50L101,51");
// });

// it("path.arcTo(x1, y1, x2, y2, radius) appends an L command if ???x1,y1??? and ???x2,y2??? are coincident", () => {
//   const p = path(); p.moveTo(100, 50); p.arcTo(101, 51, 101, 51, 10);
//   assertPathEqual(p, "M100,50L101,51");
// });

// it("path.arcTo(x1, y1, x2, y2, radius) appends an L command if the radius is zero", () => {
//   const p = path(); p.moveTo(270, 182), p.arcTo(270, 39, 163, 100, 0);
//   assertPathEqual(p, "M270,182L270,39");
// });

// it("path.arcTo(x1, y1, x2, y2, radius) appends L and A commands if the arc does not start at the current point", () => {
//   const p1 = path(); p1.moveTo(270, 182), p1.arcTo(270, 39, 163, 100, 53);
//   assertPathEqual(p1, "M270,182L270,130.222686A53,53,0,0,0,190.750991,84.179342");
//   const p2 = path(); p2.moveTo(270, 182), p2.arcTo(270, 39, 363, 100, 53);
//   assertPathEqual(p2, "M270,182L270,137.147168A53,53,0,0,1,352.068382,92.829799");
// });

// it("path.arcTo(x1, y1, x2, y2, radius) appends only an A command if the arc starts at the current point", () => {
//   const p = path(); p.moveTo(100, 100), p.arcTo(200, 100, 200, 200, 100);
//   assertPathEqual(p, "M100,100A100,100,0,0,1,200,200");
// });

// it("path.arcTo(x1, y1, x2, y2, radius) sets the last point to be the end tangent of the arc", () => {
//   const p = path(); p.moveTo(100, 100), p.arcTo(200, 100, 200, 200, 50); p.arc(150, 150, 50, 0, Math.PI);
//   assertPathEqual(p, "M100,100L150,100A50,50,0,0,1,200,150A50,50,0,1,1,100,150");
// });

// it("path.rect(x, y, w, h) appends M, h, v, h, and Z commands", () => {
//   const p = path(); p.moveTo(150, 100), p.rect(100, 200, 50, 25);
//   assertPathEqual(p, "M150,100M100,200h50v25h-50Z");
// });

test.test('path.rect(x, y, w, h) appends M, h, v, h, and Z commands', {bail: CI}, function (t) {
    t.same(`${PathData.moveTo(150, 100).rect(100, 200, 50, 25)}`, 'M150,100M100,200h50v25h-50Z');
    t.end();
});
