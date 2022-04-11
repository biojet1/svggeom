import {Matrix} from './matrix.js';
import {Vec} from './point.js';

abstract class Transform {
	_weight?: number;
	_anchor?: Vec;

	abstract at(t: number): Matrix;
	weight(n: number) {
		this._weight = n;
		return this;
	}
	anchor(x: number | Iterable<number>, y: number = 0) {
		this._anchor = Vec.new(x, y);
		return this;
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
	at(t: number): Matrix {
		throw new Error(`Not implemented`);
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

abstract class Transforms {
	items: Array<Transform>;

	constructor(items: Array<Transform>) {
		this.items = items;
	}
	abstract at(T: number): Matrix;
}

class Seq extends Transforms {
	at(T: number, M?: Matrix) {
		const {items} = this;
		let total_w = 0;
		for (const {_weight = 1} of items) {
			total_w += _weight;
		}
		let running_w = 0;
		M = M ?? Matrix.identity();
		for (const tr of items) {
			const {_weight = 1} = tr;
			const start = running_w / total_w;
			const end = (running_w + _weight) / total_w;
			if (T < start) {
				break;
				// pass
			} else if (T >= end) {
				M = M.multiply(tr.at(1));
			} else {
				// T >= start
				// T < end
				M = M.multiply(tr.at((T - start) / (_weight / total_w)));
			}
			running_w += _weight;
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
}
