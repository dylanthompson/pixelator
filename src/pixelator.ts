
var GifEncoder = require('gif-encoder');
import * as fs from 'fs';
import { PixelatorFrame, IStarsConfiguration, IStar, StarSize } from './pixelatorFrame';
import { Gradation } from './gradations/gradation';
import { GradationFactory } from './gradations/gradationFactory';
import { IPixelatorConfig, IPixelatorBackgroundConfiguration, IThemeConfiguration, ThemeProvider } from './configuration';
import { Reflection, IReflectionConfiguration } from './reflection'
import { PixelatorColor } from './pixelatorColor';

export interface IPixelatorBackground {
    name: string;
    height: number;
    speed: number;
    theme: string[];
    gradation: Gradation;
}

export class StarsCollection {
    private _stars: IStar[] = [];
    constructor(private config: IStarsConfiguration, width: number, sky: IPixelatorBackground) {
        this.generateStars(config, width, sky);
    }

    public get stars(): IStar[] {
        return this._stars;
    }

    private getStarType(config: IStarsConfiguration) {
        let odds = [config.smallOdds, config.mediumOdds, config.largeOdds, config.planetOdds];
        let results = ['small', 'medium', 'large', 'planet'];
        let totalOdds = odds.reduce((acum, val) => acum + val);
        let random = Math.floor(Math.random() * totalOdds);

        for (var i = 0; i < odds.length; i++) {
            var boundary = odds.filter((n, j) => j <= i).reduce((acum, val) => acum + val);
            if (random < boundary) {
                return results[i];
            }
        }
        return "small";
    }

    private generateStars(config: IStarsConfiguration, width: number, sky: IPixelatorBackground) {
        var numStars = config.frequency * width * sky.height;

        for (let i = 0; i < numStars; i++) {

            let size = StarSize.small; // this.getStarType(config);
            let star: IStar = { 
                x: Math.floor(Math.random() * width),
                y: Math.floor(Math.random() * sky.height),
                size: size,
                color: PixelatorColor.fromHex(config.color),
                twinkleMagnitude: config.twinkleMagnitude, // 0 means no change, otherwise its a number that indicates how dark or bright to animate the twinkle (say -32, 32 for darker, lighter)
                twinkleFrequency: Math.floor(Math.random() * 10) + 6, // the chance that on this frame twinkling will trigger
                twinkleLength: Math.floor(Math.random() * 2) + 3, // number of frames to show the twinkle,
                isTwinkling: false,
                animationFrame: 0
            }
            this._stars.push(star);
        }
    }
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

    private getTheme(theme: string | IThemeConfiguration): string[] {
        if (typeof theme == 'string') {
            return this.themes[theme];
        } else {
            return ThemeProvider.getTheme(theme);
        }
        
    }

    private getBackground(c: IPixelatorBackgroundConfiguration): IPixelatorBackground {
        return {
            name: c.name,
            height: c.height,
            speed: c.speed,
            theme: this.getTheme(c.theme),
            gradation: GradationFactory.getGradation(c.gradation)
        }
    }



    public createGif(config: IPixelatorConfig) {

        let effects:IPixelatorEffect[] = [];
        if (config.effects) {
            if (config.effects.reflection) {
                effects.push(PixelatorEffectFactory.getPixelatorEffect('reflection', config.effects.reflection) as Reflection);
            }
        }

        let starsCollection = null;
        let skyConfig = config.background.sky;
        let sky: IPixelatorBackground | null = null;

        if (skyConfig) {
            sky = this.getBackground(skyConfig);
        }
        if (sky && skyConfig.stars) {
            starsCollection = new StarsCollection(skyConfig.stars, config.width, sky);
        }

        let frames:ImageData[] = [];
        for (let t = 0; t < config.frames; t++) {
            let p = new PixelatorFrame(config.width, config.height);
            if (sky) {   
                p.drawSky(t, sky);
                if (starsCollection) {
                    p.drawStars(starsCollection.stars);
                }
                if (config.background.sky.sun) {
                    p.drawCircleFilled(config.background.sky.sun);
                }
            }

            if (config.mountains) {
                for (let mountain of config.mountains) {
                    p.drawMountain(mountain);
                }
            }
            

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