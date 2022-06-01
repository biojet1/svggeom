const { sqrt, abs, tan, cos, sin, atan, atan2, PI } = Math;
const { isFinite } = Number;

const radians = function (d: number) {
	return ((d % 360) * PI) / 180;
};

export class Matrix {
	// [ a, c, e ] [ sx*cosψ, -sy*sinψ, tx ]
	// [ b, d, f ] [ sx*sinψ,  sy*cosψ, ty ]

	a: number;
	b: number;
	c: number;
	d: number;
	e: number;
	f: number;

	constructor(M: Iterable<number> = []) {
		const [a = 1, b = 0, c = 0, d = 1, e = 0, f = 0] = M;
		this.a = a;
		this.b = b;
		this.c = c;
		this.d = d;
		this.e = e;
		this.f = f;
		if (!(isFinite(a) && isFinite(b) && isFinite(c) && isFinite(d) && isFinite(e) && isFinite(f)))
			throw TypeError(`${JSON.stringify(arguments)}`);
	}
	// Query methods
	get isIdentity() {
		const { a, b, c, d, e, f } = this;
		return a === 1 && b === 0 && c === 0 && d === 1 && e === 0 && f === 0;
	}

	get is2D() {
		return true;
	}

	toString() {
		const { a, b, c, d, e, f } = this;
		return `matrix(${a} ${b} ${c} ${d} ${e} ${f})`;
	}

	clone() {
		const { a, b, c, d, e, f } = this;
		return new Matrix([a, b, c, d, e, f]);
	}

	equals(other: Matrix, epsilon = 0) {
		const { a, b, c, d, e, f } = this;
		const { a: A, b: B, c: C, d: D, e: E, f: F } = other;
		return (
			other === this ||
			(closeEnough(a, A, epsilon) &&
				closeEnough(b, B, epsilon) &&
				closeEnough(c, C, epsilon) &&
				closeEnough(d, D, epsilon) &&
				closeEnough(e, E, epsilon) &&
				closeEnough(f, F, epsilon))
		);
	}

	isURT(epsilon = 1e-15) {
		// decomposition as U*R*T is possible
		const { a, d, b, c } = this;
		return a - d <= epsilon && b + c <= epsilon;
	}

	decompose() {
		let { a, d, b, c } = this;
		const { e, f } = this;
		let scaleX, scaleY, skewX;
		if ((scaleX = sqrt(a * a + b * b))) (a /= scaleX), (b /= scaleX);
		if ((skewX = a * c + b * d)) (c -= a * skewX), (d -= b * skewX);
		if ((scaleY = sqrt(c * c + d * d))) (c /= scaleY), (d /= scaleY), (skewX /= scaleY);
		if (a * d < b * c) (a = -a), (b = -b), (skewX = -skewX), (scaleX = -scaleX);
		return {
			translateX: e,
			translateY: f,
			rotate: (atan2(b, a) * 180) / PI,
			skewX: (atan(skewX) * 180) / PI,
			scaleX: scaleX,
			scaleY: scaleY,
			toString: function () {
				const { translateX, translateY, rotate, skewX, scaleX, scaleY } = this;
				return `${translateX || translateY ? `translate(${translateX} ${translateY})` : ''}${
					rotate ? `rotate(${rotate})` : ''
				}${skewX ? `skewX(${skewX})` : ''}${
					scaleX == 1 && scaleY == 1 ? '' : `scale(${scaleX} ${scaleY})`
				}`;
			},
		};
	}

	toArray() {
		const { a, b, c, d, e, f } = this;

		return [a, b, c, d, e, f];
	}

	describe() {
		return this.decompose().toString();
	}

	// methods returning a Matrix
	protected _hexad(
		a: number = 1,
		b: number = 0,
		c: number = 0,
		d: number = 1,
		e: number = 0,
		f: number = 0,
	): Matrix {
		return new Matrix([a, b, c, d, e, f]);
	}

	protected _cat(m: Matrix): Matrix {
		const { a, b, c, d, e, f } = this;
		const { a: A, b: B, c: C, d: D, e: E, f: F } = m;

		return this._hexad(
			a * A + c * B + e * 0,
			b * A + d * B + f * 0,
			a * C + c * D + e * 0,
			b * C + d * D + f * 0,
			a * E + c * F + e * 1,
			b * E + d * F + f * 1,
		);
	}

	inverse() {
		// Get the current parameters out of the matrix
		const { a, b, c, d, e, f } = this;

		// Invert the 2x2 matrix in the top left
		const det = a * d - b * c;
		if (!det) throw new Error('Cannot invert ' + this);

		// Calculate the top 2x2 matrix
		const na = d / det;
		const nb = -b / det;
		const nc = -c / det;
		const nd = a / det;

		// Apply the inverted matrix to the top right
		const ne = -(na * e + nc * f);
		const nf = -(nb * e + nd * f);

		// Construct the inverted matrix

		return this._hexad(na, nb, nc, nd, ne, nf);
	}

	multiply(m: Matrix): Matrix {
		return this._cat(m);
	}

	postMultiply(m: Matrix): Matrix {
		const { a, b, c, d, e, f } = m;
		const { a: A, b: B, c: C, d: D, e: E, f: F } = this;

		return this._hexad(
			a * A + c * B + e * 0,
			b * A + d * B + f * 0,
			a * C + c * D + e * 0,
			b * C + d * D + f * 0,
			a * E + c * F + e * 1,
			b * E + d * F + f * 1,
		);
	}

	translate(x = 0, y = 0) {
		return this._cat(Matrix.hexad(1, 0, 0, 1, x, y));
	}

	translateY(v: number) {
		return this.translate(0, v);
	}

	translateX(v: number) {
		return this.translate(v, 0);
	}

	scale(scaleX: number, scaleY?: number) {
		return this._cat(Matrix.hexad(scaleX, 0, 0, scaleY ?? scaleX, 0, 0));
	}

	rotate(ang: number, x: number = 0, y: number = 0): Matrix {
		const θ = ((ang % 360) * PI) / 180;
		const cosθ = cos(θ);
		const sinθ = sin(θ);
		return this._cat(
			Matrix.hexad(
				cosθ,
				sinθ,
				-sinθ,
				cosθ,
				x ? -cosθ * x + sinθ * y + x : 0,
				y ? -sinθ * x - cosθ * y + y : 0,
			),
		);
	}

	skew(x: number, y: number) {
		return this._cat(Matrix.hexad(1, tan(radians(y)), tan(radians(x)), 1, 0, 0));
	}

	skewX(x: number) {
		return this.skew(x, 0);
	}

	skewY(y: number) {
		return this.skew(0, y);
	}

	// toHexad() {
	// 	return [this.a, this.b, this.c, this.d, this.e, this.f];
	// }
	// setHexad(a: number, b: number, c: number, d: number, e: number, f: number) {
	// 	this.a = a;
	// 	this.b = b;
	// 	this.c = c;
	// 	this.d = d;
	// 	this.e = e;
	// 	this.f = f;
	// }

	// Static methods

	public static compose(dec: any) {
		const { translateX, translateY, rotate, skewX, scaleX, scaleY } = dec;
		return `${translateX || translateY ? `translate(${translateX} ${translateY})` : ''}${
			rotate ? `rotate(${rotate})` : ''
		}${skewX ? `skewX(${skewX})` : ''}${
			scaleX == 1 && scaleY == 1 ? '' : `scale(${scaleX} ${scaleY})`
		}`;

		// return `translate(${dec.translateX}, ${dec.translateY}) rotate(${dec.rotate}) skewX(${dec.skewX}) scale(${dec.scaleX}, ${dec.scaleY})`;
	}

	public static hexad(
		a: number = 1,
		b: number = 0,
		c: number = 0,
		d: number = 1,
		e: number = 0,
		f: number = 0,
	): Matrix {
		return new this([a, b, c, d, e, f]);
	}

	public static fromArray(m: number[]) {
		return new this(m);
	}

	public static parse(d: string) {
		d = d.trim();
		let m = new this();
		if (d)
			for (const str of d.split(/\)\s*,?\s*/).slice(0, -1)) {
				const kv = str.trim().split('(');
				const name = kv[0].trim();
				const args = kv[1].split(/[\s,]+/).map(function (str) {
					return parseFloat(str.trim());
				});
				m = name === 'matrix' ? m.multiply(Matrix.fromArray(args)) : m[name].apply(m, args);
			}
		return m;
	}

	[shot: string]: any;
	static fromElement(node: ElementLike): Matrix {
		return this.parse(node.getAttribute('transform') || '');
	}

	public static new(first: number | number[] | string | Matrix | ElementLike) {
		switch (typeof first) {
			case 'string':
				return this.parse(first);
			case 'number':
				return this.hexad(
					first,
					arguments[1],
					arguments[2],
					arguments[3],
					arguments[4],
					arguments[5],
				);
			case 'undefined':
				return new Matrix();
			case 'object':
				if (Array.isArray(first)) {
					return this.fromArray(first);
				} else if ((first as any).nodeType === 1) {
					return this.fromElement(first as any as ElementLike);
				} else {
					const { a, b, c, d, e, f } = first as any;

					return this.hexad(a, b, c, d, e, f);
				}
			default:
				throw new TypeError(`Invalid matrix argument ${Array.from(arguments)}`);
		}
	}

	static interpolate(
		A: number[] | string | Matrix | ElementLike,
		B: number[] | string | Matrix | ElementLike,
		opt?: any,
	) {
		const a = this.new(A).toArray();
		const b = this.new(B).toArray();
		const n = a.length;
		const klass = this;
		// console.log("interpolate T", A, B, a, b);
		return function (t: number) {
			let c = [0, 0, 0, 0, 0, 0];
			for (let i = 0; i < n; ++i) c[i] = a[i] === b[i] ? b[i] : a[i] * (1 - t) + b[i] * t;
			// console.log("compose", c);
			return klass.fromArray(c);
		};
	}
	static translate(x = 0, y = 0) {
		return this.hexad(1, 0, 0, 1, x, y);
	}
	static translateY(v: number) {
		return this.hexad(1, 0, 0, 1, 0, v);
	}
	static translateX(v: number) {
		return this.hexad(1, 0, 0, 1, v, 0);
	}
	static skew(x: number, y: number) {
		return this.hexad(1, tan(radians(y)), tan(radians(x)), 1, 0, 0);
	}
	static skewX(x: number) {
		return this.skew(x, 0);
	}
	static skewY(y: number) {
		return this.skew(0, y);
	}
	static rotate(ang: number, x: number = 0, y: number = 0) {
		const θ = ((ang % 360) * PI) / 180;
		const cosθ = cos(θ);
		const sinθ = sin(θ);
		return this.hexad(
			cosθ,
			sinθ,
			-sinθ,
			cosθ,
			x ? -cosθ * x + sinθ * y + x : 0,
			y ? -sinθ * x - cosθ * y + y : 0,
		);
	}

	static scale(scaleX: number, scaleY?: number) {
		return this.hexad(scaleX, 0, 0, scaleY ?? scaleX, 0, 0);
	}
	static identity() {
		return new this();
	}
	static multiply(args: Array<Matrix>): Matrix {
		let m;
		for (const v of args) {
			if (m) {
				m = m.multiply(v);
			} else {
				m = v;
			}
		}
		return m ?? this.identity();
	}

	final() {
		return Object.isFrozen(this) ? this : Object.freeze(this.clone());
	}
	mut() {
		return Object.isFrozen(this) ? this.clone() : this;
	}
}

interface ElementLike {
	nodeType: number;
	getAttribute(name: string): null | string;
}

function closeEnough(a: number, b: number, threshold = 1e-6) {
	return abs(b - a) <= threshold;
}

export class MatrixMut extends Matrix {
	setHexad(a: number, b: number, c: number, d: number, e: number, f: number) {
		this.a = a;
		this.b = b;
		this.c = c;
		this.d = d;
		this.e = e;
		this.f = f;
	}
	protected _catSelf(m: Matrix): Matrix {
		const { a, b, c, d, e, f } = this;
		const { a: A, b: B, c: C, d: D, e: E, f: F } = m;
		this.a = a * A + c * B + e * 0;
		this.b = b * A + d * B + f * 0;
		this.c = a * C + c * D + e * 0;
		this.d = b * C + d * D + f * 0;
		this.e = a * E + c * F + e * 1;
		this.f = b * E + d * F + f * 1;
		return this;
	}
	multiplySelf(m: Matrix): Matrix {
		return this._catSelf(m);
	}
	// invertSelf():this{

	// }
}

// type CreateMutable<Type> = {
//   -readonly [Property in keyof Type]: Type[Property];
// };

// export class MutMatrix extends CreateMutable<Matrix> {
// 	setHexad(a: number, b: number, c: number, d: number, e: number, f: number) {
// 		this.a = a;
// 		this.b = b;
// 		this.c = c;
// 		this.d = d;
// 		this.e = e;
// 		this.f = f;
// 	}
// }
