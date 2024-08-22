'uses strict';
import { spawn } from 'child_process';
import { BoundingBox, Matrix, BoxMut, Vector } from 'svggeom';
import test from 'tap';
const CI = !!process.env.CI;

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
        rigth,
        centerX,
        centerY,
        maxX,
        maxY,
        minX,
        minY,
    } = item;

    test.test(`BoundingBox(${x},${y},${width},${height})`, { bail: !CI }, function (t) {
        let box2, box;
        switch (i % 4) {
            case 1:
                box = BoundingBox.new(x, y, width, height);
                box2 = BoundingBox.extrema(minX, maxX, maxY, minY);
                break;
            case 2:
                box = BoundingBox.new(`${x}, ${y}, ${width}, ${height}`);
                box2 = BoundingBox.new(`${left} ${top} ${width} ${height}`);
                break;
            case 3:
                box = BoundingBox.new({ x, y, width, height });
                box2 = BoundingBox.new({ left, top, width, height });
                break;
            default:
                box = BoundingBox.rect(x, y, width, height);
                box2 = BoundingBox.extrema(maxX, minX, maxY, minY); // reverse
        }
        const ex = [item, box];

        t.equal(box.x, x, 'x', ex);
        t.equal(box.y, y, 'y', ex);
        t.equal(box.width, width, 'width', ex);
        t.equal(box.height, height, 'height', ex);

        t.equal(box.left, left, 'left', ex);
        t.equal(box.rigth, rigth, 'rigth', ex);
        t.equal(box.top, top, 'top', ex);
        t.equal(box.bottom, bottom, 'bottom', ex);
        t.equal(box.centerX, centerX, 'centerX', ex);
        t.equal(box.centerY, centerY, 'centerY', ex);
        t.equal(box.center.toString(), Vector.new(centerX, centerY).toString(), ex);

        t.equal(box.minX, minX, 'minX', ex);
        t.equal(box.minY, minY, 'minY', ex);
        t.equal(box.maxX, maxX, 'maxX', ex);
        t.equal(box.maxY, maxY, 'maxY', ex);

        t.equal(box2.x, x, 'x', ex);
        t.equal(box2.y, y, 'y', ex);
        t.equal(box2.width, width, 'width', ex);
        t.equal(box2.height, height, 'height', ex);
        t.ok(box2.isValid());
        t.ok(box.isValid());
        t.strictSame(box.clone().centerX, box2.centerX);
        t.strictSame(box2.clone().centerY, box.centerY);
        const box3 = box.transform(Matrix.parse('translate(100, -100)'));

        t.equal(box3.centerX, centerX + 100, 'centerX', box3);
        t.equal(box3.centerY, centerY - 100, 'centerY', box3);
        t.equal(box3.width, width, 'width', ex);
        t.equal(box3.height, height, 'height', ex);
        {
            const not = BoundingBox.new();
            t.strictSame(not.merge(box2), box2);
            t.strictSame(not.merge(not), not);
            t.strictSame(box.merge(not), box);
        }
        t.same(box2.toArray(), [x, y, width, height]);
        {
            const not = BoundingBox.rect(NaN, NaN, NaN, NaN);
            t.strictSame(not.merge(box2), box2);
            t.strictSame(not.merge(not), not);
            t.strictSame(box.merge(not), box);
        }
        t.end();
    });
}

test.test(`BoundingBox extra`, { bail: !CI }, function (t) {
    const not = BoundingBox.not();
    t.notOk(not.isValid());
    t.strictSame(BoundingBox.new(), not);
    t.same(BoundingBox.empty().toArray(), [0, 0, 0, 0]);
    t.strictSame(not.transform(Matrix.parse('translate(100, -100)')), not);
    t.throws(() => BoundingBox.new(false), TypeError, 'wrong new params');

    // self.assertEqual(tuple(BoundingBox((0, 10), (0, 10)) +
    //                        BoundingBox((-10, 0), (-10, 0))), ((-10, 10), (-10, 10)))
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
    const bbox2 = BoundingBox.new([
        [2, 3],
        [1, 2],
    ]);
    const bbox1 = BoundingBox.new([
        [0, 1],
        [2, 3],
    ]);
    t.same(bbox1.overlap(bbox1).toArray(), bbox1.toArray());
    t.same(bbox2.overlap(bbox2).toArray(), bbox2.toArray());
    t.strictSame(bbox1.overlap(bbox2), BoundingBox.not());
    t.strictSame(bbox2.overlap(bbox1), BoundingBox.not());
    t.strictSame(bbox2.overlap(BoundingBox.not()), bbox2);

    t.same(BoundingBox.not().overlap(bbox1).toArray(), bbox1.toArray());

    // const bbox1 = BoundingBox.new([-210, -150, 60, 3]);
    // Array.from(document.getElementsByTagName("rect")).sort().map(e=>`const ${e.id} = BoundingBox.new('${e.x.baseVal.value},${e.y.baseVal.value},${e.width.baseVal.value},${e.height.baseVal.value}');`).join('\n')
    t.same(B.overlap(D).toArray(), C.toArray());
    t.same(D.overlap(B).toArray(), C.toArray());
    t.same(A.overlap(B).toArray(), E.toArray());
    t.same(B.overlap(A).toArray(), E.toArray());
    t.strictSame(A.overlap(C), BoundingBox.not());
    t.strictSame(C.overlap(A), BoundingBox.not());
    t.end();
});

test.test(`BoundingBox equals`, { bail: !CI }, function (t) {
    function eq(a, b, epsilon = 0) {
        t.ok(a.equals(b, epsilon), `${a}, ${b}`);
    }
    function ne(a, b, epsilon = 0) {
        t.notOk(a.equals(b, epsilon), `${a}, ${b}`);
    }
    ne(C, D);
    ne(D, C);
    eq(C, C);
    eq(D, D);
    ne(BoundingBox.new('-130,-90,130,90'), BoundingBox.new('-130,-90,130,90.01'));
    eq(BoundingBox.new('-130,-90,130,90'), BoundingBox.new('-130,-90,130,90.01'), 0.0109);
    eq(BoundingBox.new('-130,-90,130,90'), BoundingBox.new('-130,-90,130.01,90'), 0.0109);
    eq(BoundingBox.new('-130,-90,130,90'), BoundingBox.new('-130,-90.01,130,90'), 0.0109);
    eq(BoundingBox.new('-130,-90,130,90'), BoundingBox.new('-130.01,-90,130,90'), 0.0109);
    t.end();
});

test.test(`BoundingBox merge`, { bail: !CI }, function (t) {
    t.same(C.merge(D).toArray(), D.toArray());
    t.same(D.merge(C).toArray(), D.toArray());
    t.same(B.overlap(C).merge(D).toArray(), D.toArray());
    t.same(E.merge(C).merge(F).toArray(), B.toArray());
    t.same(BoundingBox.merge(C, F, E).toArray(), B.toArray());

    const not = BoundingBox.not();
    t.same(BoundingBox.merge(C, not).toArray(), C.toArray());
    t.same(BoundingBox.merge(not, C).toArray(), C.toArray());
    t.same(BoundingBox.merge(not, not).toArray(), not.toArray());
    t.same(not.merge(not).toArray(), not.toArray());
    t.notOk(not.isValid());
    t.same(not.merge(C).toArray(), C.toArray());
    t.same(C.merge(not).toArray(), C.toArray());

    for (const b of [A, B, C, D, E, F]) {
        t.same(not.merge(b).toArray(), b.toArray());
        t.same(b.merge(not).toArray(), b.toArray());
    }
    let box = BoundingBox.not();

    for (const b of [C, G, F]) {
        box = box.merge(b);
    }
    t.same(box.toArray(), B.toArray());
    t.ok(box.equals(B));
    const n1 = BoundingBox.not();
    const n2 = BoundingBox.not();
    t.strictSame(n1.merge(n2), n2);

    t.end();
});

test.test(`BoundingBox fromRect`, { bail: !CI }, function (t) {
    t.same(BoundingBox.fromRect({ x: -20, width: 400 }).toArray(), [-20, 0, 400, 0]);
    t.same(BoundingBox.fromRect({ y: -20, height: 400 }).toArray(), [0, -20, 0, 400]);
    t.end();
});

test.test(`BoundingBox mutable`, { bail: !CI }, function (t) {
    const a = BoxMut.new([0, 0, 100, 100]);
    const b = BoxMut.parse('-60 -50 60 50');

    t.same(a.constructor.name, 'BoxMut');
    t.same(b.constructor.name, 'BoxMut');

    // // const b = new BoxRO(0, 0, 100, 100);

    a.x = 80;
    t.match(a.toString().split(/[,s]+/), ['80', '0', '100', '100']);
    a.y = -44;
    t.match(a.toString().split(/[,s]+/), ['80', '-44', '100', '100']);
    a.width = 20;
    t.match(a.toString().split(/[,s]+/), ['80', '-44', '20', '100']);
    a.height = 30;
    t.match(a.toString().split(/[,s]+/), ['80', '-44', '20', '30']);

    t.match(`${a.copy(b)}`.split(/[,s]+/), [-60, -50, 60, 50]);
    t.notOk(BoxMut.new().isValid());
    // t.ok(BoxMut.new().equal(BoxMut.not()));
    t.match(`${BoxMut.not().copy(b)}`.split(/[,s]+/), [-60, -50, 60, 50]);
    t.match(`${BoxMut.not().mergeSelf(b)}`.split(/[,s]+/), [-60, -50, 60, 50]);

    t.match(`${BoxMut.not().mergeSelf(b)}`.split(/[,s]+/), [-60, -50, 60, 50]);

    t.match(BoxMut.not().mergeSelf(C).mergeSelf(BoxMut.not()).mergeSelf(F).toArray(), B.toArray());

    // const a = BoxMut.new([0, 0, 100, 100]);

    // t.throws(() => {
    //  a.freeze().x = 60;
    // }, TypeError);
    // t.strictSame(a.x, 80);
    {
        let b;
        b = BoxMut.new('-210,-150,80,60');
        b.inflateSelf(5, 6);
        t.same(b.toArray(), [-215, -156, 90, 72]);
        b = BoxMut.new('-210,-150,80,60');
        b.inflateSelf(6);
        t.same(b.toArray(), [-216, -156, 92, 72]);
        b.sizeSelf(10);
        t.same(b.toArray(), [-216, -156, 10, 72]);
        b.sizeSelf(6, 4);
        t.same(b.toArray(), [-216, -156, 6, 4]);
        b.sizeSelf(undefined, 3);
        t.same(b.toArray(), [-216, -156, 6, 3]);
    }
    t.end();
});

test.test(`BoundingBox withCenter`, { bail: !CI }, function (t) {
    let b = D.withCenter([197, 122]);
    t.same(b.toArray(), [122, 77, 150, 90]);
    t.same(b.withMinX(197).toArray(), [197, 77, 150, 90]);
    t.same(b.withMinY(122).toArray(), [122, 122, 150, 90]);
    t.end();
});

test.test(`BoundingBox inflated`, { bail: !CI }, function (t) {
    let b = A.inflated(5, 6);
    // const A = BoundingBox.new('-210,-150,80,60');
    t.same(A.inflated(5, 6).toArray(), [-210 - 5, -150 - 6, 80 + 5 + 5, 60 + 6 + 6]);
    t.same(A.inflated(6).toArray(), [-210 - 6, -150 - 6, 80 + 6 + 6, 60 + 6 + 6]);
    t.end();
});

test.test(`BoundingBox isEmpty`, { bail: !CI }, function (t) {
    t.same(A.isEmpty(), false);
    t.same(BoundingBox.not().isEmpty(), false);
    t.same(BoundingBox.new('-0,0,0,-0').isEmpty(), true);
    t.end();
});

test.test(`BoundingBox withSize withPos`, { bail: !CI }, function (t) {
    t.same(B.withSize([150, 90]).withPos([-60, -50]).toArray(), D.toArray());
    t.same(C.withPos([-130, -90]).withSize([130, 90]).toArray(), B.toArray());
    t.same(E.withSize([0, 0]).toArray(), E.toArray());
    t.same(E.withSize([70, 90]).toArray(), F.toArray());
    t.same(C.withPos([-60, -50]).toArray(), C.toArray());
    t.same(E.withPos([0, 0]).toArray(), [0, 0, 0, 0]);
    t.end();
});
