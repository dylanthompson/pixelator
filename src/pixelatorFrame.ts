import * as Canvas from 'canvas';
import { PixelatorColor } from './pixelatorColor';
import { IPixelatorBackground } from './pixelator';

export interface ISunConfiguration {
    x: number;
    y: number;
    radius: number;
    color: string;
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


    public getPixel(x: number, y: number): PixelatorColor {
        var red: number = y * (this.width * 4) + x * 4;
        return new PixelatorColor(this.imageData.data[red],
            this.imageData.data[red + 1],
            this.imageData.data[red + 2],
            this.imageData.data[red + 3]);
    }

    public setPixel(x: number, y: number, pixel: PixelatorColor): void {
        var red = y * (this.width * 4) + x * 4;
        this.imageData.data[red] = pixel.red;
        this.imageData.data[red + 1] = pixel.green;
        this.imageData.data[red + 2] = pixel.blue;
        this.imageData.data[red + 3] = pixel.alpha;
    }

    fillRow(y: number, p: PixelatorColor) {
        for (var x = 0; x < this.width; x++) {
            this.setPixel(x, y, p);
        }
    }

    drawCircle(sunConfig: ISunConfiguration) {
        const PI = 3.1415926535;
        let i, angle, x1, y1;
        for (i = 0; i < 360; i += 0.1) {
            angle = i;
            x1 = sunConfig.radius * Math.cos(angle * PI / 180);
            y1 = sunConfig.radius * Math.sin(angle * PI / 180);
            this.setPixel(Math.round(sunConfig.x + x1), Math.round(sunConfig.y + y1), PixelatorColor.fromHex(sunConfig.color));
        }
    }

    drawCircleFilled(sunConfig: ISunConfiguration) {
        for (let x = -sunConfig.radius; x < sunConfig.radius ; x++)
        {
            let height = Math.sqrt(sunConfig.radius * sunConfig.radius - x * x);
            for (let y = -height; y < height; y++) {
                this.setPixel(x + sunConfig.x, Math.round(y + sunConfig.y), PixelatorColor.fromHex(sunConfig.color));
            }
        }
    }

    drawSky(t: number, sky: IPixelatorBackground) {

        let colors = Array.from(sky.theme, (v, k) => { return PixelatorColor.fromHex(v); });
        if (sky.height > this.height) {
            throw new Error("height must be less than max height");
        }
        let y = 0;
        let numberOfGradientSegments = (sky.theme.length * 2) - 2;
        let totalHeightForGradientSections = sky.gradation.getHeightofGradationSection(numberOfGradientSegments)
        let heightForColorBars = Math.floor((sky.height - totalHeightForGradientSections) / colors.length);

        if (sky.gradation.numColors == 2) {
            colors = [colors[0], colors[colors.length - 1]];
        }

        for (var i = 0; i < colors.length; i++) {
            let color = colors[i];
            let barMax = y + heightForColorBars;
            for (; y < barMax; y++) {
                this.fillRow(y, color);
            }
            if (i < colors.length - 1) {
                let colorsToUse;
                if (sky.gradation.numColors == 4) {
                    colorsToUse = colors
                } else {
                    colorsToUse = [colors[i], colors[i + 1]]
                }
                y = sky.gradation.drawGradation(t, y, sky.speed, colorsToUse, this);
            }
        }
    }
}
