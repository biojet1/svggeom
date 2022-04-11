import {Matrix} from './matrix.js';
import {Vec} from './point.js';

abstract class Transform {
	// _start: number = -1;
	// _end: number = -1;
	_weight?: number;
	_anchor?: Vec;
	// x: number;
	// y: number;

	abstract at(t: number): Matrix;
	// constructor(weight: number = 1) {
	// 	this._weight = weight;
	// }
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

class Translate extends Transform {
	constructor(x: number | Iterable<number>, y: number = 0) {
		super();
		this.anchor(x, y);

		// this.x = x;
		// this.y = y;
	}
	at(t: number) {
		const {_anchor: {x = 100, y = 100} = {}} = this;
		return Matrix.translate(fromTo(t, 0, x), fromTo(t, 0, y));
	}
}

class Scale extends Transform {
	n: number;
	constructor(n: number) {
		super();
		// super(x, y, weight);
		this.n = n;
	}
	at(t: number) {
		let {n, _anchor: {x, y} = {}} = this;
		n = fromTo(t, 1, n);
		if (x || y) {
			x = x ?? 0;
			y = y ?? 0;
			// x = fromTo(t, 0, x);
			// y = fromTo(t, 0, y);
			return Matrix.translate(x, y).scale(n, n).translate(-x, -y);
		}

		return Matrix.scale(n, n);
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
			// x = fromTo(t, 0, x);
			// y = fromTo(t, 0, y);
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
	static scale(n: number) {
		return new Scale(n);
	}
	static rotate(θ: number) {
		return new Rotate(θ);
	}
}
