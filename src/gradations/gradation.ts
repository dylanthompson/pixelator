import { LineGradation } from "./lineGradatation";
import { FieldGradation } from "./fieldGradation";
import { PixelatorColor } from "../PixelatorColor";
import { IGradationConfiguration } from "../configuration";
import { PixelatorFrame } from "../pixelatorFrame";

export enum GradationType {
    Field = "field",
    Line = "line"
}
export abstract class Gradation {
    abstract getHeightofGradationSection(numberOfGradientSegments: number): number;
    abstract drawGradation(time: number, yIndex: number, skySpeed: number, colors: PixelatorColor[], pixelatorFrame: PixelatorFrame): number;
    constructor(public magnitude: number, public numColors: number) {

    }
}

export class GradationFactory {
    public static getGradation(gradationConfig: IGradationConfiguration): Gradation {
        switch (gradationConfig.type) {
            case GradationType.Line:
                return new LineGradation(gradationConfig.magnitude, gradationConfig.numColors);
            case GradationType.Field:
            default:
                return new FieldGradation(gradationConfig.magnitude, gradationConfig.numColors);
        }
    }
}