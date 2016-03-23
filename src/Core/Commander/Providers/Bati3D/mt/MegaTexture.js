define(['THREE',
        'debug/DeveloperError',
        './TileDetermination',
        './TileQueue',
        './Tile',
        './IndirectionTable',
        './PageID',
        './Cache',
        './UsageTable',
        './Status',
        './MTShader'],
function(THREE,
        DeveloperError,
        TileDetermination, 
        TileQueue,
        Tile,
        IndirectionTable,
        PageID,
        Cache,
        UsageTable,
        Status, 
        MTShader){


     var MegaTexture = function (id, options) {
            if (!options) {
                    throw new DeveloperError('options is not defined. MegaTexture cannot start');
                return;
            }
            this.id = id;
            this.url            = options.services.url;
            this.maxMipMapLevel = options.services.maxMipMapLevel;
            this.tileSize       = options.services.tileSize;
            this.tilePadding    = options.services.tilePadding;
            this.cacheSize      = options.services.cacheSize;
            this.context        = options.context;

            // init tile queue
            this.tileQueue = new TileQueue(2, options.services, id);
            
            this.tileQueue.getTilePath = options.services.getTilePath;

            var lengthPerSide = 1 << Math.log(this.tileSize) / Math.log(2) + this.maxMipMapLevel;
            this.size = lengthPerSide;

            console.log('Mega Texture: width: ' + this.size + ' height: ' + this.size);

            this.tileCount = {
                x: this.size / this.tileSize,
                y: this.size / this.tileSize
            };

            // objects
            this.tileDetermination = null;
            //pageable table
            this.indirectionTable = null;
            this.cache = null;
            this.usageTable = null;
            this.needsUpdate = false;
            this.init();
    };
    
    MegaTexture.prototype = {
            render: function (renderer, camera) {
                renderer.render(this.tileDetermination.scene, camera, this.tileDetermination.renderTarget, false);
                //this.needsUpdate = true;
                this.update();
            },

            init: function () {

                //init tile determination program, set true to active Texture float 32
                this.tileDetermination = new TileDetermination(window.innerWidth, window.innerHeight, false);

                // init page table
                var cacheSize = this.size / this.tileSize;
                this.indirectionTable = new IndirectionTable(
                        this.context,
                        cacheSize
                );
                console.log("Indirection table size: " + cacheSize);

                // init page cache
                this.cache = new Cache(
                      this.context,
                      this.tileSize,        // pageSizeRoot,
                      this.tilePadding,     // padding, 
                      this.cacheSize,
                      this.cacheSize        // cacheSizeRoot
                );

                var scope = this;
                this.cache.pageDroppedCallback = function (page, mipLevel) {
                      var handle = scope.indirectionTable.getElementAt(page, mipLevel).value;
                      scope.indirectionTable.set(page, mipLevel, -1);
                      scope.indirectionTable.setChildren(page, mipLevel, -1, handle);
                };

                // init usage table
                this.usageTable = new UsageTable(this.indirectionTable.size);

                this.tileQueue.callback = function (tile) {

                    var status = scope.cache.getPageStatus(tile.parentId);
                    var tileAlreadyOnCache = (Status.StatusAvailable === status);

                    if (!tileAlreadyOnCache) {

                        var handle      = scope.cache.cachePage(tile, false);
                        var pageNumber  = PageID.getPageNumber(tile.id);
                        var mipMapLevel = PageID.getMipMapLevel(tile.id);

                        scope.indirectionTable.set(pageNumber, mipMapLevel, handle);
                        //++boundPages;
                    }

                     scope.needsUpdate = true;
                    //++erasedCount;
                };

                this.resetCache();

                // init debug helpers
                this.tileDetermination.debug();
                this.indirectionTable.debug();

                this.needsUpdate = true;
            },

            resetCache: function () {
                // delete all entries in cache and set all slots as free
                this.cache.clear();

                // set all slots in page table as -1 (invalid)
                this.indirectionTable.clear(-1);

                var pageId = PageID.create(0, this.indirectionTable.maxLevel);
                var tile   = new Tile(pageId, Number.MAX_VALUE);
                this.tileQueue.push(tile);
            },

            update: function () {

                // parse render target pixels (mip map levels and visible tile)
                this.tileDetermination.parseImage(this.context, this.usageTable);

                //console.log(this.cache)
                var element, level, isUsed;
                var releasedPagesCount = 0;
                var restoredPagesCount = 0;
                var alreadyCachedPagesCount = 0;
                var tilesRequestedCount = 0;

                for (element in this.cache.cachedPages) {
                  if (this.cache.cachedPages.hasOwnProperty(element)) {
                    element = parseInt(element, 10);

                    level = PageID.getMipMapLevel(element);
                    isUsed = this.usageTable.isUsed(element);

                    if ((!isUsed) && (level < this.maxMipMapLevel)) {
                      this.cache.releasePage(element);
                      ++releasedPagesCount;
                    }
                  }
                }

                var i, x, y, restored, wasRestored, pageId, pageNumber, mipMapLevel, elementCountAtLevel, status,
                    useProgressiveLoading, maxParentMipMapLevel, newNumber, newPageId, newPageStatus, tmpId, hits, tile;

                // find the items which are not cached yet
                for (pageId in this.usageTable.table) {
                     if (this.usageTable.table.hasOwnProperty(pageId)) {
                         wasRestored = false;

                         pageId = parseInt(pageId, 10);
                         pageNumber  = PageID.getPageNumber(pageId);
                         mipMapLevel = PageID.getMipMapLevel(pageId);
                         elementCountAtLevel = this.indirectionTable.getElementCountAtLevel(mipMapLevel);

                        if (pageNumber >= elementCountAtLevel) {
                            // FIXME: Pending bug
                            console.error('Out of bounds error:\npageNumber: ' + pageNumber + "\nmipMapLevel: " + mipMapLevel);
                            continue;
                        }

                        status = this.cache.getPageStatus(pageId);

                        // if page is already cached, continue
                        if (Status.StatusAvailable === status) {
                            ++alreadyCachedPagesCount;

                        } else if (Status.StatusPendingDelete === status) {
                            // if page is pending delete, try to restore it
                            restored = this.cache.restorePage(pageId);
                            if (restored.wasRestored) {
                              this.indirectionTable.set(pageNumber, mipMapLevel, restored.id);

                              wasRestored = true;
                              ++restoredPagesCount;
                            }
                        }

                        if ((Status.StatusAvailable !== status) && !wasRestored) {

                        useProgressiveLoading = true;
                        maxParentMipMapLevel = useProgressiveLoading ? this.indirectionTable.maxLevel : (mipMapLevel + 1);

                        // request the page and all parents
                        for (i = mipMapLevel; i < maxParentMipMapLevel; ++i) {
                                 x = pageNumber % this.indirectionTable.getLevelWidth(mipMapLevel);
                                 y = Math.floor(pageNumber / this.indirectionTable.getLevelHeight(mipMapLevel));

                                 x >>= (i - mipMapLevel);
                                 y >>= (i - mipMapLevel);

                                 newNumber = y * this.indirectionTable.getLevelWidth(i) + x;
                                 newPageId = PageID.create(newNumber, i);

                                newPageStatus = this.cache.getPageStatus(newPageId);

                                // FIXME: should try to restore page?
                                //restored = this.cache.restorePage(newPageId);
                                //if ((StatusAvailable !== newPageStatus) && !restored.wasRestored) {
                                if ((Status.StatusAvailable !== newPageStatus)) {
                                  if (!this.tileQueue.contains(newPageId)) {
                                    tmpId = ((newPageId !== pageId) ? pageId : PageID.createInvalid());
                                    hits = this.usageTable.table[pageId].hits;
                                    tile = new Tile(newPageId, hits, tmpId);

                                    this.tileQueue.push(tile);
                                    ++tilesRequestedCount;
                                  }
                                }
                        } // for (var i = mipMapLevel; i < maxParentMipMapLevel; ++i) {
                    }
                    }
                } // for (var pageId in this.sparseTable.table) {

                var cacheStatusData = this.cache.getStatus(0, 0, 0);
                /*    
                console.log('# Released Pages: ' + releasedPagesCount + '\n' +
                  '# Restored Pages: ' + restoredPagesCount + '\n' +
                  '# Already Cached Pages: ' + alreadyCachedPagesCount + '\n' +
                  '# Tiles Requested: ' + tilesRequestedCount);

                console.log("EntryCount:\t"   + this.usageTable.entryCount +
                      "\nUsed:\t\t"   + cacheStatusData.used +
                      "\nFree:\t\t"   + cacheStatusData.free +
                      "\nMarkedFree:\t"   + cacheStatusData.markedFree);
                */      
                this.indirectionTable.update(this.cache);
                this.usageTable.clear();
            },
    
            detectTilesVisible : function (geometry, megaTexture) {

                    var shader = MTShader.computeVisibleTiles;
                    var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

                    uniforms.fMegaTextureSize.value = {
                            x: megaTexture.size,
                            y: megaTexture.size
                    };

                    uniforms.fMaximumMipMapLevel.value = megaTexture.maxMipMapLevel;
                    uniforms.fTileCount.value = megaTexture.tileCount;

                    var parameters = {
                        uniforms: uniforms,
                        fragmentShader: shader.fragmentShader,
                        vertexShader: shader.vertexShader,
                        //side: THREE.DoubleSide
                    };

                    var materialMT = new THREE.ShaderMaterial(parameters);
                    var meshMT = new THREE.Mesh(geometry, materialMT);
                    //add globe to second scene to compute mipmap
                    megaTexture.tileDetermination.scene.add(meshMT);
            },

            createMegaTextureMaterial : function (megaTexture) {
                    var type;
                    var shader   = MTShader.renderMT;
                    var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

                    for (type in megaTexture.cache.textures) {
                        if (megaTexture.cache.textures.hasOwnProperty(type)) {
                          uniforms[type].value = megaTexture.cache.textures[type];
                        }
                    }

                    var pageSizeInTextureSpaceXY = {
                        x: megaTexture.cache.usablePageSize / megaTexture.cache.size.x,
                        y: megaTexture.cache.usablePageSize / megaTexture.cache.size.y
                    };

                    // init values
                    uniforms.tCacheIndirection.value = megaTexture.indirectionTable.texture;
                    uniforms.vCachePageSize.value = pageSizeInTextureSpaceXY;
                    uniforms.vCacheSize.value = { x: megaTexture.cache.width, y: megaTexture.cache.height };

                    uniforms.vTextureSize.value = megaTexture.size;
                    uniforms.fMaxMipMapLevel.value = megaTexture.maxMipMapLevel;

                    uniforms.uNormalScale.value = { x: 1.0, y: 1.0 };
                    uniforms.enableDiffuse.value = true;
                    uniforms.enableSpecular.value = true;

                    var parameters = {
                        defines: { 'MEGA_TEXTURE': true },
                        uniforms: uniforms,
                        fragmentShader: shader.fragmentShader,
                        vertexShader: shader.vertexShader,
                        //side: THREE.DoubleSide,
                        lights: true,
                        wireframe : false
                    };

                    return new THREE.ShaderMaterial(parameters);
            }
    
    };

    return MegaTexture;
    
});

 

 

