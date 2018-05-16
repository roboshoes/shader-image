# Shader Image

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

> Tool to simplify writing shaders for HTML Image and Canvas elements.


This class class creates a webgl context and texture from a given `HTMLImageElement` or `HTMLCanvasElement` as
well as a fragment shader.

The shader is wrapped with the necessery definitions and functions to render the image.

```js
import { ShaderImage } from "shader-image";

const source = new Image();
source.src = "some/url.png"

// only render the red channel of the image.
const shader = `
    void main() {
        vec4 pixel = getImagePixel();

        gl_FragCoord = vec4( pixel.r, 0, 0, 1 );
    }
`

const image = new ShaderImage( source, shader );

document.body.appendChild( image.domElement );
```

## Api

### Fields
- `domElement` Returns a `HTMLCanvasElement` in the size of the source image containing the shaded image.
- `width` Returns the width of the content.
- `height` Returns the height of the content.

### Methods
- `dispose()` Releases all memory. Since it uses WebGL internally, simply losing the reference will not clear
              all memory.