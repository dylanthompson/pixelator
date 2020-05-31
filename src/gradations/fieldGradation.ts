import { Gradation } from "./gradation";
import { PixelatorColor } from "../pixelatorColor";
import { PixelatorFrame } from "../pixelatorFrame";

export class FieldGradation extends Gradation {
    public stagger: number;
    constructor(magnitude: number, numColors: number, stagger: number) {
        super(magnitude, numColors);
        this.stagger = stagger;
    }

    public getHeightofGradationSection(numOfGradationSegments: number): number {
        return numOfGradationSegments * this.magnitude;
    }

    private fillGradientRow(time: number, yIndex: number, skySpeed: number, pixelatorFrame: PixelatorFrame, primaryColor: PixelatorColor, secondaryColor: PixelatorColor, frequency: number) {
        let curMovement = Math.floor(time * skySpeed);
        let loopIndex: number | null = curMovement % (frequency);
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

    public drawGradation(time: number, yIndex: number, skySpeed: number, colors: PixelatorColor[], stagger: number, pixelatorFrame: PixelatorFrame): number {

        let c1, c2, c3, c4;
        if (colors.length < 4) {
            [c1, c2] = colors;
            [c4, c3] = colors;
        } else {
            [c1, c2, c3, c4] = colors;
        }

        // If bottom, only draw color bar
        // if top or in the middle, color bar then bottom gradient
        let curSpeed = skySpeed;
        let curTime = time;
        if (skySpeed == 0 && stagger > 0) {
            curSpeed = 1;
            curTime = 0;
        }
        for (var g = this.magnitude; g > 0; g--) {
            this.fillGradientRow(curTime + stagger, yIndex, curSpeed, pixelatorFrame, c1, c2, g);
            yIndex++;
        }

        for (var g2 = 1; g2 < this.magnitude; g2++) {
            this.fillGradientRow(curTime + stagger, yIndex, curSpeed, pixelatorFrame, c3, c4, g2);
            yIndex++;
        }

        return yIndex;
    }
}