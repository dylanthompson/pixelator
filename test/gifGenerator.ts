import { Pixelator } from 'pixelator';
import { PixelatorColor } from 'pixelator/src/pixelatorColor';
import { ThemeProvider, IThemeConfiguration } from 'pixelator/src/configuration';

export class GifGenerator {

    constructor(private themes: {[key:string] : string[]},
        private sizes = [512],
        private animationLengths = [32],
        private gradationField = [5],
        private gradationLines = [1, 3, 5],
        private backgroundSpeeds = [0],
        private gradationTypes = ['field']) {
    }

    private getGifConfig(theme: string | IThemeConfiguration, size: number, gradationMagnitude: number, gradation: string, animationLength: number, speed: number, numColors: number): any {

        let themeName = typeof theme === 'string' ? theme : theme.name;

        var nameToUse = animationLength > 1 ?
            `${themeName}-${size}x${size}-g(${gradationMagnitude})-length${animationLength}-bgspeed${speed}` :
            `${themeName}-${size}x${size}-g(${gradationMagnitude})`;

        var horizonLine = Math.ceil(size * 2 / 3);

        return {
            "name": nameToUse,
            "height": size,
            "width": size,
            "frames": animationLength,
            "delay": 60,
            "background": {
                "sky": {
                    "name": "purple sky",
                    "height": horizonLine,
                    "speed": speed,
                    "theme": theme,
                    "gradation": {
                        "numColors": 0,
                        "type": "field",
                        "magnitude": gradationMagnitude,
                        "stagger": 32
                    },
                    "sun": {
                        "x": Math.ceil(size * 2/3),
                        "y": horizonLine,
                        "radius": Math.ceil(size * 0.11),
                        "color": "#FCECFC"
                    },
                    "stars": {
                        "frequency": 0.001,
                        "smallOdds": 8,
                        "mediumOdds": 1,
                        "largeOdds": 1,
                        "planetOdds": 0,
                        "twinkleMagnitude": 128,
                        "color": "#aaaaaa"
                    }
                }
            },
            "mountains": [
                {
                    "color": "#0A0A0A",
                    "v1": {
                        "x": Math.ceil(size * 0.15) - Math.ceil(size * 0.3),
                        "y": horizonLine
                    },
                    "v2": {
                        "x": Math.ceil(size * 0.15),
                        "y": horizonLine - Math.ceil(horizonLine / 3)
                    },
                    "v3": {
                        "x": Math.ceil(size * 0.15) * 3,
                        "y": horizonLine
                    }
                },
                {
                    "color": "#0A0A0A",
                    "v1": {
                        "x": size - Math.ceil(size * 0.2),
                        "y": horizonLine
                    },
                    "v2": {
                        "x": size,
                        "y": horizonLine - Math.ceil(horizonLine / 6)
                    },
                    "v3": {
                        "x": size,
                        "y": horizonLine
                    }
                },
                {
                    "color": "#0A0A0A",
                    "v1": {
                        "x": Math.ceil(size * 0.23),
                        "y": horizonLine
                    },
                    "v2": {
                        "x": Math.ceil(size * 0.23) * 2,
                        "y": horizonLine - Math.ceil(horizonLine / 4)
                    },
                    "v3": {
                        "x": Math.ceil(size * 0.23) * 3,
                        "y": horizonLine
                    }
                }
            ],
            "effects": {
                "reflection": {
                    "top": horizonLine - 2,
                    "rippleDepth": 3,
                    "rippleMagnitude": 3,
                    "rippleSpeed": 1,
                    "rippleDelay": 8,
                    "opacity": 0.9
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

var themes: {[key: string]: string[] } = {};

var colors = [
    { name: "red", value: "#b71c1c" },
    { name: "pink", value: "#880e4f" },
    { name: "purple", value: "#4a148c" },
    { name: "purple-deep", value: "#311b92" },
    { name: "indigo", value: "#1a237e" },
    { name: "blue", value: "#0d47a1" },
    { name: "blue-light", value: "#01579b" },
    { name: "cyan", value: "#006064" },
    { name: "teal", value: "#004d40" },
    { name: "green", value: "#1b5e20" },
    { name: "green-light", value: "#33691e" },
    { name: "lime", value: "#827717" },
    { name: "yellow", value: "#f57f17" },
    { name: "amber", value: "#ff6f00" },
    { name: "orange", value: "#e65100" },
    { name: "orange-deep", value: "#bf360c" },
    { name: "brown", value: "#3e2723" },

    { name: "dark-red", value: "#6f0000" },
    { name: "dark-pink", value: "#460017" },
    { name: "dark-purple", value: "#1F004e" },
    { name: "dark-purple-deep", value: "#200553" },
    { name: "dark-indigo", value: "#000041" },
    { name: "dark-blue", value: "#001161" },
    { name: "dark-blue-light", value: "#001f5c" },
    { name: "dark-cyan", value: "#00262a" },
    { name: "dark-teal", value: "#00150a" },
    { name: "dark-green", value: "#002300" },
    { name: "dark-green-light", value: "#002d00" },
    { name: "dark-lime", value: "#423c00" },
    { name: "dark-yellow", value: "#ac4100" },
    { name: "dark-amber", value: "#b42e00" },
    { name: "dark-orange", value: "#9c0900" },
    { name: "dark-orange-deep", value: "#770000" },
    { name: "dark-brown", value: "#0b0000" }
]

let customThemes = [{
    name: "custom-colors-purple",
    topColor: colors.filter(x => x.name == 'purple')[0].value,
    horizonColor: colors.filter(x => x.name == 'dark-orange')[0].value,
    numColors: 12,
    interpolation: "linear"
}, 
{
    name: "custom-colors-indigo",
    topColor: colors.filter(x => x.name == 'indigo')[0].value,
    horizonColor: colors.filter(x => x.name == 'dark-lime')[0].value,
    numColors: 12,
    interpolation: "linear"
}, 
{
    name: "custom-colors-cyan",
    topColor: colors.filter(x => x.name == 'cyan')[0].value,
    horizonColor: colors.filter(x => x.name == 'dark-pink')[0].value,
    numColors: 12,
    interpolation: "linear"
}, 
]

let easings = ["linear", "easeInCubic"];

let getThemeConfig = (name: string, horizonColor: string, topColor: string, easing: string) => {
    return {
        name: name + "-" + easing,
        keyColors: [topColor, horizonColor],
        numColors: 12,
        interpolation: easing,
    }
}

for (let theme of customThemes) {
    for (let easing of easings) {

        let config = getThemeConfig(theme.name, theme.horizonColor as any, theme.topColor as any, easing);
        themes[config.name] = ThemeProvider.getTheme(config);
    }
}

var p = new Pixelator(themes);
var generator = new GifGenerator(themes);
generator.generateGifs(p);

