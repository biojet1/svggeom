'uses strict';
import { spawn } from 'child_process';
export async function* enum_path_data(env) {
    const pyproc = spawn('python3', ['test/path.py'], {
        stdio: ['ignore', 'pipe', 'inherit'],
        env: { ...process.env, ...env },
    });
    let last;
    for await (const chunk of pyproc.stdout) {
        const lines = ((last ?? '') + chunk.toString()).split(/\r?\n/);
        last = lines.pop();
        for (const item of lines.map(value => JSON.parse(value))) {
            // console.log(item.points);
            yield item;
        }
    }
}
// import {Cubic} from 'svggeom';
import { PathSE } from '../dist/path/segment/pathse.js';
PathSE.digits = 16;

export function test_segment(t, seg, item, opt = {}) {
    const { epsilon = 1e-11 } = opt;
    const {
        delta_epsilon = epsilon,
        len_epsilon = epsilon,
        slope_epsilon = epsilon,
        point_epsilon = epsilon,
        end_point_epsilon = epsilon,
        test_descs = true,
        test_tangents = true,
        descArrayOpt,
    } = opt;
    const tan_opt = { delta_epsilon: delta_epsilon, slope_epsilon: slope_epsilon };
    t.almostEqual(item.from[0], seg.from.x);
    t.almostEqual(item.from[1], seg.from.y);
    t.almostEqual(item.to[0], seg.to.x, end_point_epsilon, 'ENDX');
    t.almostEqual(item.to[1], seg.to.y, end_point_epsilon, 'ENDY');
    t.sameBox(seg, item.bbox, epsilon, 'BOX', [item, seg]);
    t.almostEqual(seg.length, item.length, len_epsilon, 'LEN', [item, seg]);

    let pv, px, a, b;
    for (const [T, { x, y, tx, ty, pathA, pathB }] of Object.entries(item.at)) {
        pv = seg.point_at(T).slice(0, 2);
        px = [x, y, 0];
        // console.error(pv, px);
        t.almostEqual(pv, px, { epsilon: point_epsilon, on_fail: opt?.on_fail }, `point_at(${T})`, [item, seg, pv, px]);

        pv = seg.slope_at(T).slice(0, 2);
        px = [tx, ty];
        // t.almostEqual(pv, px, 1e-11, `tangent_at(${T})`, [item, seg, pv, px]);
        test_tangents && t.sameTangent(pv, px, tan_opt, `tangent_at(${T})`, [item, seg]);
        if (test_descs && pathA) {
            try {
                [a, b] = seg.split_at(T);

                t.sameDescs(a.terms(descArrayOpt), pathA, { epsilon: point_epsilon }, `split_at(0, ${T})`, [item, seg]);
                t.sameDescs(
                    b.terms(descArrayOpt),
                    pathB,
                    { epsilon: point_epsilon, write_svg: true, item },
                    `split_at(${T}, 1)`,
                    seg
                );
                t.sameDescs(seg.cut_at(T).terms(), pathA, point_epsilon, `cut_at(${T})`, seg);
                t.sameDescs(seg.cut_at(-T).terms(), pathB, point_epsilon, `cut_at(${T})`, seg);
                t.sameDescs(seg.crop_at(0, T).terms(), pathA, point_epsilon, `crop_at(0, ${T})`, seg);
                t.sameDescs(seg.crop_at(T, 1).terms(), pathB, point_epsilon, `crop_at(${T}, 1)`, seg);
            } catch (err) {
                console.error('Err split_at', T);
                console.dir(seg, { depth: null });
                throw err;
            }
        }
        const rev = seg.reversed();
        const bak = rev.reversed();
        if (seg instanceof PathSE) {
            t.notSame(seg._segs, rev._segs);
            t.same(bak._segs, seg._segs);
        } else {
            t.notSame(seg, rev);
            t.same(bak, seg);
        }
        const sega = seg.terms();
        const reva = rev.terms();
        const baka = bak.terms();
        t.notSame(sega, reva);
        t.same(baka, sega);
    }
}
export function testSegment(t, seg, item, opt = {}) {
    const { epsilon = 1e-11 } = opt;
    const {
        delta_epsilon = epsilon,
        len_epsilon = epsilon,
        slope_epsilon = epsilon,
        point_epsilon = epsilon,
        end_point_epsilon = epsilon,
        test_descs = true,
        test_tangents = true,
    } = opt;
    const tan_opt = { delta_epsilon: delta_epsilon, slope_epsilon: slope_epsilon };
    t.almostEqual(item.start[0], seg.from.x);
    t.almostEqual(item.start[1], seg.from.y);
    t.almostEqual(item.end[0], seg.to.x, end_point_epsilon, 'ENDX');
    t.almostEqual(item.end[1], seg.to.y, end_point_epsilon, 'ENDY');
    t.almostEqual(item.length, seg.length, len_epsilon, 'LEN', [item, seg]);
    t.sameBox(item.bbox, seg.bbox());
    let pv, px, pt, a, b, sub;
    for (const [T, { x, y, tx, ty, pathA, pathB }] of Object.entries(item.at)) {
        // point_at
        try {
            pv = [...seg.point_at(T).slice(0, 2)];
            px = [x, y];
            t.almostEqual(pv, px, { epsilon: point_epsilon, on_fail: opt?.on_fail }, `point_at(${T})`, [item, seg, pv, px]);
        } catch (err) {
            console.error('Err point_at', T, seg.constructor.name, seg?._tail?.constructor.name, seg?._tail?.to);
            // console.dir(seg, {depth: null});
            // console.error(pv, px);
            throw err;
        }
        // slope_at
        // tangent_at
        if (test_tangents) {
            px = [tx, ty];
            try {
                pv = seg.slope_at(T).slice(0, 2);
                pt = seg.tangent_at(T).slice(0, 2);
                // t.almostEqual(pv, px, 1e-11, `slope_at(${T})`, [item, seg, pv, px]);
                t.sameTangent(pv, [tx, ty], tan_opt, `tangent_at(${T})`, [item, seg, pv, pt, px]);
                t.sameTangent(pt, [tx, ty], tan_opt, `tangent_at(${T})`, [item, seg, pv, pt, px]);
            } catch (err) {
                console.error('Err slope_at/tangent_at', T, seg.constructor.name, pv, pt, px, seg.terms());
                throw err;
            }
        }
        // split_at
        if (test_descs && pathA) {
            try {
                [a, b] = seg.split_at(T);
                const descs_opt = { epsilon: point_epsilon, write_svg: true, item, pathA, pathB };
                t.sameDescs(a.terms(), pathA, descs_opt, `split_at(0, ${T})`, seg);
                t.sameDescs(b.terms({ close: false }), pathB, descs_opt, `split_at(${T}, 1)`, seg);
                t.sameDescs(seg.crop_at(0, T).terms(), pathA, descs_opt, `crop_at(0, ${T})`, seg);
                t.sameDescs(seg.crop_at(T, 1).terms({ close: false }), pathB, descs_opt, `crop_at(${T}, 1)`, seg);
                t.sameDescs(seg.cut_at(T).terms(), pathA, descs_opt, `cut_at(${T})`, seg);
                sub = seg.cut_at(T - 1);
                t.sameDescs(
                    sub.terms({ close: false }),
                    pathB,
                    descs_opt,
                    `cut_at(${T} --> ${T - 1}) ${sub.constructor.name}`,
                    seg
                );
            } catch (err) {
                console.error(`Err split_at ${seg?.constructor.name}`, T);
                console.dir(seg, { depth: null });
                throw err;
            }
        }
        // reversed
        const rev = seg.reversed();
        const bak = rev.reversed();
        const sega = seg.terms({ close: false });
        const reva = rev.terms();
        const baka = bak.terms({ close: false });
        t.notSame(sega, reva);
        t.same(
            baka,
            sega,
            [baka, sega, reva].map(v => v.join(' '))
        );

        t.same(seg.crop_at(0, 1).terms(), seg.terms());
        t.same(seg.crop_at(1, 0).terms(), seg.terms());
    }
    t.same(seg.crop_at(0.5, 0.75).terms(), seg.crop_at(-0.5, -0.25).terms());
    t.same(seg.crop_at(0.5, 0.75).terms(), seg.crop_at(0.75, 0.5).terms());
}
