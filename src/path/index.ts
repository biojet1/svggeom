import { Vector } from '../vector.js';
import { BoundingBox } from '../bbox.js';

export interface DescParams {
	relative?: boolean;
	smooth?: boolean;
	short?: boolean;
	close?: boolean;
	dfix?: number;
}

export abstract class Segment {
	abstract get from(): Vector;
	abstract get to(): Vector;
	abstract get length(): number;
	abstract bbox(): BoundingBox;
	abstract point_at(t: number): Vector;
	abstract slope_at(t: number): Vector;

	tangent_at(t: number) {
		const vec = this.slope_at(t);
		return vec.div(vec.abs());
	}
	toPath(): string {
		const { x, y } = this.from;
		return ['M', x, y].concat(this.toPathFragment()).join(' ');
	}
	descArray(opt?: DescParams): (string | number)[] {
		const { x, y } = this.from;
		return ['M', x, y].concat(this.toPathFragment(opt));
	}
	toPathFragment(opt?: DescParams): (string | number)[] {
		throw new Error('NOTIMPL');
	}
}

export function tCheck(t: number) {
	if (t > 1) {
		return 1;
	} else if (t < 0) {
		return 0;
	}
	// if (t < 0 || t > 1) {
	// 	throw new RangeError(`"t" must be between 0 and 1 (${t})`);
	// }
	return t;
}

export function tNorm(t: number) {
	if (t < 0) {
		t = 1 + (t % 1);
	} else if (t > 1) {
		if (0 == (t = t % 1)) {
			t = 1;
		}
	}
	return t;
}

export function* pickPos(args: Vector[] | number[]) {
	let n: number | undefined = undefined;
	for (const v of args) {
		if (typeof v == 'number') {
			if (n == undefined) {
				n = v;
			} else {
				yield Vector.new(n, v);
				n = undefined;
			}
		} else if (n != undefined) {
			throw new Error(`n == ${n}`);
		} else if (v instanceof Vector) {
			yield v;
		} else {
			yield Vector.new(v);
		}
	}
}

export function* pickNum(args: Vector[] | number[]) {
	for (const v of args) {
		switch (typeof v) {
			case 'number':
				yield v;
				break;
			case 'boolean':
			case 'string':
				yield v ? 1 : 0;
				break;
			default:
				if (v) {
					const [x, y] = v;
					yield x;
					yield y;
				} else {
					yield 0;
				}
		}
	}
}
