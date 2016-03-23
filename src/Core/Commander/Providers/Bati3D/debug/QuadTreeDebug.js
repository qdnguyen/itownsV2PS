/**
 * service interface using for debug MT
 */

define([
        './defineProperties'
    ], function(
        defineProperties) {

        var QuadTreeDebug = function(options) {
            
		if (options === undefined) {
			throw new DeveloperError('description is required.');
		}
                
                this._url       = options.url; 
		this._name      = options.service || "WMTS";
              
                
                this._enabled         = options.enable || true;
                this._maxMipMapLevel  = options.maxMipMapLevel || 4;
                this._tileSize        = options.tileSize || 128;
                this._tilePadding     = options.tilePadding || 4;
                this._cacheSize       = options.cacheSize || 2048;


	};
        
        //TODO: to develope, this function must be replace getTilePath
	QuadTreeDebug.prototype.requestTileGeometry = function(x, y,level) {
	};
        
        QuadTreeDebug.prototype.getTilePath = function(tile) {
                return (4 - tile.mipMapLevel) + '-' + tile.pageNumber + ".jpg";
        };
        
       
        
	/**
	 * Gets the maximum geometric error allowed in a tile at a given level.
	 * 
	 * @memberof IgnWMSServerTerrainProvider
	 * 
	 * @param {Number}
	 *            level The tile level for which to get the maximum geometric
	 *            error.
	 * @returns {Number} The maximum geometric error.
	 */
	QuadTreeDebug.prototype.getLevelMaximumGeometricError = function(level) {
		return this._parserHelper.levelZeroMaximumGeometricError/ (1 << level);
	};

        defineProperties(QuadTreeDebug.prototype, {    
		
                url : {
                        get : function(){
                            return this._url;
                        },
                        set : function(value){
                            this._url = value;
                        }
                },
                name : {
                        get : function(){
                            return this._name;
                        }
                },
                
                key : {
                        get : function(){
                            return this._key;
                        }
                },
                layer : {
                        get : function(){
                            return this._layer;
                        }
                },
                enabled : {
                        get : function(){
                            return this._enabled;
                        },
                        set : function(value){
                            this._enabled = value;
                        }
                },
                maxMipMapLevel : {
                        get : function(){
                            return this._maxMipMapLevel;
                        }
                },
                
                tileSize : {
                        get : function(){
                            return this._tileSize;
                        }
                },
                tilePadding : {
                        get : function(){
                            return this._tilePadding;
                        }
                },
                cacheSize : {
                        get : function(){
                            return this._cacheSize;
                        }
                },        
                /**
		 * Gets an event that is raised when the terrain provider encounters an
		 * asynchronous error. By subscribing to the event, you will be notified
		 * of the error and can potentially recover from it. Event listeners are
		 * passed an instance of {@link TileProviderError}.
		 * 
		 * @memberof IgnWMSServerTerrainProvider.prototype
		 * @type {Event}
		 */
		errorEvent : {
			get : function() {
				return this._errorEvent;
			}                        
		},

		/**
		 * Gets a value indicating whether or not the provider includes a water
		 * mask. The water mask indicates which areas of the globe are water rather
		 * than land, so they can be rendered as a reflective surface with animated
		 * waves.
		 * 
		 * @memberof IgnWMSServerTerrainProvider
		 * 
		 * @returns {Boolean} True if the provider has a water mask; otherwise,
		 *          false.
		 */
		hasWaterMask:{
			get : function() {
				return this._parserHelper.waterMask;
			}
		}, 


		/**
		 * Gets the tiling scheme used by this provider. This function should
		 * not be called before {@link IgnWMSServerTerrainProvider#ready} returns
		 * true.
		 * 
		 * @memberof IgnWMSServerTerrainProvider.prototype
		 * @type {GeographicTilingScheme}
		 */
		tilingScheme : {
			get : function() {
				return this._parserHelper.tilingScheme;
			}
		},

		/**
		 * Gets a value indicating whether or not the provider is ready for use.
		 * 
		 * @memberof IgnWMSServerTerrainProvider.prototype
		 * @type {Boolean}
		 */
		ready : {
			get : function() {
				return this._parserHelper._ready;
			}
		},
		/**
                * Gets a value indicating whether or not the requested tiles includes vertex normals.
                * @type {Boolean}
                */
                hasVertexNormals : {
                    get : function() {
                        return false;
                    }
                }
	});
    
        
        QuadTreeDebug.prototype.getTileDataAvailable = function(x, y, level) {
            return undefined;
        };

    
        return QuadTreeDebug; 
    
    
});