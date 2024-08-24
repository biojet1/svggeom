'uses strict';
import { spawn } from 'child_process';
import { BoundingBox, Matrix, Vector } from 'svggeom';
import test from 'tap';
const CI = !!process.env.CI;
function rect_a(b) {
    return [b.left, b.top, b.width, b.height]
}
export async function* enum_box_data(env) {
    const pyproc = spawn('python3', ['test/data.box.py'], {
        stdio: ['ignore', 'pipe', 'inherit'],
        env: { ...process.env, ...env },
    });
    let last,
        i = 0;

    for await (const chunk of pyproc.stdout) {
        const lines = ((last ?? '') + chunk.toString()).split(/\r?\n/);
        last = lines.pop();

        for (const item of lines.map(value => JSON.parse(value))) {
            // console.log(item.points);
            yield [i++, item];
        }
    }
}

for await (const [i, item] of enum_box_data({})) {
    const {
        x,
        y,
        width,
        height,
        top,
        bottom,
        left,
        right,
        centerX,
        centerY,
        maxX,
        maxY,
        minX,
        minY,
    } = item;

    test.test(`BoundingBox(${x},${y},${width},${height}) (${[minX, maxX]},${[minY, maxY]})`, { bail: !CI }, function (t) {
        let box2, box;
        let name = `(${x}, ${y}, ${width}, ${height})(${[minX, maxX]},${[minY, maxY]})`;
        switch (i % 4) {
            case 1:
                box = BoundingBox.new(x, y, width, height);
                box2 = BoundingBox.extrema(minX, maxX, minY, maxY);
                break;
            case 2:
                box = BoundingBox.new(`${x}, ${y}, ${width}, ${height}`);
                box2 = BoundingBox.new(`${left} ${top} ${width} ${height}`);
                break;
            case 3:
                box = BoundingBox.rect(x, y, width, height);
                box2 = BoundingBox.rect(left, top, width, height);
                break;
            default:
                box = BoundingBox.rect(x, y, width, height);
                box2 = BoundingBox.check([maxX, minX], [maxY, minY]); // reverse
        }
        const ex = [item, box];
        t.ok(isFinite(box.top));
        t.ok(isFinite(box.left));

        t.equal(box.left, x, 'x', ex);
        t.equal(box.top, y, 'y', ex);
        t.equal(box.width, width, 'width', ex);
        t.equal(box.height, height, 'height', ex);
        t.ok(box.top === y);
        t.notOk(box.top === Infinity);
        t.ok(box instanceof BoundingBox);

        t.equal(box.left, left, 'left', ex);
        t.equal(box.right, right, 'right', ex);
        t.equal(box.top, top, 'top', ex);
        t.equal(box.bottom, bottom, 'bottom', ex);
        t.equal(box.center_x, centerX, 'centerX', ex);
        t.equal(box.center_y, centerY, 'centerY', ex);
        t.equal(box.center.toString(), (new Vector([centerX, centerY])).toString(), ex);

        t.equal(box.min_x, minX, 'minX', ex);
        t.equal(box.min_y, minY, 'minY', ex);
        t.equal(box.max_x, maxX, 'maxX', ex);
        t.equal(box.max_y, maxY, 'maxY', ex);
        t.ok(box2.is_valid());
        t.ok(box.is_valid());
        t.equal(box2.left, x, 'x', ex);
        t.equal(box2.top, y, `y {box2}`, ex);
        t.equal(box2.width, width, 'width', ex);
        t.equal(box2.height, height, 'height', ex);
        t.strictSame(box.clone().center_x, box2.center_x);
        t.strictSame(box2.clone().center_y, box.center_y);

        {
            const m = Matrix.parse('translate(100, -100)')
            const box3 = box.transform(m);
            t.equal(box3.center_x, centerX + 100, 'centerX', box3);
            t.equal(box3.center_y, centerY - 100, 'centerY', box3);
            t.equal(box3.width, width, 'width', ex);
            t.equal(box3.height, height, 'height', ex);
        }
        {
            const not = BoundingBox.new();
            t.strictSame(not.merge(box2).dump(), box2.dump());
            t.same(not.merge(not).dump(), not.dump(), [not.merge(not), not]);
            t.strictSame(box.merge(not).dump(), box.dump());
        }
        {
            const not = BoundingBox.not();
            t.strictSame(not.merge(box2).dump(), box2.dump());
            t.strictSame(not.merge(not).dump(), not.dump());
            t.strictSame(box.merge(not).dump(), box.dump());
        }

        t.end();
    });
}

test.test(`BoundingBox extra`, { bail: !CI }, function (t) {
    const not = BoundingBox.not();
    t.notOk(not.is_valid());
    t.strictSame(BoundingBox.new().dump(), not.dump());
    t.same(not.toString(), `[Infinity, -Infinity], [Infinity, -Infinity]`);
    // not.merge_self(BoundingBox.not());
    // t.same(not.toString(), `[Infinity, -Infinity], [Infinity, -Infinity]`);
    // // t.same(not.transform(Matrix.parse('translate(100, -100)')).toString(), `[Infinity, -Infinity], [Infinity, -Infinity]`);
    // // t.strictSame(not.transform(Matrix.parse('translate(100, -100)')), not);
    t.throws(() => BoundingBox.new(false), TypeError, 'wrong new params');

    t.end();
});

const B = BoundingBox.new('-130,-90,130,90');
const D = BoundingBox.new('-60,-50,150,90');
const C = BoundingBox.new('-60 -50 60 50');
const A = BoundingBox.new('-210,-150,80,60');
const E = BoundingBox.new('-130,-90,0,0');
const F = BoundingBox.new('-130,-90,70,90');
const G = BoundingBox.new('-60,-90,60,40');
test.test(`BoundingBox overlap`, { bail: !CI }, function (t) {
    const bbox2 = BoundingBox.new([[2, 3], [1, 2]]);
    const bbox1 = BoundingBox.new([[0, 1], [2, 3]]);
    t.same(bbox1.overlap(bbox1).dump(), bbox1.dump());
    t.same(bbox2.overlap(bbox2).dump(), bbox2.dump());
    t.strictSame(bbox1.overlap(bbox2).dump(), BoundingBox.not().dump());
    t.strictSame(bbox2.overlap(bbox1).dump(), BoundingBox.not().dump());
    t.strictSame(bbox2.overlap(BoundingBox.not()).dump(), bbox2.dump());

    t.same(BoundingBox.not().overlap(bbox1.dump()), bbox1.dump());

    // const bbox1 = BoundingBox.new([-210, -150, 60, 3]);
    // Array.from(document.getElementsByTagName("rect")).sort().map(e=>`const ${e.id} = BoundingBox.new('${e.x.baseVal.value},${e.y.baseVal.value},${e.width.baseVal.value},${e.height.baseVal.value}');`).join('\n')
    t.same(B.overlap(D).dump(), C.dump());
    t.same(D.overlap(B).dump(), C.dump());
    t.same(A.overlap(B).dump(), E.dump());
    t.same(B.overlap(A).dump(), E.dump());
    t.strictSame(A.overlap(C).dump(), BoundingBox.not().dump());
    t.strictSame(C.overlap(A).dump(), BoundingBox.not().dump());
    t.end();
});

// test.test(`BoundingBox equals`, {bail: !CI }, function (t) {
//     function eq(a, b, epsilon = 0) {
//         t.ok(a.equals(b, epsilon), `${a}, ${b}`);
//     }
//     function ne(a, b, epsilon = 0) {
//         t.notOk(a.equals(b, epsilon), `${a}, ${b}`);
//     }
//     ne(C, D);
//     ne(D, C);
//     eq(C, C);
//     eq(D, D);
//     ne(BoundingBox.new('-130,-90,130,90'), BoundingBox.new('-130,-90,130,90.01'));
//     eq(BoundingBox.new('-130,-90,130,90'), BoundingBox.new('-130,-90,130,90.01'), 0.0109);
//     eq(BoundingBox.new('-130,-90,130,90'), BoundingBox.new('-130,-90,130.01,90'), 0.0109);
//     eq(BoundingBox.new('-130,-90,130,90'), BoundingBox.new('-130,-90.01,130,90'), 0.0109);
//     eq(BoundingBox.new('-130,-90,130,90'), BoundingBox.new('-130.01,-90,130,90'), 0.0109);
//     t.end();
// });

test.test(`BoundingBox merge`, { bail: !CI }, function (t) {
    t.same(C.merge(D).toString(), D.toString());
    t.same(D.merge(C).toString(), D.toString());
    t.same(B.overlap(C).merge(D).toString(), D.toString());
    t.same(E.merge(C).merge(F).toString(), B.toString());
    t.same(BoundingBox.merge(C, F, E).toString(), B.toString());

    const not = BoundingBox.not();
    t.same(BoundingBox.merge(C, not).toString(), C.toString());
    t.same(BoundingBox.merge(not, C).toString(), C.toString());
    t.same(BoundingBox.merge(not, not).toString(), not.toString());
    t.same(not.toString(), `[Infinity, -Infinity], [Infinity, -Infinity]`);
    not.merge_self(not)
    t.same(not.toString(), `[Infinity, -Infinity], [Infinity, -Infinity]`);
    // t.same(not.merge(not).toString(), `[Infinity, -Infinity], [Infinity, -Infinity]`);
    t.same(not.merge(not).toString(), not.toString());
    t.notOk(not.is_valid());
    t.same(not.merge(C).toString(), C.toString());
    t.same(C.merge(not).toString(), C.toString());

    for (const b of [A, B, C, D, E, F]) {
        t.same(not.merge(b).toString(), b.toString());
        t.same(b.merge(not).toString(), b.toString());
    }
    let box = BoundingBox.not();

    for (const b of [C, G, F]) {
        box = box.merge(b);
    }
    t.same(box.toString(), B.toString());
    t.ok(box.equals(B), [box, B, box.toString(), B.toString()]);
    const n1 = BoundingBox.not();
    const n2 = BoundingBox.not();
    t.strictSame(n1.merge(n2).dump(), n2.dump());
    t.end();
});

// test.test(`BoundingBox fromRect`, {bail: !CI }, function (t) {
//     t.same(BoundingBox.fromRect({ x: -20, width: 400 }).toArray(), [-20, 0, 400, 0]);
//     t.same(BoundingBox.fromRect({ y: -20, height: 400 }).toArray(), [0, -20, 0, 400]);
//     t.end();
// });

// test.test(`BoundingBox mutable`, { bail: !CI }, function (t) {
//     const a = BoxMut.new([0, 0, 100, 100]);
//     const b = BoxMut.parse('-60 -50 60 50');

//     t.same(a.constructor.name, 'BoxMut');
//     t.same(b.constructor.name, 'BoxMut');

//     // // const b = new BoxRO(0, 0, 100, 100);

//     a.x = 80;
//     t.match(a.toString().split(/[,s]+/), ['80', '0', '100', '100']);
//     a.y = -44;
//     t.match(a.toString().split(/[,s]+/), ['80', '-44', '100', '100']);
//     a.width = 20;
//     t.match(a.toString().split(/[,s]+/), ['80', '-44', '20', '100']);
//     a.height = 30;
//     t.match(a.toString().split(/[,s]+/), ['80', '-44', '20', '30']);

//     t.match(`${a.copy(b)}`.split(/[,s]+/), [-60, -50, 60, 50]);
//     t.notOk(BoxMut.new().is_valid());
//     // t.ok(BoxMut.new().equal(BoxMut.not()));
//     t.match(`${BoxMut.not().copy(b)}`.split(/[,s]+/), [-60, -50, 60, 50]);
//     t.match(`${BoxMut.not().mergeSelf(b)}`.split(/[,s]+/), [-60, -50, 60, 50]);

//     t.match(`${BoxMut.not().mergeSelf(b)}`.split(/[,s]+/), [-60, -50, 60, 50]);

//     t.match(BoxMut.not().mergeSelf(C).mergeSelf(BoxMut.not()).mergeSelf(F).toArray(), B.toArray());

//     // const a = BoxMut.new([0, 0, 100, 100]);

//     // t.throws(() => {
//     //  a.freeze().x = 60;
//     // }, TypeError);
//     // t.strictSame(a.x, 80);
//     {
//         let b;
//         b = BoxMut.new('-210,-150,80,60');
//         b.inflateSelf(5, 6);
//         t.same(b.toArray(), [-215, -156, 90, 72]);
//         b = BoxMut.new('-210,-150,80,60');
//         b.inflateSelf(6);
//         t.same(b.toArray(), [-216, -156, 92, 72]);
//         b.sizeSelf(10);
//         t.same(b.toArray(), [-216, -156, 10, 72]);
//         b.sizeSelf(6, 4);
//         t.same(b.toArray(), [-216, -156, 6, 4]);
//         b.sizeSelf(undefined, 3);
//         t.same(b.toArray(), [-216, -156, 6, 3]);
//     }
//     t.end();
// });


test.test(`BoundingBox withCenter`, { bail: !CI }, function (t) {
    let b = D.with_center([197, 122]);
    t.same(rect_a(b), [122, 77, 150, 90]);
    t.same(rect_a(b.with_min_x(197)), [197, 77, 150, 90]);
    t.same(rect_a(b.with_min_y(122)), [122, 122, 150, 90]);
    t.end();
});

test.test(`BoundingBox inflated`, { bail: !CI }, function (t) {
    let b = A.inflated(5, 6);
    // const A = BoundingBox.new('-210,-150,80,60');
    t.same(rect_a(A.inflated(5, 6)), [-210 - 5, -150 - 6, 80 + 5 + 5, 60 + 6 + 6]);
    t.same(rect_a(A.inflated(6)), [-210 - 6, -150 - 6, 80 + 6 + 6, 60 + 6 + 6]);
    t.end();
});

// test.test(`BoundingBox isEmpty`, {bail: !CI }, function (t) {
//     t.same(A.isEmpty(), false);
//     t.same(BoundingBox.not().isEmpty(), false);
//     t.same(BoundingBox.new('-0,0,0,-0').isEmpty(), true);
//     t.end();
// });

test.test(`BoundingBox with_size with_pos`, { bail: !CI }, function (t) {
    t.same(rect_a(B.with_size([150, 90]).with_pos([-60, -50])), rect_a(D));
    t.same(rect_a(C.with_pos([-130, -90]).with_size([130, 90])), rect_a(B));
    t.same(rect_a(E.with_size([0, 0])), rect_a(E));
    t.same(rect_a(E.with_size([70, 90])), rect_a(F));
    t.same(rect_a(C.with_pos([-60, -50])), rect_a(C));
    t.same(rect_a(E.with_pos([0, 0])), [0, 0, 0, 0]);
    t.end();
});
