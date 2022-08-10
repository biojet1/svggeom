import fs from 'fs';
import path from 'path';
import os from 'os';
import fsp from 'fs/promises';
import { createHash } from 'crypto';
export class FontCache {
    _cacheDir;
    _cacheFonts;
    _fontMap;
    static instance;
    constructor() { }
    static getInstance() {
        const { instance } = FontCache;
        return instance || (FontCache.instance = new FontCache());
    }
    findCacheDir() {
        let dir = process.env._FONT_CACEH_DIR;
        if (dir && fs.existsSync(dir)) {
            return dir;
        }
        return path.join(os.homedir(), '.local', 'cache.fonts');
    }
    get cacheDir() {
        const { _cacheDir } = this;
        return _cacheDir || (this._cacheDir = this.findCacheDir());
    }
    get cacheFonts() {
        const { _cacheFonts } = this;
        return _cacheFonts || (this._cacheFonts = {});
    }
    get fontMap() {
        const { _fontMap } = this;
        return (_fontMap ||
            (this._fontMap = {
                'roboto-regular': 'https://raw.githubusercontent.com/google/fonts/blob/main/apache/roboto/Roboto%5Bwdth%2Cwght%5D.ttf',
                'ubuntu-regular': 'https://raw.githubusercontent.com/google/fonts/main/ufl/ubuntu/Ubuntu-Regular.ttf',
                'latin-modern-math': 'https://mirrors.rit.edu/CTAN/fonts/lm-math/opentype/latinmodern-math.otf',
            }));
    }
    async loadFontURL(url) {
        const { cacheFonts } = this;
        let font = cacheFonts[url];
        if (font) {
            console.warn(`Cache: Hit ${url}`);
            return font;
        }
        else if (!url) {
            throw new Error(`Invalid URL '${url}'`);
        }
        const hash = createHash('sha1');
        hash.update(url);
        const key = hash.digest('hex');
        const { cacheDir } = this;
        const dir = path.join(cacheDir, key.substring(0, 2));
        const file = path.join(dir, key.substring(2));
        return (cacheFonts[url] = await fsp
            .stat(file)
            .catch((err) => {
            console.warn(`Cache: File DL ${url} --> ${file}`);
            return fsp
                .stat(dir)
                .catch((err) => fsp.mkdir(dir, { recursive: true }))
                .then((ret) => downloadURL(url, file + '.tmp'))
                .then((tmp) => fsp.rename(tmp, file));
        })
            .then((ret) => {
            if (ret) {
                console.warn(`Cache: File Hit ${url} <-- ${file}`);
            }
            else {
            }
            return fsp
                .open(file, 'r')
                .then((fh) => fh.readFile().finally(() => fh.close()))
                .then((buf) => import('opentype.js').then((mod) => mod.parse(buf.buffer)));
        }));
    }
    async getFont(name) {
        const { cacheFonts } = this;
        const key = name ? name.toLowerCase() : 'ubuntu-regular';
        let font = cacheFonts[key];
        if (!font) {
            const url = this.fontMap[key];
            cacheFonts[key] = font = await this.loadFontURL(url);
        }
        return font;
    }
}
import https from 'https';
import http from 'http';
import { URL } from 'url';
const TIMEOUT = 10000;
export function downloadURL(url, dest) {
    const uri = new URL(decodeURI(url));
    const pkg = url.toLowerCase().startsWith('https:') ? https : http;
    return new Promise((resolve, reject) => {
        const request = pkg.get(uri.href).on('response', (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(dest, { flags: 'wx' });
                res
                    .on('end', () => {
                    file.end();
                    resolve(dest);
                })
                    .on('error', (err) => {
                    file.destroy();
                    fs.unlink(dest, () => reject(err));
                })
                    .pipe(file);
            }
            else if (res.statusCode === 302 || res.statusCode === 301) {
                downloadURL(res.headers.location || '', dest).then((dest) => resolve(dest));
            }
            else {
                reject(new Error(`Download request failed, response status: ${res.statusCode} ${res.statusMessage}`));
            }
        });
        request.setTimeout(TIMEOUT, function () {
            request.abort();
            reject(new Error(`Request timeout after ${TIMEOUT / 1000.0}s`));
        });
    });
}
//# sourceMappingURL=font.js.map