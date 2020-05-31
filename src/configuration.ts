import { GradationType } from "./gradations/gradation";
import { IReflectionConfiguration } from './reflection';
import { ISunConfiguration, IMountainConfiguration, IStarsConfiguration } from "./pixelatorFrame";
import { PixelatorColor } from "./pixelatorColor";
export interface IPixelatorConfig {
    name: string;
    height: number;
    width: number;
    frames: number;
    delay: number;
    effects: { 
        reflection: IReflectionConfiguration | null;
    }
    background: { [key: string]: IPixelatorBackgroundConfiguration };
    mountains: IMountainConfiguration[] | null;
}

export class ThemeProvider {
    constructor() {
    }

    public static getTheme(config: IThemeConfiguration): string[] {
        if (config.keyColors.length != 2) {
            throw new Error("only 2 colors supported atm");
        }
        let colorGradient = [config.keyColors[0]];
        let startColor = PixelatorColor.fromHex(config.keyColors[0]);
        let endColor = PixelatorColor.fromHex(config.keyColors[1]);
        let distance = PixelatorColor.getColorTweenVector(startColor, endColor).getMagnitude();
        let colorStep = distance / config.numColors;
        for (let i = 0; i < config.numColors - 1; i++) {
            let curLinearStepPercentage = colorStep * (i + 1) / distance;
            let curInterpolatedStepPercentage = PixelatorColor.interpolate(curLinearStepPercentage, config.interpolation);
            let interpolatedColorStep = curInterpolatedStepPercentage * distance;
            let curColor = startColor.tween(interpolatedColorStep, endColor);
            colorGradient.push(curColor.toHex());
        }
        colorGradient.push(config.keyColors[1]);
        return colorGradient;
    }
}

export interface IThemeConfiguration {
    name: string | null;
    keyColors: string[];
    numColors: number;
    interpolation: string;
}

export interface IPixelatorBackgroundConfiguration {
    name: string;
    height: number;
    speed: number;
    theme: string | IThemeConfiguration;
    gradation: IGradationConfiguration;
    sun: ISunConfiguration | null;
    stars: IStarsConfiguration | null;
}

export interface IGradationConfiguration {
    magnitude: number;
    numColors: number;
    type: GradationType;
    stagger: number;
}