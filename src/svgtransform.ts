import {Matrix} from './matrix.js';
const {PI, cos, sin, tan} = Math;

export class SVGMatrix extends Matrix {}

export class SVGTransform extends Matrix {
	static SVG_TRANSFORM_UNKNOWN = 0;
	static SVG_TRANSFORM_MATRIX = 1;
	static SVG_TRANSFORM_TRANSLATE = 2;
	static SVG_TRANSFORM_SCALE = 3;
	static SVG_TRANSFORM_ROTATE = 4;
	static SVG_TRANSFORM_SKEWX = 5;
	static SVG_TRANSFORM_SKEWY = 6;

	type: number = 0;
	angle?: number;
	_tx?: number;
	_ty?: number;

	get matrix(): this {
		return this;
	}

	setMatrix(m: Matrix): void {
		const {a, b, c, d, e, f} = m;
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
		const θ = (((this.angle = angle) % 360) * PI) / 180;
		const cosθ = cos(θ);
		const sinθ = sin(θ);
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
				const {e, f} = this;
				return `translate(${e}${f ? ' ' + f : ''})`;
			}
			case 3: {
				const {a, d} = this;
				return `scale(${a}${a == d ? '' : ' ' + d})`;
			}
			case 4: {
				const {angle, _tx, _ty} = this;
				if (_tx || _ty) return `rotate(${angle}, ${_tx ?? 0}, ${_ty ?? 0})`;
				return `rotate(${angle})`;
			}
			case 5: {
				const {angle} = this;
				return `skewX(${angle})`;
			}
			case 6: {
				const {angle} = this;
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
		this.splice(i, 0, newItem);
	}
	createSVGTransformFromMatrix(newItem: Matrix) {
		this.clear();
		const m = new SVGTransform();
		m.setMatrix(newItem);
		this.push(m);
		return m;
	}

	consolidate() {
		let {[0]: first, length: n} = this;
		const m = new SVGTransform();
		if (first) {
			m.setMatrix(first);
			for (let i = 1; i < n; ) {
				m._catSelf(this[i++]);
			}
		}
		return this.initialize(m);
	}

	toString() {
		return this.join('');
	}
	get numberOfItems() {
		return this.length;
	}

	public static parse(d: string): SVGTransformList {
		const tl = new SVGTransformList();
		for (const str of d.split(/\)\s*,?\s*/).slice(0, -1)) {
			const kv = str.trim().split('(');
			const name = kv[0].trim();
			const args = kv[1].split(/[\s,]+/).map(str => parseFloat(str));
			// console.warn(name, args);
			const t = new SVGTransform();
			switch (name) {
				case 'matrix':
					t.setMatrix(Matrix.fromArray(args));
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
				case 'scaleX':
					t.setScale(args[0], 0);
					break;
				case 'scaleY':
					t.setScale(0, args[0]);
					break;
				case 'rotate':
					t.setRotate(args[0], args[1], args[3]);
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
			tl.appendItem(t);
		}
		return tl;
	}
	public static new(m: SVGTransform): SVGTransformList {
		return new SVGTransformList(m);
	}
}
