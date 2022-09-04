'uses strict';
import test from 'tap';
import {Matrix, SegmentLS} from 'svggeom';
import {Path, Cubic, Arc, Line} from '../dist/path.js';
import {enum_path_data} from './path.utils.js';
import './utils.js';

for await (const item of enum_path_data({
    DATA: 'transforms',
    ARCS: 'only',
    // SCALE: 'no',
    SCALE: 'equal',
})) {
    const {d} = item;
    switch (d) {
        // case 'M0,0L10,0m0,0L10,0':
        // case 'M0,0L10,0M0,0L10,0':
        // case 'M0,0L10,0l10,0':
        // case 'm0,0h10z':
        // case 'm0,0h10Z':
        // case 'M100,100h100v100h-100Zm200,0h1v1h-1z':
        case 'M396 140a176 112 0 1 1 -352 0a176 112 0 1 1 352 0z':
            continue;
    }
    const opt = {write_svg: true, epsilon: 0.00032};

    test.test(`<${d}>`, {bail: 1}, function (t) {
        const p = Path.parse(item.d);
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
            t.sameDescs(a, A, {...opt, path_source: d, path_transform: T}, `${i}, ${T}`, [p2, m, m.decompose()]);
        }

        t.end();
    });

    test.test(`SegmentLS<${d}>`, {bail: 1}, function (t) {
        const p = SegmentLS.parse(item.d);
        // console.dir(p);
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

            const a = p2.descArray();
            // console.dir(p.toString(), p2.toString());
            t.sameDescs(a, A, {...opt, path_source: d, path_transform: T}, `${i}, ${T}`, [p2, m, m.decompose()]);
        }

        t.end();
    });    
}
