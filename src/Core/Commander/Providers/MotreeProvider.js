define (['THREE','./Bati3D/cores/LoaderMesh'
],function (THREE,
           LoaderMesh
) {

var tileSet = null;
var MotreeProvider = function(options){
       if (!options) 
            throw new Error('options is required'); 
        var model = new LoaderMesh({
                      url : "resources/res1_wgs84_local_coord.b3d", //"resources/b3d/EXPORT_1302-13718/export-3DS/ZoneAExporter.b3d",//
                      targetError : 0.001,
                      targetFps  :  25,
                      wireframe  : true
        });
        //model.position.copy(new THREE.Vector3(4627770 -3307.55517578125 , 112407 + 5222.22021484375, 4372970 + 3558.525634765625));
        //model.position.copy(new THREE.Vector3(4627770 , 112407 , 4372970 ));
        tileSet = new THREE.Object3D();
        
        tileSet.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI / 2 ));
        tileSet.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ),  Math.PI ));
       
       /*
        var material = new THREE.MeshBasicMaterial({color: 0xff0000});
        var geometry = new THREE.SphereGeometry(20);
        var batiment = new THREE.Mesh(geometry, material);
        var position = new THREE.Vector3(4627770 -3307.55517578125 , 112407 + 5222.22021484375, 4372970 + 3558.525634765625);
        //var position = new THREE.Vector3(4627770, 112407, 4372970);
        batiment.position.copy(position);
        batiment.update = function(cam, rendrer){
        };
        
        //batiment.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI / 2 ));
        //batiment.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ),  Math.PI ));
        tileSet.add(batiment);
        */
        tileSet.add(model);
        //options.scene.add(model);
        options.scene.add(tileSet);
    
};

MotreeProvider.prototype.getClipMap = function(){
        if(tileSet)
            return tileSet.children;
        else return undefined;
};

return MotreeProvider;

});