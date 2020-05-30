import { PixelatorFrame } from './pixelatorFrame';
import { PixelatorColor } from './pixelatorColor';
import { IPixelatorEffect } from './pixelator';

export interface IReflectionConfiguration {
    top: number;
    rippleDepth: number;
    rippleMagnitude: number;
    rippleDelay: number;
    opacity: number;
    rippleSpeed: number;
}

export class Reflection implements IPixelatorEffect {
    private animationDirection: number = 1;
    private animationIndex: number = 0;
    private animationLength: number = 0;
    constructor(private top: number,
        private rippleDepth: number, // number of y pixel rows to shift at a time
        private rippleMagnitude: number, // number of stages of animation to animate left and right, 1 counts for still, to 3 means 1 still 2 animated frames in either direction (ie  1 2 3 2 1 -2 -3 -2 1 2 3 2 1 etc...)
        private rippleSpeed: number, // number of pixels to move left or right during an animation frame.
        private rippleDelay: number, // number of frames per animation stage (rippleMAg)
        private opacity: number) {
            this.animationLength = ((rippleMagnitude - 1) * 2) + 1;
            this.animationIndex = Math.ceil(rippleMagnitude / 2);
    }

    public applyEffect(t: number, frame: PixelatorFrame) {
        this.reflect(t, frame);
    }

    public applyOpacity(pixel: PixelatorColor): void {
        pixel.red = Math.ceil(pixel.red * this.opacity);
        pixel.green = Math.ceil(pixel.green * this.opacity);
        pixel.blue = Math.ceil(pixel.blue * this.opacity);
    }

    private setAnimationFrame(t: number) {
        let frameIndex = t % this.rippleDelay;
        if (frameIndex == this.rippleDelay - 1) {
            if (this.animationDirection == 1) {
                if (this.animationIndex >= this.animationLength - 1) {
                    this.animationDirection = -1;
                    this.animationIndex--;
                } else {
                    this.animationIndex++;
                }
            } else {
                if (this.animationIndex <= 0) {
                    this.animationDirection = 1;
                    this.animationIndex++;
                } else {
                    this.animationIndex--;
                }
            }
        }
    }

    public trimX(x: number, frame: PixelatorFrame) {
        if (x <= 0) {
            return 0
        } else if (x >= frame.width) {
            return frame.width;
        }
        return x;
    }

    public trimY(y: number, frame: PixelatorFrame) {
        if (y <= 0) {
            return 0
        } else if (y >= frame.height) {
            return frame.width;
        }
        return y;
    }

    public transformX(x: number, direction: number, frame: PixelatorFrame) {
        var modifiers = Array.from(Array(this.animationLength).keys(), x => x - (this.animationLength - 1) / 2);

        return this.trimX(x + modifiers[this.animationIndex] * direction * this.rippleSpeed, frame);
    }

    public reflect(t: number, frame: PixelatorFrame) {
        let reflectY = this.top;
        let reflectX;
        this.setAnimationFrame(t);
        let rippleDepthDirection = this.animationDirection * -1;
        
        // Draw the reflection by copying pixels over across the X axis at top
        for (let drawCoordY = this.top + 1; drawCoordY > 0; drawCoordY++) {
            if (drawCoordY % this.rippleDepth == 0) {
                rippleDepthDirection *= -1;
            }
            for (let drawCoordX = reflectX = 0; drawCoordX < frame.width; drawCoordX++) {
                let drawPixel = frame.getPixel(this.transformX(reflectX, rippleDepthDirection, frame), reflectY);
                this.applyOpacity(drawPixel);
                frame.setPixel(drawCoordX, drawCoordY, drawPixel);
                reflectX++;
            }
            reflectY--;
            if (reflectY < 0) {
                return;
            }
        }
    }
}