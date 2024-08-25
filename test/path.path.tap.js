'uses strict';
import test from 'tap';
import { PathLC } from 'svggeom';
import { enum_path_data, testSegment } from './path.utils.js';
import './utils.js';
const CI = !!process.env.CI;

for await (const item of enum_path_data({ SEGMENTS: '' })) {
    const { d } = item;
    switch (d) {
        case 'M0,0L10,0m0,0L10,0':
        case 'M0,0L10,0M0,0L10,0':
        case 'M0,0L10,0l10,0':
        case 'm0,0h10z':
        case 'm0,0h10Z':
        case 'M -3.4E+38,3.4E+38 L -3.4E-38,3.4E-38':
        case 'M100,100h100v100h-100Zm200,0h1v1h-1z':
        case 'M50,20A50,50,0,0,0,150,20Z':
            // let seg = PathSE.parse(d);
            // console.log('Skip', d, seg.toString());

            continue;
    }

    test.test(`<${d}>`, { bail: !CI }, function (t) {
        const opt = {
            descArrayOpt: { close: true },
            len_epsilon: 0.32,
            point_epsilon: 0.06,
            delta_epsilon: 1e-7,
            slope_epsilon: 0.0045,
            write_svg: true,
        };
        // {
        //     let seg = PathSE.parse(d);
        //     // test_segment(t, seg, item, {
        //     //     descArrayOpt: {close: true},
        //     //     len_epsilon: 0.32,
        //     //     point_epsilon: 0.0573,
        //     //     delta_epsilon: 1e-7,
        //     //     slope_epsilon: 0.0045,
        //     //     write_svg: true,
        //     // });
        //     testSegment(t, seg, item, { ...opt });
        //     t.almostEqual(seg.getTotalLength(), item.length, opt.len_epsilon, 'LEN', [item, seg]);
        //     t.sameBox(seg.getBBox(), item.bbox);
        // }
        {
            let seg = PathLC.parse(d);
            testSegment(t, seg, item, opt);
        }
        t.end();
    });
}
