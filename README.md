# Shader Image

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

> Tool to simplify writing shaders for HTML Image and Canvas elements.

> Written in Typescript and ships with all types.

This class class creates a webgl context and texture from a given `HTMLImageElement` or `HTMLCanvasElement` as
well as a fragment shader.

The shader is wrapped with the necessery definitions and functions to render the image.

```js
import { ShaderImage } from "shader-image";

const source = new Image();
source.src = "some/url.png";

// Shader to only render the red channel of the image.
const shader = `
    void main() {
        vec4 pixel = getPixel();

        gl_FragColor = vec4( pixel.r, 0, 0, 1 );
    }
`;

const image = new ImageShader( source, shader );

document.body.appendChild( image.domElement );
```

## Api

### Constructor
`new ShaderImage( source, shader )` where `source` is either a `HTMLImageElement` or a `HTMLCanvasElement` and the
`shader` is a string in form of `webgl` shader. This means it has to include a `void main()` method in which or
subsequently from which the `gl_FragColor` is set.

For a list of available variables and methods within the shader [see below](#methods).

### Fields
- `domElement`: Returns a `HTMLCanvasElement` in the size of the source image containing the shaded image.
- `width`:      Returns the width of the content.
- `height`:     Returns the height of the content.
- `uniforms`:   Returns a readonly object which contains all uniforms. Setting additional uniforms is enabled by
                adding more values on this object:

```javascript
const image = new ImageShader( source, fragment );

image.uniforms.time = 2340;
image.uniforms.anchor = [ 23, 45 ];

image.render();
```

### Methods
- `dispose()`:          Releases all memory. Since it uses WebGL internally, simply losing the reference will not
                        clear all memory.
- `render()`:           Re-renders the image. Should only be used after uniforms have been changed. Calling the
                        method otherwise is safe, but potentially wasteful.

### Shader Helpers
The passed in shader, used as a fragment shader for the image, ships with some uniforms and helper methods:

#### Uniforms and Varying
- `sampler2D image`: The image/canvas in question as texture.
- `vec2 resolution`: The size of the image.
- `vec2 uv`:         The UV coordinates of the current fragment.

#### Methods
- `vec4 getPixel()`:                Returns the pixel for the current fragment. For instance:
                                    `gl_FragColor = getPixel()` simply renders the image unaltered.
- `vec4 getPixel( vec2 uv )`:       Returns the image pixel at the given UV coordineats.
- `vec4 getPixelXY( vec2 coords )`: Returns the image pixel at the given coordinates in pixels.
