define(['./PageID'],function(PageID){
    var Tile = function (id, hits, parentId) {
        this.parentId = (undefined === parentId) ? PageID.createInvalid() : parentId;
        this.id = id;
        this.hits = (undefined !== hits) ? hits : 0;
        this.pageNumber  = PageID.getPageNumber(id);
        this.mipMapLevel = PageID.getMipMapLevel(id);
        this.loaded = false;
        this.image = undefined;
  };
  Tile.prototype = {
    isLoaded: function () {
        return this.loaded;
    },

    hasParent: function () {
        return PageID.isValid(this.parentId);
    }
  };
 
  return Tile;  
    
});

