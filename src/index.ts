import triangle from "a-big-triangle";
import createShader from "gl-shader";
import createTexture from "gl-texture2d";

const VERTEX_SHADER = `
    precision mediump float;

    attribute vec2 position;
    varying vec2 uv;

    void main() {
        uv = vec2( 0.0, 1.0 ) + vec2( 0.5, -0.5 ) * ( position + 1.0 );
        gl_Position = vec4( position.xy, 0.0, 1.0 );
    }
`;

const FRAGMENT_PREPENDIX = `
    precision highp float;

    uniform sampler2D image;
    uniform vec2 resolution;
    varying vec2 uv;

    vec4 getPixel() {
        return texture2D( image, uv );
    }

    vec4 getPixel( vec2 uv ) {
        return texture2D( image, uv );
    }

    vec4 getPixelXY( vec2 coords ) {
        return texture2D( image, coords / resolution );
    }
`;

// tslint:disable-next-line:no-any Allowing all uniform types.
export type UniformType = any;

export class ImageShader {
    private readonly canvas: HTMLCanvasElement;
    private readonly gl: WebGLRenderingContext;
    private readonly fragment: string;
    private readonly uniformCache: { [ key: string ]: UniformType } = {};
    private shader?: ReturnType<typeof createShader>;
    private texture?: ReturnType<typeof createTexture>;

    constructor( private readonly source: HTMLImageElement | HTMLCanvasElement, shader: string ) {
        this.canvas = document.createElement( "canvas" );
        this.gl = this.canvas.getContext( "webgl" )! || this.canvas.getContext( "experimental-webgl" )!;
        this.fragment = `${ FRAGMENT_PREPENDIX }\n${ shader }`;

        if ( source instanceof HTMLImageElement && !this.isComplete( source ) ) {
            source.onload = () => {
                this.setup( source );
            };
        } else {
            this.setup( source );
        }
    }

    get domElement(): HTMLCanvasElement {
        return this.canvas;
    }

    get width(): number {
        return this.canvas.width;
    }

    get height(): number {
        return this.canvas.height;
    }

    get uniforms(): { [ key: string ]: UniformType } {
        return this.uniformCache;
    }

    update() {
        if  ( !this.texture ) return;

        this.texture.setPixels( this.source );
        this.render();
    }

    dispose() {
        if ( this.shader ) this.shader.dispose();
        if ( this.texture ) this.texture.dispose();
    }

    render() {
        if ( !this.shader ) return;

        this.shader.bind();

        for ( const key in this.uniformCache ) {
            if ( this.uniformCache.hasOwnProperty( key ) ) {
                this.shader.uniforms[ key ] = this.uniformCache[ key ];
            }
        }

        triangle( this.gl );
    }

    private setup( source: HTMLImageElement | HTMLCanvasElement ) {
        this.canvas.width = source.width;
        this.canvas.height = source.height;

        this.gl.viewport( 0, 0, this.canvas.width, this.canvas.height );

        this.texture = createTexture( this.gl, source );

        this.shader = createShader( this.gl, VERTEX_SHADER, this.fragment  );
        this.shader.attributes.position.location = 0;

        this.uniformCache.resolution = [ this.canvas.width, this.canvas.height ];
        this.uniformCache.image = this.texture;

        this.render();
    }

    private isComplete( source: HTMLImageElement ): boolean {
        return source.complete && source.naturalHeight !== 0 && source.naturalHeight !== 0;
    }
}
