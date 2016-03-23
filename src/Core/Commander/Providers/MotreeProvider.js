define (['THREE',
         './Bati3D/cores/LoaderMesh',
         './MotreeClipMap',
         'Core/Math/Ellipsoid',
         'Core/Geographic/CoordStars'
],function (THREE,
           LoaderMesh,
           MotreeClipMap,
           Ellipsoid,
           CoordStars
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
        
        this._coSun= CoordStars.getSunPositionInScene(new Ellipsoid(new THREE.Vector3(6378137, 6356752.3142451793, 6378137)), new Date().getTime(), 0, 0);
        
        var directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.x = this._coSun.x;
	    directionalLight.position.y = this._coSun.y;
	    directionalLight.position.z = this._coSun.z;
	    //directionalLight.position.normalize();
	options.scene.add( directionalLight );
	
        
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
                var path = url + tileToLoads[i] + "/export-3DS/ZoneAExporter-Non-MNT.b3d";
                this.tileSetPaths.push(path);
            }
       }
};

//false means system referentiel does not in wgs84, e.g. iTowns
MotreeProvider.prototype.init = function(url, clipmap){
        if(clipmap){
            this.genertateBati3DForTilePath(url,clipmap);
        }
        //var color = new THREE.Color().setHex( Math.random() * 0xffffff );
         var color = 0x003399;

        if(this.tileSetPaths.length > 0){
            for(var i = 0 ; i < this.tileSetPaths.length; i++){
                    var model = new LoaderMesh({
                          url : this.tileSetPaths[i],
                          targetError : 0.0005,
                          targetFps  :  25,
                          wireframe  : false,
                          color      : color,
                          wgs84      : false, 
                          lightPos   : this._coSun
                    });
                    MotreeInstance.add(model); 
            }        
        }

};

return MotreeProvider;

});