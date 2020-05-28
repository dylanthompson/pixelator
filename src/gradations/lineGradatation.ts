import { Gradation } from "./gradation";
import { PixelatorColor } from "../PixelatorColor";
import { PixelatorFrame } from "../pixelatorFrame";

export class LineGradation extends Gradation {

    constructor(magnitude: number, numColors: number) {
        super(magnitude, numColors);
    }

    private getNumberOfLines(num: number): number {
        let result = 0;
        for (let i = num; i > 0; i--) {
            result += i;
        }
        return result;
    }

    public getHeightofGradationSection(numOfGradationSegments: number): number {
        return this.getNumberOfLines(this.magnitude + 1) * 2;
    }

    drawGradation(time: number, yIndex: number, skySpeed: number, colors: PixelatorColor[], pixelatorFrame: PixelatorFrame): number {
        let flipColor = (curColor: PixelatorColor) => {
            if (curColor == nextColor) {
                return color;
            } else {
                return nextColor;
            }
        }

        let color = colors[0];
        let nextColor = colors[1];
        // If bottom, only draw color bar
        // if top or in the middle, color bar then bottom gradient
        var nextColorToPrint = nextColor;
        for (var g = this.magnitude; g > 0; g--) {
            for (var l = 0; l < g; l++) {
                pixelatorFrame.fillRow(yIndex, nextColorToPrint);
                yIndex++;
            }
            nextColorToPrint = flipColor(nextColorToPrint);
        }

        for (var g2 = 0; g2 < this.magnitude; g2++) {
            for (var l = 0; l <= g2; l++) {
                pixelatorFrame.fillRow(yIndex, nextColorToPrint);
                yIndex++;
            }
            nextColorToPrint = flipColor(nextColorToPrint);
        }

        return yIndex;
    }
}
