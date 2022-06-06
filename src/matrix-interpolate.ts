import { Matrix } from './matrix.js';
import { Vec } from './point.js';
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
	static scale(sx: number, sy?: number) {
		return new Scale(sx, sy);
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
	static translateX(n: number) {
		return this.translate(n, 0);
	}
	static translateY(n: number) {
		return this.translate(0, n);
	}
	static scaleY(n: number) {
		return this.scale(1, n);
	}
	static scaleX(n: number) {
		return this.scale(n, 1);
	}
	// static track(seg: Segment) {
	// 	return new Select().weight(n);
	// }
	static parse(...args: any) {
		const items = parse(args);
		return items && items.length > 1 ? new Seq(items) : items[0];
	}

	at(t: number, M?: Matrix): Matrix {
		throw new Error(`Not implemented`);
	}
}
function parse(args: Array<any>): Array<Transform> {
	return args.map((item) => {
		let v, t;
		if (Array.isArray(item)) {
			t = new Par(parse(item));
		} else if (item instanceof Transform) {
			t = item;
		} else {
			if ((v = item.par)) {
				t = new Par(parse(v));
			} else if ((v = item.seq)) {
				t = new Seq(parse(v));
			} else if ((v = item.translate)) {
				if (Array.isArray(v)) {
					t = new Translate(v[0], v[1]);
				} else {
					t = new Translate(v);
				}
			} else if ((v = item.scale)) {
				if (Array.isArray(v)) {
					t = new Scale(v[0], v[1]);
				} else {
					t = new Scale(v);
				}
			} else if ((v = item.rotate)) {
				t = new Rotate(v);
			} else {
				throw new Error(`Unxepectd argument`);
			}
			if ((v = item.anchor)) {
				if (Array.isArray(v)) {
					t._anchor = Vec.new(v[0], v[1]);
				} else {
					t._anchor = v;
				}
			}
			if ((v = item.weight)) {
				t._weight = v;
			}
		}
		return t;
	});
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
	at(t: number, m: Matrix): Matrix {
		throw new Error(`Not implemented`);
	}
}

const fromTo = function (t: number, a = 0, b = 1) {
	return a + (b - a) * t;
};

class Select extends Transform {
	private new(v: Transform) {
		const { _weight, _anchor } = this;
		_weight && (v._weight = _weight);
		_anchor && (v._anchor = _anchor);
		return v;
	}
	translate(x: number | Iterable<number>, y: number = 0) {
		const t = new Translate(x, y);
		return this.new(t);
	}
	scale(n: number) {
		const t = new Scale(n);
		return this.new(t);
	}
	rotate(θ: number) {
		const t = new Rotate(θ);
		return this.new(t);
	}
}

class Translate extends Transform {
	_seg: Segment;

	constructor(x: number | Iterable<number> | Segment, y: number = 0) {
		// seg: Segment
		super();
		if (x instanceof Segment) {
			this._seg = x;
		} else {
			this._seg = new Line(Vec.pos(0, 0), Vec.new(x, y));
			// this.anchor(x, y);
		}
	}
	track(seg: Segment) {
		this._seg = seg;
	}
	at(t: number, m: Matrix) {
		const { _seg } = this;
		const { x, y } = _seg.pointAt(t);
		return m.translate(x, y);
	}
}

class Scale extends Transform {
	n: number[];
	constructor(sx: number, sy?: number) {
		super();
		this.n = [sx, sy ?? sx];
	}
	at(t: number, m: Matrix) {
		let {
			n: [sx, sy],
			_anchor: { x, y } = {},
		} = this;
		sx = fromTo(t, 1, sx);
		sy = fromTo(t, 1, sy);
		if (x || y) {
			x = x ?? 0;
			y = y ?? 0;
			return m.translate(x, y).scale(sx, sy).translate(-x, -y);
		}

		return m.scale(sx, sy);
	}
}

class Compose extends Transform {
	comp: any;
	constructor(m: Matrix) {
		super();
		this.comp = m.decompose();
	}
	at(t: number, m: Matrix) {
		const { translateX, translateY, rotate, skewX, scaleX, scaleY } = this.comp;
		const m1 =
			(translateX || translateY) &&
			Matrix.translate(fromTo(t, 0, translateX), fromTo(t, 0, translateY));
		const m2 = rotate && Matrix.rotate(rotate);
		const m3 = !(scaleX == 1 && scaleY == 1) && Matrix.scale(scaleX, scaleY);
		for (const v of [m1, m2, m3]) {
			v && (m = m ? m.multiply(v) : v);
		}
		return m ?? Matrix.identity();
	}
}

class Rotate extends Transform {
	θ: number;
	constructor(θ: number) {
		super();
		this.θ = θ;
	}
	at(t: number, m: Matrix) {
		let { θ, _anchor: { x, y } = {} } = this;
		θ = fromTo(t, 0, θ);
		if (x || y) {
			x = x ?? 0;
			y = y ?? 0;
			return m.translate(x, y).rotate(θ).translate(-x, -y);
		}
		return m.rotate(θ);
	}
}

class Identity extends Transform {
	at(t: number, m: Matrix) {
		return m;
	}
}

abstract class Transforms extends Transform {
	items: Array<Transform>;

	constructor(items: Array<Transform>) {
		super();
		this.items = items;
	}
}

class Seq extends Transforms {
	at(T: number, m: Matrix) {
		const { items } = this;
		let w_total = 0;
		for (const { _weight = 1 } of items) {
			w_total += _weight;
		}
		let w_walk = 0;
		for (const tr of items) {
			const { _weight = 1 } = tr;
			const start = w_walk / w_total;
			const end = (w_walk + _weight) / w_total;
			if (T < start) {
				break; // pass
			} else if (T >= end) {
				m = tr.at(1, m);
			} else {
				// T >= start &&  T < end
				m = tr.at((T - start) / (_weight / w_total), m);
			}
			w_walk += _weight;
		}
		return m;
	}
}

class Par extends Transforms {
	at(T: number, m: Matrix) {
		for (const tr of this.items) {
			m = tr.at(T, m);
		}
		return m;
	}
}

import { Cubic } from './path/cubic.js';
import { Line } from './path/line.js';
import { Segment } from './path/index.js';

export function cubicTrack(h1: Vec, h2: Vec|undefined, p1: Vec, p2?: Vec) {
	if (!p2) {
		p2 = p1;
		p1 = Vec.pos(0, 0);
	}
	const d = p2.distance(p1);
	const c1 = p1.add(Vec.polar(h1.abs() * d, h1.angle));
	const c2 = h2 ? p2.add(Vec.polar(h2.abs() * d, h2.angle)) : p2;
	return  new Cubic(p1, c1, c2, p2);
}

export function MInterp(m1: Matrix, m2: Matrix) {
	const d1 = m1.decompose();
	const d2 = m2.decompose();
	if (d1.translateX == d2.translateX) {
		if (d1.translateY == d2.translateY) {
		}
	}

	do {
		if (d1.scaleX == d2.scaleX) {
			if (d1.scaleY == d2.scaleY) {
				break;
			}
		}
		
	} while (0);

	// translateX: e,
	// translateY: f,
	// rotate: (atan2(b, a) * 180) / PI,
	// skewX: (atan(skewX) * 180) / PI,
	// scaleX: scaleX,
	// scaleY: scaleY,
	// {do:translate}{do:scale,from:.3,to:9}
	// return q;
}
