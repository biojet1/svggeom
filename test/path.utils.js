'uses strict';
import { spawn } from 'child_process';
export async function* enum_path_data(env) {
    const pyproc = spawn('python', ['test/path.py'], {
        stdio: ['ignore', 'pipe', 'inherit'],
        env: { ...process.env, ...env },
    });
    let last;
    for await (const chunk of pyproc.stdout) {
        const lines = ((last ?? '') + chunk.toString()).split(/\r?\n/);
        last = lines.pop();
        for (const item of lines.map((value) => JSON.parse(value))) {
            // console.log(item.points);
            yield item;
        }
    }
}
import { Cubic, Path } from 'svggeom';
Path.digits = 16;

export function test_segment(t, seg, item, opt = {}) {
    const { epsilon = 1e-11 } = opt;
    const {
        delta_epsilon = epsilon,
        len_epsilon = epsilon,
        slope_epsilon = epsilon,
        point_epsilon = epsilon,
        test_descs = true,
        test_tangents = true,
    } = opt;
    const tan_opt = { delta_epsilon: delta_epsilon, slope_epsilon: slope_epsilon };

    t.sameBox(seg, item.bbox, epsilon, 'BOX', [item, seg]);
    t.almostEqual(seg.length, item.length, len_epsilon, 'LEN', [item, seg]);

    let pv, px, a, b;
    for (const [T, { x, y, tx, ty, pathA, pathB }] of Object.entries(item.at)) {
        pv = seg.pointAt(T).toArray();
        px = [x, y, 0];
        // console.error(pv, px);
        t.almostEqual(pv, px, { epsilon: point_epsilon, on_fail: opt?.on_fail }, `pointAt(${T})`, [
            item,
            seg,
            pv,
            px,
        ]);

        pv = seg.slopeAt(T).toArray();
        px = [tx, ty];
        // t.almostEqual(pv, px, 1e-11, `tangentAt(${T})`, [item, seg, pv, px]);
        test_tangents && t.sameTangent(pv, px, tan_opt, `tangentAt(${T})`, [item, seg]);
        if (test_descs && pathA) {
            try {
                [a, b] = seg.splitAt(T);

                t.sameDescs(descArray(a), pathA, point_epsilon, `splitAt(0, ${T})`, [item, seg]);
                t.sameDescs(descArray(b), pathB, point_epsilon, `splitAt(${T}, 1)`, seg);
                t.sameDescs(descArray(seg.cutAt(T)), pathA, point_epsilon, `cutAt(${T})`, seg);
                t.sameDescs(descArray(seg.cutAt(-T)), pathB, point_epsilon, `cutAt(${T})`, seg);
                t.sameDescs(descArray(seg.cropAt(0, T)), pathA, point_epsilon, `cropAt(0, ${T})`, seg);
                t.sameDescs(descArray(seg.cropAt(T, 1)), pathB, point_epsilon, `cropAt(${T}, 1)`, seg);
            } catch (err) {
                console.error('Err splitAt', T);
                console.dir(seg, { depth: null });
                throw err;
            }
        }
        let rev = seg.reversed();
        let bak = rev.reversed();
        if (seg instanceof Path) {
            t.notSame(seg._segs, rev._segs);
            t.same(bak._segs, seg._segs);
        } else {
            t.notSame(seg, rev);
            t.same(bak, seg);
        }
    }
}
function descArray(x) {
    if (x instanceof Path) {
        return x.descArray({ close: null });
    } else {
        return new Path([x]).descArray({ close: null });
    }
}

export function testSegment(t, seg, item, opt = {}) {
    const { epsilon = 1e-11 } = opt;
    const {
        delta_epsilon = epsilon,
        len_epsilon = epsilon,
        slope_epsilon = epsilon,
        point_epsilon = epsilon,
        test_descs = true,
        test_tangents = true,
    } = opt;
    const tan_opt = { delta_epsilon: delta_epsilon, slope_epsilon: slope_epsilon };
    t.almostEqual(item.start[0], seg.start.x);
    t.almostEqual(item.start[1], seg.start.y);
    t.almostEqual(item.end[0], seg.end.x);
    t.almostEqual(item.end[1], seg.end.y);
    t.almostEqual(item.length, seg.length, len_epsilon, 'LEN', [item, seg]);
    t.sameBox(item.bbox, seg.bbox());
    let pv, px, a, b;
    for (const [T, { x, y, tx, ty, pathA, pathB }] of Object.entries(item.at)) {
        // pointAt
        pv = seg.pointAt(T).toArray();
        px = [x, y, 0];
        // console.error(pv, px);
        t.almostEqual(pv, px, { epsilon: point_epsilon, on_fail: opt?.on_fail }, `pointAt(${T})`, [
            item,
            seg,
            pv,
            px,
        ]);
        // slopeAt
        pv = seg.slopeAt(T).toArray();
        px = [tx, ty];
        // t.almostEqual(pv, px, 1e-11, `slopeAt(${T})`, [item, seg, pv, px]);
        // tangentAt
        test_tangents && t.sameTangent(pv, px, tan_opt, `tangentAt(${T})`, [item, seg]);
        // splitAt
        if (test_descs && pathA) {
            try {
                [a, b] = seg.splitAt(T);

                t.sameDescs(a.descArray(), pathA, point_epsilon, `splitAt(0, ${T})`, [item, seg, a]);
                t.sameDescs(b.descArray(), pathB, point_epsilon, `splitAt(${T}, 1)`, seg);
                t.sameDescs(seg.cutAt(T).descArray(), pathA, point_epsilon, `cutAt(${T})`, seg);
                t.sameDescs(seg.cutAt(-T).descArray(), pathB, point_epsilon, `cutAt(${T})`, seg);
                t.sameDescs(seg.cropAt(0, T).descArray(), pathA, point_epsilon, `cropAt(0, ${T})`, seg);
                t.sameDescs(seg.cropAt(T, 1).descArray(), pathB, point_epsilon, `cropAt(${T}, 1)`, seg);
            } catch (err) {
                console.error('Err splitAt', T);
                console.dir(seg, { depth: null });
                throw err;
            }
        }
    }
}
