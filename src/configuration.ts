import { GradationType } from "./gradations/gradation";
import { IReflectionConfiguration } from './reflection';
import { ISunConfiguration, IMountainConfiguration, IStarsConfiguration } from "./pixelatorFrame";
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

export interface IPixelatorBackgroundConfiguration {
    name: string;
    height: number;
    speed: number;
    theme: string;
    gradation: IGradationConfiguration;
    sun: ISunConfiguration | null;
    stars: IStarsConfiguration | null;
}

export interface IGradationConfiguration {
    magnitude: number;
    numColors: number;
    type: GradationType;
}