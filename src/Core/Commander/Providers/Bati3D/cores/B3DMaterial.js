define(['THREE',
    'Renderer/BasicMaterial',
    '../shaders/B3DShaderVS.glsl',
    '../shaders/B3DShaderFS.glsl'
], function(
    THREE,
    BasicMaterial,
    B3DShaderFresnelVS,
    B3DShaderFresnelFS) {

    var B3DMaterial = function() {

        BasicMaterial.call(this);

        this.vertexShader = B3DShaderFresnelVS;
        this.fragmentShader = B3DShaderFresnelFS;

        this.nbTextures = 0;
        this.wireframe = false;
        
        this.uniforms.lightPosition = { type: "v3", value: new THREE.Vector3(1,1,1)};
    };

    B3DMaterial.prototype = Object.create(BasicMaterial.prototype);
    B3DMaterial.prototype.constructor = B3DMaterial;

    B3DMaterial.prototype.generateTexture = function() {
        // build a small canvas 32x64 and paint it in white
        var canvas  = document.createElement( 'canvas' );
        canvas.width = 32;
        canvas.height    = 64;
        var context = canvas.getContext( '2d' );
        // plain it in white
        context.fillStyle    = '#ffffff';
        context.fillRect( 0, 0, 32, 64 );
        // draw the window rows - with a small noise to simulate light variations in each room
        for( var y = 2; y < 64; y += 2 ){
            for( var x = 0; x < 32; x += 2 ){
                var value   = Math.floor( Math.random() * 64 );
                context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
                context.fillRect( x, y, 2, 1 );
            }
        }

        // build a bigger canvas and copy the small one in it
        // This is a trick to upscale the texture without filtering
        var canvas2 = document.createElement( 'canvas' );
        canvas2.width    = 512;
        canvas2.height   = 1024;
        var context = canvas2.getContext( '2d' );
        // disable smoothing
        context.imageSmoothingEnabled        = false;
        context.webkitImageSmoothingEnabled  = false;
        context.mozImageSmoothingEnabled = false;
        // then draw the image
        context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
        // return the just built canvas2
        return canvas2;
    };


    B3DMaterial.prototype.dispose = function() {

        this.dispatchEvent({
            type: 'dispose'
        });

        
        this.nbTextures = 0;
    };

    return B3DMaterial;
});


