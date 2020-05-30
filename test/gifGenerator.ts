import { Pixelator } from 'pixelator';
import { PixelatorColor } from 'pixelator/src/pixelatorColor';

export class GifGenerator {

    constructor(private themes: {[key:string] : string[]},
        private sizes = [256],
        private animationLengths = [1, 128],
        private gradationField = [128],
        private gradationLines = [1, 2, 3, 4, 5, 6, 7],
        private backgroundSpeeds = [1, 4, 20],
        private gradationTypes = ['line', 'field']) {

    }

    private getGifConfig(themeName: string, size: number, gradationMagnitude: number, gradation: string, animationLength: number, speed: number, numColors: number): any {
        var nameToUse = animationLength > 1 ?
            `${themeName}-${size}x${size}-g(${gradationMagnitude})-length${animationLength}-bgspeed${speed}` :
            `${themeName}-${size}x${size}-g(${gradationMagnitude})`;
        return {
            "name": nameToUse,
            "height": size,
            "width": size,
            "frames": animationLength,
            "delay": 100,
            "background": {
                "sky": {
                    "name": themeName,
                    "height": size,
                    "speed": speed,
                    "theme": themeName,
                    "gradation": {
                        "numColors": numColors,
                        "type": gradation,
                        "magnitude": gradationMagnitude
                    }
                }
            }
        }
    }

    public generateGifs(p: Pixelator) {
        for (let key in this.themes) {
            if (this.themes[key].length <= 2) {
                continue;
            }
            for (let size of this.sizes) {
                for (let gradationType of this.gradationTypes) {
                    var gradationMagnitudes;
                    gradationMagnitudes = gradationType == 'line' ? this.gradationLines : this.gradationField.map(x => x > size / 2 ? size / 2 : x);
                    for (let gradationMagnitude of gradationMagnitudes) {
                        if (gradationType == 'field') {
                            for (let animationLength of this.animationLengths) {
                                for (let speed of this.backgroundSpeeds) {
                                    let numColors = gradationMagnitude >= Math.floor(size / 2) ? 2 : 0;
                                    p.createGif(this.getGifConfig(key, size, gradationMagnitude, gradationType, animationLength, speed, numColors));
                                }
                            }
                        } else {
                            p.createGif(this.getGifConfig(key, size, gradationMagnitude, gradationType, 1, 1, 0))
                        }
                    }
                }
            }
        }
    }
}