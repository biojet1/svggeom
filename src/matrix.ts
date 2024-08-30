const { sqrt, abs, tan, cos, sin, atan, atan2, PI } = Math;
const { isFinite } = Number;

const radians = function (d: number) {
	return ((d % 360) * PI) / 180;
};
const _cat = function (m: Matrix, n: Matrix) {
	const { a, b, c, d, e, f } = m;
	const { a: A, b: B, c: C, d: D, e: E, f: F } = n;
	return [
		a * A + c * B + e * 0,
		b * A + d * B + f * 0,
		a * C + c * D + e * 0,
		b * C + d * D + f * 0,
		a * E + c * F + e * 1,
		b * E + d * F + f * 1,
	];
};
const _inv = function (m: Matrix) {
	// Get the current parameters out of the matrix
	const { a, b, c, d, e, f } = m;

	// Invert the 2x2 matrix in the top left
	const det = a * d - b * c;
	if (!det) throw new Error('Cannot invert ' + m);

	// Calculate the top 2x2 matrix
	const na = d / det;
	const nb = -b / det;
	const nc = -c / det;
	const nd = a / det;

	// Apply the inverted matrix to the top right
	const ne = -(na * e + nc * f);
	const nf = -(nb * e + nd * f);

	// Construct the inverted matrix

	return [na, nb, nc, nd, ne, nf];
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
		if (
			!(
				isFinite(a) &&
				isFinite(b) &&
				isFinite(c) &&
				isFinite(d) &&
				isFinite(e) &&
				isFinite(f)
			)
		)
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

	is_identity() {
		const { a, b, c, d, e, f } = this;
		return a === 1 && b === 0 && c === 0 && d === 1 && e === 0 && f === 0;
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

	is_urt(epsilon = 1e-15) {
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
				return `${translateX || translateY ? `translate(${translateX} ${translateY})` : ''
					}${rotate ? `rotate(${rotate})` : ''}${skewX ? `skewX(${skewX})` : ''}${scaleX == 1 && scaleY == 1
						? ''
						: `scale(${scaleX}${scaleX == scaleY ? '' : ' ' + scaleY})`
					}`;
			},
		};
	}
	// https://github.com/svg/svgo/blob/8d6385bd9ab49d1d300a10268930238baa5eb269/plugins/_transforms.js#L461
	take_apart() {
		const { a, b, c, d, e, f } = this;
		let rotation, scale, skew, r, skew_axis;
		const delta = a * d - b * c;
		if (a !== 0 || b !== 0) {
			r = Math.hypot(a, b);
			// rotation = ((b < 0 ? -1 : 1) * Math.acos(a / r)) * 180 / Math.PI;
			rotation = ((b > 0 ? 1 : -1) * Math.acos(a / r)) * 180 / Math.PI;
			scale = [r, delta / r];
			skew_axis = 0;
		} else {
			r = Math.hypot(c, d);
			// rotation = 90 + ((d < 0 ? -1 : 1) * Math.acos(c / r) * 180 / Math.PI);
			rotation = 90 - ((d > 0 ? Math.acos(-c / r) : -Math.acos(c / r)) * 180 / Math.PI);
			scale = [delta / r, r];
			skew_axis = 90;
		}
		skew = Math.atan2((a * c + b * d), r * r) * 180 / Math.PI;
		return { rotation, scale, skew, skew_axis, translation: [e, f] };
	}

	toArray() {
		return this.dump_hexad();
	}
	dump_hexad() {
		const { a, b, c, d, e, f } = this;

		return [a, b, c, d, e, f];
	}

	describe() {
		return this.decompose().toString();
	}

	protected _set_hexad(
		a: number = 1,
		b: number = 0,
		c: number = 0,
		d: number = 1,
		e: number = 0,
		f: number = 0
	): this {
		this.a = a;
		this.b = b;
		this.c = c;
		this.d = d;
		this.e = e;
		this.f = f;
		return this;
	}

	// methods returning a Matrix
	protected _hexad(
		a: number = 1,
		b: number = 0,
		c: number = 0,
		d: number = 1,
		e: number = 0,
		f: number = 0
	): Matrix {
		return new Matrix([a, b, c, d, e, f]);
	}

	_cat_self(m: Matrix): this {
		return this._set_hexad(..._cat(this, m));
	}

	protected _post_cat_self(m: Matrix): this {
		return this._set_hexad(..._cat(m, this));
	}

	protected _cat(m: Matrix): Matrix {
		return this._hexad(..._cat(this, m));
	}

	protected _post_cat(m: Matrix): Matrix {
		return this._hexad(..._cat(m, this));
	}

	inverse() {
		return this._hexad(..._inv(this));
	}

	cat(m: Matrix): Matrix {
		return this._cat(m);
	}

	multiply(m: Matrix): Matrix {
		return this._cat(m);
	}

	post_cat(m: Matrix): Matrix {
		return this._post_cat(m);
	}

	translate(x = 0, y = 0) {
		return this._cat(Matrix.matrix(1, 0, 0, 1, x, y));
	}

	translateY(v: number) {
		return this.translate(0, v);
	}

	translateX(v: number) {
		return this.translate(v, 0);
	}

	scale(scaleX: number, scaleY?: number) {
		return this._cat(Matrix.matrix(scaleX, 0, 0, scaleY ?? scaleX, 0, 0));
	}

	rotate(deg: number, x: number = 0, y: number = 0): Matrix {
		const θ = ((deg % 360) * PI) / 180;
		const cosθ = cos(θ);
		const sinθ = sin(θ);
		return this._cat(
			Matrix.matrix(
				cosθ,
				sinθ,
				-sinθ,
				cosθ,
				x ? -cosθ * x + sinθ * y + x : 0,
				y ? -sinθ * x - cosθ * y + y : 0
			)
		);
	}

	skew(x: number, y: number) {
		return this._cat(Matrix.matrix(1, tan(radians(y)), tan(radians(x)), 1, 0, 0));
	}

	skewX(deg: number) {
		return this.skew(deg, 0);
	}

	skewY(deg: number) {
		return this.skew(0, deg);
	}

	cat_self(m: Matrix): this {
		throw new Error(`Not implemented`);
	}

	post_cat_self(m: Matrix): this {
		throw new Error(`Not implemented`);
	}
	// Static methods

	public static hexad(
		a: number = 1,
		b: number = 0,
		c: number = 0,
		d: number = 1,
		e: number = 0,
		f: number = 0
	) {
		return new this([a, b, c, d, e, f]);
	}

	public static matrix(
		a: number = 1,
		b: number = 0,
		c: number = 0,
		d: number = 1,
		e: number = 0,
		f: number = 0
	) {
		return new this([a, b, c, d, e, f]);
	}

	public static fromArray(m: number[]) {
		return new this(m);
	}

	public static parse(d: string) {
		let m = new this();
		if (d)
			for (const str of d.split(/\)\s*,?\s*/).slice(0, -1)) {
				const kv = str.trim().split('(');
				const name = kv[0].trim();
				const args = kv[1].split(/[\s,]+/).map(function (str) {
					return parseFloat(str.trim());
				});
				switch (name) {
					case 'matrix':
						m._cat_self(this.fromArray(args));
						break;
					case 'translate':
						m._cat_self(this.translate(args[0], args[1]));
						break;
					case 'translateX':
						m._cat_self(this.translateX(args[0]));
						break;
					case 'translateY':
						m._cat_self(this.translateY(args[0]));
						break;
					case 'scale':
						m._cat_self(this.scale(args[0], args[1]));
						break;
					case 'rotate':
						m._cat_self(this.rotate(args[0], args[1], args[2]));
						break;
					case 'skewX':
						m._cat_self(this.skewX(args[0]));
						break;
					case 'skewY':
						m._cat_self(this.skewY(args[0]));
						break;
					default:
						throw new Error(`Unexpected transform '${name}'`);
				}
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
				return this.matrix(
					first,
					arguments[1],
					arguments[2],
					arguments[3],
					arguments[4],
					arguments[5]
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

					return this.matrix(a, b, c, d, e, f);
				}
			default:
				throw new TypeError(`Invalid matrix argument ${Array.from(arguments)}`);
		}
	}

	static interpolate(
		A: number[] | string | Matrix | ElementLike,
		B: number[] | string | Matrix | ElementLike,
		opt?: any
	) {
		const a = this.new(A).dump_hexad();
		const b = this.new(B).dump_hexad();
		const n = a.length;
		const klass = this;
		// console.warn("interpolate T", A, B, a, b);
		return function (t: number) {
			let c = [0, 0, 0, 0, 0, 0];
			for (let i = 0; i < n; ++i) c[i] = a[i] === b[i] ? b[i] : a[i] * (1 - t) + b[i] * t;
			// console.warn("compose", c);
			return klass.fromArray(c);
		};
	}
	static translate(x = 0, y = 0) {
		return this.matrix(1, 0, 0, 1, x, y);
	}
	static translateY(v: number) {
		return this.matrix(1, 0, 0, 1, 0, v);
	}
	static translateX(v: number) {
		return this.matrix(1, 0, 0, 1, v, 0);
	}
	static skew(x: number, y: number) {
		return this.matrix(1, tan(radians(y)), tan(radians(x)), 1, 0, 0);
	}
	static skewX(x: number) {
		return this.skew(x, 0);
	}
	static skewY(y: number) {
		return this.skew(0, y);
	}
	static rotate(deg: number, x: number = 0, y: number = 0) {
		const θ = ((deg % 360) * PI) / 180;
		const cosθ = cos(θ);
		const sinθ = sin(θ);
		return this.matrix(
			cosθ,
			sinθ,
			-sinθ,
			cosθ,
			x ? -cosθ * x + sinθ * y + x : 0,
			y ? -sinθ * x - cosθ * y + y : 0
		);
	}

	static scale(scaleX: number, scaleY?: number) {
		return this.matrix(scaleX, 0, 0, scaleY ?? scaleX, 0, 0);
	}
	// static Identity = new Matrix();
	static identity() {
		return new this();
		// return this.Identity;
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

	invertSelf() {
		return this._set_hexad(..._inv(this));
	}

	override cat_self(m: Matrix): this {
		return this._cat_self(m);
	}

	override post_cat_self(m: Matrix): this {
		return this._post_cat_self(m);
	}
}
