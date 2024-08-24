'uses strict';
import test from 'tap';
import { PathLS, SegmentLS } from 'svggeom';
import { enum_path_data, test_segment, testSegment } from './path.utils.js';
import './utils.js';
const CI = !!process.env.CI;

const d = `m 182.94048,133.3363 a 71.059525,34.395832 0 0 1 -57.74432,33.78659
        71.059525,34.395832 0 0 1 -79.384695,-21.12465 71.059525,34.395832 0 0 1
        27.993926,-41.70331 71.059525,34.395832 0 0 1 89.875769,5.49583
`;
const a = SegmentLS.parse(d);
const b = a.as_curve();
console.log(a.describe(), a.point_at(0));
console.log(b.describe(), b.point_at(0));

