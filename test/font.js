import {loadFont} from 'svggeom';
globalThis.window = 444;

//  const fonts = new FontCache()
// // let font = await loadFont("/media/biojet1/OS/var/tmp/OpenSans/OpenSans-Regular.ttf");
let font = await loadFont('');
// console.log(font);
const path = font.getPath('Hello,\nWorld!', 0, 0, 384);

console.log(path.toPathData());
//  console.log(fonts.cacheDir);
//  // await downloadURL('https://raw.githubusercontent.com/google/fonts/main/ufl/ubuntu/Ubuntu-Regular.ttf', '/tmp/font.ttf');
//  // fonts.loadURL('https://raw.githubusercontent.com/google/fonts/main/ufl/ubuntu/Ubuntu-Regular.ttf')

//    let font2 = await fonts.loadURL('https://raw.githubusercontent.com/google/fonts/main/ufl/ubuntu/Ubuntu-Regular.ttf')
//    let font3 = await fonts.loadURL('https://raw.githubusercontent.com/google/fonts/main/apache/opensans/OpenSans%5Bwdth%2Cwght%5D.ttf')
