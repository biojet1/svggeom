import {Vec} from '../point.js';

const pi = Math.PI,
	tau = 2 * pi,
	epsilon = 1e-6,
	tauEpsilon = tau - epsilon;
type NumOrVec = number | Iterable<number>;

function* pickXY(args: NumOrVec[]) {
	for (const v of args) {
		if (typeof v == 'number') {
			yield v;
		} else {
			const [x, y] = v;
			yield x;
			yield y;
		}
	}
}

function Pt(x: NumOrVec, y?: number) {
	if (typeof x === 'object') {
		return [...x];
	} else {
		return [x, y];
	}
}

class Data {
	_prev?: Data;
	_p2: Vec;

	constructor(p: Vec, prev?: Data) {
		this._p2 = p;
		prev ?? (this._prev = prev);
	}

	get p2() {
		return this._p2;
	}

	get p1() {
		return this._prev?._p2;
	}

	anchor(): Data | undefined {
		let {_prev} = this;
		for (; _prev; _prev = _prev._prev) {
			if (_prev instanceof MoveData) {
				return _prev;
			}
		}
		return _prev;
	}

	// compose() {
	// 	return [...this.iter()]
	// 		.reverse()
	// 		.map(s => s.format())
	// 		.join(' ');
	// }

	// *iter(): Iterator<Data> {
	// 	let _prev = this;
	// 	do {
	// 		yield _prev;
	// 	} while ((_prev = _prev._prev));
	// }

	// moveTo(a: NumOrVec, b?: number) {
	// 	return new MoveData(Vec.pos(Pt(a, b)), this);
	// }
}

class LineData extends Data {
	format() {
		const [x, y] = this.p2;
		return `L${x},${y}`;
	}
}

class MoveData extends Data {
	format() {
		const [x, y] = this.p2;
		return `M${x},${y}`;
	}
}

export class PathData {
	_x0?: number;
	_y0?: number;
	_x1?: number;
	_y1?: number;
	_ = '';

	public static moveTo(a: NumOrVec, b?: number) {
		return new this().moveTo(a, b);
	}

	moveTo(a: NumOrVec, b?: number) {
		// this.cur = new MoveData(Vec.pos(x, y), this.cur);
		const [x = 0, y = 0] = Pt(a, b);
		this._ += 'M' + (this._x0 = this._x1 = +x) + ',' + (this._y0 = this._y1 = +y);
		return this;
	}

	closePath() {
		const {_x1 = null} = this;
		if (_x1 !== null) {
			(this._x1 = this._x0), (this._y1 = this._y0);
			this._ += 'Z';
		}
		return this;
	}

	lineTo(a: NumOrVec, b?: number) {
		const [x = 0, y = 0] = Pt(a, b);
		this._ += 'L' + (this._x1 = +x) + ',' + (this._y1 = +y);
		return this;
	}

	quadraticCurveTo(...args: NumOrVec[]) {
		const [x1 = 0, y1 = 0, x = 0, y = 0] = pickXY(args);

		this._ += 'Q' + +x1 + ',' + +y1 + ',' + (this._x1 = +x) + ',' + (this._y1 = +y);
		return this;
	}

	bezierCurveTo(...args: NumOrVec[]) {
		const [x1, y1, x2, y2, x, y] = pickXY(args);
		this._ += 'C' + +x1 + ',' + +y1 + ',' + +x2 + ',' + +y2 + ',' + (this._x1 = +x) + ',' + (this._y1 = +y);
		return this;
	}

	rect(...args: NumOrVec[]) {
		const [x, y, w, h] = pickXY(args);
		this._ += 'M' + (this._x0 = this._x1 = +x) + ',' + (this._y0 = this._y1 = +y) + 'h' + +w + 'v' + +h + 'h' + -w + 'Z';
		return this;
	}

	arcTo(...args: NumOrVec[]) {
		let [x1, y1, x2, y2, r] = pickXY(args);

		(x1 = +x1), (y1 = +y1), (x2 = +x2), (y2 = +y2), (r = +r);
		var x0 = this._x1 ?? 0,
			y0 = this._y1 ?? 0,
			x21 = x2 - x1,
			y21 = y2 - y1,
			x01 = x0 - x1,
			y01 = y0 - y1,
			l01_2 = x01 * x01 + y01 * y01;

		// Is the radius negative? Error.
		if (r < 0) throw new Error('negative radius: ' + r);

		// Is this path empty? Move to (x1,y1).
		if (this._x1 === null) {
			this._ += 'M' + (this._x1 = x1) + ',' + (this._y1 = y1);
		}

		// Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
		else if (!(l01_2 > epsilon)) {
		} else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
			// Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
			// Equivalently, is (x1,y1) coincident with (x2,y2)?
			// Or, is the radius zero? Line to (x1,y1).
			this._ += 'L' + (this._x1 = x1) + ',' + (this._y1 = y1);
		}

		// Otherwise, draw an arc!
		else {
			var x20 = x2 - x0,
				y20 = y2 - y0,
				l21_2 = x21 * x21 + y21 * y21,
				l20_2 = x20 * x20 + y20 * y20,
				l21 = Math.sqrt(l21_2),
				l01 = Math.sqrt(l01_2),
				l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
				t01 = l / l01,
				t21 = l / l21;

			// If the start tangent is not coincident with (x0,y0), line to.
			if (Math.abs(t01 - 1) > epsilon) {
				this._ += 'L' + (x1 + t01 * x01) + ',' + (y1 + t01 * y01);
			}

			this._ +=
				'A' +
				r +
				',' +
				r +
				',0,0,' +
				+(y01 * x20 > x01 * y20) +
				',' +
				(this._x1 = x1 + t21 * x21) +
				',' +
				(this._y1 = y1 + t21 * y21);
		}
		return this;
	}
	arcd(...args: NumOrVec[]) {
		const [x, y, r, a0, a1, ccw] = pickXY(args);
		return this.arc(x, y, r, (a0 * pi) / 180, (a1 * pi) / 180, ccw);
	}
	arc(...args: NumOrVec[]) {
		let [x, y, r, a0, a1, ccw] = pickXY(args);

		(x = +x), (y = +y), (r = +r), (ccw = !!ccw ? 1 : 0);
		var dx = r * Math.cos(a0),
			dy = r * Math.sin(a0),
			x0 = x + dx,
			y0 = y + dy,
			cw = 1 ^ ccw,
			da = ccw ? a0 - a1 : a1 - a0;

		// Is the radius negative? Error.
		if (r < 0) throw new Error('negative radius: ' + r);

		// Is this path empty? Move to (x0,y0).
		if (this._x1 === undefined) {
			console.log(dx);
			this._ += 'M' + x0 + ',' + y0;
		}

		// Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
		else if (Math.abs((this._x1 ?? 0) - x0) > epsilon || Math.abs((this._y1 ?? 0) - y0) > epsilon) {
			this._ += 'L' + x0 + ',' + y0;
		}

		// Is this arc empty? We’re done.
		if (!r) return this;

		// Does the angle go the wrong way? Flip the direction.
		if (da < 0) da = (da % tau) + tau;

		// Is this a complete circle? Draw two arcs to complete the circle.
		if (da > tauEpsilon) {
			this._ +=
				'A' +
				r +
				',' +
				r +
				',0,1,' +
				cw +
				',' +
				(x - dx) +
				',' +
				(y - dy) +
				'A' +
				r +
				',' +
				r +
				',0,1,' +
				cw +
				',' +
				(this._x1 = x0) +
				',' +
				(this._y1 = y0);
		}

		// Is this arc non-empty? Draw an arc!
		else if (da > epsilon) {
			this._ +=
				'A' +
				r +
				',' +
				r +
				',0,' +
				+(da >= pi) +
				',' +
				cw +
				',' +
				(this._x1 = x + r * Math.cos(a1)) +
				',' +
				(this._y1 = y + r * Math.sin(a1));
		}
		return this;
	}

	toString() {
		return this._;
	}
}
