
var GifEncoder = require('gif-encoder');
import * as Canvas from 'canvas';
import * as fs from 'fs';

class Pixel {
    constructor(public red: number, public green: number, public blue: number, public alpha: number) { }

    private componentToHex(c: any) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    public toHex(): string {
        return "#" + this.componentToHex(this.red) + this.componentToHex(this.green) + this.componentToHex(this.green);
    }

    public static fromHex(hex: string): Pixel {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result)
            return new Pixel(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 255);
        else
            throw new Error("Invalid Hex");
    }
}

export class PixelatorFrame {

    imageData: ImageData

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    constructor(private _width: number, private _height: number) {
        const canvas = Canvas.createCanvas(_width, _height)
        const ctx = canvas.getContext('2d')
        this.imageData = ctx.createImageData(_width, _height);
    }

    public getImageData(): ImageData {
        return this.imageData;
    }
    

    public getPixel(x: number, y: number): Pixel {
        var red: number = y * (this.width * 4) + x * 4;
        return new Pixel(this.imageData.data[red],
            this.imageData.data[red + 1],
            this.imageData.data[red + 2],
            this.imageData.data[red + 3]);
    }

    public setPixel(x: number, y: number, pixel: Pixel): void {
        var red = y * (this.width * 4) + x * 4;
        this.imageData.data[red] = pixel.red;
        this.imageData.data[red + 1] = pixel.green;
        this.imageData.data[red + 2] = pixel.blue;
        this.imageData.data[red + 3] = pixel.alpha;
    }

    fillRow(y: number, p: Pixel) {
        for (var x = 0; x < this.width; x++) {
            this.setPixel(x, y, p);
        }
    }

    drawSky(sky: IPixelatorBackground) {
        let colors = Array.from(sky.colors, (v,k) => { return Pixel.fromHex(v);  });
        if (sky.height > this.height) {
            throw new Error("height must be less than max height");
        }
        let y = 0;
        let numberOfGradientSegments = (sky.colors.length * 2) - 2;
        let totalHeightForGradientSections = sky.gradation.style.getHeightofGradationSection(sky.gradation, numberOfGradientSegments)
        let heightForColorBars = Math.floor((sky.height - totalHeightForGradientSections) / colors.length);
        for (var i = 0; i < colors.length; i++) {
            let color = colors[i];
            let barMax = y + heightForColorBars;
            for (; y < barMax; y++) {
                this.fillRow(y, color);
            }
            if (i < colors.length - 1) {
                y = sky.gradation.style.drawGradation(y, color, colors[i + 1], sky.gradation, this);
            }
        }
    }
}

export class Pixelator {

    constructor() { }

    public createGif(config: IPixelatorConfig) {
        let frames:ImageData[] = [];
        for (let t = 0; t < config.frames; t++) {
            let p = new PixelatorFrame(config.width, config.height);

            if (config.background && config.background['sky']) {
                p.drawSky(config.background['sky']);
            }
            frames.push(p.getImageData());
        }

        this.print(config, frames);
    }

    print(config: IPixelatorConfig, frames: ImageData[]) {
        var gif = new GifEncoder(config.width, config.height);
        var file = fs.createWriteStream(config.name + '.gif');

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

function getNumberOfLines(num:number): number
{
    let result = 0;
    for (let i = num; i > 0; i--) {
        result += i;
    }
    return result;
}

interface IPixelatorBackground {
    name: string;
    height: number;
    speed: number;
    colors: string[];
    gradation: IGradation;
}

interface IPixelatorConfig {
    name: string;
    height: number;
    width: number;
    frames: number;
    background: { [key: string]: IPixelatorBackground };
}

interface IGradationStyle {
    getHeightofGradationSection(gradation: IGradation, numberOfGradientSegments: number): number;
    drawGradation(yIndex: number, color: Pixel, nextColor: Pixel, gradation: IGradation, pixelatorFrame: PixelatorFrame): number;
}

interface IGradation {
    magnitude: number;
    style: IGradationStyle;
}

let gradationStyles = {
    'lines': {
        getHeightofGradationSection: (gradation: IGradation, numOfGradationSegments: number): number => {
            return getNumberOfLines(gradation.magnitude + 1) * 2;
        },
        drawGradation: (yIndex: number, color: Pixel, nextColor: Pixel, gradation: IGradation, pixelatorFrame: PixelatorFrame): number => {

            let flipColor = (curColor: Pixel) => {
                if (curColor == nextColor) {
                    return color;
                } else {
                    return nextColor;
                }
            }
            // If bottom, only draw color bar
            // if top or in the middle, color bar then bottom gradient
            var nextColorToPrint = nextColor;
            for (var g = gradation.magnitude; g > 0; g--) {
                for (var l = 0; l < g; l++) {
                    pixelatorFrame.fillRow(yIndex, nextColorToPrint);
                    yIndex++;
                }
                nextColorToPrint = flipColor(nextColorToPrint);
            }

            for (var g2 = 0; g2 < gradation.magnitude; g2++) {
                for (var l = 0; l <= g2; l++) {
                    pixelatorFrame.fillRow(yIndex, nextColorToPrint);
                    yIndex++;
                }
                nextColorToPrint = flipColor(nextColorToPrint);
            }

            return yIndex;
        }
    },
    '3dField': {
        getHeightofGradationSection: (gradation: IGradation, numOfGradationSegments: number) => {
            return numOfGradationSegments * gradation.magnitude;
        },
        drawGradation: (yIndex: number, color: Pixel, nextColor: Pixel, gradation: IGradation, pixelatorFrame: PixelatorFrame): number => {

            let fillGradientRow = (yIndex: number, gradation: IGradation, pixelatorFrame: PixelatorFrame, primaryColor: Pixel, secondaryColor: Pixel, frequency: number) => {
                let loopIndex: number | null = 0;
                for (var x = 0; x < pixelatorFrame.width; x++) {
                    let colorToUse;
                    if (secondaryColor && loopIndex != null && loopIndex >= frequency - 1) {
                        colorToUse = secondaryColor;
                        loopIndex = null;
                    } else if (loopIndex == null) {
                        colorToUse = primaryColor;
                        loopIndex = 0;
                    } else {
                        colorToUse = primaryColor;
                        loopIndex++;
                    }
                    
                    pixelatorFrame.setPixel(x, yIndex, colorToUse);
                }
            }
            // If bottom, only draw color bar
            // if top or in the middle, color bar then bottom gradient
            for (var g = gradation.magnitude; g > 0; g--) {
                fillGradientRow(yIndex, gradation, pixelatorFrame, color, nextColor, g);
                yIndex++;
            }

            for (var g2 = 0; g2 < gradation.magnitude; g2++) {
                fillGradientRow(yIndex, gradation, pixelatorFrame, nextColor, color, g2);
                yIndex++;
            }

            return yIndex;
        }
    }
};

var themes = {
    'material-purple':  [
        '#4a148c',
        '#6a1b9a',
        '#7b1fa2',
        '#8e24aa',
        '#9c27b0',
        '#ab47bc',
        '#ba68c8',
        '#ce93d8',
        '#e1bee7',
        '#f3e5f5'
    ],
    'material-yellow': [
        '#f57f17',
        '#f9a825',
        '#fbc02d',
        '#fdd835',
        '#ffeb3b',
        '#ffee58',
        '#fff176',
        '#fff59d',
        '#fff9c4',
        '#fffde7'
    ],
    'material-rainbow': [
        '#ffcdd2',
        '#f8bbd0',
        '#e1bee7',
        '#d1c4e9',
        '#c5cae9',
        '#bbdefb',
        '#b3e5fc',
        '#b2ebf2',
        '#b2dfdb',
        '#c8e6c9',
        '#dcedc8',
        '#f0f4c3',
        '#fff9c4',
        '#ffecb3',
        '#ffe0b2',
        '#ffccbc',
        '#d7ccc8'
    ]
};


let config: IPixelatorConfig = {
    name: 'purple-lines',
    height: 256,
    width: 256,
    frames: 16,
    background: {
        'sky' : {
            name: 'purple-sky',
            height: 168,
            speed: 1,
            colors: themes['material-purple'],
            gradation:  {
                style: gradationStyles.lines,
                magnitude: 3
            }
        }
    }
}

let configA: IPixelatorConfig = {
    name: 'purple-dots',
    height: 256,
    width: 256,
    frames: 16,
    background: {
        'sky' : {
            name: 'purple-sky',
            height: 168,
            speed: 1,
            colors: themes['material-purple'],
            gradation:  {
                style: gradationStyles['3dField'],
                magnitude: 5
            }
        }
    }
}

let config2: IPixelatorConfig = {
    name: 'yellow-lines',
    height: 1048,
    width: 512,
    frames: 1,
    background: {
        'sky' : {
            name: 'yellow-sky',
            height: 1048,
            speed: 1,
            colors: themes['material-yellow'],
            gradation:  {
                style: gradationStyles.lines,
                magnitude: 9
            }
        }
    }
}

let config2A: IPixelatorConfig = {
    name: 'yellow-dots',
    height: 1048,
    width: 512,
    frames: 1,
    background: {
        'sky' : {
            name: 'yellow-sky',
            height: 1048,
            speed: 1,
            colors: themes['material-yellow'],
            gradation:  {
                style: gradationStyles['3dField'],
                magnitude: 8
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
            colors: themes['material-rainbow'],
            gradation:  {
                style: gradationStyles["lines"],
                magnitude: 6
            }
        }
    }
}

let config3A: IPixelatorConfig = {
    name: 'rainbow-dots',
    height: 1048,
    width: 1048,
    frames: 1,
    background: {
        'sky' : {
            name: 'rainbow-sky',
            height: 1048,
            speed: 1,
            colors: themes['material-rainbow'],
            gradation:  {
                style: gradationStyles["3dField"],
                magnitude: 16
            }
        }
    }
}

var p = new Pixelator();

p.createGif(config);
// p.createGif(config2);
// p.createGif(config3);

// p.createGif(configA);
// p.createGif(config2A);
// p.createGif(config3A);