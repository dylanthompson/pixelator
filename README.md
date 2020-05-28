# pixelator
Pixel art utility

Creates Gif animated gradients and hopefully other animated elements

**Installation and Building Pixelator Library**
1) Requires Node and npm
 - https://www.npmjs.com/get-npm

2) Needs Typescript
> npm install -g typescript

3) Install and Package
> npm run install-and-package

This will produce an npm package pixelator-0.0.1.tgz in /dist

Test Application
The test app will consume the library as an NPM package and has a different build.  
See test/

1) Copy package
 - copy dist/pixelator-0.0.1.tgz to test/



2) cd to test and Install
> cd test
> npm install

3) Build
> tsc
> node .\test.js

