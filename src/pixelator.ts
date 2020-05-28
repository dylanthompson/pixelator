
var GifEncoder = require('gif-encoder');
import * as fs from 'fs';
import { PixelatorFrame } from './pixelatorFrame';
import { GradationFactory, GradationType, Gradation } from './gradations/gradation';
import { IPixelatorConfig, IPixelatorBackgroundConfiguration } from './configuration';

export interface IPixelatorBackground {
    name: string;
    height: number;
    speed: number;
    theme: string[];
    gradation: Gradation;
} 

export class Pixelator {

    constructor(private themes: { [key: string]: string[] }) { }

    private setThemes(themes: { [key: string]: string[] }) {
        this.themes = themes;
    }

    private getTheme(themeName: string) {
        return this.themes[themeName];
    }

    private getBackground(c: IPixelatorBackgroundConfiguration) {
        return {
            name: c.name,
            height: c.height,
            speed: c.speed,
            theme: this.getTheme(c.theme),
            gradation: GradationFactory.getGradation(c.gradation)
        }
    }

    public createGif(config: IPixelatorConfig) {
        let frames:ImageData[] = [];
        for (let t = 0; t < config.frames; t++) {
            let p = new PixelatorFrame(config.width, config.height);
            let skyConfig = config.background['sky'];
            if (config.background && skyConfig) {
                var sky: IPixelatorBackground = this.getBackground(skyConfig);
                p.drawSky(t, sky);
            }
            frames.push(p.getImageData());
        }

        this.print(config, frames);
    }

    print(config: IPixelatorConfig, frames: ImageData[]) {
        var gif = new GifEncoder(config.width, config.height, {
            highWaterMark: 32 * 1024 * 1024 // 32MB
          });

        gif.setRepeat(0);
        var file = fs.createWriteStream('./gifs/' + config.name + '.gif');

        gif.pipe(file);
        
        // Write out the image into memory  
        gif.writeHeader();
        for (let frame of frames) {
            gif.addFrame(frame.data);
        }
        // gif.addFrame(pixels); // Write subsequent rgba arrays for more frames
        gif.finish();
    }
}