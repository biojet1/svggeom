'uses strict';
import test from 'tap';
import {Path, PathLS} from 'svggeom';
import {enum_path_data, test_segment, testSegment} from './path.utils.js';
import './utils.js';
const CI = !!process.env.CI;


for await (const item of enum_path_data({SEGMENTS: ''})) {
    const {d} = item;
    switch (d) {
        case 'M0,0L10,0m0,0L10,0':
        case 'M0,0L10,0M0,0L10,0':
        case 'M0,0L10,0l10,0':
        case 'm0,0h10z':
        case 'm0,0h10Z':
        case 'M100,100h100v100h-100Zm200,0h1v1h-1z':
        case 'M50,20A50,50,0,0,0,150,20Z':
            let seg = Path.parse(d);
            console.log('Skip', d, seg.toString());

            continue;
    }

    test.test(`<${d}>`, {bail: !CI}, function (t) {
        {
            let seg = Path.parse(d);
            // test_segment(t, seg, item, {
            //     descArrayOpt: {close: true},
            //     len_epsilon: 0.32,
            //     point_epsilon: 0.0573,
            //     delta_epsilon: 1e-7,
            //     slope_epsilon: 0.0045,
            //     write_svg: true,
            // });
        }
        {
            let seg = PathLS.parse(d);
            testSegment(t, seg, item, {
                descArrayOpt: {close: true},
                len_epsilon: 0.32,
                point_epsilon: 0.0573,
                delta_epsilon: 1e-7,
                slope_epsilon: 0.0045,
                write_svg: true,
            });
        }
        t.end();
    });
}
