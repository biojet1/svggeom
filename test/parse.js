import {Path} from 'svggeom';

// const d = "m -51.111089,737.77763 a 400,400 0 0 1 799.999999,0 400,400 0 0 1 799.99999,0 q 0,599.99997 -799.99999,1199.99997 -799.999999,-600 -799.999999,-1199.99997 z";
const d =
    'm 755.16947,151.67245 h 16.66665 V 66.487356 h -9.25925 c -53.70365,0 -109.25915,-24.07405 -124.07395,-55.555499 -3.7037,-5.5555502 -5.55555,-9.2592502 -5.55555,-16.6666501 0,-12.9629499 9.25925,-38.8888499 37.037,-120.3702469 l 37.037,-109.25915 h 431.48103 l 44.4444,131.48135 c 24.0741,72.222147 44.4444,133.333196 44.4444,137.036896 0,25.9259 -70.3703,33.3333 -129.6295,33.3333 h -24.074 v 85.185094 h 18.5185 c 27.7777,-5.55555 214.8146,-5.55555 266.6664,-5.55555 49.9999,0 207.4072,0 235.1849,5.55555 h 16.6667 V 66.487356 h -55.5555 c -83.3333,-1.85185 -99.9999,-5.55555 -116.6666,-20.37035 -5.5555,-5.55555 -9.2592,-11.1111 -12.9629,-18.5185 L 1223.6875,-570.54904 c -107.4073,-322.22189 -198.1479,-588.88826 -199.9998,-590.74016 -7.4074,-11.1111 -11.1111,-11.1111 -44.44439,-12.9629 h -16.66665 c -20.37035,0 -29.6296,1.8518 -35.18515,14.8148 -5.55555,5.5555 -381.48109,1135.184007 -387.03664,1148.146957 -24.07405,46.296249 -81.4814,74.073999 -170.3702,77.777699 h -27.77775 v 85.185094 h 12.96295 c 22.2222,-5.55555 146.29615,-5.55555 187.03685,-5.55555 42.59255,0 190.74055,1.85185 212.96275,5.55555 z M 1110.7247,-320.54929 H 921.83596 c -105.55544,0 -187.03684,0 -187.03684,-1.85185 l 187.03684,-557.40684 z';

const p = Path.parse(d); //.cutAt(0.06666666666666667);
const q = Path.parseDesc(d); //.cutAt(0.06666666666666667);

console.log(d);
console.log(p.length(), q.length());
// console.dir(p, {depth:10})
// console.dir(q, {depth:10})
console.log(p.describe() == q.describe());
console.log(p.descArray(), q.descArray());