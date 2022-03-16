import fs from 'fs';
import path from 'path';
import os from 'os';
import fsp from 'fs/promises';
import {createHash} from 'crypto';
import {load, Font, loadSync, parse} from 'opentype.js';

export interface IFontCache {
	[key: string]: Font;
}

export interface IFontMap {
	[key: string]: string;
}

export class FontCache {
	private _cacheDir?: string;
	private _cacheFonts?: IFontCache;
	private _fontMap?: IFontMap;
	private static instance: FontCache;
	private constructor() {}

	public static getInstance(): FontCache {
		const {instance} = FontCache;
		return instance || (FontCache.instance = new FontCache());
	}
	get_cache_dir(): string {
		let dir = process.env._FONT_CACEH_DIR;
		if (dir && fs.existsSync(dir)) {
			return dir;
		}
		return path.join(os.homedir(), '.local', 'cache.fonts');
	}
	get cacheDir(): string {
		const {_cacheDir} = this;
		return _cacheDir || (this._cacheDir = this.get_cache_dir());
	}
	get cacheFonts(): IFontCache {
		const {_cacheFonts} = this;
		return _cacheFonts || (this._cacheFonts = {});
	}
	get fontMap(): IFontMap {
		const {_fontMap} = this;
		return (
			_fontMap ||
			(this._fontMap = {
				'roboto-regular':
					'https://raw.githubusercontent.com/google/fonts/blob/main/apache/roboto/static/Roboto-Regular.ttf',
				'ubuntu-regular': 'https://raw.githubusercontent.com/google/fonts/main/ufl/ubuntu/Ubuntu-Regular.ttf',
			})
		);
	}

	async loadFontURL(url: string): Promise<Font> {
		const {cacheFonts} = this;
		// get loaded
		let font = cacheFonts[url];
		if (font) {
			console.log(`Cache: Hit ${url}`);

			return font;
		}
		////////
		const hash = createHash('sha1');
		hash.update(url);
		const key = hash.digest('hex');
		// console.log(key);
		const {cacheDir} = this;
		const dir = path.join(cacheDir, key.substring(0, 2));
		const file = path.join(dir, key.substring(2));
		return (cacheFonts[url] = await fsp
			.stat(file)
			.catch(err => {
				// not found
				console.log(`Cache: File DL ${url}`);
				return fsp
					.stat(dir)
					.catch(err => fsp.mkdir(dir, {recursive: true})) // mkdir if not found
					.then(ret => downloadURL(url, file + '.tmp')) // dl to tmp file
					.then(tmp => fsp.rename(tmp, file)); // rename to dest file
			})
			.then(ret => {
				if (ret) {
					// from stat
					console.log(`Cache: File Hit ${url} <-- ${file}`);
				} else {
					//from rename
				}
				// return load(file, null, {isUrl: false});
				return fsp
					.open(file, 'r')
					.then(fh => fh.readFile().finally(() => fh.close()))
					.then(buf => parse(buf.buffer));
			}));
	}

	async getFont(name: string): Promise<Font> {
		const {cacheFonts} = this;
		const key = name ? name.toLowerCase() : 'ubuntu-regular';
		let font = cacheFonts[key];
		if (!font) {
			const url = this.fontMap[key];
			// if (!(font = cacheFonts[url])) {
			// 	_cacheFonts[url] = cacheFonts[key] = font = await this.loadFontURL(url);
			// }
			cacheFonts[key] = font = await this.loadFontURL(url);
		}
		return font;
	}
}

// export async function loadFont(which: string): Promise<Font> {
// 	return await FontCache.getInstance().getFont(which);
// }

// download.js
import https from 'https';
import http from 'http';
import {URL} from 'url';

const TIMEOUT = 10000;

export function downloadURL(url: string, dest: string): Promise<string> {
	const uri = new URL(url);
	const pkg = url.toLowerCase().startsWith('https:') ? https : http;

	return new Promise((resolve, reject) => {
		const request = pkg.get(uri.href).on('response', res => {
			if (res.statusCode === 200) {
				const file = fs.createWriteStream(dest, {flags: 'wx'});
				res.on('end', () => {
					file.end();
					// console.log(`${uri.pathname} downloaded to: ${path}`)
					resolve(dest);
				})
					.on('error', err => {
						file.destroy();
						fs.unlink(dest, () => reject(err));
					})
					.pipe(file);
			} else if (res.statusCode === 302 || res.statusCode === 301) {
				// Recursively follow redirects, only a 200 will resolve.
				downloadURL(res.headers.location || '', dest).then(dest => resolve(dest));
			} else {
				reject(new Error(`Download request failed, response status: ${res.statusCode} ${res.statusMessage}`));
			}
		});
		request.setTimeout(TIMEOUT, function () {
			request.abort();
			reject(new Error(`Request timeout after ${TIMEOUT / 1000.0}s`));
		});
	});
}
