'uses strict';
import test from 'tap';
import {enum_path_data} from './path.utils.js';
import {Path, SegmentLS} from 'svggeom';
import './utils.js';

for await (const item of enum_path_data({SEGMENTS: 'Parsed'})) {
    const {d} = item;
    let close = true;
    switch (d) {
        case 'M0,0L10,0m0,0L10,0':
            continue;
        // case 'M396 140a176 112 0 1 1 -352 0a176 112 0 1 1 352 0z':
        // continue;
        // case 'm0,0h10z':
        // case 'm0,0h10Z':
        // 	close = null;
        // 	break;
        default:
        // if (d.indexOf('ZM') > 0) {
        // 	close = false;
        // } else if (d.indexOf('Z') > 0 || d.indexOf('z') > 0) {
        // 	close = null;
        // }
        // if (d.indexOf('A') > 0 || d.indexOf('a') > 0) {
        // 	if (d.indexOf('Z') > 0 || d.indexOf('z') > 0) {
        // 		close = null;
        // 	}
        // }
    }

    test.test(`SPTPaths<${d}>`, {bail: 1}, function (t) {
        const p = Path.parse(d);
        const abs = p.descArray({relative: false, close: close, short: false});

        t.sameDescs(abs, item.abs, 5e-5, `ABS`, p);
        const rel = p.descArray({relative: true, close: close, short: false});
        t.sameDescs(rel, item.rel, 5e-5, `REL`, p);

        t.end();
    });
}
for await (const item of enum_path_data({SEGMENTS: 'SEPaths'})) {
    const {d} = item;
    switch (d) {
        case 'M0,0L10,0m0,0L10,0':
        // case 'M0,0L10,0M0,0L10,0':
        // case 'M0,0L10,0l10,0':
        // case 'M396 140a176 112 0 1 1 -352 0a176 112 0 1 1 352 0z':
        // d = ;
        // break;
        case 'm0,0h10z':
        case 'm0,0h10Z':
            continue;
    }
    const eps = 0.00005;
    test.test(`SEPaths<${d}>`, {bail: 1}, function (t) {
        const p = Path.parse(item.d);
        const abs = p.descArray({relative: false, close: true});

        t.sameDescs(abs, item.abs, eps, `ABS`, p);
        const rel = p.descArray({relative: true});
        t.sameDescs(rel, item.rel, eps, `REL`, p);

        t.end();
    });
    test.test(`SegmentLS:SEPaths<${d}>`, {bail: 1}, function (t) {
        const cur = SegmentLS.parse(item.d);
        // t.same(item.abs, cur.descArray(), [`${cur.toString()}`, item.abs]);
        t.sameDescs(cur.descArray(), item.abs, eps, `ABS`, cur);
        t.end();
    });

}
