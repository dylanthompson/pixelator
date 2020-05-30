import { PixelatorFrame } from './pixelatorFrame';
import { PixelatorColor } from './pixelatorColor';
import { IPixelatorEffect } from './pixelator';

export interface IReflectionConfiguration {
    top: number;
    rippleDepth: number;
    rippleMagnitude: number;
}

export class Reflection implements IPixelatorEffect {
    constructor(private top: number, private rippleDepth: number, private rippleMagnitude: number) {

    }

    public applyEffect(frame: PixelatorFrame) {
        this.reflect(frame);
    }

    public reflect(frame: PixelatorFrame) {
        // Do the reflect matrix transform
        var reflectX = 0, reflectY = this.top;

        for (var drawCoordY = this.top + 1; drawCoordY > 0; drawCoordY++) {
            for (var drawCoordX = reflectX =0; drawCoordX < frame.width; drawCoordX++) {
                frame.setPixel(drawCoordX, drawCoordY, frame.getPixel(reflectX, reflectY));
                reflectX++;
            }
            reflectY--;
            if (reflectY < 0)
            {
                return;
            }
        }
    }
}