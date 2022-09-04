'uses strict';
import test from 'tap';
import {PathLS, Vec} from 'svggeom';
import {dSplit} from '../dist/path.js';
import './utils.js';
const CI = !!process.env.CI;

test.test(`sub paths`, {bail: 1}, function (t) {
    const d = `m 10,50 q 15,-25 30,0 15,25 30,0 15,-25 30,0 15,25 30,0 15,-25 30,0 15,25 30,0 M 10,90 C 30,90 25,10 50,10 75,10 70,90 90,90 M 10,30 a 20,20 0 0 1 40,0 20,20 0 0 1 40,0 Q 90,60 50,90 10,60 10,30 Z M 110,10 190,90 V 10 h -40 m -40,80 c 20,0 15,-80 40,-80 25,0 20,80 40,80`;
    const D =
        'M 10 50 C 20 33.3333 30 33.3333 40 50 C 50 66.6667 60 66.6667 70 50 C 80 33.3333 90 33.3333 100 50 C 110 66.6667 120 66.6667 130 50 C 140 33.3333 150 33.3333 160 50 C 170 66.6667 180 66.6667 190 50 M 10 90 C 30 90 25 10 50 10 C 75 10 70 90 90 90 M 10 30 C 10 22.8547 13.812 16.2521 20 12.6795 C 26.188 9.10684 33.812 9.10684 40 12.6795 C 46.188 16.2521 50 22.8547 50 30 C 50 22.8547 53.812 16.2521 60 12.6795 C 66.188 9.10684 73.812 9.10684 80 12.6795 C 86.188 16.2521 90 22.8547 90 30 C 90 50 76.6667 70 50 90 C 23.3333 70 10 50 10 30 Z M 110 10 L 190 90 L 190 10 L 150 10 M 110 90 C 130 90 125 10 150 10 C 175 10 170 90 190 90';
    const p = PathLS.parse(d);
    const subPaths = [...p.enumSubPaths()];
    t.same(subPaths.length, 5);
    t.same(subPaths[0].descArray(), `M 110 90 C 130 90 125 10 150 10 C 175 10 170 90 190 90`.split(/\s+/));
    t.same(subPaths[1].descArray(), `M 110 10 L 190 90 L 190 10 L 150 10`.split(/\s+/));
    t.same(
        subPaths[2].descArray(),
        'M 10 30 A 20 20 0 0 1 50 30 A 20 20 0 0 1 90 30 Q 90 60 50 90 Q 10 60 10 30 Z'.split(/[,\s]+/)
    );
    t.same(subPaths[3].descArray(), 'M 10 90 C 30 90 25 10 50 10 C 75 10 70 90 90 90'.split(/[,\s]+/));
    t.same(
        subPaths[4].descArray({smooth: true, relative: true}),
        'm 10,50 q 15,-25 30,0 t 30,0 t 30,0 t 30,0 t 30,0 t 30,0'.split(/[,\s]+/)
    );
    t.end();
});
