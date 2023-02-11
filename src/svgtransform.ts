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

	setTranslate(x: number, y: number): void {
		this.type = 2;
		this._set_hexad(1, 0, 0, 1, x, y);
	}

	setScale(sx: number, sy: number): void {
		this.type = 3;
		this._set_hexad(sx, 0, 0, sy, 0, 0);
	}

	setRotate(angle: number, cx: number, cy: number): void {
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
