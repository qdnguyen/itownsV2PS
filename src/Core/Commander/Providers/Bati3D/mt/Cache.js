 define(['THREE','./Page','./PageID','./Status','./Tile'],
 function(THREE, Page, PageID, Status, Tile){
         
     var Cache = function (context, tileSize, padding, width, height) {

            this.context = context;
            this.width = width;
            this.height = height;
            this.realTileSize = {
              x: tileSize + (2 * padding),
              y: tileSize + (2 * padding)
            };

            this.tileCountPerSide = {
              x: parseInt(this.width / this.realTileSize.x, 10),
              y: parseInt(this.height / this.realTileSize.y, 10)
            };

            this.tileCount = this.tileCountPerSide.x * this.tileCountPerSide.y;

            this.usablePageSize = tileSize;
            this.padding = padding;
            this.size = {
              x: width,
              y: height
            };

            this.relativePadding = {
              x: padding / this.width,
              y : padding / this.height
            };

            this.textures = {
              tDiffuse : null
            };

            this.cachedPages = {};
            this.freeSlots = [];
            this.slots = [];
            this.loadingQueue = [];

            this.init();
            this.clear();
  };

  Cache.prototype = {

            init: function () {
              var i, type, texture;

              for (i = 0; i < this.tileCount; ++i) {
                this.slots.push(new Page());
              }

              for (type in this.textures) {
                if (this.textures.hasOwnProperty(type)) {
                  texture = new THREE.DataTexture(
                        null,
                        this.width,
                        this.height,
                        THREE.RGBAFormat,
                        THREE.UnsignedByteType,
                        THREE.UVMapping,
                        THREE.ClampToEdgeWrapping,
                        THREE.ClampToEdgeWrapping,
                        THREE.LinearFilter,
                        THREE.LinearFilter
                  );

                  texture.generateMipmaps = false;
                  texture.needsUpdate = true;
                  this.textures[type] = texture;
                }
              }
            },

            getNextFreeSlot: function () {
              try {
                if (!this.hasFreeSlot()) {
                  this.freeSlot();
                }

                // get the first slot
                var id, slot;
                //for (var slot in this.freeSlots) {
                for (slot = 0; slot < this.freeSlots.length; ++slot) {
                  if (true === this.freeSlots[slot]) {
                    this.freeSlots[slot] = false;
                    id = slot;

                    // end iteration, we just want one item
                    break;
                  }
                }

                if (undefined === id) {
                  console.error("FreeSlotNotFound");
                }

                return parseInt(id, 10);

              } catch (e) {
                console.log(e.stack);
              }
            },

            getPageCoordinates: function (id) {
              var topLeftCorner = [
                ((id % this.tileCountPerSide.x) * this.realTileSize.x) / this.size.x,
                (Math.floor(id / this.tileCountPerSide.y) * this.realTileSize.y) / this.size.y];

              // add offset
              topLeftCorner[0] += this.relativePadding.x;
              topLeftCorner[1] += this.relativePadding.y;

              return topLeftCorner;
            },

            getPageSizeInTextureSpace: function () {
              var space = [
                this.usablePageSize / this.size.x,
                this.usablePageSize / this.size.y];

              return space;
            },

            releasePage: function (id) {
              // if possible, move page to the free list
              if (undefined !== this.cachedPages[id]) {
                var slot = this.cachedPages[id];
                this.freeSlots[slot] = true;
              }
            },

            getPageMipLevel: function (id) {
              if (this.slots[id] === undefined) {
                console.error("page on slot " + id + " is undefined");
              }

              return this.slots[id].mipLevel;
            },

            onPageDropped: function (id) {
              if (this.pageDroppedCallback) {
                this.pageDroppedCallback(
                    PageID.getPageNumber(id),
                    PageID.getMipMapLevel(id)
                );
              }
            },

            getPageStatus: function (id) {
              if (!this.cachedPages[id]) {
                return Status.StatusNotAvailable;
              }

              if (!this.slots[this.cachedPages[id]].valid) {
                return Status.StatusNotAvailable;
              }

              if (true === this.freeSlots[this.cachedPages[id]]) {
                return Status.StatusPendingDelete;
              }

              return Status.StatusAvailable;
            },

            restorePage: function (id) {
                    try {
                      if (!this.cachedPages[id]) {
                        return {
                          wasRestored: false,
                          id: -1
                        };
                      }

                      if (this.slots[this.cachedPages[id]].pageId !== parseInt(id, 10)) {
                        console.error("ErrorOnId");
                      }

                      this.freeSlots[this.cachedPages[id]] = false;

                      return {
                        wasRestored: true,
                        id: this.cachedPages[id]
                      };
                    } catch (e) {
                      console.log(e.stack);
                    }
            },

            getStatus: function (slotsUsed, slotsMarkedFree, slotsEmpty) {
                    var i;
                    slotsUsed = slotsMarkedFree = slotsEmpty = 0;

                    for (i = 0; i < this.slots.length; ++i) {
                      if (true === this.slots[i].valid) {
                        ++slotsUsed;
                      } else {
                        ++slotsMarkedFree;
                      }
                    }

                    for (i = 0; i < this.freeSlots.length; ++i) {
                      if (true === this.freeSlots[i]) {
                        ++slotsEmpty;
                      }
                    }

                    return {
                      used: slotsUsed,
                      markedFree: slotsMarkedFree,
                      free: slotsEmpty
                    };
                  }
  };

  Cache.prototype.clear = function () {
    this.cachedPages = {};
    this.freeSlots = [];

    var i;

    for (i = 0; i < this.tileCount; ++i) {
      this.slots[i].valid = false;
      this.freeSlots[i] = true;
    }
  };

  Cache.prototype.freeSlot = function () {
    // find one slot and free it
    // this function gets called when no slots are free
    try {
      var i, page, minMipLevel = Number.MAX_VALUE;

      for (i = 0; i < this.tileCount; ++i) {
        if ((false === this.slots[i].forced) && (this.slots[i].mipLevel < minMipLevel)) {
          minMipLevel = this.slots[i].mipLevel;
          page = i;
        }
      }

      if ((undefined === page) || (true === this.slots[page].forced)) {
        console.error("FreeSlotNotFound");
      }

      this.freeSlots[page] = true;
    } catch (e) {
      console.log(e.stack);
    }
  };

  Cache.prototype.hasFreeSlot = function () {
    var i;
    for (i = 0; i < this.freeSlots.length; ++i) {
      if (true === this.freeSlots[i]) {
        return true;
      }
    }

    return false;
  };

  Cache.prototype.reset = function () {
    try {
      //TODO: replace 4 by real mipmap  
      var id = PageID.create(0, 4);
      var tile = new Tile(id);

      this.cachePage(tile, true);

    } catch (e) {
      console.log(e.stack);
    }
  };

  Cache.prototype.drawToTexture = function (tile, x, y) {
    // update cache texture 
    var i;
    if (tile.loaded) {
      var gl = this.context;

      gl.bindTexture(gl.TEXTURE_2D, this.textures.tDiffuse.__webglTexture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, gl.RGBA, gl.UNSIGNED_BYTE, tile.image);

    } else {

      for (i = 0; i < tile.image.length; ++i) {
        console.error('Tile ' + tile.image.src + ' was not available yet.');
      }
    }
  };

  Cache.prototype.writeToCache = function (id, forced) {
    // try to restore
    if (this.restorePage(id).wasRestored) {
      return this.cachedPages[id];
    }

    // get the next free page
    var page = this.getNextFreeSlot();
    this.cachedPages[id] = page;

    if (this.slots[page].valid) {
      this.onPageDropped(this.slots[page].pageId);
      // remove it now, (otherwise handles leak)
      delete this.cachedPages[this.slots[page].pageId];
      //this.cachedPages[this.slots[page].pageId] = undefined;
    }

    // update slot
    this.slots[page].forced   = forced;
    this.slots[page].mipLevel = PageID.getMipMapLevel(id);
    this.slots[page].pageId   = id;
    this.slots[page].valid    = true;

    return page;
  };

  Cache.prototype.cachePage = function (tile, forced) {
    try {
      var id = tile.id;
      var page = this.writeToCache(id, forced);

      // compute x,y coordinate
      var x = parseInt((page % this.tileCountPerSide.x) * this.realTileSize.x, 10);
      var y = parseInt(Math.floor((page / this.tileCountPerSide.y)) * this.realTileSize.y, 10);

      this.drawToTexture(tile, x, y);

      return page;
    } catch (e) {
      console.log(e.stack);
    }
  };


   return Cache;
     
 });
 
