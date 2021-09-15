'uses strict';
import {spawn} from 'child_process';
import test from 'tap';
import {Path, Matrix, Cubic, Arc, Line} from '../dist/index.js';
import {enum_path_data} from './path.utils.js';
import './utils.js';
const CI = !!process.env.CI;

for await (const item of enum_path_data({DATA: 'transforms', ARCS: 'no'})) {
	const {d} = item;
	switch (d) {
		case 'M0,0L10,0m0,0L10,0':
		case 'M0,0L10,0M0,0L10,0':
		case 'M0,0L10,0l10,0':
		case 'm0,0h10z':
		case 'm0,0h10Z':
		case 'M100,100h100v100h-100Zm200,0h1v1h-1z':
		case 'M -3.4E+38,3.4E+38 L -3.4E-38,3.4E-38':
			continue;
	}

	test.test(`<${d}>`, {bail: !CI, timeout: 30000}, function (t) {
		const p = Path.fromPath(item.d);
		for (const [i, [T, A]] of item.transforms.entries()) {
			const m = Matrix.parse(T);
			let p2;
			try {
				p2 = p.transform(m);
			} catch (err) {
				console.error(p.segs, A);
				console.error(m, T);
				throw err;
			}

			const a = p2.descArray({smooth: true});
			t.sameDescs(a, A, 5.1e-8, `${i}, ${T}`, p2);
		}

		t.end();
	});
}
