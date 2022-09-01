'uses strict';
import {spawn} from 'child_process';
export async function* enum_path_data(env) {
    const pyproc = spawn('python', ['test/path.py'], {
        stdio: ['ignore', 'pipe', 'inherit'],
        env: {...process.env, ...env},
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
import {Cubic, Path} from 'svggeom';
Path.digits = 16;

export function test_segment(t, seg, item, opt = {}) {
    const {epsilon = 1e-11} = opt;
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
    const tan_opt = {delta_epsilon: delta_epsilon, slope_epsilon: slope_epsilon};
    t.almostEqual(item.from[0], seg.from.x);
    t.almostEqual(item.from[1], seg.from.y);
    t.almostEqual(item.to[0], seg.to.x, end_point_epsilon, 'ENDX');
    t.almostEqual(item.to[1], seg.to.y, end_point_epsilon, 'ENDY');
    t.sameBox(seg, item.bbox, epsilon, 'BOX', [item, seg]);
    t.almostEqual(seg.length, item.length, len_epsilon, 'LEN', [item, seg]);

    let pv, px, a, b;
    for (const [T, {x, y, tx, ty, pathA, pathB}] of Object.entries(item.at)) {
        pv = seg.pointAt(T).toArray();
        px = [x, y, 0];
        // console.error(pv, px);
        t.almostEqual(pv, px, {epsilon: point_epsilon, on_fail: opt?.on_fail}, `pointAt(${T})`, [item, seg, pv, px]);

        pv = seg.slopeAt(T).toArray();
        px = [tx, ty];
        // t.almostEqual(pv, px, 1e-11, `tangentAt(${T})`, [item, seg, pv, px]);
        test_tangents && t.sameTangent(pv, px, tan_opt, `tangentAt(${T})`, [item, seg]);
        if (test_descs && pathA) {
            try {
                [a, b] = seg.splitAt(T);

                t.sameDescs(a.descArray(descArrayOpt), pathA, {epsilon: point_epsilon}, `splitAt(0, ${T})`, [item, seg]);
                t.sameDescs(
                    b.descArray(descArrayOpt),
                    pathB,
                    {epsilon: point_epsilon, write_svg: true, item},
                    `splitAt(${T}, 1)`,
                    seg
                );
                t.sameDescs(seg.cutAt(T).descArray(), pathA, point_epsilon, `cutAt(${T})`, seg);
                t.sameDescs(seg.cutAt(-T).descArray(), pathB, point_epsilon, `cutAt(${T})`, seg);
                t.sameDescs(seg.cropAt(0, T).descArray(), pathA, point_epsilon, `cropAt(0, ${T})`, seg);
                t.sameDescs(seg.cropAt(T, 1).descArray(), pathB, point_epsilon, `cropAt(${T}, 1)`, seg);
            } catch (err) {
                console.error('Err splitAt', T);
                console.dir(seg, {depth: null});
                throw err;
            }
        }
        const rev = seg.reversed();
        const bak = rev.reversed();
        if (seg instanceof Path) {
            t.notSame(seg._segs, rev._segs);
            t.same(bak._segs, seg._segs);
        } else {
            t.notSame(seg, rev);
            t.same(bak, seg);
        }
        const sega = seg.descArray();
        const reva = rev.descArray();
        const baka = bak.descArray();
        t.notSame(sega, reva);
        t.same(baka, sega);
    }
}
export function testSegment(t, seg, item, opt = {}) {
    const {epsilon = 1e-11} = opt;
    const {
        delta_epsilon = epsilon,
        len_epsilon = epsilon,
        slope_epsilon = epsilon,
        point_epsilon = epsilon,
        end_point_epsilon = epsilon,
        test_descs = true,
        test_tangents = true,
    } = opt;
    const tan_opt = {delta_epsilon: delta_epsilon, slope_epsilon: slope_epsilon};
    t.almostEqual(item.start[0], seg.from.x);
    t.almostEqual(item.start[1], seg.from.y);
    t.almostEqual(item.end[0], seg.to.x, end_point_epsilon, 'ENDX');
    t.almostEqual(item.end[1], seg.to.y, end_point_epsilon, 'ENDY');
    t.almostEqual(item.length, seg.length, len_epsilon, 'LEN', [item, seg]);
    t.sameBox(item.bbox, seg.bbox());
    let pv, px, pt, a, b, sub;
    for (const [T, {x, y, tx, ty, pathA, pathB}] of Object.entries(item.at)) {
        // pointAt
        try {
            pv = seg.pointAt(T).toArray();
            px = [x, y, 0];
            t.almostEqual(pv, px, {epsilon: point_epsilon, on_fail: opt?.on_fail}, `pointAt(${T})`, [item, seg, pv, px]);
        } catch (err) {
            console.error('Err pointAt', T, seg.constructor.name, seg?._tail?.constructor.name, seg?._tail?.to);
            // console.dir(seg, {depth: null});
            // console.error(pv, px);
            throw err;
        }
        // slopeAt
        // tangentAt
        if (test_tangents) {
            px = [tx, ty];
            try {
                pv = seg.slopeAt(T).toArray();
                pt = seg.tangentAt(T).toArray();
                // t.almostEqual(pv, px, 1e-11, `slopeAt(${T})`, [item, seg, pv, px]);
                t.sameTangent(pv, [tx, ty], tan_opt, `tangentAt(${T})`, [item, seg, pv, pt, px]);
                t.sameTangent(pt, [tx, ty], tan_opt, `tangentAt(${T})`, [item, seg, pv, pt, px]);
            } catch (err) {
                console.error('Err slopeAt/tangentAt', T, seg.constructor.name, pv, pt, px, seg.descArray());
                throw err;
            }
        }
        // splitAt
        if (test_descs && pathA) {
            try {
                [a, b] = seg.splitAt(T);
                const descs_opt = {epsilon: point_epsilon, write_svg: true, item, pathA, pathB};
                t.sameDescs(a.descArray(), pathA, descs_opt, `splitAt(0, ${T})`, seg);
                t.sameDescs(b.descArray({close: false}), pathB, descs_opt, `splitAt(${T}, 1)`, seg);
                t.sameDescs(seg.cropAt(0, T).descArray(), pathA, descs_opt, `cropAt(0, ${T})`, seg);
                t.sameDescs(seg.cropAt(T, 1).descArray({close: false}), pathB, descs_opt, `cropAt(${T}, 1)`, seg);
                t.sameDescs(seg.cutAt(T).descArray(), pathA, descs_opt, `cutAt(${T})`, seg);
                sub = seg.cutAt(T - 1);
                t.sameDescs(
                    sub.descArray({close: false}),
                    pathB,
                    descs_opt,
                    `cutAt(${T} --> ${T - 1}) ${sub.constructor.name}`,
                    seg
                );
            } catch (err) {
                console.error('Err splitAt', T);
                console.dir(seg, {depth: null});
                throw err;
            }
        }
        // reversed
        const rev = seg.reversed();
        const bak = rev.reversed();
        const sega = seg.descArray({close: false});
        const reva = rev.descArray();
        const baka = bak.descArray({close: false});
        t.notSame(sega, reva);
        t.same(
            baka,
            sega,
            [baka, sega, reva].map(v => v.join(' '))
        );

        t.same(seg.cropAt(0, 1).descArray(), seg.descArray());
        t.same(seg.cropAt(1, 0).descArray(), seg.descArray());
    }
    t.same(seg.cropAt(0.5, 0.75).descArray(), seg.cropAt(-0.5, -0.25).descArray());
    t.same(seg.cropAt(0.5, 0.75).descArray(), seg.cropAt(0.75, 0.5).descArray());
}
