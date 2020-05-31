export var easingFunctions: {[key: string]: (t:number) => number }= {
    // no easing, no acceleration
    linear: (t: number) => t,
    // accelerating from zero velocity
    easeInQuad: (t: number) => t*t,
    // decelerating to zero velocity
    easeOutQuad: (t: number) => t*(2-t),
    // acceleration until halfway, then deceleration
    easeInOutQuad: (t: number) => t<.5 ? 2*t*t : -1+(4-2*t)*t,
    // accelerating from zero velocity 
    easeInCubic: (t: number) => t*t*t,
    // decelerating to zero velocity 
    easeOutCubic: (t: number) => (--t)*t*t+1,
    // acceleration until halfway, then deceleration 
    easeInOutCubic: (t: number) => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
    // accelerating from zero velocity 
    easeInQuart: (t: number) => t*t*t*t,
    // decelerating to zero velocity 
    easeOutQuart: (t: number) => 1-(--t)*t*t*t,
    // acceleration until halfway, then deceleration
    easeInOutQuart: (t: number) => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,
    // accelerating from zero velocity
    easeInQuint: (t: number) => t*t*t*t*t,
    // decelerating to zero velocity
    easeOutQuint: (t: number) => 1+(--t)*t*t*t*t,
    // acceleration until halfway, then deceleration 
    easeInOutQuint: (t: number) => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t
  }

export class PixelatorColor {
    constructor(public red: number, public green: number, public blue: number, public alpha: number) { }

    private componentToHex(c: any) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    public toHex(): string {
        return "#" + this.componentToHex(this.red) + this.componentToHex(this.green) + this.componentToHex(this.blue);
    }

    public static interpolate(linearDistancePercentage:number, interpolation: string = "linear"): number {
        if (!(interpolation in easingFunctions))  {
            throw new Error("Bad interpolation function name");
        }
        return easingFunctions[interpolation](linearDistancePercentage);
    }

    public static fromHex(hex: string): PixelatorColor {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result)
            return new PixelatorColor(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 255);
        else
            throw new Error("Invalid Hex");
    }

    public getMagnitude() {
        return Math.sqrt(Math.pow(this.red, 2) + Math.pow(this.green, 2) + Math.pow(this.blue, 2));
    }

    private trim(rgbValue: number) {
        return rgbValue < 0 ? 0 : rgbValue > 255 ? 255 : rgbValue;
    }

    public getUnitVector(): PixelatorColor {
        let magnitude = this.getMagnitude();
        return new PixelatorColor(this.trim(this.red / magnitude), this.trim(this.green / magnitude), this.trim(this.blue / magnitude), this.alpha)
    }

    public getMagnitudeVector(magnitude: number) {
        let startVector = this.getUnitVector();
        startVector.red = Math.round(startVector.red * magnitude);
        startVector.green = Math.round(startVector.green * magnitude);
        startVector.blue = Math.round(startVector.blue * magnitude);
        return startVector;
    }

    public static getColorTweenVector(fromColor: PixelatorColor, toColor: PixelatorColor) {
        return new PixelatorColor(toColor.red - fromColor.red, toColor.green - fromColor.green, toColor.blue - fromColor.blue, toColor.alpha);
    }

    public static colorTween(magnitude: number, fromColor: PixelatorColor, toColor: PixelatorColor) {
        var red = toColor.red - fromColor.red;
        var green = toColor.green - fromColor.green;
        var blue = toColor.blue - fromColor.blue;
        let toColorTweenVector = new PixelatorColor(red, green, blue, toColor.alpha).getUnitVector().scale(magnitude);
        return new PixelatorColor(Math.round(toColorTweenVector.red + fromColor.red),
        Math.round(toColorTweenVector.green + fromColor.green),
        Math.round(toColorTweenVector.blue + fromColor.blue),
            fromColor.alpha);
    }

    public scale(magnitude: number) {
        return new PixelatorColor(Math.round(this.red * magnitude), Math.round(this.green * magnitude), Math.round(this.blue * magnitude), this.alpha);
    }

    public tween(magnitude: number, toColor: PixelatorColor) {
        var tweenColor = PixelatorColor.colorTween(magnitude, this, toColor);
        return new PixelatorColor(this.trim(tweenColor.red), this.trim(tweenColor.green), this.trim(tweenColor.blue), this.trim(tweenColor.alpha));
    }

    public brighten(magnitude: number) {
        var brightColor = PixelatorColor.fromHex('#FFFFFF');
        var brightVector = PixelatorColor.colorTween(magnitude, this, brightColor);
        return new PixelatorColor(brightVector.red, brightVector.green, brightVector.blue, brightVector.alpha);
    }

    public darken(magnitude: number) {
        var darkColor = PixelatorColor.fromHex('#000000');
        var darkVector = PixelatorColor.colorTween(magnitude, this, darkColor);
        return new PixelatorColor(darkVector.red, darkVector.green, darkVector.blue, darkVector.alpha);
    }
}