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
    varying vec2 uv;

    vec4 getImagePixel() {
        return texture2D( image, uv );
    }
`;

export class ShaderImage {
    private readonly canvas: HTMLCanvasElement;
    private readonly gl: WebGLRenderingContext;
    private readonly fragment: string;
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

    update() {
        // @types/gl-texture2d is missing the setPixels method
        // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/25840
        // tslint:disable-next-line:no-any
        (this.texture as any).setPixels( this.source );

        this.render();
    }

    dispose() {
        if ( this.shader ) this.shader.dispose();
        if ( this.texture ) this.texture.dispose();
    }

    private render() {
        if (!this.shader) return;

        this.shader.bind();
        this.shader.uniforms.image = this.texture;

        triangle( this.gl );
    }

    private setup( source: HTMLImageElement | HTMLCanvasElement ) {
        this.canvas.width = source.width;
        this.canvas.height = source.height;

        this.gl.viewport( 0, 0, this.canvas.width, this.canvas.height );

        this.texture = createTexture( this.gl, source );

        this.shader = createShader( this.gl, VERTEX_SHADER, this.fragment  );
        this.shader.attributes.position.location = 0;

        this.render();
    }

    private isComplete( source: HTMLImageElement ): boolean {
        return source.complete && source.naturalHeight !== 0 && source.naturalHeight !== 0;
    }
}
