var rx = 30;
var ry = 50;

const {abs, atan, tan, cos, sin, sqrt, acos, atan2, pow, PI, min, max, ceil} = Math;

var φ = -15;
φ = ((φ % 360) + 360) % 360; // from -30 -> 330
var φrad = (φ * PI) / 180;
var cosφ = cos(φrad);
var sinφ = sin(φrad);

console.log(' φ', φ);
console.log(' φrad', φrad);
console.log(' cosφ', cosφ);
console.log(' sinφ', sinφ);
console.log(' rx', rx);
console.log(' ry', ry);

const x1 = 172.55;
const y1 = 152.45;
const x2 = 215.1;
const y2 = 109.9;
const arc = 0;
const sweep = 1;

const x1ˈ = (cosφ * (x1 - x2) + sinφ * (y1 - y2)) / 2;
const y1ˈ = (-sinφ * (x1 - x2) + cosφ * (y1 - y2)) / 2;

const p1 = document.getElementById('p1');
const e0 = document.getElementById('e0');
const e1 = document.getElementById('e1');
const prx = document.getElementById('prx');
const pry = document.getElementById('pry');
const p2 = document.getElementById('p2');
const p1ˈ = document.getElementById('p1ˈ');
const p2ˈ = document.getElementById('p2ˈ');
const cenˈ = document.getElementById('cenˈ');
const p1ˈn = document.getElementById('p1ˈn');
const cen = document.getElementById('cen');
const vA = document.getElementById('vA');
const vB = document.getElementById('vB');
const pl = document.getElementById('pl');

p1.cx.baseVal.value = x1;
p1.cy.baseVal.value = y1;
p2.cx.baseVal.value = x2;
p2.cy.baseVal.value = y2;
p1ˈ.cx.baseVal.value = x1ˈ;
p1ˈ.cy.baseVal.value = y1ˈ;

const rxSq = rx ** 2;
const rySq = ry ** 2;
const y1ˈSq = y1ˈ ** 2;
const x1ˈSq = x1ˈ ** 2;

// (eq. 6.2)
// Make sure the radius fit with the arc and correct if neccessary

const Λ = x1ˈ ** 2 / rxSq + y1ˈ ** 2 / rySq;
// if (ratio !== Λ) throw Error(`${Λ}, ${ratio}`);
// (eq. 6.3)
if (Λ > 1) {
    rx = sqrt(Λ) * rx;
    ry = sqrt(Λ) * ry;

    console.log(' rx', rx);
    console.log(' ry', ry);
}
const s1 = rxSq * y1ˈSq;
const s2 = rySq * x1ˈSq;
const v1 = (rxSq * rySq - s1 - s2) / (s1 + s2);
const m1 = v1 <= 0 ? 0 : sqrt(v1) * (!!arc === !!sweep ? -1 : 1);
const cxˈ = (rx * y1ˈ * m1) / ry;
const cyˈ = (-ry * x1ˈ * m1) / rx;

const cx = cosφ * cxˈ - sinφ * cyˈ + (x1 + x2) / 2;
const cy = sinφ * cxˈ + cosφ * cyˈ + (y1 + y2) / 2;

p1ˈn.cx.baseVal.value = -x1ˈ;
p1ˈn.cy.baseVal.value = -y1ˈ;
cenˈ.cx.baseVal.value = cxˈ;
cenˈ.cy.baseVal.value = cyˈ;
cen.cx.baseVal.value = cx;
cen.cy.baseVal.value = cy;

e0.cx.baseVal.value = cxˈ;
e0.cy.baseVal.value = cyˈ;
e0.rx.baseVal.value = rx;
e0.ry.baseVal.value = ry;
e1.rx.baseVal.value = rx;
e1.ry.baseVal.value = ry;
e1.setAttribute('transform', `translate(${cx}, ${cy}) rotate(${φ})`);

const v1x = (x1ˈ - cxˈ) / rx;
const v1y = (y1ˈ - cyˈ) / ry;
const v2x = (-x1ˈ - cxˈ) / rx;
const v2y = (-y1ˈ - cyˈ) / ry;
vA.setAttribute('d', `M0,0L${v1x},${v1y}`);
vB.setAttribute('d', `M0,0L${v2x},${v2y}`);

// prx.cx.baseVal.value = cosφ * (cxˈ + rx) - sinφ * cyˈ + (x1 + x2) / 2;
// prx.cy.baseVal.value = sinφ * cxˈ + cosφ * cyˈ + (y1 + y2) / 2;
// pry.cx.baseVal.value = cosφ * 0 - sinφ * 0 + (x1 + x2) / 2;
// pry.cy.baseVal.value = sinφ * 0 + cosφ * 0 + (y1 + y2) / 2;

pl.setAttribute(
    'points',
    [
        [0, 0],
        [rx, 0],
        [0, ry],
        [-rx, 0],
        [0, -ry],
        [0, -ry],
        [rx, -ry],
        [rx, ry],
        [-rx, ry],
        [-rx, -ry],
        [0, -ry],
        [0, 0, true],
    ]
        .map(([x, y, t]) => {
            if (t) {
                return [cosφ * +x - sinφ * +y + (x1 + x2) / 2, sinφ * +x + cosφ * +y + (y1 + y2) / 2];
            }

            return [cosφ * (cxˈ + x) - sinφ * (cyˈ + y) + (x1 + x2) / 2, sinφ * (cxˈ + x) + cosφ * (cyˈ + y) + (y1 + y2) / 2];
        })
        .map(([x, y]) => {
            return `${x},${y}`;
        })
        .join(' ')
);
