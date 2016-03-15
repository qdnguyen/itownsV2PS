define (['THREE',
         './Bati3D/cores/LoaderMesh',
         './MotreeClipMap'
],function (THREE,
           LoaderMesh,
           MotreeClipMap        
) {

var MotreeInstance = null;
var MotreeProvider = function(options){
        if (!options) 
            throw new Error('options is required'); 
        
        this.clipMap = new MotreeClipMap(options.lon,options.lat,options.size);
        this.tileSetPaths = [];
        this._scene = options.scene;
        
        //local referentiel
        MotreeInstance = new THREE.Object3D();
        MotreeInstance.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI / 2 ));
        MotreeInstance.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ),  Math.PI ));

        //add Motree into Scene
        options.scene.add(MotreeInstance);
        
        this.init(options.url,this.clipMap);
};

MotreeProvider.prototype.getClipMap = function(){
        if(MotreeInstance)
            return MotreeInstance.children;
        else return undefined;
};

/*
 * This function is specific for Bati 3D of Paris
 */
MotreeProvider.prototype.genertateBati3DForTilePath = function(url,clipmap){
       var tileToLoads = clipmap.getListTiles();
       if(tileToLoads.length >0){
            for(var i=0; i<tileToLoads.length; i++){
                var path = url + tileToLoads[i] + "/export-3DS/ZoneAExporter.b3d";
                this.tileSetPaths.push(path);
            }
       }
};

MotreeProvider.prototype.init = function(url, clipmap){
        if(clipmap){
            this.genertateBati3DForTilePath(url,clipmap);
        }

        if(this.tileSetPaths.length > 0){
            for(var i = 0 ; i < this.tileSetPaths.length; i++){
                    var model = new LoaderMesh({
                          url : this.tileSetPaths[i],
                          targetError : 0.00001,
                          targetFps  :  25,
                          wireframe  : true
                    });
                    MotreeInstance.add(model); 
            }        
        }        
};

return MotreeProvider;

});