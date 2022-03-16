"uses strict";
import "./utils.js";
import test from "tap";
import { Matrix } from "../dist/matrix.js";

const CI = !!process.env.CI;
const ts = [100, 0, -100];
const ss = [-3, 1, 1, 2];
// list(range(0, 370, 15))

const rs = CI
	? [
			0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210,
			225, 240, 255, 270, 285, 300, 315, 330, 345, 360, -15, -30, -45,
			-60, -75, -90, -105, -120, -135, -150, -165, -180, -195, -210, -225,
			-240, -255, -270, -285, -300, -315, -330, -345, -360,
	  ]
	: [0, -30, 60, -90, 120, -150, 180, -210, 240, -270, 300, -330, 360];
const PI = Math.PI;

function* matrixes() {
	for (const r of rs) {
		const θ = (r * PI) / 180;
		const cosθ = Math.cos(θ);
		const sinθ = Math.sin(θ);
		for (const e of ts) {
			for (const f of ts) {
				for (const sx of ss) {
					for (const sy of ss) {
						const a = sx * cosθ;
						const b = sx * sinθ;
						const c = -sy * sinθ;
						const d = sy * cosθ;
						yield [
							`matrix(${a},${b},${c},${d},${e},${f})`,
							`translate(${e},${f})rotate(${r})scale(${sx},${sy})`,
						];
					}
				}
			}
		}
	}
}

let c = 0;
for await (const [m1, m2] of matrixes()) {
	const M1 = Matrix.parse(m1);
	const M2 = Matrix.new(m2);
	const extra = [M1, M2];

	// if (!M1.isURT()) {
	// 	continue;
	// }
	// if (!M2.isURT()) {
	// 	continue;
	// }

	test.test(`${m2} vs ${m1} #${c}`, { bail: !CI }, function (t) {
		// t.strictSame(M1.describe(), m2);

		t.almostEqual(M1.a, M2.a, 1e-11, "A: sx * cosθ", extra);
		t.almostEqual(M1.b, M2.b, 1e-11, "B: -sx * sinθ", extra);
		t.almostEqual(M1.c, M2.c, 1e-11, "C: sy * sinθ", extra);
		t.almostEqual(M1.d, M2.d, 1e-11, "D: sy * cosθ", extra);
		t.almostEqual(M1.e, M2.e, 1e-11, "E: tx", extra);
		t.almostEqual(M1.f, M2.f, 1e-11, "F: ty", extra);
		t.equal(M1.isURT(1e-14), M2.isURT(1e-14), `isURT`, extra);
		t.ok(M1.equals(M2, 1e-15), `M1==M2`, extra);
		t.ok(M2.equals(M1, 1e-15), `M2==M1`, extra);
		const A = M1.inverse();
		const B = M2.inverse();
		t.ok(A.equals(B, 1e-11), `^M1==^M2`, [A, B]);
		t.ok(M1.translateX(-100).equals(M2.translate(-100, 0), 1e-11));
		t.ok(M2.translateY(+100).equals(M1.translate(0, +100), 1e-11));
		const p = M1.toArray();
		const q = [M2.a, M2.b, M2.c, M2.d, M2.e, M2.f];
		let i = p.length;
		t.strictSame(q.length, i);
		while (i-- > 0) {
			t.almostEqual(p[i], q[i], 1e-11, `${i}`, extra);
		}
		t.ok(M1.equals(Matrix.new(M2.a, M2.b, M2.c, M2.d, M2.e, M2.f), 1e-15));
		t.ok(M1.equals(Matrix.new(M2), 1e-15));
		t.ok(M1.equals(Matrix.new(q), 1e-15));
		t.ok(
			M2.equals(
				Matrix.new({ nodeType: 1, getAttribute: (s) => m1 }),
				1e-15
			)
		);
		t.ok(
			M1.equals(
				Matrix.fromElement({ nodeType: 1, getAttribute: (s) => m1 }),
				1e-15
			)
		);
		t.end();
	});
	++c;
}
console.log(`${c} matrixes CI(${CI})`);
test.test(`matrixes etc`, { bail: !CI }, function (t) {
	t.ok(Matrix.translateX(42).clone().equals(Matrix.translate(42, 0)));
	t.ok(Matrix.translateY(42).clone().equals(Matrix.translate(0, 42)));
	t.ok(
		Matrix.translate(-1, -4).equals(
			Matrix.translateX(-1).translate(0, -2).translateY(-2)
		)
	);

	t.same(Matrix.new().toArray(), [1, 0, 0, 1, 0, 0]);
	t.same(
		Matrix.new("matrix(1,0,0,1,0,0)"),
		Matrix.new([1, 0, 0, 1, 0, 0])
	);
	t.same(Matrix.new().toString(), "matrix(1,0,0,1,0,0)");
	t.same(
		Matrix.translateY(4.1).translateX(1.4).describe().replace(/\s+/g, ""),
		"translate(1.4,4.1)"
	);
	t.throws(
		() => Matrix.new([1, 0, 0, 1, 0, NaN]),
		TypeError,
		"must be finite"
	);
	t.throws(() => Matrix.new(true), TypeError);

	t.end();
});

test.test(`test_interpolate`, { bail: !CI }, function (t) {
	const fn = Matrix.interpolate(
		[10, 20, 30, 40, 50, 60],
		[20, 30, 30, 50, 60, 70]
	);
	t.same(fn(0).toArray(), [10, 20, 30, 40, 50, 60]);
	t.same(fn(0.5).toArray(), [15, 25, 30, 45, 55, 65]);
	t.same(fn(1).toArray(), [20, 30, 30, 50, 60, 70]);
	t.end();
});

test.test(`test_new_from_skew`, { bail: !CI }, function (t) {
	t.ok(
		Matrix.new()
			.skewX(10)
			.equals(Matrix.new("matrix(1 0 0.176327 1 0 0)"), 1e-5)
	);
	t.ok(
		Matrix.new()
			.skewY(10)
			.equals(Matrix.new("matrix(1 0.176327 0 1 0 0)"), 1e-5)
	);
	t.end();
});

test.test(`test_matrix_inversion`, { bail: !CI }, function (t) {
	t.ok(
		Matrix.new("rotate(45)")
			.inverse()
			.equals(Matrix.parse("rotate(-45)"), 1e-11)
	);
	t.ok(
		Matrix.new("scale(4)")
			.inverse()
			.equals(Matrix.parse("scale(0.25)"), 1e-11)
	);
	t.ok(
		Matrix.new("translate(12, 10)")
			.inverse()
			.equals(Matrix.parse("translate(-12, -10)"))
	);
	t.end();
});

test.test(`test_new_from_rotate`, { bail: !CI }, function (t) {
	t.ok(
		Matrix.parse("rotate(90 10 12)").equals(
			Matrix.parse("matrix(6.12323e-17 1 -1 6.12323e-17 22 2)"),
			1e-4
		)
	);
	t.end();
});
