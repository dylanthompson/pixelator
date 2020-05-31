import { IGradationConfiguration } from "../configuration";
import { Gradation, GradationType } from "./gradation";
import { LineGradation } from "./lineGradatation";
import { FieldGradation } from "./fieldGradation";

export class GradationFactory {
    public static getGradation(gradationConfig: IGradationConfiguration): Gradation {
        switch (gradationConfig.type) {
            case GradationType.Line:
                return new LineGradation(gradationConfig.magnitude, gradationConfig.numColors);
            case GradationType.Field:
            default:
                return new FieldGradation(gradationConfig.magnitude, gradationConfig.numColors, gradationConfig.stagger);
        }
    }
}