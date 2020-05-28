import { Pixelator } from '../src/pixelator';
import * as fs from 'fs';
var gifConfigs = JSON.parse(fs.readFileSync("..\\..\\test\\gifs.json", 'utf-8'));
var themes = JSON.parse(fs.readFileSync("..\\..\\test\\themes.json", 'utf-8'));

var p = new Pixelator(themes);

for (var i = 0; i < gifConfigs.queue.length; i++) {
    var next = gifConfigs[gifConfigs.queue[i]];
    p.createGif(next);
}
