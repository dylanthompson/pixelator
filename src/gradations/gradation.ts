import { PixelatorColor } from "../pixelatorColor";
import { PixelatorFrame } from "../pixelatorFrame";

export enum GradationType {
    Field = "field",
    Line = "line"
}
export abstract class Gradation {
    stagger: number = 0;
    abstract getHeightofGradationSection(numberOfGradientSegments: number): number;
    abstract drawGradation(time: number, yIndex: number, skySpeed: number, colors: PixelatorColor[], stagger: number, pixelatorFrame: PixelatorFrame): number;
    constructor(public magnitude: number, public numColors: number) {

    }
}