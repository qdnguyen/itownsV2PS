define(function(){
       
        var MTShader = {};
        
        MTShader.computeVisibleTiles = {
                                uniforms: {
                                                "fMegaTextureSize":     { type: "v2", value: null },
                                                "fMaximumMipMapLevel":  { type: "f", value: 0.0 },
                                                "fTileCount":           { type: "v2", value: null }
                                          },
                                vertexShader : [
                                            "varying vec2 vUv;",
                                            "varying vec3 vViewPosition;",
                                            "void main() {",
                                                "vec4 mvPosition = (modelViewMatrix * vec4( position, 1.0 ));",
                                                "vUv = vec2(uv.x, 1.0 - uv.y);",
                                                //"vUv = vec2(clamp(uv.x, 0.0, 0.5),clamp(1.0 - uv.y, 0.0, 0.5));", 
                                                "gl_Position = projectionMatrix * mvPosition;",
                                            "}"
                                ].join('\n'),          
                                fragmentShader: [
                                            "#extension GL_OES_standard_derivatives : enable",
                                            "#extension GL_OES_texture_float_linear : enable",

                                            "uniform vec2 fMegaTextureSize;",
                                            "uniform float fMaximumMipMapLevel;",
                                            "uniform vec2 fTileCount;",

                                            "varying vec2 vUv;",

                                            "float MipLevel(vec2 uv, vec2 size)",
                                            "{",        
                                                  "vec2 coordPixels = uv * size;",

                                                  "vec2 dx = dFdx(coordPixels);",
                                                  "vec2 dy = dFdy(coordPixels);",

                                                  "float d = max(dot( dx, dx ), dot( dy, dy ) );",
                                                  "return max( 0.5 * log2( d ) - 1.0, 0.0 );",
                                            "}",
                                            "float mip_map_level(vec2 texture_coordinate)",
                                            "{",
                                                 // The OpenGL Graphics System: A Specification 4.2
                                                 // chapter 3.9.11, equation 3.21
                                                 "vec2  dx_vtc        = dFdx(texture_coordinate);",
                                                 "vec2  dy_vtc        = dFdy(texture_coordinate);",
                                                 "float delta_max_sqr = max(dot(dx_vtc, dx_vtc), dot(dy_vtc, dy_vtc));",
                                                 //"return max(0.0, 0.5 * log2(delta_max_sqr) - 1.0);", // == log2(sqrt(delta_max_sqr));
                                                 "return 0.5 * log2(delta_max_sqr); // == log2(sqrt(delta_max_sqr));",
                                            "}",
                                            "void main()",
                                            "{",
                                                        "float mipLevel  = floor( MipLevel( vUv, fMegaTextureSize ));",
                                                        //"float mipLevel  = floor( mip_map_level( vUv));",
                                                        "mipLevel = clamp(mipLevel, 0.0,  fMaximumMipMapLevel);", 

                                                        "vec4 result;", 
                                                        "result.rg = floor( vUv.xy * fTileCount / exp2(mipLevel));", //x,y ==> pageId
                                                        "result.b = mipLevel;",
                                                        "result.a = 255.0;",
                                                        "gl_FragColor = result/255.0;",
                                            "}"
                                ].join("\n") 
        };
    
        MTShader.renderMT = {
                                uniforms: {
                                             "bMegaTextureDebugUvs" : { type: "i", value: 0 },
                                             "bMegaTextureDebugDiscontinuities" : { type: "i", value: 0 },
                                             "bMegaTextureDebugMipMapLevel" : { type: "i", value: 0 },

                                             // page cache settings
                                             "vCachePageSize" : { type: "v2", value: null },
                                             "vCacheSize" : { type: "v2", value: null },

                                             "vTextureSize" : { type: "v2", value : null },
                                             "fMaxMipMapLevel" : { type: "f", value: 0.0 },

                                             "tCacheIndirection" : {type: "t", value: null},
                                             
                                             "tDiffuse"     : { type: "t", value: null },
                                             "tNormal"    : { type: "t", value: null },
                                             "tSpecular"    : { type: "t", value: null },

                                             // light variables (from THREE)   
                                             ambientLightColor : { type: "fv", value: [] },

                                             directionalLightDirection : { type: "fv", value: [] },
                                             directionalLightColor : { type: "fv", value: [] },

                                             hemisphereLightDirection : { type: "fv", value: [] },
                                             hemisphereLightSkyColor : { type: "fv", value: [] },
                                             hemisphereLightGroundColor : { type: "fv", value: [] },

                                             pointLightColor : { type: "fv", value: [] },
                                             pointLightPosition : { type: "fv", value: [] },
                                             pointLightDistance : { type: "fv1", value: [] },

                                             spotLightColor : { type: "fv", value: [] },
                                             spotLightPosition : { type: "fv", value: [] },
                                             spotLightDirection : { type: "fv", value: [] },
                                             spotLightDistance : { type: "fv1", value: [] },
                                             spotLightAngleCos : { type: "fv1", value: [] },
                                             spotLightExponent : { type: "fv1", value: [] },       

                                             //
                                             enableDiffuse : { type: 'i', value: 0 },
                                             enableSpecular : { type: 'i', value: 0 },
                                             uNormalScale : { type: 'f', value: 1},

                                             //
                                             uDiffuseColor : { type: 'c', value: {r:1,g:1,b:1} },
                                             uSpecularColor : { type: 'c', value: {r:1,g:1,b:1} },
                                             uAmbientColor : { type: 'c', value: {r:1,g:1,b:1} },

                                             //
                                             uShininess : { type: 'f', value: 30.0 },
                                             uOpacity : { type: 'f', value: 1.0 },
                                             uOffset : { type: 'v2', value: {x:0,y:0} },
                                             uRepeat : { type: 'v2', value: {x:1,y:1} }
                                    
                                },
                                vertexShader : [
                                              "attribute vec4 tangent;",

                                              "uniform vec2 uOffset;",
                                              "uniform vec2 uRepeat;",

                                              "varying vec3 vTangent;",
                                              "varying vec3 vBinormal;",
                                              "varying vec3 vNormal;",
                                              "varying vec2 vUv;",

                                              "uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
                                              "uniform float pointLightDistance[ MAX_POINT_LIGHTS ];",

                                              "varying vec4 vPointLight[ MAX_POINT_LIGHTS ];",
                                              "varying vec3 vViewPosition;",

                                              "void main() {",

                                                    "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                                                    "vViewPosition = -mvPosition.xyz;",

                                                    // normal, tangent and binormal vectors
                                                    "vNormal = normalMatrix * (normal);",
                                                    "vTangent = normalMatrix * (tangent.xyz+0.000001);",
                                                    "vBinormal = cross( vNormal, vTangent ) * tangent.w;",

                                                    "vUv = uv * uRepeat + uOffset;",

                                                    // point lights
                                                    "for( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {",

                                                            "vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",
                                                            "vec3 lVector = lPosition.xyz - mvPosition.xyz;",

                                                            "float lDistance = 1.0;",
                                                            "if ( pointLightDistance[ i ] > 0.0 )",
                                                                  "lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );",

                                                            "lVector = normalize( lVector );",

                                                            "vPointLight[ i ] = vec4( lVector, lDistance );", 

                                                    "}",
                                                    
                                                    "gl_Position = projectionMatrix * mvPosition;",       
                                                "}"
                                    
                                ].join('\n'),
                                fragmentShader : [
                                                "#ifdef MEGA_TEXTURE",
                                                    "#extension GL_OES_standard_derivatives : enable",
                                                "#endif",

                                                "uniform sampler2D tCacheIndirection;",

                                                "uniform vec2 vCachePageSize;",
                                                "uniform vec2 vCacheSize;",
                                                "uniform vec2 vTextureSize;",

                                                "uniform float fMaxMipMapLevel;",

                                                "uniform bool bMegaTextureDebugUvs;",
                                                "uniform bool bMegaTextureDebugDiscontinuities;",
                                                "uniform bool bMegaTextureDebugMipMapLevel;",

                                                "vec2 computeUvCoords( vec2 vUv ) {",
                                                        "vec2 UvCoords;",

                                                        "vec3 pageData = texture2D( tCacheIndirection, vUv ).xyz;",
                                                        "float mipExp = exp2(pageData.z);",
                                                        "vec2 inPageOffset = fract(vUv * mipExp) * (vCachePageSize);",
                                                        "UvCoords.xy = vec2(pageData.xy + inPageOffset.xy);",

                                                        "return UvCoords;",
                                                "}",        
                                                "uniform sampler2D tDiffuse;",
                                                "uniform sampler2D tNormal;",
                                                "uniform sampler2D tSpecular;",

                                                "uniform vec3 uAmbientColor;",
                                                "uniform vec3 uDiffuseColor;",
                                                "uniform vec3 uSpecularColor;",
                                                "uniform float uShininess;",
                                                "uniform float uOpacity;",

                                                "uniform bool enableDiffuse;",
                                                "uniform bool enableSpecular;",
                                                "uniform float uNormalScale;",

                                                "varying vec3 vTangent;",
                                                "varying vec3 vBinormal;",
                                                "varying vec3 vNormal;",
                                                "varying vec2 vUv;",

                                                "uniform vec3 ambientLightColor;",

                                                "uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];",
                                                
                                                "varying vec4 vPointLight[ MAX_POINT_LIGHTS ];",
                                                "varying vec3 vViewPosition;",
  
                                                "void main() ",
                                                "{",
                                                        "vec4 diffuseMap  = texture2D(tDiffuse, vUv);",
                                                        "vec4 normalMap   = texture2D(tNormal, vUv);",
                                                        "vec4 specularMap = texture2D(tSpecular, vUv);",

                                                        "#ifdef MEGA_TEXTURE",
                                                                "vec2 UvCoords = computeUvCoords( vUv );",

                                                                "diffuseMap    = texture2D(tDiffuse, UvCoords);",
                                                                "normalMap     = texture2D(tNormal, UvCoords);",
                                                                "specularMap   = texture2D(tSpecular, UvCoords);",
                                                        "#endif",

                                                        "gl_FragColor = vec4( vec3( 1.0 ), uOpacity );",
                                                        "gl_FragColor = gl_FragColor * diffuseMap * diffuseMap;",

                                                        "vec3 specularTex = vec3( 1.0 );",
                                                        "vec3 normalTex = normalMap.xyz * 2.0 - 1.0;",
                                                        "normalTex = normalize( normalTex );",

                                                        "specularTex = specularMap.xyz;",

                                                        "mat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );",
                                                        "vec3 finalNormal = tsb * normalTex;",
                                                        "vec3 normal = normalize( finalNormal );",
                                                        "vec3 viewPosition = normalize( vViewPosition );",

                                                        // point lights

                                                        "vec3 pointDiffuse = vec3( 0.0 );",
                                                        "vec3 pointSpecular = vec3( 0.0 );",

                                                        "for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {",

                                                                "vec3 pointVector = normalize( vPointLight[ i ].xyz );",
                                                                "float pointDistance = vPointLight[ i ].w;",

                                                                // diffuse
                                                                "float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",
                                                                "pointDiffuse += pointDistance * pointLightColor[ i ] * uDiffuseColor * pointDiffuseWeight;",

                                                                // specular
                                                                "vec3 pointHalfVector = normalize( pointVector + viewPosition );",
                                                                "float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
                                                                "float pointSpecularWeight = specularTex.r * max( pow( pointDotNormalHalf, uShininess ), 0.0 );",
      
                                                                // 2.0 => 2.0001 is hack to work around ANGLE bug
                                                                "float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

                                                                "vec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( pointVector, pointHalfVector ), 5.0 );",
                                                                "pointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * pointDistance * specularNormalization;",
                                                        "}",

                                                        // all lights contribution summation
                                                        "vec3 totalDiffuse = vec3( 0.0 );",
                                                        "vec3 totalSpecular = vec3( 0.0 );",

                                                        "totalDiffuse += pointDiffuse;",
                                                        "totalSpecular += pointSpecular;",

                                                        "gl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor) + totalSpecular;",
                                                        "gl_FragColor.xyz = sqrt( gl_FragColor.xyz );",
                                                "}"
                                ].join("\n") 
        };
    
    return MTShader;
    
});

