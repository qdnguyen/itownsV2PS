define(['THREE'],function(THREE){
    
  var TileDetermination = function (width, height, type) {
        this.scene = new THREE.Scene();
        this.usingTextureFloat = type || false;
        var renderTargetParameters = {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            stencilBufer: false,
            type : type !== true ? THREE.UnsignedByteType : THREE.FloatType
        };

        // TODO: resize rt on window resize
        this.renderTarget = new THREE.WebGLRenderTarget(
            Math.floor(width * 0.125), //8 level max
            Math.floor(height * 0.125),
            renderTargetParameters
        );
        
        var width = this.renderTarget.width;
        var height = this.renderTarget.height;

        this.canvas = document.createElement('canvas');
        this.canvas.width =  width;
        this.canvas.height = height;

        if(this.usingTextureFloat) {
            this.data = new Float32Array(width * height * 4);
        }else{
            this.data = new Uint8Array(width * height * 4);
        }    
        this.imgData = this.canvas.getContext('2d').createImageData(width, height);
        
  };

  TileDetermination.prototype.parseImage = function (context, sparseTable) {
    var scope = this;

    function parse(sparseTable) {
      var i, offset, r, g, b;
      var numPixels = scope.renderTarget.width * scope.renderTarget.height;

      for (i = 0; i < numPixels; ++i) {
        offset = i * 4;

        if (0 !== scope.data[offset + 3]) {
          r = scope.data[offset];
          g = scope.data[offset + 1];
          b = scope.data[offset + 2];
          sparseTable.set(r, g, b);
        }
      }
    }

    // copy render buffer to imgData.data
    var gl = context;
    gl.pixelStorei(gl.PACK_ALIGNMENT, 4);
    
    //one option to use float texture to support more LOD
    if(this.usingTextureFloat) {
          gl.readPixels(0, 0, this.renderTarget.width, this.renderTarget.height, gl.RGBA, gl.FLOAT, this.data);
    }else{
          gl.readPixels(0, 0, this.renderTarget.width, this.renderTarget.height, gl.RGBA, gl.UNSIGNED_BYTE, this.data);
    }

    // parse uv and page id from render target
    parse(sparseTable);

    //if (this.debug.enabled) {
      // copy the flipped texture to data
    this.imgData.data.set(this.data);
    this.canvas.getContext('2d').putImageData(this.imgData, 0, 0);
    //}
  };
  
  
  TileDetermination.prototype.debug = function () {
        var scope = this;

        var verticalPosition = 0;
        var horizontalPosition = 10;
        var position = "absolute";
        var zIndex = "100";
        var borderColor = "red";
        var borderStyle = "solid";
        var borderWidth = 1;

        var fontSize = 13; // in pixels
        var fontFamily = "Arial";
        var lineHeight = 20; // in pixels

        // create div title
        var divTitle = document.createElement('div');

        divTitle.style.color = "#000000";
        divTitle.style.fontFamily = fontFamily;
        divTitle.style.fontSize = fontSize + "px";
        divTitle.style.fontWeight = "bold";
        divTitle.style.zIndex = 100;
        divTitle.style.position = "absolute";
        divTitle.style.top = verticalPosition + "px";
        divTitle.style.left = horizontalPosition + "px";

        divTitle.innerHTML = "Visible Tiles (Feedback Buffer)";
        document.body.appendChild(divTitle);

        scope.canvas.style.top = verticalPosition + lineHeight + "px";
        scope.canvas.style.left = horizontalPosition + "px";
        scope.canvas.style.position = position;
        scope.canvas.style.zIndex = zIndex;
        scope.canvas.style.borderColor = borderColor;
        scope.canvas.style.borderStyle = borderStyle;
        scope.canvas.style.borderWidth = borderWidth + "px";

        document.body.appendChild(scope.canvas);
  };
  
  return TileDetermination;  

});