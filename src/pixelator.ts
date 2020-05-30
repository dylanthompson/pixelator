
var GifEncoder = require('gif-encoder');
import * as fs from 'fs';
import { PixelatorFrame } from './pixelatorFrame';
import { Gradation } from './gradations/gradation';
import { GradationFactory } from './gradations/gradationFactory';
import { IPixelatorConfig, IPixelatorBackgroundConfiguration } from './configuration';
import { Reflection, IReflectionConfiguration } from './reflection'
import { PixelatorColor } from './pixelatorColor';

export interface IPixelatorBackground {
    name: string;
    height: number;
    speed: number;
    theme: string[];
    gradation: Gradation;
}


export interface IPixelatorEffect {
    applyEffect(time: number, frame: PixelatorFrame): void;
}

export class PixelatorEffectFactory {
    public static getPixelatorEffect(name: string, config: any): IPixelatorEffect {
        switch (name) {
            case "reflection":
            default:
                let pixelatorEffectConfig = config as IReflectionConfiguration;
                return new Reflection(pixelatorEffectConfig.top,
                    pixelatorEffectConfig.rippleDepth,
                    pixelatorEffectConfig.rippleMagnitude,
                    pixelatorEffectConfig.rippleSpeed,
                    pixelatorEffectConfig.rippleDelay,
                    pixelatorEffectConfig.opacity);
        }
    }
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

        let effects = [];
        if (config.effects) {
            if (config.effects.reflection) {
                effects.push(PixelatorEffectFactory.getPixelatorEffect('reflection', config.effects.reflection) as Reflection);
            }
        }

        let frames:ImageData[] = [];
        for (let t = 0; t < config.frames; t++) {
            let p = new PixelatorFrame(config.width, config.height);
            let skyConfig = config.background['sky'];
            if (config.background && skyConfig) {
                var sky: IPixelatorBackground = this.getBackground(skyConfig);
                p.drawSky(t, sky);
                if (config.background.sky.sun) {
                    p.drawCircleFilled(config.background.sky.sun);
                }
            }
            var p1 = { x: 0, y: 180 };
            var p2 = { x: 80, y: 120 };
            var p3 = { x: 160, y: 180 };

            p.drawMountain([p1, p2, p3], PixelatorColor.fromHex("#010101"));

            for (let effect of effects) {
                effect.applyEffect(t, p);
            }

            frames.push(p.getImageData());
        }

        this.print(config, frames);
    }

    print(config: IPixelatorConfig, frames: ImageData[]) {
        var gif = new GifEncoder(config.width, config.height, {
            highWaterMark: 32 * 1024 * 1024 // 32MB
        });

        gif.setDelay(config.delay);
        
        var file = fs.createWriteStream('./gifs/' + config.name + '.gif');

        gif.on('data', (buffer: Buffer) => {
            file.write(buffer);
        });

        gif.on('end', () => {
            file.end();
        });

        gif.on('finish#stop', () => {
            file.end();
        });

        gif.setRepeat(0);
        gif.writeHeader();
        for (let frame of frames) {
            gif.addFrame(frame.data);
        }
        gif.finish();
    }
}