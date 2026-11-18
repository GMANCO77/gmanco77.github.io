"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[744],{4744:(e,t,o)=>{o.r(t),o.d(t,{default:()=>s});var r=o(5155),a=o(2115);let n=`#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,i=`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uFlow;
uniform float uHue;
uniform float uScale;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uBandHeight;
uniform float uBandSpread;
uniform float uOctaveDecay;
uniform float uLayerOffset;
uniform vec2 uShift;
uniform vec4 uCursor;
uniform vec4 uPulses[4];
uniform float uSpectrum;
uniform float uTilt;
uniform vec3 uIntro;
uniform float uLightMode;
uniform float uOpacity;
out vec4 fragColor;

#define TAU 6.28318

vec3 gradientHash(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 234.6)),
    dot(p, vec3(269.5, 183.3, 198.3)),
    dot(p, vec3(169.5, 283.3, 156.9))
  );
  vec3 h = fract(sin(p) * 43758.5453123);
  float phi = acos(2.0 * h.x - 1.0);
  float theta = TAU * h.y;
  return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));
}

float quinticSmooth(float t) {
  float t2 = t * t;
  float t3 = t * t2;
  return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;
}

vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

float perlin3D(float amplitude, float frequency, float px, float py, float pz) {
  float x = px * frequency;
  float y = py * frequency;

  float fx = floor(x);
  float fy = floor(y);
  float fz = floor(pz);
  float cx = ceil(x);
  float cy = ceil(y);
  float cz = ceil(pz);

  vec3 g000 = gradientHash(vec3(fx, fy, fz));
  vec3 g100 = gradientHash(vec3(cx, fy, fz));
  vec3 g010 = gradientHash(vec3(fx, cy, fz));
  vec3 g110 = gradientHash(vec3(cx, cy, fz));
  vec3 g001 = gradientHash(vec3(fx, fy, cz));
  vec3 g101 = gradientHash(vec3(cx, fy, cz));
  vec3 g011 = gradientHash(vec3(fx, cy, cz));
  vec3 g111 = gradientHash(vec3(cx, cy, cz));

  float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));
  float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));
  float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));
  float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));
  float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));
  float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));
  float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));
  float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));

  float sx = quinticSmooth(x - fx);
  float sy = quinticSmooth(y - fy);
  float sz = quinticSmooth(pz - fz);

  float lx00 = mix(d000, d100, sx);
  float lx10 = mix(d010, d110, sx);
  float lx01 = mix(d001, d101, sx);
  float lx11 = mix(d011, d111, sx);

  float ly0 = mix(lx00, lx10, sy);
  float ly1 = mix(lx01, lx11, sy);

  return amplitude * mix(ly0, ly1, sz);
}

float auroraGlow(float t, vec2 uv, float bend) {
  float noiseVal = 0.0;
  float freq = uNoiseFreq;
  float amp = uNoiseAmp;
  vec2 samplePos = uv * uScale;

  for (float i = 0.0; i < 3.0; i += 1.0) {
    noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);
    amp *= uOctaveDecay;
    freq *= 2.0;
  }

  float yBand = uv.y * 10.0 - (uBandHeight + bend) * 10.0;
  return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * uIntro.y * abs(noiseVal * uIntro.z + yBand))), 0.0);
}

vec2 turn(vec2 p, vec2 center) {
  float c = cos(uTilt);
  float s = sin(uTilt);
  vec2 d = p - center;
  return center + vec2(c * d.x - s * d.y, s * d.x + c * d.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 center = vec2(0.5 * uResolution.x / uResolution.y, 0.5);
  vec2 screen = turn(gl_FragCoord.xy / uResolution.y, center);
  vec2 cursor = turn(uCursor.xy, center);
  vec2 field = screen + uShift;
  float t = 0.4 * uFlow;

  float reach = exp(-pow((screen.x - cursor.x) / 0.32, 2.0)) * uCursor.z;
  float gap = cursor.y + uShift.y - uBandHeight;
  float near = exp(-gap * gap / 0.16);
  float bend = reach * gap * near * 0.55;

  float pulse = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 wave = uPulses[i];
    if (wave.z <= 0.0) continue;
    float x = (abs(screen.x - turn(wave.xy, center).x) - wave.w * 0.55) / (0.1 + wave.w * 0.06);
    pulse += wave.z * exp(-x * x);
  }
  float boost = (1.0 + reach * near * 0.25 + pulse * 0.65) * uIntro.x;

  float glow1 = auroraGlow(t, field, bend) * boost;
  float glow2 = auroraGlow(t + uLayerOffset, field, bend) * boost;
  vec3 gradient1 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.2, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)), uSpectrum);
  vec3 gradient2 = mix(vec3(1.0), cosineGradient(uv.x + uHue * 0.1, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)), uSpectrum);

  vec3 col = 0.99 * glow1 * gradient1 * uColor1;
  col += 0.99 * glow2 * gradient2 * uColor2;
  col *= uBrightness;

  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  if (uLightMode > 0.5) {
    float energy = max(col.r, max(col.g, col.b));
    vec3 hue = clamp(col / max(energy, 1e-4), 0.0, 1.0);
    vec3 average = (glow1 * uColor1 + glow2 * uColor2) / max(glow1 + glow2, 1e-4);
    float top = max(average.r, max(average.g, average.b));
    float spread = top - min(average.r, min(average.g, average.b));
    float core = smoothstep(0.55, 1.6, energy);
    float depth = 1.25 + 0.45 * core;
    vec3 tint = mix(average * 0.82, pow(average / max(top, 1e-4), vec3(depth + 0.6)), smoothstep(0.04, 0.2, spread));
    float vivid = smoothstep(0.12, 0.55, 1.0 - min(hue.r, min(hue.g, hue.b))) * smoothstep(0.04, 0.2, spread);
    vec3 ink = mix(tint, pow(hue, vec3(depth)), vivid) * mix(0.93, 0.8, core);
    float density = 0.88 * (1.0 - exp(-1.9 * pow(energy, 1.7)));
    density = clamp(density * uOpacity + grain, 0.0, 1.0);
    fragColor = vec4(ink * density, density);
  } else {
    float alpha = clamp(length(col), 0.0, 1.0);
    vec3 color = clamp(col, 0.0, 1.0);
    fragColor = vec4(clamp(color * alpha + grain, 0.0, alpha) * uOpacity, alpha * uOpacity);
  }
}`,l=(e,t,o)=>Math.min(o,Math.max(t,e)),c=e=>{let t=String(e||"").trim(),o=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(t);if(o){let e=3===o[1].length?o[1].replace(/./g,e=>e+e):o[1];return[0,2,4].map(t=>parseInt(e.slice(t,t+2),16)/255)}let r=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(t);return r?[r[1],r[2],r[3]].map(e=>l(parseFloat(e)/255,0,1)):null},u=(e,t,o)=>{let r=e.createShader(t);return r?(e.shaderSource(r,o),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))?r:(console.error(e.getShaderInfoLog(r)),e.deleteShader(r),null):null},f=e=>{let t=l(e,0,1);return t*t*t*(t*(6*t-15)+10)},s=({speed:e=.6,scale:t=1.5,brightness:o=1,color1:s="#f7f7f7",color2:d="#e100ff",noiseFrequency:m=2.5,noiseAmplitude:v=1,bandHeight:h=.5,bandSpread:p=1,octaveDecay:g=.1,layerOffset:x=0,colorSpeed:y=1,spectrum:w=1,tilt:S=0,enableMouseInteraction:b=!0,mouseInfluence:z=.25,clickPulse:M=!0,intro:E=!0,lightMode:L=!1,opacity:C=1,className:A="",style:F})=>{let P=(0,a.useRef)(null),R=(0,a.useRef)(null),H=(0,a.useRef)(null),[q,I]=(0,a.useState)(0),O={speed:Math.max(0,e),scale:Math.max(.01,t),brightness:Math.max(0,o),color1:c(s)||[.969,.969,.969],color2:c(d)||[.882,0,1],noiseFrequency:Math.max(.01,m),noiseAmplitude:Math.max(0,v),bandHeight:h,bandSpread:Math.max(0,p),octaveDecay:Math.max(0,g),layerOffset:x,colorSpeed:y,spectrum:l(w,0,1),tilt:l(S,-90,90)*Math.PI/180,mouse:b,influence:Math.max(0,z),clickPulse:M,intro:E,light:L,opacity:l(C,0,1)},T=(0,a.useRef)(O);return(0,a.useLayoutEffect)(()=>{T.current=O}),(0,a.useEffect)(()=>{H.current?.()}),(0,a.useEffect)(()=>{let e=P.current,t=R.current;if(!e||!t)return;let o=t.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"}),r=o?(e=>{let t=u(e,e.VERTEX_SHADER,n),o=u(e,e.FRAGMENT_SHADER,i),r=t&&o?e.createProgram():null;if(!t||!o||!r)return t&&e.deleteShader(t),o&&e.deleteShader(o),null;if(e.attachShader(r,t),e.attachShader(r,o),e.linkProgram(r),e.deleteShader(t),e.deleteShader(o),!e.getProgramParameter(r,e.LINK_STATUS))return console.error(e.getProgramInfoLog(r)),e.deleteProgram(r),null;let a={},l=e.getProgramParameter(r,e.ACTIVE_UNIFORMS);for(let t=0;t<l;t++){let o=e.getActiveUniform(r,t);o&&(a[o.name.replace(/\[0\]$/,"")]=e.getUniformLocation(r,o.name))}return{program:r,uniforms:a}})(o):null;if(!o||!r)return;let a=window.matchMedia("(prefers-reduced-motion: reduce)").matches,c=o.createVertexArray(),s={width:1,height:1},d={x:.5,y:.5,inside:!1},m={x:.5,y:.5,presence:0},v=[],h=new Float32Array(16),p=0,g=0,x=T.current.intro&&!a&&0===q?0:1,y=0,w=0,S=!0,b="hidden"!==document.visibilityState,z=!1,M=!1,E=()=>{M=!0,C()},L=n=>{if(y=0,M){let o,r,a,n,i,c,u;M=!1,o=T.current,a=Math.max(1,(r=e.getBoundingClientRect()).width),n=Math.max(1,r.height),c=Math.max(1,Math.round(a*(i=l(.35+.04*o.noiseFrequency*o.scale,.5,1)))),u=Math.max(1,Math.round(n*i)),(t.width!==c||t.height!==u)&&(t.width=c,t.height=u),s.width=a,s.height=n}if(z)return;let i=T.current,u=l((n-w)/1e3||0,0,.05);w=Math.max(w,n);let E=a?.35:1;p+=u*i.speed*E,g+=u*i.speed*i.colorSpeed*E,x<1&&(x=Math.min(1,x+u/2));let C=i.mouse&&d.inside,A=1-Math.exp(-u/.325);m.x+=((C?d.x:.5)-m.x)*A,m.y+=((C?d.y:.5)-m.y)*A,m.presence+=(!!C-m.presence)*(1-Math.exp(-u/(C?.45:.8)));for(let e=v.length-1;e>=0;e--)v[e].age+=u,v[e].age>=2.6&&v.splice(e,1);h.fill(0),v.forEach((e,t)=>{h[4*t]=e.x,h[4*t+1]=e.y,h[4*t+2]=f(e.age/.18)*(1-f((e.age-.18)/2.42)),h[4*t+3]=e.age});let F=1-Math.pow(1-x,3),P=s.width/s.height,R=Math.min(1,4*i.influence)*m.presence;o.viewport(0,0,t.width,t.height),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.useProgram(r.program),o.bindVertexArray(c);let H=r.uniforms;o.uniform2f(H.uResolution,t.width,t.height),o.uniform1f(H.uFlow,p),o.uniform1f(H.uHue,g),o.uniform1f(H.uScale,i.scale),o.uniform1f(H.uBrightness,i.brightness),o.uniform3f(H.uColor1,i.color1[0],i.color1[1],i.color1[2]),o.uniform3f(H.uColor2,i.color2[0],i.color2[1],i.color2[2]),o.uniform1f(H.uNoiseFreq,i.noiseFrequency),o.uniform1f(H.uNoiseAmp,i.noiseAmplitude),o.uniform1f(H.uBandHeight,i.bandHeight),o.uniform1f(H.uBandSpread,i.bandSpread),o.uniform1f(H.uOctaveDecay,i.octaveDecay),o.uniform1f(H.uLayerOffset,i.layerOffset),o.uniform2f(H.uShift,(m.x-.5)*i.influence*!!i.mouse,(m.y-.5)*i.influence*!!i.mouse),o.uniform4f(H.uCursor,m.x*P,m.y,R,0),o.uniform4fv(H.uPulses,h),o.uniform1f(H.uSpectrum,i.spectrum),o.uniform1f(H.uTilt,i.tilt),o.uniform3f(H.uIntro,f(x/.7),1+3*(1-F)*(1-F),.25+.75*F),o.uniform1f(H.uLightMode,+!!i.light),o.uniform1f(H.uOpacity,i.opacity),o.drawArrays(o.TRIANGLES,0,3);let q=Math.abs(m.x-(C?d.x:.5))>1e-4||Math.abs(m.y-(C?d.y:.5))>1e-4||Math.abs(!!C-m.presence)>.001||v.length>0;(i.speed>0||x<1||q)&&S&&b&&(y=requestAnimationFrame(L))},C=()=>{!y&&!z&&S&&b&&(w=performance.now(),y=requestAnimationFrame(L))};H.current=()=>{E(),C()};let A=t=>{let o=e.getBoundingClientRect();return{x:(t.clientX-o.left)/Math.max(1,o.width),y:1-(t.clientY-o.top)/Math.max(1,o.height),inside:t.clientX>=o.left&&t.clientX<=o.right&&t.clientY>=o.top&&t.clientY<=o.bottom}},F=e=>{let t=A(e);d.x=t.x,d.y=t.y,d.inside=t.inside,C()},O=e=>{let t=T.current,o=A(e);o.inside&&t.clickPulse&&!a&&(v.push({x:o.x*(s.width/s.height),y:o.y,age:0}),v.length>4&&v.shift(),C())},B=()=>{d.inside=!1,C()},_=e=>{"mouse"!==e.pointerType&&B()};window.addEventListener("pointermove",F,{passive:!0}),window.addEventListener("pointerdown",O,{passive:!0}),window.addEventListener("pointerup",_,{passive:!0}),window.addEventListener("pointercancel",_,{passive:!0}),document.documentElement.addEventListener("pointerleave",B);let N=e=>{e.preventDefault(),z=!0,cancelAnimationFrame(y),y=0},D=()=>I(e=>e+1);t.addEventListener("webglcontextlost",N),t.addEventListener("webglcontextrestored",D);let k=new ResizeObserver(()=>{E(),C()});k.observe(e);let U=new IntersectionObserver(e=>{S=e.some(e=>e.isIntersecting),C()});U.observe(e);let V=()=>{b="hidden"!==document.visibilityState,C()};return document.addEventListener("visibilitychange",V),E(),C(),()=>{cancelAnimationFrame(y),H.current=null,k.disconnect(),U.disconnect(),window.removeEventListener("pointermove",F),window.removeEventListener("pointerdown",O),window.removeEventListener("pointerup",_),window.removeEventListener("pointercancel",_),document.documentElement.removeEventListener("pointerleave",B),document.removeEventListener("visibilitychange",V),t.removeEventListener("webglcontextlost",N),t.removeEventListener("webglcontextrestored",D),o.isContextLost()||(o.deleteVertexArray(c),o.deleteProgram(r.program))}},[q]),(0,r.jsx)("div",{ref:P,className:`relative h-full w-full overflow-hidden ${A}`.trim(),style:F,children:(0,r.jsx)("canvas",{ref:R,className:"absolute inset-0 block h-full w-full","aria-hidden":"true"})})}}}]);