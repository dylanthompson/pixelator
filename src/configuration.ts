import { GradationType } from "./gradations/gradation";

export interface IPixelatorConfig {
    name: string;
    height: number;
    width: number;
    frames: number;
    background: { [key: string]: IPixelatorBackgroundConfiguration };
}

export interface IPixelatorBackgroundConfiguration {
    name: string;
    height: number;
    speed: number;
    theme: string;
    gradation: IGradationConfiguration;
}

export interface IGradationConfiguration {
    magnitude: number;
    numColors: number;
    type: GradationType;
}