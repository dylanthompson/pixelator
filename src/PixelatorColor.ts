export class PixelatorColor {
    constructor(public red: number, public green: number, public blue: number, public alpha: number) { }

    private componentToHex(c: any) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    public toHex(): string {
        return "#" + this.componentToHex(this.red) + this.componentToHex(this.green) + this.componentToHex(this.green);
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
}