
var GifEncoder = require('gif-encoder');
import * as fs from 'fs';
import { PixelatorFrame } from './src/pixelatorFrame';
import { GradationFactory, GradationType, Gradation } from './src/gradations/gradation';
import { IPixelatorConfig, IPixelatorBackgroundConfiguration } from './src/configuration';

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

let config: IPixelatorConfig = {
    name: 'purple-blue-yellow-orange',
    height: 512,
    width: 512,
    frames: 32,
    background: {
        'sky' : {
            name: 'material-blues-purples',
            height: 512,
            speed: 1,
            theme: 'material-purple-blue-yellow-orange',
            gradation:  {
                numColors: 4,
                type: GradationType.Line,
                magnitude: 256
            }
        }
    }
}

let configA: IPixelatorConfig = {
    name: 'material-purple-blue-yellow-red',
    height: 512,
    width: 512,
    frames: 256,
    background: {
        'sky' : {
            name: 'material-blues-purples',
            height: 512,
            speed: 1,
            theme: 'toxic',
            gradation:  {
                numColors: 4,
                type: GradationType.Field,
                magnitude: 256
            }
        }
    }
}


let configP: IPixelatorConfig = {
    name: 'purple-sky-recreate',
    height: 256,
    width: 256,
    frames: 1,
    background: {
        'sky' : {
            name: 'purple sky',
            height: 168,
            speed: 1,
            theme: 'material-purple',
            gradation:  {
                numColors: 0,
                type: GradationType.Field,
                magnitude: 5
            }
        }
    }
}

let configP1: IPixelatorConfig = {
    name: 'purple-animated',
    height: 512,
    width: 512,
    frames: 64,
    background: {
        'sky' : {
            name: 'bpurple',
            height: 512,
            speed: 1,
            theme: 'material-purple',
            gradation:  {
                numColors: 0,
                type: GradationType.Field,
                magnitude: 12
            }
        }
    }
}

let config2: IPixelatorConfig = {
    name: 'yellow-lines',
    height: 2096,
    width: 512,
    frames: 120,
    background: {
        'sky' : {
            name: 'yellow-sky-fast',
            height: 2096,
            speed: 1,
            theme: 'material-yellow',
            gradation:  {
                numColors: 0,
                type: GradationType.Field,
                magnitude: 12
            }
        }
    }
}

let config2A: IPixelatorConfig = {
    name: 'yellow-dots',
    height: 512,
    width: 512,
    frames: 128,
    background: {
        'sky' : {
            name: 'yellow-field',
            height: 512,
            speed: 1,
            theme: 'two-yellow',
            gradation:  {
                numColors: 0,
                type: GradationType.Field,
                magnitude: 256
            }
        }
    }
}

let config3: IPixelatorConfig = {
    name: 'rainbow-lines',
    height: 1048,
    width: 1048,
    frames: 1,
    background: {
        'sky' : {
            name: 'rainbow-sky',
            height: 1048,
            speed: 1,
            theme: 'material-rainbow',
            gradation:  {
                numColors: 0,
                type: GradationType.Line,
                magnitude: 6
            }
        }
    }
}

let config3A: IPixelatorConfig = {
    name: 'teal-white-field',
    height: 256,
    width: 512,
    frames: 1000,
    background: {
        'sky' : {
            name: 'teal-white',
            height: 256,
            speed: 10,
            theme: 'two-teal',
            gradation:  {
                numColors: 0,
                type: GradationType.Field,
                magnitude: 128
            }
        }
    }
}