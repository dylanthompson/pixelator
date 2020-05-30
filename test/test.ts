import { Pixelator } from 'pixelator';
import { GifGenerator } from './gifGenerator';
import * as fs from 'fs';

var gifConfigs = JSON.parse(fs.readFileSync("gifs.json", 'utf-8'));
var themes = JSON.parse(fs.readFileSync("themes.json", 'utf-8'));

var p = new Pixelator(themes);

for (var i = 0; i < gifConfigs.queue.length; i++) {
    var next = gifConfigs.gifs[gifConfigs.queue[i]];
    p.createGif(next);
}

// var generator = new GifGenerator(themes);
// generator.generateGifs(p);

