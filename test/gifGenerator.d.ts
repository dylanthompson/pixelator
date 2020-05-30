import { Pixelator } from 'pixelator';
export declare class GifGenerator {
    private themes;
    private sizes;
    private animationLengths;
    private gradationField;
    private gradationLines;
    private backgroundSpeeds;
    private gradationTypes;
    constructor(themes: {
        [key: string]: string[];
    }, sizes?: number[], animationLengths?: number[], gradationField?: number[], gradationLines?: number[], backgroundSpeeds?: number[], gradationTypes?: string[]);
    private getGifConfig;
    generateGifs(p: Pixelator): void;
}
