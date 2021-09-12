'uses strict';
import './utils.js';
import test from 'tap';
import {Matrix} from '../dist/matrix.js';

const CI = !!process.env.CI;
const ts = [100, 0, -100];
const ss = [-3, 1, 1, 2];
// list(range(0, 370, 15))

const rs = CI
	? [
			0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225,
			240, 255, 270, 285, 300, 315, 330, 345, 360, -15, -30, -45, -60, -75, -90,
			-105, -120, -135, -150, -165, -180, -195, -210, -225, -240, -255, -270,
			-285, -300, -315, -330, -345, -360,
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
	const M1 = Matrix.fromTransform(m1);
	const M2 = Matrix.fromTransform(m2);
	const extra = [M1, M2];
	// if (!M1.isURT()) {
	// 	continue;
	// }
	// if (!M2.isURT()) {
	// 	continue;
	// }

	test.test(`${m2} vs ${m1} #${c}`, {bail: !CI}, function (t) {
		t.almostEqual(M1.a, M2.a, 1e-11, 'A: sx * cosθ', extra);
		t.almostEqual(M1.b, M2.b, 1e-11, 'B: -sx * sinθ', extra);
		t.almostEqual(M1.c, M2.c, 1e-11, 'C: sy * sinθ', extra);
		t.almostEqual(M1.d, M2.d, 1e-11, 'D: sy * cosθ', extra);
		t.almostEqual(M1.e, M2.e, 1e-11, 'E: tx', extra);
		t.almostEqual(M1.f, M2.f, 1e-11, 'F: ty', extra);
		t.equal(M1.isURT(1e-14), M2.isURT(1e-14), `isURT`, extra);
		t.ok(M1.equals(M2, 1e-15), `M1==M2`, extra);
		t.ok(M2.equals(M1, 1e-15), `M2==M1`, extra);
		const A = M1.inverse();
		const B = M2.inverse();
		t.ok(A.equals(B, 1e-11), `^M1==^M2`, [A, B]);
		t.end();
	});
	++c;
}
console.log(`${c} matrixes CI(${CI})`);
