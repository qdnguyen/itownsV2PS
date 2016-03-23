#ifdef USE_LOGDEPTHBUF

	uniform float logDepthBufFC;

	#ifdef USE_LOGDEPTHBUF_EXT

		//#extension GL_EXT_frag_depth : enable
		varying float vFragDepth;

	#endif

#endif

uniform vec3 lightPosition;
varying vec3 vPosition;
varying vec3 vNormal;
 
void main() {
 
    #if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)

	gl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;

    #endif

    vec3 lightDirection = normalize(lightPosition.xyz -  vPosition.xyz);
    
    // simpliest hardcoded lighting ^^
    
    float c = 0.35 + max(0.0, dot(vNormal, lightDirection)) * 0.4;
    
    gl_FragColor = vec4(c, c, c, 1.0);
 }