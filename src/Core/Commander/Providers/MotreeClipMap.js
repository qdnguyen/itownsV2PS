define (['THREE'
],function (THREE
        
) {

var MotreeClipMap  = function (lon, lat, size) {
        this.list  = [];
	this.ori   = new THREE.Vector2(0,0);
        this.scale = 500;
        
        if(size >= 0){ //0 means 1 tile
            for(var i = -size; i <= size; i++){
                for(var j= -size; j <= size; j++){
                    this.createTile(lon,lat,i,j);
                }
            }
        }
};
            
MotreeClipMap.prototype = {
                createTile: function(posx, posz, x, y) {
                    var lon = Math.floor(posx / this.scale);
                    var lat = Math.floor(posz / this.scale);
                    var tile = "EXPORT_" + (lon + x).toString() + "-" + (lat + y).toString();
                    this.list.push(tile);
                },
                getListTiles: function() {
                    return this.list;
                },
                clean    : function(){
                    this.list = [];
                },
                copy : function(map){
                    this.clean();
                    var newList = map.getListTiles();
                    for(var i=0 ; i< newList.length;i++){
                           this.list.push(newList[i]); 
                    }
                }
};

return MotreeClipMap;

});