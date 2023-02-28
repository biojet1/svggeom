import { Matrix } from './matrix.js';
const { PI, cos, sin, tan } = Math;
export { Matrix as SVGMatrix };
export class SVGTransform extends Matrix {
    static SVG_TRANSFORM_UNKNOWN = 0;
    static SVG_TRANSFORM_MATRIX = 1;
    static SVG_TRANSFORM_TRANSLATE = 2;
    static SVG_TRANSFORM_SCALE = 3;
    static SVG_TRANSFORM_ROTATE = 4;
    static SVG_TRANSFORM_SKEWX = 5;
    static SVG_TRANSFORM_SKEWY = 6;
    type = 0;
    angle;
    _tx;
    _ty;
    get matrix() {
        return this;
    }
    setMatrix(m) {
        const { a, b, c, d, e, f } = m;
        this.type = 1;
        delete this.angle;
        delete this._tx;
        delete this._ty;
        this._set_hexad(a, b, c, d, e, f);
    }
    setTranslate(x, y = 0) {
        this.type = 2;
        this._set_hexad(1, 0, 0, 1, x, y);
    }
    setScale(sx, sy) {
        this.type = 3;
        this._set_hexad(sx, 0, 0, sy ?? sx, 0, 0);
    }
    setRotate(angle, cx = 0, cy = 0) {
        this.type = 4;
        if (cx) {
            this._tx = cx;
        }
        else {
            delete this._tx;
        }
        if (cy) {
            this._ty = cy;
        }
        else {
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
        this._set_hexad(cosθ, sinθ, -sinθ, cosθ, cx ? -cosθ * cx + sinθ * cy + cx : 0, cy ? -sinθ * cx - cosθ * cy + cy : 0);
    }
    setSkewX(angle) {
        const θ = (((this.angle = angle) % 360) * PI) / 180;
        this.type = 5;
        this._set_hexad(1, 0, tan(θ), 1, 0, 0);
    }
    setSkewY(angle) {
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
                if (_tx || _ty)
                    return `rotate(${angle} ${_tx ?? 0} ${_ty ?? 0})`;
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
export class SVGTransformList extends Array {
    clear() {
        this.splice(0);
    }
    getItem(i) {
        return this[i];
    }
    removeItem(i) {
        const m = this[i];
        this.splice(i, 1);
        return m;
    }
    appendItem(newItem) {
        this.push(newItem);
        return newItem;
    }
    initialize(newItem) {
        this.clear();
        this.push(newItem);
        return newItem;
    }
    insertItemBefore(newItem, i) {
        let j;
        while ((j = this.indexOf(newItem)) >= 0) {
            this.splice(j, 1);
        }
        this.splice(i, 0, newItem);
    }
    replaceItem(newItem, i) {
        let j;
        while ((j = this.indexOf(newItem)) >= 0) {
            this.splice(j, 1);
            --i;
        }
        this.splice(i, 1, newItem);
    }
    createSVGTransformFromMatrix(newItem) {
        const m = new SVGTransform();
        m.setMatrix(newItem);
        return m;
    }
    combine() {
        let M;
        for (const m of this) {
            if (M) {
                M._catSelf(m);
            }
            else {
                M = m.clone();
            }
        }
        return M ?? Matrix.identity();
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
    _dropItem(refItem) {
        let j;
        while ((j = this.indexOf(refItem)) >= 0) {
            this.splice(j, 1);
        }
    }
    _parse(d) {
        for (const str of d.split(/\)\s*,?\s*/).slice(0, -1)) {
            const kv = str.trim().split('(');
            const name = kv[0].trim();
            const args = kv[1].split(/[\s,]+/).map(str => parseFloat(str));
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
    static _parse(d) {
        return new SVGTransformList()._parse(d);
    }
}
//# sourceMappingURL=svgtransform.js.map