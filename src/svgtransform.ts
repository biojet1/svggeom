import { Matrix, MatrixMut } from './matrix.js';
const { PI, cos, sin, tan } = Math;

export { MatrixMut as SVGMatrix };

export class SVGTransform extends MatrixMut {
	static readonly SVG_TRANSFORM_UNKNOWN = 0;
	static readonly SVG_TRANSFORM_MATRIX = 1;
	static readonly SVG_TRANSFORM_TRANSLATE = 2;
	static readonly SVG_TRANSFORM_SCALE = 3;
	static readonly SVG_TRANSFORM_ROTATE = 4;
	static readonly SVG_TRANSFORM_SKEWX = 5;
	static readonly SVG_TRANSFORM_SKEWY = 6;

	type: number = 0;
	angle?: number;
	_tx?: number;
	_ty?: number;

	get matrix(): this {
		return this;
	}

	setMatrix(m: Matrix): void {
		const { a, b, c, d, e, f } = m;
		this.type = 1;
		delete this.angle;
		delete this._tx;
		delete this._ty;
		this._set_hexad(a, b, c, d, e, f);
	}

	setTranslate(x: number, y: number = 0): void {
		this.type = 2;
		this._set_hexad(1, 0, 0, 1, x, y);
	}

	setScale(sx: number, sy?: number): void {
		this.type = 3;
		this._set_hexad(sx, 0, 0, sy ?? sx, 0, 0);
	}

	setRotate(angle: number, cx: number = 0, cy: number = 0): void {
		this.type = 4;
		if (cx) {
			this._tx = cx;
		} else {
			delete this._tx;
		}
		if (cy) {
			this._ty = cy;
		} else {
			delete this._ty;
		}
		let cosθ, sinθ;
		switch ((this.angle = angle)) {
			case 0:
				cosθ = 1;
				sinθ = 0;
				break;
			case 90:
				cosθ = +0;
				sinθ = +1;
				break;
			case -90:
				cosθ = +0;
				sinθ = -1;
				break;
			case 180:
				cosθ = -1;
				sinθ = +0;
				break;
			case -180:
				cosθ = -1;
				sinθ = -0;
				break;
			case 270:
				cosθ = -0;
				sinθ = -1;
				break;
			case -270:
				cosθ = -0;
				sinθ = +1;
				break;
			default:
				const θ = ((angle % 360) * PI) / 180;
				cosθ = cos(θ);
				sinθ = sin(θ);
		}

		this._set_hexad(
			cosθ,
			sinθ,
			-sinθ,
			cosθ,
			cx ? -cosθ * cx + sinθ * cy + cx : 0,
			cy ? -sinθ * cx - cosθ * cy + cy : 0
		);
	}

	setSkewX(angle: number): void {
		const θ = (((this.angle = angle) % 360) * PI) / 180;
		this.type = 5;
		this._set_hexad(1, 0, tan(θ), 1, 0, 0);
	}

	setSkewY(angle: number): void {
		const θ = (((this.angle = angle) % 360) * PI) / 180;
		this.type = 6;
		this._set_hexad(1, tan(θ), 0, 1, 0, 0);
	}

	toString() {
		switch (this.type) {
			case 2: {
				const { e, f } = this;
				return `translate(${e}${f ? ' ' + f : ''})`;
			}
			case 3: {
				const { a, d } = this;
				return `scale(${a}${a == d ? '' : ' ' + d})`;
			}
			case 4: {
				const { angle, _tx, _ty } = this;
				if (_tx || _ty) return `rotate(${angle} ${_tx ?? 0} ${_ty ?? 0})`;
				return `rotate(${angle})`;
			}
			case 5: {
				const { angle } = this;
				return `skewX(${angle})`;
			}
			case 6: {
				const { angle } = this;
				return `skewY(${angle})`;
			}
		}

		return super.toString();
	}
}

export class SVGTransformList extends Array<SVGTransform> {
	clear() {
		this.splice(0);
	}
	getItem(i: number) {
		return this[i];
	}
	removeItem(i: number) {
		const m = this[i];
		this.splice(i, 1);
		return m;
	}
	appendItem(newItem: SVGTransform) {
		this.push(newItem);
		return newItem;
	}
	initialize(newItem: SVGTransform) {
		this.clear();
		this.push(newItem);
		return newItem;
	}
	insertItemBefore(newItem: SVGTransform, i: number) {
		let j;
		while ((j = this.indexOf(newItem)) >= 0) {
			this.splice(j, 1);
		}
		this.splice(i, 0, newItem);
	}
	replaceItem(newItem: SVGTransform, i: number) {
		let j;
		while ((j = this.indexOf(newItem)) >= 0) {
			this.splice(j, 1);
			--i;
		}
		this.splice(i, 1, newItem);
	}
	createSVGTransformFromMatrix(newItem: MatrixMut) {
		const m = new SVGTransform();
		m.setMatrix(newItem);
		// this.clear();
		// this.push(m);
		return m;
	}

	combine() {
		let M;
		for (const m of this) {
			if (M) {
				M._cat_self(m.matrix);
			} else {
				M = m.clone();
			}
		}
		return M ?? MatrixMut.identity();
	}
	consolidate() {
		const m = new SVGTransform();
		m.setMatrix(this.combine());
		return this.initialize(m);
	}

	toString() {
		return this.join('');
	}

	get numberOfItems() {
		return this.length;
	}

	_dropItem(refItem: SVGTransform) {
		let j;
		while ((j = this.indexOf(refItem)) >= 0) {
			this.splice(j, 1);
		}
	}

	_parse(d: string) {
		for (const str of d.split(/\)\s*,?\s*/).slice(0, -1)) {
			const kv = str.trim().split('(');
			const name = kv[0].trim();
			const args = kv[1].split(/[\s,]+/).map(str => parseFloat(str));
			const t = new SVGTransform();
			switch (name) {
				case 'matrix':
					t.setMatrix(MatrixMut.fromArray(args));
					break;
				case 'translate':
					t.setTranslate(args[0], args[1]);
					break;
				case 'translateX':
					t.setTranslate(args[0], 0);
					break;
				case 'translateY':
					t.setTranslate(0, args[0]);
					break;
				case 'scale':
					t.setScale(args[0], args[1]);
					break;
				case 'rotate':
					t.setRotate(args[0], args[1], args[2]);
					break;
				case 'skewX':
					t.setSkewX(args[0]);
					break;
				case 'skewY':
					t.setSkewY(args[0]);
					break;
				default:
					throw new Error(`Unexpected transform '${name}'`);
			}
			this.appendItem(t);
		}
		return this;
	}

	public static _parse(d: string): SVGTransformList {
		return new SVGTransformList()._parse(d);
	}

	// public static new(m: SVGTransform): SVGTransformList {
	// 	return new SVGTransformList(m);
	// }
}
