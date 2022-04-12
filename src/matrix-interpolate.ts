import {Matrix} from './matrix.js';
import {Vec} from './point.js';
export class MatrixInterpolate {
	static par(...arg: Array<Transform>) {
		return new Par(arg);
	}
	static seq(...arg: Array<Transform>) {
		return new Seq(arg);
	}
	static translate(x: number | Iterable<number>, y: number = 0) {
		return new Translate(x, y);
	}
	static translateX(n: number) {
		return this.translate(n, 0);
	}
	static translateY(n: number) {
		return this.translate(0, n);
	}
	static scale(sx: number, sy?: number) {
		return new Scale(sx, sy);
	}
	static scaleY(n: number) {
		return this.scale(1, n);
	}
	static scaleX(n: number) {
		return this.scale(n, 1);
	}
	static rotate(θ: number) {
		return new Rotate(θ);
	}
	static weight(n: number) {
		return new Select().weight(n);
	}
	static anchor(x: number | Iterable<number>, y: number = 0) {
		return new Select().anchor(x, y);
	}
	static identity() {
		return new Identity();
	}

	at(t: number, M?: Matrix): Matrix {
		throw new Error(`Not implemented`);
	}
}

class Transform {
	_weight?: number;
	_anchor?: Vec;

	weight(n: number) {
		this._weight = n;
		return this;
	}
	anchor(x: number | Iterable<number>, y: number = 0) {
		this._anchor = Vec.new(x, y);
		return this;
	}
	at(t: number): Matrix {
		throw new Error(`Not implemented`);
	}
}

const fromTo = function (t: number, a = 0, b = 1) {
	return a + (b - a) * t;
};

class Select extends Transform {
	private new(v: Transform) {
		const {_weight, _anchor} = this;
		_weight && (v._weight = _weight);
		_anchor && (v._anchor = _anchor);
		return v;
	}
	translate(x: number | Iterable<number>, y: number = 0) {
		return this.new(new Translate(x, y));
	}
	scale(n: number) {
		return this.new(new Scale(n));
	}
	rotate(θ: number) {
		return this.new(new Rotate(θ));
	}
}

class Translate extends Transform {
	constructor(x: number | Iterable<number>, y: number = 0) {
		super();
		this.anchor(x, y);
	}
	at(t: number) {
		const {_anchor: {x = 100, y = 100} = {}} = this;
		return Matrix.translate(fromTo(t, 0, x), fromTo(t, 0, y));
	}
}

class Scale extends Transform {
	n: number[];
	constructor(sx: number, sy?: number) {
		super();
		this.n = [sx, sy ?? sx];
	}
	at(t: number) {
		let {
			n: [sx, sy],
			_anchor: {x, y} = {},
		} = this;
		sx = fromTo(t, 1, sx);
		sy = fromTo(t, 1, sy);
		if (x || y) {
			x = x ?? 0;
			y = y ?? 0;
			return Matrix.translate(x, y).scale(sx, sy).translate(-x, -y);
		}

		return Matrix.scale(sx, sy);
	}
}

class Rotate extends Transform {
	θ: number;
	constructor(θ: number) {
		super();
		this.θ = θ;
	}
	at(t: number) {
		let {θ, _anchor: {x, y} = {}} = this;
		θ = fromTo(t, 0, θ);
		if (x || y) {
			x = x ?? 0;
			y = y ?? 0;
			return Matrix.translate(x, y).rotate(θ).translate(-x, -y);
		}

		return Matrix.rotate(θ);
	}
}

class Identity extends Transform {
	at(t: number) {
		return Matrix.identity();
	}
}

abstract class Transforms extends MatrixInterpolate {
	items: Array<Transform>;

	constructor(items: Array<Transform>) {
		super();
		this.items = items;
	}
	// abstract at(T: number, M?: Matrix): Matrix;
}

class Seq extends Transforms {
	at(T: number, M?: Matrix) {
		const {items} = this;
		let w_total = 0;
		for (const {_weight = 1} of items) {
			w_total += _weight;
		}
		let w_walk = 0;
		M = M ?? Matrix.identity();
		for (const tr of items) {
			const {_weight = 1} = tr;
			const start = w_walk / w_total;
			const end = (w_walk + _weight) / w_total;
			if (T < start) {
				break; // pass
			} else if (T >= end) {
				M = M.multiply(tr.at(1));
			} else {
				// T >= start &&  T < end
				M = M.multiply(tr.at((T - start) / (_weight / w_total)));
			}
			w_walk += _weight;
		}
		return M;
	}
}

class Par extends Transforms {
	at(T: number, M?: Matrix) {
		M = M ?? Matrix.identity();
		for (const tr of this.items) {
			M = M.multiply(tr.at(T));
		}
		return M;
	}
}

import {Cubic} from './path/cubic.js';

export function cubicTranslate(h1: Vec, h2: Vec, p1: Vec, p2?: Vec) {
	if (!p2) {
		p2 = p1;
		p1 = Vec.pos(0, 0);
	}

	const d = p2.distance(p1);
	const c1 = p1.add(Vec.polar(h1.abs() * d, h1.angle));
	const c2 = p2.add(Vec.polar(h2.abs() * d, h2.angle));
	const q = new Cubic(p1, c1, c2, p2);
	return q;
	// return function (t: number) {
	// 	return q.pointAt(t);
	// };
}
