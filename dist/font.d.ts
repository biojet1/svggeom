import { Font } from 'opentype.js';
export interface IFontCache {
    [key: string]: Font;
}
export interface IFontMap {
    [key: string]: string;
}
export { Font };
export declare class FontCache {
    private _cacheDir?;
    private _cacheFonts?;
    private _fontMap?;
    private static instance;
    private constructor();
    static getInstance(): FontCache;
    get_cache_dir(): string;
    get cacheDir(): string;
    get cacheFonts(): IFontCache;
    get fontMap(): IFontMap;
    loadFontURL(url: string): Promise<Font>;
    getFont(name: string): Promise<Font>;
}
export declare function downloadURL(url: string, dest: string): Promise<string>;
