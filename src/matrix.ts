const radians = function (d: number) {
	return ((d % 360) * Math.PI) / 180;
};

export class Matrix {
	// [ a, c, e ] [ sx*cosψ, -sy*sinψ, tx ]
	// [ b, d, f ] [ sx*sinψ,  sy*cosψ, ty ]

	readonly a: number;
	readonly b: number;
	readonly c: number;
	readonly d: number;
	readonly e: number;
	readonly f: number;
	constructor(m: undefined | number[] = undefined) {
		// if (arguments.length === 6) {
		// 	m = arguments;
		// }
		if (m) {
			this.a = m[0];
			this.b = m[1];
			this.c = m[2];
			this.d = m[3];
			this.e = m[4];
			this.f = m[5];
		} else {
			this.a = this.d = 1;
			this.b = this.c = this.e = this.f = 0;
		}
		if (
			!(
				Number.isFinite(this.a) &&
				Number.isFinite(this.b) &&
				Number.isFinite(this.c) &&
				Number.isFinite(this.d) &&
				Number.isFinite(this.e) &&
				Number.isFinite(this.f)
			)
		)
			throw Error(`${JSON.stringify(arguments)}`);
	}

	inverse() {
		// Get the current parameters out of the matrix
		const { a, d, b, c, e, f } = this;

		// Invert the 2x2 matrix in the top left
		const det = a * d - b * c;
		if (!det) throw new Error("Cannot invert " + this);

		// Calculate the top 2x2 matrix
		const na = d / det;
		const nb = -b / det;
		const nc = -c / det;
		const nd = a / det;

		// Apply the inverted matrix to the top right
		const ne = -(na * e + nc * f);
		const nf = -(nb * e + nd * f);

		// Construct the inverted matrix

		return Matrix.fromHexad(na, nb, nc, nd, ne, nf);
	}

	multiply(m: Matrix): Matrix {
		const { a, d, b, c, e, f } = this;
		const { a: A, b: B, c: C, d: D, e: E, f: F } = m;

		return Matrix.fromHexad(
			a * A + c * B + e * 0,
			b * A + d * B + f * 0,
			a * C + c * D + e * 0,
			b * C + d * D + f * 0,
			a * E + c * F + e * 1,
			b * E + d * F + f * 1
		);
	}

	rotate(ang: number, x: number = 0, y: number = 0): Matrix {
		const θ = ((ang % 360) * Math.PI) / 180;
		const cosθ = Math.cos(θ);
		const sinθ = Math.sin(θ);
		return this.multiply(
			Matrix.fromHexad(
				cosθ,
				sinθ,
				-sinθ,
				cosθ,
				x ? -cosθ * x + sinθ * y + x : 0,
				y ? -sinθ * x - cosθ * y + y : 0
			)
		);
	}

	scale(scaleX: number, scaleY = scaleX) {
		return this.multiply(Matrix.fromHexad(scaleX, 0, 0, scaleY, 0, 0));
	}

	skew(x: number, y: number) {
		return this.multiply(
			Matrix.fromHexad(
				1,
				Math.tan(radians(y)),
				Math.tan(radians(x)),
				1,
				0,
				0
			)
		);
	}

	skewX(x: number) {
		return this.skew(x, 0);
	}

	skewY(y: number) {
		return this.skew(0, y);
	}

	toString() {
		return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
	}

	translate(x = 0, y = 0) {
		return this.multiply(Matrix.fromHexad(1, 0, 0, 1, x, y));
	}
	translateY(v: number) {
		return this.translate(0, v);
	}
	translateX(v: number) {
		return this.translate(v, 0);
	}
	// toHexad() {
	// 	return [this.a, this.b, this.c, this.d, this.e, this.f];
	// }

	equals(other: Matrix, epsilon = 0) {
		const { a, d, b, c, e, f } = this;
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
	// public static from(node: any) {
	// 	 if (Array.isArray(x)) {
	// 		return new Matrix(...x);
	// 	} else if (x) {
	// 		return new Point(x.x, x.y);
	// 	} else {
	// 		return new Point();
	// 	}
	// }
	decompose() {
		let { a, d, b, c } = this;
		const { e, f } = this;
		var scaleX, scaleY, skewX;
		if ((scaleX = Math.sqrt(a * a + b * b))) (a /= scaleX), (b /= scaleX);
		if ((skewX = a * c + b * d)) (c -= a * skewX), (d -= b * skewX);
		if ((scaleY = Math.sqrt(c * c + d * d)))
			(c /= scaleY), (d /= scaleY), (skewX /= scaleY);
		if (a * d < b * c)
			(a = -a), (b = -b), (skewX = -skewX), (scaleX = -scaleX);
		return {
			translateX: e,
			translateY: f,
			rotate: (Math.atan2(b, a) * 180) / Math.PI,
			skewX: (Math.atan(skewX) * 180) / Math.PI,
			scaleX: scaleX,
			scaleY: scaleY,
		};
	}
	public toArray() {
		const { a, d, b, c, e, f } = this;

		return [a, b, c, d, e, f];
	}
	public describe() {
		return Matrix.compose(this.decompose());
	}

	public static compose(dec: any) {
		const { translateX, translateY, rotate, skewX, scaleX, scaleY } = dec;
		return `${
			translateX || translateY
				? `translate(${translateX},${translateY})`
				: ""
		}${rotate ? `rotate(${rotate})` : ""}${skewX ? `skewX(${skewX})` : ""}${
			scaleX == 1 && scaleY == 1 ? "" : `scale(${scaleX},${scaleY})`
		}`;

		// return `translate(${dec.translateX}, ${dec.translateY}) rotate(${dec.rotate}) skewX(${dec.skewX}) scale(${dec.scaleX}, ${dec.scaleY})`;
	}
	public static fromHexad(
		a: number = 1,
		b: number = 0,
		c: number = 0,
		d: number = 1,
		e: number = 0,
		f: number = 0
	): Matrix {
		return new Matrix([a, b, c, d, e, f]);
	}

	public static fromArray(m: number[]): Matrix {
		return new Matrix(m);
	}
	public static fromTransform(d: string): Matrix {
		d = d.trim();
		// return d
		// 	? d

		// 			.split(/\)\s*,?\s*/)
		// 			// .filter(str => !!str)
		// 			.slice(0, -1)
		// 			.map(function (str) {
		// 				// generate key => value pairs
		// 				const kv = str.trim().split("(");
		// 				return [
		// 					kv[0].trim(),
		// 					kv[1].split(/[\s,]+/).map(function (str) {
		// 						return parseFloat(str.trim());
		// 					}),
		// 				];
		// 			})
		// 			// merge every transformation into one matrix
		// 			.reduce(function (
		// 				matrix: Matrix,
		// 				transform: [string, number[]]
		// 			) {
		// 				return transform[0] === "matrix"
		// 					? matrix.multiply(Matrix.fromArray(transform[1]))
		// 					: matrix[transform[0]].apply(matrix, transform[1]);
		// 			},
		// 			new Matrix())
		// 	: new Matrix();
		let m = new Matrix();
		if (d)
			for (const str of d
				.split(/\)\s*,?\s*/)
				// .filter(str => !!str)
				.slice(0, -1)) {
				const kv = str.trim().split("(");
				const name = kv[0].trim();
				const args = kv[1].split(/[\s,]+/).map(function (str) {
					return parseFloat(str.trim());
				});
				m =
					name === "matrix"
						? m.multiply(Matrix.fromArray(args))
						: m[name].apply(m, args);
			}
		return m;
	}
	[shot: string]: any;
	static fromElement(node: Element): Matrix {
		return Matrix.fromTransform(node.getAttribute("transform") || "");
	}
	// public static from(node: any) {
	// 	return Matrix.fromTransform(node.getAttribute('transform') || '').trim();
	// }
	// getAttribute
	static from(v: string | Element | number[]): Matrix {
		if (Array.isArray(v)) {
			return Matrix.fromArray(v);
		} else if (!v) {
			return new Matrix();
		} else if (typeof v === "string") {
			return Matrix.fromTransform(v);
		} else if (v instanceof Matrix) {
			return v;
		} else {
			return Matrix.fromElement(v);
		}
	}
	static interpolate(
		A: string | Element | number[],
		B: string | Element | number[]
	) {
		const a = Matrix.from(A).toArray();
		const b = Matrix.from(B).toArray();
		const n = a.length;
		// console.log('interpolate T', A, B, a, b);
		return function (t: number) {
			let c = [0, 0, 0, 0, 0, 0];
			for (let i = 0; i < n; ++i)
				c[i] = a[i] === b[i] ? b[i] : a[i] * (1 - t) + b[i] * t;
			return Matrix.compose(Matrix.fromArray(c).decompose());
		};
	}
	static translate(x = 0, y = 0) {
		return Matrix.fromHexad(1, 0, 0, 1, x, y);
	}
	static translateY(v: number) {
		return Matrix.fromHexad(1, 0, 0, 1, 0, v);
	}
	static translateX(v: number) {
		return Matrix.fromHexad(1, 0, 0, 1, v, 0);
	}
}

function closeEnough(a: number, b: number, threshold = 1e-6) {
	return Math.abs(b - a) <= threshold;
}
