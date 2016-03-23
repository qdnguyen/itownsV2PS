define(['loader/loadImage','loader/throttleRequestByServer'],
        function(loadImage, throttleRequestByServer){

    var TileQueue = function (size, service, parent) {
            this.maxLoading = size;
            this.onLoading = 0;
            this.loadCount = 0;
            this.parent    = parent;
            this._service = service;
            this.callback = null;

            this.content = [];
            this.sorted = false;
            //this.bill = new BillBoard();
    };

    TileQueue.prototype.push = function (item) {
            this.content.push({object: item, priority: item.hits});
            this.sorted = false;

            this.process();
    };

  
    TileQueue.prototype.process = function () {

            if ((this.onLoading < this.maxLoading) && !this.empty()) {
                    var scope   = this;
                    var service = scope._service;
                    var item    = this.pop();
                    var params  = this.getTilePath(item, scope.parent, service.maxMipMapLevel);
       
                    var url = scope._service.url;
                    if(service.name === "WMTS"){
                            url += service.key + "/geoportail/wmts?LAYER="+ service.layer +    
                            "&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0"+
                            "&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM"+
                            "&TILEMATRIX=" + params.mipmap + "&TILEROW=" + params.y+ "&TILECOL=" + params.x;
                    }else if(service.name === "DEBUG"){ //Debug
                           url += params;
                    }
                    
                    var promise = throttleRequestByServer(url, loadImage);
                    if (promise === undefined) {
                      // too many active requests in progress, try again later.
                    } else {
                      promise.then(function(image) {
                            --scope.onLoading;
                            ++scope.loadCount;

                            //item.image = this;
                            item.image = image;
                            item.loaded = true;
                            
                            /*
                            console.log('# MageTexture : ' + scope.parent + '\n' +
                                        '# Page Number : ' + item.pageNumber + '\n' +
                                        '# Mipmap Level: ' + params.mipmap + '\n' +
                                        '# X Row       : ' + params.x + '\n' +
                                        '# Y Row       : ' + params.y);
                            */
                            
                            //scope.process();
                            scope.callback(item);
                      });
                    }
            }
    };         
    TileQueue.prototype.pop = function () {
        if (!this.sorted) {
          this.sort();
        }

        var element = this.content.pop();
        if (element) {
          return element.object;
        }

        return undefined;
    };

    TileQueue.prototype.empty = function () {
        return 0 === this.content.length;
    };

    TileQueue.prototype.contains = function (id) {
          var i;
          for (i = this.content.length - 1; i >= 0; --i) {
            if (id === this.content[i].object.id) {
              return true;
            }
          }

          return false;
    };

    TileQueue.prototype.size = function () {
          return this.content.length;
    };

    TileQueue.prototype.top = function () {
          if (!this.sorted) {
            this.sort();
          }

          var element = this.content[this.content.length - 1];
          if (element) {
            return element.object;
          }

          return undefined;
    };

    TileQueue.prototype.sort = function () {
          this.content.sort(function (a, b) {
          return a.priority - b.priority;
    });

    this.sorted = true;
    
   

    
};

return TileQueue;

    
});
