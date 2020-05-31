import * as Canvas from 'canvas';
import { PixelatorColor } from './pixelatorColor';
import { IPixelatorBackground } from './pixelator';

export interface ISunConfiguration {
    x: number;
    y: number;
    radius: number;
    color: string;
}

export enum StarSize {
    small = "small",
    medium = "medium",
    large = "large",
}

export interface IStar {
    x: number;
    y: number;
    size: StarSize;
    color: PixelatorColor;
    twinkleMagnitude: number; // 0 means no change, otherwise its a number that indicates how dark or bright to animate the twinkle (say -32, 32 for darker, lighter)
    twinkleFrequency: number; // the chance that on this frame twinkling will trigger
    twinkleLength: number; // number of frames to show the twinkle
    isTwinkling: boolean;
    animationFrame: number;
}

export interface IStarsConfiguration {
    // how many stars in sky
    frequency: number;
    // distribution of types of stars among the stars created
    smallOdds: number; // chance that the star generated is small = smallF / sum of all cases
    mediumOdds: number;
    largeOdds: number;
    planetOdds: number;

    color: string;
    twinkleMagnitude: number;
}

export interface IMountainConfiguration {
    color: string;
    v1: ICoord;
    v2: ICoord;
    v3: ICoord;
}

export interface ICoord {
    x: number;
    y: number;
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
        for (let x = -sunConfig.radius; x < sunConfig.radius; x++) {
            let height = Math.sqrt(sunConfig.radius * sunConfig.radius - x * x);
            for (let y = -height; y < height; y++) {
                this.setPixel(x + sunConfig.x, Math.round(y + sunConfig.y), PixelatorColor.fromHex(sunConfig.color));
            }
        }
    }

    drawLine(x0: number, y0: number, x1: number, y1: number, color: PixelatorColor) {
        x0 = Math.round(x0);
        y0 = Math.round(y0);
        x1 = Math.round(x1);
        y1 = Math.round(y1);
        var dx = Math.abs(x1 - x0);
        var dy = Math.abs(y1 - y0);
        var sx = x0 < x1 ? 1 : -1;
        var sy = y0 < y1 ? 1 : -1;
        var err = dx - dy;

        let itt = 0;
        while (true) {
            this.setPixel(x0, y0, color);
            itt++;
            if (x0 == x1 && y0 == y1) break;
            var e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    private fillTriangle(vertices: ICoord[], color: PixelatorColor) {
        vertices = vertices.sort((a, b) => a.y == b.y ? 0 : a.y < b.y ? -1 : 1);
        if (vertices[1].y == vertices[2].y) {
            this.fillBottomFlatTriangle(vertices[0], vertices[1], vertices[2], color);
        } else if (vertices[0].y == vertices[1].y) {
            this.fillTopFlatTriangle(vertices[0], vertices[1], vertices[2], color);
        } else {
            let v4 = {
                x: vertices[0].x + (vertices[1].y - vertices[0].y) / (vertices[2].y - vertices[0].y) * (vertices[2].x - vertices[0].x),
                y: vertices[1].y
            };
            this.fillBottomFlatTriangle(vertices[0], vertices[1], v4, color);
            this.fillTopFlatTriangle(vertices[1], v4, vertices[2], color);
        }
    }

    private fillBottomFlatTriangle(v1: ICoord, v2: ICoord, v3: ICoord, color: PixelatorColor) {
        let invslope1 = (v2.x - v1.x) / (v2.y - v1.y);
        let invslope2 = (v3.x - v1.x) / (v3.y - v1.y);
        
        let curx1 = v1.x;
        let curx2 = v1.x;

        for (let scanlineY = v1.y; scanlineY <= v2.y; scanlineY++) {
            this.drawLine(curx1, scanlineY, curx2, scanlineY, color);
            curx1 += invslope1;
            curx2 += invslope2;
        }
    }

    private fillTopFlatTriangle(v1: ICoord, v2: ICoord, v3: ICoord, color: PixelatorColor) {
        let invslope1 = (v3.x - v1.x) / (v3.y - v1.y);
        let invslope2 = (v3.x - v2.x) / (v3.y - v2.y);

        let curx1 = v3.x;
        let curx2 = v3.x;

        for (let scanlineY = v3.y; scanlineY > v1.y; scanlineY--) {
            this.drawLine(curx1, scanlineY, curx2, scanlineY, color);
            curx1 -= invslope1;
            curx2 -= invslope2;
        }
    }

    drawStars(stars:IStar[]) {
        for (let star of stars) {
            if (star.isTwinkling) {
                this.setPixel(star.x, star.y, star.color.brighten(star.twinkleMagnitude));
                if (star.animationFrame >= star.twinkleLength) {
                    star.isTwinkling = false;
                    star.animationFrame = 0;
                }
            } else {
                this.setPixel(star.x, star.y, star.color);
                if (star.animationFrame > star.twinkleFrequency) {
                    star.isTwinkling = true;
                    star.animationFrame = 0;
                }
            }
            star.animationFrame++;
        }
    }

    drawMountain(mountain:IMountainConfiguration) {
        let p1 = mountain.v1;
        let p2 = mountain.v2;
        let p3 = mountain.v3;
        let backgroundColorAtPeak = this.getPixel(p2.x, p2.y);
        let color = PixelatorColor.fromHex(mountain.color);
        this.fillTriangle([p1, p2, p3], color);
        let delta1 = backgroundColorAtPeak.getMagnitudeVector(16);
        let delta2 = backgroundColorAtPeak.getMagnitudeVector(32);
        let newColor1 = new PixelatorColor(color.red + delta1.red, color.green + delta1.green, color.blue + delta1.blue, color.alpha);
        let newColor2 = new PixelatorColor(color.red + delta2.red, color.green + delta2.green, color.blue + delta2.blue, color.alpha);
        this.drawLine(p1.x, p1.y, p2.x, p2.y, newColor2);
        this.drawLine(p2.x, p2.y, p3.x, p3.y, newColor2);
        this.drawLine(p1.x, p1.y - 1, p2.x, p2.y - 1, newColor1);
        this.drawLine(p2.x, p2.y - 1, p3.x, p3.y - 1, newColor1);
    }

    drawSky(t: number, sky: IPixelatorBackground) {

        let colors = Array.from(sky.theme, (v, k) => { return PixelatorColor.fromHex(v); });
        if (sky.height > this.height) {
            throw new Error("height must be less than max height");
        }
        let y = 0;
        let numberOfGradientSegments = (sky.theme.length * 2) - 2;
        let totalHeightForGradientSections = sky.gradation.getHeightofGradationSection(numberOfGradientSegments)
        let heightForColorBars = Math.ceil((sky.height - totalHeightForGradientSections) / colors.length);

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
