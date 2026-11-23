(()=>{var ll="147",ki={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Bi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},nu=0,Wl=1,iu=2;var To=1,su=2,Ys=3,ys=0,_n=1,yn=2,gi=0,ps=1,Xl=2,ql=3,Yl=4,ru=5,ds=100,ou=101,au=102,Zl=103,Jl=104,lu=200,cu=201,hu=202,uu=203,fh=204,ph=205,du=206,fu=207,pu=208,mu=209,gu=210,xu=0,yu=1,_u=2,Ta=3,vu=4,bu=5,Mu=6,wu=7,mh=0,Su=1,Tu=2,ti=0,Au=1,Eu=2,Cu=3,Pu=4,Lu=5,gh=300,_s=301,vs=302,Aa=303,Ea=304,Ao=306,Ca=1e3,kn=1001,Pa=1002,xn=1003,$l=1004;var Kl=1005;var Ln=1006,Ru=1007;var Eo=1008;var Di=1009,Iu=1010,Du=1011,xh=1012,Nu=1013,Pi=1014,Li=1015,js=1016,Ou=1017,zu=1018,ms=1020,Fu=1021,ku=1022,Bn=1023,Bu=1024,Uu=1025,Ri=1026,bs=1027,Vu=1028,Gu=1029,Hu=1030,Wu=1031,Xu=1033,Wo=33776,Xo=33777,qo=33778,Yo=33779,jl=35840,Ql=35841,ec=35842,tc=35843,qu=36196,nc=37492,ic=37496,sc=37808,rc=37809,oc=37810,ac=37811,lc=37812,cc=37813,hc=37814,uc=37815,dc=37816,fc=37817,pc=37818,mc=37819,gc=37820,xc=37821,yc=36492;var eo=2300,to=2301,Zo=2302,_c=2400,vc=2401,bc=2402;var Ni=3e3,vt=3001,Yu=3200,Zu=3201,yh=0,Ju=1;var Gn="srgb",Qs="srgb-linear";var Jo=7680;var $u=519,La=35044;var Mc="300 es",Ra=1035,Wn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let i=this._listeners[e];if(i!==void 0){let s=i.indexOf(t);s!==-1&&i.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let n=this._listeners[e.type];if(n!==void 0){e.target=this;let i=n.slice(0);for(let s=0,a=i.length;s<a;s++)i[s].call(this,e);e.target=null}}},nn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],wc=1234567,Js=Math.PI/180,no=180/Math.PI;function ni(){let r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(nn[r&255]+nn[r>>8&255]+nn[r>>16&255]+nn[r>>24&255]+"-"+nn[e&255]+nn[e>>8&255]+"-"+nn[e>>16&15|64]+nn[e>>24&255]+"-"+nn[t&63|128]+nn[t>>8&255]+"-"+nn[t>>16&255]+nn[t>>24&255]+nn[n&255]+nn[n>>8&255]+nn[n>>16&255]+nn[n>>24&255]).toLowerCase()}function un(r,e,t){return Math.max(e,Math.min(t,r))}function cl(r,e){return(r%e+e)%e}function Ku(r,e,t,n,i){return n+(r-e)*(i-n)/(t-e)}function ju(r,e,t){return r!==e?(t-r)/(e-r):0}function $s(r,e,t){return(1-t)*r+t*e}function Qu(r,e,t,n){return $s(r,e,1-Math.exp(-t*n))}function ed(r,e=1){return e-Math.abs(cl(r,e*2)-e)}function td(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*(3-2*r))}function nd(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*r*(r*(r*6-15)+10))}function id(r,e){return r+Math.floor(Math.random()*(e-r+1))}function sd(r,e){return r+Math.random()*(e-r)}function rd(r){return r*(.5-Math.random())}function od(r){r!==void 0&&(wc=r);let e=wc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function ad(r){return r*Js}function ld(r){return r*no}function Ia(r){return(r&r-1)===0&&r!==0}function cd(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function io(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function hd(r,e,t,n,i){let s=Math.cos,a=Math.sin,o=s(t/2),c=a(t/2),h=s((e+n)/2),u=a((e+n)/2),l=s((e-n)/2),d=a((e-n)/2),g=s((n-e)/2),_=a((n-e)/2);switch(i){case"XYX":r.set(o*u,c*l,c*d,o*h);break;case"YZY":r.set(c*d,o*u,c*l,o*h);break;case"ZXZ":r.set(c*l,c*d,o*u,o*h);break;case"XZX":r.set(o*u,c*_,c*g,o*h);break;case"YXY":r.set(c*g,o*u,c*_,o*h);break;case"ZYZ":r.set(c*_,c*g,o*u,o*h);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function ei(r,e){switch(e.constructor){case Float32Array:return r;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function St(r,e){switch(e.constructor){case Float32Array:return r;case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}var hl=Object.freeze({__proto__:null,DEG2RAD:Js,RAD2DEG:no,generateUUID:ni,clamp:un,euclideanModulo:cl,mapLinear:Ku,inverseLerp:ju,lerp:$s,damp:Qu,pingpong:ed,smoothstep:td,smootherstep:nd,randInt:id,randFloat:sd,randFloatSpread:rd,seededRandom:od,degToRad:ad,radToDeg:ld,isPowerOfTwo:Ia,ceilPowerOfTwo:cd,floorPowerOfTwo:io,setQuaternionFromProperEuler:hd,normalize:St,denormalize:ei}),Ue=class r{constructor(e=0,t=0){r.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*i+e.x,this.y=s*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Sn=class r{constructor(){r.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1]}set(e,t,n,i,s,a,o,c,h){let u=this.elements;return u[0]=e,u[1]=i,u[2]=o,u[3]=t,u[4]=s,u[5]=c,u[6]=n,u[7]=a,u[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[3],c=n[6],h=n[1],u=n[4],l=n[7],d=n[2],g=n[5],_=n[8],m=i[0],f=i[3],b=i[6],P=i[1],A=i[4],v=i[7],w=i[2],O=i[5],U=i[8];return s[0]=a*m+o*P+c*w,s[3]=a*f+o*A+c*O,s[6]=a*b+o*v+c*U,s[1]=h*m+u*P+l*w,s[4]=h*f+u*A+l*O,s[7]=h*b+u*v+l*U,s[2]=d*m+g*P+_*w,s[5]=d*f+g*A+_*O,s[8]=d*b+g*v+_*U,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],c=e[6],h=e[7],u=e[8];return t*a*u-t*o*h-n*s*u+n*o*c+i*s*h-i*a*c}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],c=e[6],h=e[7],u=e[8],l=u*a-o*h,d=o*c-u*s,g=h*s-a*c,_=t*l+n*d+i*g;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/_;return e[0]=l*m,e[1]=(i*h-u*n)*m,e[2]=(o*n-i*a)*m,e[3]=d*m,e[4]=(u*t-i*c)*m,e[5]=(i*s-o*t)*m,e[6]=g*m,e[7]=(n*c-h*t)*m,e[8]=(a*t-n*s)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,a,o){let c=Math.cos(s),h=Math.sin(s);return this.set(n*c,n*h,-n*(c*a+h*o)+a+e,-i*h,i*c,-i*(-h*a+c*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply($o.makeScale(e,t)),this}rotate(e){return this.premultiply($o.makeRotation(-e)),this}translate(e,t){return this.premultiply($o.makeTranslation(e,t)),this}makeTranslation(e,t){return this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},$o=new Sn;function _h(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function er(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function Ii(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function Qr(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}var Ko={[Gn]:{[Qs]:Ii},[Qs]:{[Gn]:Qr}},ln={legacyMode:!0,get workingColorSpace(){return Qs},set workingColorSpace(r){console.warn("THREE.ColorManagement: .workingColorSpace is readonly.")},convert:function(r,e,t){if(this.legacyMode||e===t||!e||!t)return r;if(Ko[e]&&Ko[e][t]!==void 0){let n=Ko[e][t];return r.r=n(r.r),r.g=n(r.g),r.b=n(r.b),r}throw new Error("Unsupported color space conversion.")},fromWorkingColorSpace:function(r,e){return this.convert(r,this.workingColorSpace,e)},toWorkingColorSpace:function(r,e){return this.convert(r,e,this.workingColorSpace)}},vh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Xt={r:0,g:0,b:0},On={h:0,s:0,l:0},Er={h:0,s:0,l:0};function jo(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}function Cr(r,e){return e.r=r.r,e.g=r.g,e.b=r.b,e}var ft=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,t===void 0&&n===void 0?this.set(e):this.setRGB(e,t,n)}set(e){return e&&e.isColor?this.copy(e):typeof e=="number"?this.setHex(e):typeof e=="string"&&this.setStyle(e),this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Gn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ln.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=ln.workingColorSpace){return this.r=e,this.g=t,this.b=n,ln.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=ln.workingColorSpace){if(e=cl(e,1),t=un(t,0,1),n=un(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=jo(a,s,e+1/3),this.g=jo(a,s,e),this.b=jo(a,s,e-1/3)}return ln.toWorkingColorSpace(this,i),this}setStyle(e,t=Gn){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^((?:rgb|hsl)a?)\(([^\)]*)\)/.exec(e)){let s,a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return this.r=Math.min(255,parseInt(s[1],10))/255,this.g=Math.min(255,parseInt(s[2],10))/255,this.b=Math.min(255,parseInt(s[3],10))/255,ln.toWorkingColorSpace(this,t),n(s[4]),this;if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return this.r=Math.min(100,parseInt(s[1],10))/100,this.g=Math.min(100,parseInt(s[2],10))/100,this.b=Math.min(100,parseInt(s[3],10))/100,ln.toWorkingColorSpace(this,t),n(s[4]),this;break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)){let c=parseFloat(s[1])/360,h=parseFloat(s[2])/100,u=parseFloat(s[3])/100;return n(s[4]),this.setHSL(c,h,u,t)}break}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=i[1],a=s.length;if(a===3)return this.r=parseInt(s.charAt(0)+s.charAt(0),16)/255,this.g=parseInt(s.charAt(1)+s.charAt(1),16)/255,this.b=parseInt(s.charAt(2)+s.charAt(2),16)/255,ln.toWorkingColorSpace(this,t),this;if(a===6)return this.r=parseInt(s.charAt(0)+s.charAt(1),16)/255,this.g=parseInt(s.charAt(2)+s.charAt(3),16)/255,this.b=parseInt(s.charAt(4)+s.charAt(5),16)/255,ln.toWorkingColorSpace(this,t),this}return e&&e.length>0?this.setColorName(e,t):this}setColorName(e,t=Gn){let n=vh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ii(e.r),this.g=Ii(e.g),this.b=Ii(e.b),this}copyLinearToSRGB(e){return this.r=Qr(e.r),this.g=Qr(e.g),this.b=Qr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Gn){return ln.fromWorkingColorSpace(Cr(this,Xt),e),un(Xt.r*255,0,255)<<16^un(Xt.g*255,0,255)<<8^un(Xt.b*255,0,255)<<0}getHexString(e=Gn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ln.workingColorSpace){ln.fromWorkingColorSpace(Cr(this,Xt),t);let n=Xt.r,i=Xt.g,s=Xt.b,a=Math.max(n,i,s),o=Math.min(n,i,s),c,h,u=(o+a)/2;if(o===a)c=0,h=0;else{let l=a-o;switch(h=u<=.5?l/(a+o):l/(2-a-o),a){case n:c=(i-s)/l+(i<s?6:0);break;case i:c=(s-n)/l+2;break;case s:c=(n-i)/l+4;break}c/=6}return e.h=c,e.s=h,e.l=u,e}getRGB(e,t=ln.workingColorSpace){return ln.fromWorkingColorSpace(Cr(this,Xt),t),e.r=Xt.r,e.g=Xt.g,e.b=Xt.b,e}getStyle(e=Gn){return ln.fromWorkingColorSpace(Cr(this,Xt),e),e!==Gn?`color(${e} ${Xt.r} ${Xt.g} ${Xt.b})`:`rgb(${Xt.r*255|0},${Xt.g*255|0},${Xt.b*255|0})`}offsetHSL(e,t,n){return this.getHSL(On),On.h+=e,On.s+=t,On.l+=n,this.setHSL(On.h,On.s,On.l),this}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(On),e.getHSL(Er);let n=$s(On.h,Er.h,t),i=$s(On.s,Er.s,t),s=$s(On.l,Er.l,t);return this.setHSL(n,i,s),this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}};ft.NAMES=vh;var Zi,so=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement=="undefined")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Zi===void 0&&(Zi=er("canvas")),Zi.width=e.width,Zi.height=e.height;let n=Zi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Zi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement!="undefined"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&e instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&e instanceof ImageBitmap){let t=er("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let a=0;a<s.length;a++)s[a]=Ii(s[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Ii(t[n]/255)*255):t[n]=Ii(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},ro=class{constructor(e=null){this.isSource=!0,this.uuid=ni(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?s.push(Qo(i[a].image)):s.push(Qo(i[a]))}else s=Qo(i);n.url=s}return t||(e.images[this.uuid]=n),n}};function Qo(r){return typeof HTMLImageElement!="undefined"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&r instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&r instanceof ImageBitmap?so.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var ud=0,fn=class r extends Wn{constructor(e=r.DEFAULT_IMAGE,t=r.DEFAULT_MAPPING,n=kn,i=kn,s=Ln,a=Eo,o=Bn,c=Di,h=r.DEFAULT_ANISOTROPY,u=Ni){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ud++}),this.uuid=ni(),this.name="",this.source=new ro(e),this.mipmaps=[],this.mapping=t,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=a,this.anisotropy=h,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Ue(0,0),this.repeat=new Ue(1,1),this.center=new Ue(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Sn,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.encoding=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.encoding=e.encoding,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.5,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,type:this.type,encoding:this.encoding,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return JSON.stringify(this.userData)!=="{}"&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==gh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ca:e.x=e.x-Math.floor(e.x);break;case kn:e.x=e.x<0?0:1;break;case Pa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ca:e.y=e.y-Math.floor(e.y);break;case kn:e.y=e.y<0?0:1;break;case Pa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}};fn.DEFAULT_IMAGE=null;fn.DEFAULT_MAPPING=gh;fn.DEFAULT_ANISOTROPY=1;var It=class r{constructor(e=0,t=0,n=0,i=1){r.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s,c=e.elements,h=c[0],u=c[4],l=c[8],d=c[1],g=c[5],_=c[9],m=c[2],f=c[6],b=c[10];if(Math.abs(u-d)<.01&&Math.abs(l-m)<.01&&Math.abs(_-f)<.01){if(Math.abs(u+d)<.1&&Math.abs(l+m)<.1&&Math.abs(_+f)<.1&&Math.abs(h+g+b-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let A=(h+1)/2,v=(g+1)/2,w=(b+1)/2,O=(u+d)/4,U=(l+m)/4,y=(_+f)/4;return A>v&&A>w?A<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(A),i=O/n,s=U/n):v>w?v<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(v),n=O/i,s=y/i):w<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(w),n=U/s,i=y/s),this.set(n,i,s,t),this}let P=Math.sqrt((f-_)*(f-_)+(l-m)*(l-m)+(d-u)*(d-u));return Math.abs(P)<.001&&(P=1),this.x=(f-_)/P,this.y=(l-m)/P,this.z=(d-u)/P,this.w=Math.acos((h+g+b-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this.w=this.w<0?Math.ceil(this.w):Math.floor(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ii=class extends Wn{constructor(e=1,t=1,n={}){super(),this.isWebGLRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new It(0,0,e,t),this.scissorTest=!1,this.viewport=new It(0,0,e,t);let i={width:e,height:t,depth:1};this.texture=new fn(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.encoding),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.internalFormat=n.internalFormat!==void 0?n.internalFormat:null,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:Ln,this.depthBuffer=n.depthBuffer!==void 0?n.depthBuffer:!0,this.stencilBuffer=n.stencilBuffer!==void 0?n.stencilBuffer:!1,this.depthTexture=n.depthTexture!==void 0?n.depthTexture:null,this.samples=n.samples!==void 0?n.samples:0}setSize(e,t,n=1){(this.width!==e||this.height!==t||this.depth!==n)&&(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new ro(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},oo=class extends fn{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=xn,this.minFilter=xn,this.wrapR=kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Da=class extends fn{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=xn,this.minFilter=xn,this.wrapR=kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Tn=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,a,o){let c=n[i+0],h=n[i+1],u=n[i+2],l=n[i+3],d=s[a+0],g=s[a+1],_=s[a+2],m=s[a+3];if(o===0){e[t+0]=c,e[t+1]=h,e[t+2]=u,e[t+3]=l;return}if(o===1){e[t+0]=d,e[t+1]=g,e[t+2]=_,e[t+3]=m;return}if(l!==m||c!==d||h!==g||u!==_){let f=1-o,b=c*d+h*g+u*_+l*m,P=b>=0?1:-1,A=1-b*b;if(A>Number.EPSILON){let w=Math.sqrt(A),O=Math.atan2(w,b*P);f=Math.sin(f*O)/w,o=Math.sin(o*O)/w}let v=o*P;if(c=c*f+d*v,h=h*f+g*v,u=u*f+_*v,l=l*f+m*v,f===1-o){let w=1/Math.sqrt(c*c+h*h+u*u+l*l);c*=w,h*=w,u*=w,l*=w}}e[t]=c,e[t+1]=h,e[t+2]=u,e[t+3]=l}static multiplyQuaternionsFlat(e,t,n,i,s,a){let o=n[i],c=n[i+1],h=n[i+2],u=n[i+3],l=s[a],d=s[a+1],g=s[a+2],_=s[a+3];return e[t]=o*_+u*l+c*g-h*d,e[t+1]=c*_+u*d+h*l-o*g,e[t+2]=h*_+u*g+o*d-c*l,e[t+3]=u*_-o*l-c*d-h*g,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t){let n=e._x,i=e._y,s=e._z,a=e._order,o=Math.cos,c=Math.sin,h=o(n/2),u=o(i/2),l=o(s/2),d=c(n/2),g=c(i/2),_=c(s/2);switch(a){case"XYZ":this._x=d*u*l+h*g*_,this._y=h*g*l-d*u*_,this._z=h*u*_+d*g*l,this._w=h*u*l-d*g*_;break;case"YXZ":this._x=d*u*l+h*g*_,this._y=h*g*l-d*u*_,this._z=h*u*_-d*g*l,this._w=h*u*l+d*g*_;break;case"ZXY":this._x=d*u*l-h*g*_,this._y=h*g*l+d*u*_,this._z=h*u*_+d*g*l,this._w=h*u*l-d*g*_;break;case"ZYX":this._x=d*u*l-h*g*_,this._y=h*g*l+d*u*_,this._z=h*u*_-d*g*l,this._w=h*u*l+d*g*_;break;case"YZX":this._x=d*u*l+h*g*_,this._y=h*g*l+d*u*_,this._z=h*u*_-d*g*l,this._w=h*u*l-d*g*_;break;case"XZY":this._x=d*u*l-h*g*_,this._y=h*g*l-d*u*_,this._z=h*u*_+d*g*l,this._w=h*u*l+d*g*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t!==!1&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],s=t[8],a=t[1],o=t[5],c=t[9],h=t[2],u=t[6],l=t[10],d=n+o+l;if(d>0){let g=.5/Math.sqrt(d+1);this._w=.25/g,this._x=(u-c)*g,this._y=(s-h)*g,this._z=(a-i)*g}else if(n>o&&n>l){let g=2*Math.sqrt(1+n-o-l);this._w=(u-c)/g,this._x=.25*g,this._y=(i+a)/g,this._z=(s+h)/g}else if(o>l){let g=2*Math.sqrt(1+o-n-l);this._w=(s-h)/g,this._x=(i+a)/g,this._y=.25*g,this._z=(c+u)/g}else{let g=2*Math.sqrt(1+l-n-o);this._w=(a-i)/g,this._x=(s+h)/g,this._y=(c+u)/g,this._z=.25*g}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(un(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,i=e._y,s=e._z,a=e._w,o=t._x,c=t._y,h=t._z,u=t._w;return this._x=n*u+a*o+i*h-s*c,this._y=i*u+a*c+s*o-n*h,this._z=s*u+a*h+n*c-i*o,this._w=a*u-n*o-i*c-s*h,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,i=this._y,s=this._z,a=this._w,o=a*e._w+n*e._x+i*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=s,this;let c=1-o*o;if(c<=Number.EPSILON){let g=1-t;return this._w=g*a+t*this._w,this._x=g*n+t*this._x,this._y=g*i+t*this._y,this._z=g*s+t*this._z,this.normalize(),this._onChangeCallback(),this}let h=Math.sqrt(c),u=Math.atan2(h,o),l=Math.sin((1-t)*u)/h,d=Math.sin(t*u)/h;return this._w=a*l+this._w*d,this._x=n*l+this._x*d,this._y=i*l+this._y*d,this._z=s*l+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=Math.random(),t=Math.sqrt(1-e),n=Math.sqrt(e),i=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(t*Math.cos(i),n*Math.sin(s),n*Math.cos(s),t*Math.sin(i))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},R=class r{constructor(e=0,t=0,n=0){r.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Sc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Sc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,s=e.x,a=e.y,o=e.z,c=e.w,h=c*t+a*i-o*n,u=c*n+o*t-s*i,l=c*i+s*n-a*t,d=-s*t-a*n-o*i;return this.x=h*c+d*-s+u*-o-l*-a,this.y=u*c+d*-a+l*-s-h*-o,this.z=l*c+d*-o+h*-a-u*-s,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,i=e.y,s=e.z,a=t.x,o=t.y,c=t.z;return this.x=i*c-s*o,this.y=s*a-n*c,this.z=n*o-i*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ea.copy(this).projectOnVector(e),this.sub(ea)}reflect(e){return this.sub(ea.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(un(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,n=Math.sqrt(1-e**2);return this.x=n*Math.cos(t),this.y=n*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ea=new R,Sc=new Tn,Oi=class{constructor(e=new R(1/0,1/0,1/0),t=new R(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){let t=1/0,n=1/0,i=1/0,s=-1/0,a=-1/0,o=-1/0;for(let c=0,h=e.length;c<h;c+=3){let u=e[c],l=e[c+1],d=e[c+2];u<t&&(t=u),l<n&&(n=l),d<i&&(i=d),u>s&&(s=u),l>a&&(a=l),d>o&&(o=d)}return this.min.set(t,n,i),this.max.set(s,a,o),this}setFromBufferAttribute(e){let t=1/0,n=1/0,i=1/0,s=-1/0,a=-1/0,o=-1/0;for(let c=0,h=e.count;c<h;c++){let u=e.getX(c),l=e.getY(c),d=e.getZ(c);u<t&&(t=u),l<n&&(n=l),d<i&&(i=d),u>s&&(s=u),l>a&&(a=l),d>o&&(o=d)}return this.min.set(t,n,i),this.max.set(s,a,o),this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Si.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0)if(t&&n.attributes!=null&&n.attributes.position!==void 0){let s=n.attributes.position;for(let a=0,o=s.count;a<o;a++)Si.fromBufferAttribute(s,a).applyMatrix4(e.matrixWorld),this.expandByPoint(Si)}else n.boundingBox===null&&n.computeBoundingBox(),ta.copy(n.boundingBox),ta.applyMatrix4(e.matrixWorld),this.union(ta);let i=e.children;for(let s=0,a=i.length;s<a;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Si),Si.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ks),Pr.subVectors(this.max,ks),Ji.subVectors(e.a,ks),$i.subVectors(e.b,ks),Ki.subVectors(e.c,ks),li.subVectors($i,Ji),ci.subVectors(Ki,$i),Ti.subVectors(Ji,Ki);let t=[0,-li.z,li.y,0,-ci.z,ci.y,0,-Ti.z,Ti.y,li.z,0,-li.x,ci.z,0,-ci.x,Ti.z,0,-Ti.x,-li.y,li.x,0,-ci.y,ci.x,0,-Ti.y,Ti.x,0];return!na(t,Ji,$i,Ki,Pr)||(t=[1,0,0,0,1,0,0,0,1],!na(t,Ji,$i,Ki,Pr))?!1:(Lr.crossVectors(li,ci),t=[Lr.x,Lr.y,Lr.z],na(t,Ji,$i,Ki,Pr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return Si.copy(e).clamp(this.min,this.max).sub(e).length()}getBoundingSphere(e){return this.getCenter(e.center),e.radius=this.getSize(Si).length()*.5,e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Zn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Zn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Zn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Zn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Zn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Zn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Zn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Zn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Zn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Zn=[new R,new R,new R,new R,new R,new R,new R,new R],Si=new R,ta=new Oi,Ji=new R,$i=new R,Ki=new R,li=new R,ci=new R,Ti=new R,ks=new R,Pr=new R,Lr=new R,Ai=new R;function na(r,e,t,n,i){for(let s=0,a=r.length-3;s<=a;s+=3){Ai.fromArray(r,s);let o=i.x*Math.abs(Ai.x)+i.y*Math.abs(Ai.y)+i.z*Math.abs(Ai.z),c=e.dot(Ai),h=t.dot(Ai),u=n.dot(Ai);if(Math.max(-Math.max(c,h,u),Math.min(c,h,u))>o)return!1}return!0}var dd=new Oi,Bs=new R,ia=new R,Ms=class{constructor(e=new R,t=-1){this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):dd.setFromPoints(e).getCenter(n);let i=0;for(let s=0,a=e.length;s<a;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Bs.subVectors(e,this.center);let t=Bs.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(Bs,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ia.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Bs.copy(e.center).add(ia)),this.expandByPoint(Bs.copy(e.center).sub(ia))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},Jn=new R,sa=new R,Rr=new R,hi=new R,ra=new R,Ir=new R,oa=new R,ao=class{constructor(e=new R,t=new R(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.direction).multiplyScalar(e).add(this.origin)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Jn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.direction).multiplyScalar(n).add(this.origin)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Jn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Jn.copy(this.direction).multiplyScalar(t).add(this.origin),Jn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){sa.copy(e).add(t).multiplyScalar(.5),Rr.copy(t).sub(e).normalize(),hi.copy(this.origin).sub(sa);let s=e.distanceTo(t)*.5,a=-this.direction.dot(Rr),o=hi.dot(this.direction),c=-hi.dot(Rr),h=hi.lengthSq(),u=Math.abs(1-a*a),l,d,g,_;if(u>0)if(l=a*c-o,d=a*o-c,_=s*u,l>=0)if(d>=-_)if(d<=_){let m=1/u;l*=m,d*=m,g=l*(l+a*d+2*o)+d*(a*l+d+2*c)+h}else d=s,l=Math.max(0,-(a*d+o)),g=-l*l+d*(d+2*c)+h;else d=-s,l=Math.max(0,-(a*d+o)),g=-l*l+d*(d+2*c)+h;else d<=-_?(l=Math.max(0,-(-a*s+o)),d=l>0?-s:Math.min(Math.max(-s,-c),s),g=-l*l+d*(d+2*c)+h):d<=_?(l=0,d=Math.min(Math.max(-s,-c),s),g=d*(d+2*c)+h):(l=Math.max(0,-(a*s+o)),d=l>0?s:Math.min(Math.max(-s,-c),s),g=-l*l+d*(d+2*c)+h);else d=a>0?-s:s,l=Math.max(0,-(a*d+o)),g=-l*l+d*(d+2*c)+h;return n&&n.copy(this.direction).multiplyScalar(l).add(this.origin),i&&i.copy(Rr).multiplyScalar(d).add(sa),g}intersectSphere(e,t){Jn.subVectors(e.center,this.origin);let n=Jn.dot(this.direction),i=Jn.dot(Jn)-n*n,s=e.radius*e.radius;if(i>s)return null;let a=Math.sqrt(s-i),o=n-a,c=n+a;return o<0&&c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,a,o,c,h=1/this.direction.x,u=1/this.direction.y,l=1/this.direction.z,d=this.origin;return h>=0?(n=(e.min.x-d.x)*h,i=(e.max.x-d.x)*h):(n=(e.max.x-d.x)*h,i=(e.min.x-d.x)*h),u>=0?(s=(e.min.y-d.y)*u,a=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,a=(e.min.y-d.y)*u),n>a||s>i||((s>n||isNaN(n))&&(n=s),(a<i||isNaN(i))&&(i=a),l>=0?(o=(e.min.z-d.z)*l,c=(e.max.z-d.z)*l):(o=(e.max.z-d.z)*l,c=(e.min.z-d.z)*l),n>c||o>i)||((o>n||n!==n)&&(n=o),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Jn)!==null}intersectTriangle(e,t,n,i,s){ra.subVectors(t,e),Ir.subVectors(n,e),oa.crossVectors(ra,Ir);let a=this.direction.dot(oa),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;hi.subVectors(this.origin,e);let c=o*this.direction.dot(Ir.crossVectors(hi,Ir));if(c<0)return null;let h=o*this.direction.dot(ra.cross(hi));if(h<0||c+h>a)return null;let u=-o*hi.dot(oa);return u<0?null:this.at(u/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},At=class r{constructor(){r.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}set(e,t,n,i,s,a,o,c,h,u,l,d,g,_,m,f){let b=this.elements;return b[0]=e,b[4]=t,b[8]=n,b[12]=i,b[1]=s,b[5]=a,b[9]=o,b[13]=c,b[2]=h,b[6]=u,b[10]=l,b[14]=d,b[3]=g,b[7]=_,b[11]=m,b[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new r().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,i=1/ji.setFromMatrixColumn(e,0).length(),s=1/ji.setFromMatrixColumn(e,1).length(),a=1/ji.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,i=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(i),h=Math.sin(i),u=Math.cos(s),l=Math.sin(s);if(e.order==="XYZ"){let d=a*u,g=a*l,_=o*u,m=o*l;t[0]=c*u,t[4]=-c*l,t[8]=h,t[1]=g+_*h,t[5]=d-m*h,t[9]=-o*c,t[2]=m-d*h,t[6]=_+g*h,t[10]=a*c}else if(e.order==="YXZ"){let d=c*u,g=c*l,_=h*u,m=h*l;t[0]=d+m*o,t[4]=_*o-g,t[8]=a*h,t[1]=a*l,t[5]=a*u,t[9]=-o,t[2]=g*o-_,t[6]=m+d*o,t[10]=a*c}else if(e.order==="ZXY"){let d=c*u,g=c*l,_=h*u,m=h*l;t[0]=d-m*o,t[4]=-a*l,t[8]=_+g*o,t[1]=g+_*o,t[5]=a*u,t[9]=m-d*o,t[2]=-a*h,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){let d=a*u,g=a*l,_=o*u,m=o*l;t[0]=c*u,t[4]=_*h-g,t[8]=d*h+m,t[1]=c*l,t[5]=m*h+d,t[9]=g*h-_,t[2]=-h,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){let d=a*c,g=a*h,_=o*c,m=o*h;t[0]=c*u,t[4]=m-d*l,t[8]=_*l+g,t[1]=l,t[5]=a*u,t[9]=-o*u,t[2]=-h*u,t[6]=g*l+_,t[10]=d-m*l}else if(e.order==="XZY"){let d=a*c,g=a*h,_=o*c,m=o*h;t[0]=c*u,t[4]=-l,t[8]=h*u,t[1]=d*l+m,t[5]=a*u,t[9]=g*l-_,t[2]=_*l-g,t[6]=o*u,t[10]=m*l+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(fd,e,pd)}lookAt(e,t,n){let i=this.elements;return Mn.subVectors(e,t),Mn.lengthSq()===0&&(Mn.z=1),Mn.normalize(),ui.crossVectors(n,Mn),ui.lengthSq()===0&&(Math.abs(n.z)===1?Mn.x+=1e-4:Mn.z+=1e-4,Mn.normalize(),ui.crossVectors(n,Mn)),ui.normalize(),Dr.crossVectors(Mn,ui),i[0]=ui.x,i[4]=Dr.x,i[8]=Mn.x,i[1]=ui.y,i[5]=Dr.y,i[9]=Mn.y,i[2]=ui.z,i[6]=Dr.z,i[10]=Mn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[4],c=n[8],h=n[12],u=n[1],l=n[5],d=n[9],g=n[13],_=n[2],m=n[6],f=n[10],b=n[14],P=n[3],A=n[7],v=n[11],w=n[15],O=i[0],U=i[4],y=i[8],L=i[12],z=i[1],Z=i[5],re=i[9],Y=i[13],V=i[2],j=i[6],oe=i[10],fe=i[14],ie=i[3],le=i[7],ce=i[11],ee=i[15];return s[0]=a*O+o*z+c*V+h*ie,s[4]=a*U+o*Z+c*j+h*le,s[8]=a*y+o*re+c*oe+h*ce,s[12]=a*L+o*Y+c*fe+h*ee,s[1]=u*O+l*z+d*V+g*ie,s[5]=u*U+l*Z+d*j+g*le,s[9]=u*y+l*re+d*oe+g*ce,s[13]=u*L+l*Y+d*fe+g*ee,s[2]=_*O+m*z+f*V+b*ie,s[6]=_*U+m*Z+f*j+b*le,s[10]=_*y+m*re+f*oe+b*ce,s[14]=_*L+m*Y+f*fe+b*ee,s[3]=P*O+A*z+v*V+w*ie,s[7]=P*U+A*Z+v*j+w*le,s[11]=P*y+A*re+v*oe+w*ce,s[15]=P*L+A*Y+v*fe+w*ee,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],a=e[1],o=e[5],c=e[9],h=e[13],u=e[2],l=e[6],d=e[10],g=e[14],_=e[3],m=e[7],f=e[11],b=e[15];return _*(+s*c*l-i*h*l-s*o*d+n*h*d+i*o*g-n*c*g)+m*(+t*c*g-t*h*d+s*a*d-i*a*g+i*h*u-s*c*u)+f*(+t*h*l-t*o*g-s*a*l+n*a*g+s*o*u-n*h*u)+b*(-i*o*u-t*c*l+t*o*d+i*a*l-n*a*d+n*c*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],c=e[6],h=e[7],u=e[8],l=e[9],d=e[10],g=e[11],_=e[12],m=e[13],f=e[14],b=e[15],P=l*f*h-m*d*h+m*c*g-o*f*g-l*c*b+o*d*b,A=_*d*h-u*f*h-_*c*g+a*f*g+u*c*b-a*d*b,v=u*m*h-_*l*h+_*o*g-a*m*g-u*o*b+a*l*b,w=_*l*c-u*m*c-_*o*d+a*m*d+u*o*f-a*l*f,O=t*P+n*A+i*v+s*w;if(O===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let U=1/O;return e[0]=P*U,e[1]=(m*d*s-l*f*s-m*i*g+n*f*g+l*i*b-n*d*b)*U,e[2]=(o*f*s-m*c*s+m*i*h-n*f*h-o*i*b+n*c*b)*U,e[3]=(l*c*s-o*d*s-l*i*h+n*d*h+o*i*g-n*c*g)*U,e[4]=A*U,e[5]=(u*f*s-_*d*s+_*i*g-t*f*g-u*i*b+t*d*b)*U,e[6]=(_*c*s-a*f*s-_*i*h+t*f*h+a*i*b-t*c*b)*U,e[7]=(a*d*s-u*c*s+u*i*h-t*d*h-a*i*g+t*c*g)*U,e[8]=v*U,e[9]=(_*l*s-u*m*s-_*n*g+t*m*g+u*n*b-t*l*b)*U,e[10]=(a*m*s-_*o*s+_*n*h-t*m*h-a*n*b+t*o*b)*U,e[11]=(u*o*s-a*l*s-u*n*h+t*l*h+a*n*g-t*o*g)*U,e[12]=w*U,e[13]=(u*m*i-_*l*i+_*n*d-t*m*d-u*n*f+t*l*f)*U,e[14]=(_*o*i-a*m*i-_*n*c+t*m*c+a*n*f-t*o*f)*U,e[15]=(a*l*i-u*o*i+u*n*c-t*l*c-a*n*d+t*o*d)*U,this}scale(e){let t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),s=1-n,a=e.x,o=e.y,c=e.z,h=s*a,u=s*o;return this.set(h*a+n,h*o-i*c,h*c+i*o,0,h*o+i*c,u*o+n,u*c-i*a,0,h*c-i*o,u*c+i*a,s*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,a){return this.set(1,n,s,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,s=t._x,a=t._y,o=t._z,c=t._w,h=s+s,u=a+a,l=o+o,d=s*h,g=s*u,_=s*l,m=a*u,f=a*l,b=o*l,P=c*h,A=c*u,v=c*l,w=n.x,O=n.y,U=n.z;return i[0]=(1-(m+b))*w,i[1]=(g+v)*w,i[2]=(_-A)*w,i[3]=0,i[4]=(g-v)*O,i[5]=(1-(d+b))*O,i[6]=(f+P)*O,i[7]=0,i[8]=(_+A)*U,i[9]=(f-P)*U,i[10]=(1-(d+m))*U,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements,s=ji.set(i[0],i[1],i[2]).length(),a=ji.set(i[4],i[5],i[6]).length(),o=ji.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],zn.copy(this);let h=1/s,u=1/a,l=1/o;return zn.elements[0]*=h,zn.elements[1]*=h,zn.elements[2]*=h,zn.elements[4]*=u,zn.elements[5]*=u,zn.elements[6]*=u,zn.elements[8]*=l,zn.elements[9]*=l,zn.elements[10]*=l,t.setFromRotationMatrix(zn),n.x=s,n.y=a,n.z=o,this}makePerspective(e,t,n,i,s,a){let o=this.elements,c=2*s/(t-e),h=2*s/(n-i),u=(t+e)/(t-e),l=(n+i)/(n-i),d=-(a+s)/(a-s),g=-2*a*s/(a-s);return o[0]=c,o[4]=0,o[8]=u,o[12]=0,o[1]=0,o[5]=h,o[9]=l,o[13]=0,o[2]=0,o[6]=0,o[10]=d,o[14]=g,o[3]=0,o[7]=0,o[11]=-1,o[15]=0,this}makeOrthographic(e,t,n,i,s,a){let o=this.elements,c=1/(t-e),h=1/(n-i),u=1/(a-s),l=(t+e)*c,d=(n+i)*h,g=(a+s)*u;return o[0]=2*c,o[4]=0,o[8]=0,o[12]=-l,o[1]=0,o[5]=2*h,o[9]=0,o[13]=-d,o[2]=0,o[6]=0,o[10]=-2*u,o[14]=-g,o[3]=0,o[7]=0,o[11]=0,o[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},ji=new R,zn=new At,fd=new R(0,0,0),pd=new R(1,1,1),ui=new R,Dr=new R,Mn=new R,Tc=new At,Ac=new Tn,tr=class r{constructor(e=0,t=0,n=0,i=r.DefaultOrder){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,s=i[0],a=i[4],o=i[8],c=i[1],h=i[5],u=i[9],l=i[2],d=i[6],g=i[10];switch(t){case"XYZ":this._y=Math.asin(un(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,g),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(d,h),this._z=0);break;case"YXZ":this._x=Math.asin(-un(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,g),this._z=Math.atan2(c,h)):(this._y=Math.atan2(-l,s),this._z=0);break;case"ZXY":this._x=Math.asin(un(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-l,g),this._z=Math.atan2(-a,h)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-un(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(d,g),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-a,h));break;case"YZX":this._z=Math.asin(un(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,h),this._y=Math.atan2(-l,s)):(this._x=0,this._y=Math.atan2(o,g));break;case"XZY":this._z=Math.asin(-un(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,h),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,g),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Tc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Tc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ac.setFromEuler(this),this.setFromQuaternion(Ac,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}toVector3(){console.error("THREE.Euler: .toVector3() has been removed. Use Vector3.setFromEuler() instead")}};tr.DefaultOrder="XYZ";tr.RotationOrders=["XYZ","YZX","ZXY","XZY","YXZ","ZYX"];var lo=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},md=0,Ec=new R,Qi=new Tn,$n=new At,Nr=new R,Us=new R,gd=new R,xd=new Tn,Cc=new R(1,0,0),Pc=new R(0,1,0),Lc=new R(0,0,1),yd={type:"added"},Rc={type:"removed"},jt=class r extends Wn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:md++}),this.uuid=ni(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=r.DefaultUp.clone();let e=new R,t=new tr,n=new Tn,i=new R(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new At},normalMatrix:{value:new Sn}}),this.matrix=new At,this.matrixWorld=new At,this.matrixAutoUpdate=r.DefaultMatrixAutoUpdate,this.matrixWorldNeedsUpdate=!1,this.matrixWorldAutoUpdate=r.DefaultMatrixWorldAutoUpdate,this.layers=new lo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Qi.setFromAxisAngle(e,t),this.quaternion.multiply(Qi),this}rotateOnWorldAxis(e,t){return Qi.setFromAxisAngle(e,t),this.quaternion.premultiply(Qi),this}rotateX(e){return this.rotateOnAxis(Cc,e)}rotateY(e){return this.rotateOnAxis(Pc,e)}rotateZ(e){return this.rotateOnAxis(Lc,e)}translateOnAxis(e,t){return Ec.copy(e).applyQuaternion(this.quaternion),this.position.add(Ec.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Cc,e)}translateY(e){return this.translateOnAxis(Pc,e)}translateZ(e){return this.translateOnAxis(Lc,e)}localToWorld(e){return e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return e.applyMatrix4($n.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Nr.copy(e):Nr.set(e,t,n);let i=this.parent;this.updateWorldMatrix(!0,!1),Us.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?$n.lookAt(Us,Nr,this.up):$n.lookAt(Nr,Us,this.up),this.quaternion.setFromRotationMatrix($n),i&&($n.extractRotation(i.matrixWorld),Qi.setFromRotationMatrix($n),this.quaternion.premultiply(Qi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(yd)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Rc)),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){for(let e=0;e<this.children.length;e++){let t=this.children[e];t.parent=null,t.dispatchEvent(Rc)}return this.children.length=0,this}attach(e){return this.updateWorldMatrix(!0,!1),$n.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),$n.multiply(e.parent.matrixWorld)),e.applyMatrix4($n),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Us,e,gd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Us,xd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,i=t.length;n<i;n++){let s=t[n];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){let i=this.children;for(let s=0,a=i.length;s<a;s++){let o=i[s];o.matrixWorldAutoUpdate===!0&&o.updateWorldMatrix(!1,!0)}}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.5,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),JSON.stringify(this.userData)!=="{}"&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON()));function s(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let h=0,u=c.length;h<u;h++){let l=c[h];s(e.shapes,l)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,h=this.material.length;c<h;c++)o.push(s(e.materials,this.material[c]));i.material=o}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];i.animations.push(s(e.animations,c))}}if(t){let o=a(e.geometries),c=a(e.materials),h=a(e.textures),u=a(e.images),l=a(e.shapes),d=a(e.skeletons),g=a(e.animations),_=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),h.length>0&&(n.textures=h),u.length>0&&(n.images=u),l.length>0&&(n.shapes=l),d.length>0&&(n.skeletons=d),g.length>0&&(n.animations=g),_.length>0&&(n.nodes=_)}return n.object=i,n;function a(o){let c=[];for(let h in o){let u=o[h];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}};jt.DefaultUp=new R(0,1,0);jt.DefaultMatrixAutoUpdate=!0;jt.DefaultMatrixWorldAutoUpdate=!0;var Fn=new R,Kn=new R,aa=new R,jn=new R,es=new R,ts=new R,Ic=new R,la=new R,ca=new R,ha=new R,gs=class r{constructor(e=new R,t=new R,n=new R){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Fn.subVectors(e,t),i.cross(Fn);let s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){Fn.subVectors(i,t),Kn.subVectors(n,t),aa.subVectors(e,t);let a=Fn.dot(Fn),o=Fn.dot(Kn),c=Fn.dot(aa),h=Kn.dot(Kn),u=Kn.dot(aa),l=a*h-o*o;if(l===0)return s.set(-2,-1,-1);let d=1/l,g=(h*c-o*u)*d,_=(a*u-o*c)*d;return s.set(1-g-_,_,g)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,jn),jn.x>=0&&jn.y>=0&&jn.x+jn.y<=1}static getUV(e,t,n,i,s,a,o,c){return this.getBarycoord(e,t,n,i,jn),c.set(0,0),c.addScaledVector(s,jn.x),c.addScaledVector(a,jn.y),c.addScaledVector(o,jn.z),c}static isFrontFacing(e,t,n,i){return Fn.subVectors(n,t),Kn.subVectors(e,t),Fn.cross(Kn).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Fn.subVectors(this.c,this.b),Kn.subVectors(this.a,this.b),Fn.cross(Kn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return r.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return r.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,n,i,s){return r.getUV(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return r.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return r.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,s=this.c,a,o;es.subVectors(i,n),ts.subVectors(s,n),la.subVectors(e,n);let c=es.dot(la),h=ts.dot(la);if(c<=0&&h<=0)return t.copy(n);ca.subVectors(e,i);let u=es.dot(ca),l=ts.dot(ca);if(u>=0&&l<=u)return t.copy(i);let d=c*l-u*h;if(d<=0&&c>=0&&u<=0)return a=c/(c-u),t.copy(n).addScaledVector(es,a);ha.subVectors(e,s);let g=es.dot(ha),_=ts.dot(ha);if(_>=0&&g<=_)return t.copy(s);let m=g*h-c*_;if(m<=0&&h>=0&&_<=0)return o=h/(h-_),t.copy(n).addScaledVector(ts,o);let f=u*_-g*l;if(f<=0&&l-u>=0&&g-_>=0)return Ic.subVectors(s,i),o=(l-u)/(l-u+(g-_)),t.copy(i).addScaledVector(Ic,o);let b=1/(f+m+d);return a=m*b,o=d*b,t.copy(n).addScaledVector(es,a).addScaledVector(ts,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},_d=0,si=class extends Wn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:_d++}),this.uuid=ni(),this.name="",this.type="Material",this.blending=ps,this.side=ys,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.blendSrc=fh,this.blendDst=ph,this.blendEquation=ds,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.depthFunc=Ta,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=$u,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Jo,this.stencilZFail=Jo,this.stencilZPass=Jo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn("THREE.Material: '"+t+"' parameter is undefined.");continue}let i=this[t];if(i===void 0){console.warn("THREE."+this.type+": '"+t+"' is not a property of this material.");continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.5,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==ps&&(n.blending=this.blending),this.side!==ys&&(n.side=this.side),this.vertexColors&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=this.transparent),n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.stencilWrite=this.stencilWrite,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaToCoverage===!0&&(n.alphaToCoverage=this.alphaToCoverage),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=this.premultipliedAlpha),this.wireframe===!0&&(n.wireframe=this.wireframe),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=this.flatShading),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),JSON.stringify(this.userData)!=="{}"&&(n.userData=this.userData);function i(s){let a=[];for(let o in s){let c=s[o];delete c.metadata,a.push(c)}return a}if(t){let s=i(e.textures),a=i(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},kt=class extends si{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ft(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=mh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Bt=new R,Or=new Ue,rn=class{constructor(e,t,n){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n===!0,this.usage=La,this.updateRange={offset:0,count:-1},this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Or.fromBufferAttribute(this,t),Or.applyMatrix3(e),this.setXY(t,Or.x,Or.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.applyMatrix3(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.applyMatrix4(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.applyNormalMatrix(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.transformDirection(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}set(e,t=0){return this.array.set(e,t),this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ei(t,this.array)),t}setX(e,t){return this.normalized&&(t=St(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ei(t,this.array)),t}setY(e,t){return this.normalized&&(t=St(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ei(t,this.array)),t}setZ(e,t){return this.normalized&&(t=St(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ei(t,this.array)),t}setW(e,t){return this.normalized&&(t=St(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=St(t,this.array),n=St(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=St(t,this.array),n=St(n,this.array),i=St(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=St(t,this.array),n=St(n,this.array),i=St(i,this.array),s=St(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==La&&(e.usage=this.usage),(this.updateRange.offset!==0||this.updateRange.count!==-1)&&(e.updateRange=this.updateRange),e}copyColorsArray(){console.error("THREE.BufferAttribute: copyColorsArray() was removed in r144.")}copyVector2sArray(){console.error("THREE.BufferAttribute: copyVector2sArray() was removed in r144.")}copyVector3sArray(){console.error("THREE.BufferAttribute: copyVector3sArray() was removed in r144.")}copyVector4sArray(){console.error("THREE.BufferAttribute: copyVector4sArray() was removed in r144.")}};var co=class extends rn{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var ho=class extends rn{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var gt=class extends rn{constructor(e,t,n){super(new Float32Array(e),t,n)}};var vd=0,Pn=new At,ua=new jt,ns=new R,wn=new Oi,Vs=new Oi,$t=new R,Ut=class r extends Wn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:vd++}),this.uuid=ni(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(_h(e)?ho:co)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new Sn().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Pn.makeRotationFromQuaternion(e),this.applyMatrix4(Pn),this}rotateX(e){return Pn.makeRotationX(e),this.applyMatrix4(Pn),this}rotateY(e){return Pn.makeRotationY(e),this.applyMatrix4(Pn),this}rotateZ(e){return Pn.makeRotationZ(e),this.applyMatrix4(Pn),this}translate(e,t,n){return Pn.makeTranslation(e,t,n),this.applyMatrix4(Pn),this}scale(e,t,n){return Pn.makeScale(e,t,n),this.applyMatrix4(Pn),this}lookAt(e){return ua.lookAt(e),ua.updateMatrix(),this.applyMatrix4(ua.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ns).negate(),this.translate(ns.x,ns.y,ns.z),this}setFromPoints(e){let t=[];for(let n=0,i=e.length;n<i;n++){let s=e[n];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new gt(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Oi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new R(-1/0,-1/0,-1/0),new R(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let s=t[n];wn.setFromBufferAttribute(s),this.morphTargetsRelative?($t.addVectors(this.boundingBox.min,wn.min),this.boundingBox.expandByPoint($t),$t.addVectors(this.boundingBox.max,wn.max),this.boundingBox.expandByPoint($t)):(this.boundingBox.expandByPoint(wn.min),this.boundingBox.expandByPoint(wn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ms);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new R,1/0);return}if(e){let n=this.boundingSphere.center;if(wn.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){let o=t[s];Vs.setFromBufferAttribute(o),this.morphTargetsRelative?($t.addVectors(wn.min,Vs.min),wn.expandByPoint($t),$t.addVectors(wn.max,Vs.max),wn.expandByPoint($t)):(wn.expandByPoint(Vs.min),wn.expandByPoint(Vs.max))}wn.getCenter(n);let i=0;for(let s=0,a=e.count;s<a;s++)$t.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared($t));if(t)for(let s=0,a=t.length;s<a;s++){let o=t[s],c=this.morphTargetsRelative;for(let h=0,u=o.count;h<u;h++)$t.fromBufferAttribute(o,h),c&&(ns.fromBufferAttribute(e,h),$t.add(ns)),i=Math.max(i,n.distanceToSquared($t))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.array,i=t.position.array,s=t.normal.array,a=t.uv.array,o=i.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new rn(new Float32Array(4*o),4));let c=this.getAttribute("tangent").array,h=[],u=[];for(let z=0;z<o;z++)h[z]=new R,u[z]=new R;let l=new R,d=new R,g=new R,_=new Ue,m=new Ue,f=new Ue,b=new R,P=new R;function A(z,Z,re){l.fromArray(i,z*3),d.fromArray(i,Z*3),g.fromArray(i,re*3),_.fromArray(a,z*2),m.fromArray(a,Z*2),f.fromArray(a,re*2),d.sub(l),g.sub(l),m.sub(_),f.sub(_);let Y=1/(m.x*f.y-f.x*m.y);isFinite(Y)&&(b.copy(d).multiplyScalar(f.y).addScaledVector(g,-m.y).multiplyScalar(Y),P.copy(g).multiplyScalar(m.x).addScaledVector(d,-f.x).multiplyScalar(Y),h[z].add(b),h[Z].add(b),h[re].add(b),u[z].add(P),u[Z].add(P),u[re].add(P))}let v=this.groups;v.length===0&&(v=[{start:0,count:n.length}]);for(let z=0,Z=v.length;z<Z;++z){let re=v[z],Y=re.start,V=re.count;for(let j=Y,oe=Y+V;j<oe;j+=3)A(n[j+0],n[j+1],n[j+2])}let w=new R,O=new R,U=new R,y=new R;function L(z){U.fromArray(s,z*3),y.copy(U);let Z=h[z];w.copy(Z),w.sub(U.multiplyScalar(U.dot(Z))).normalize(),O.crossVectors(y,Z);let Y=O.dot(u[z])<0?-1:1;c[z*4]=w.x,c[z*4+1]=w.y,c[z*4+2]=w.z,c[z*4+3]=Y}for(let z=0,Z=v.length;z<Z;++z){let re=v[z],Y=re.start,V=re.count;for(let j=Y,oe=Y+V;j<oe;j+=3)L(n[j+0]),L(n[j+1]),L(n[j+2])}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new rn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,g=n.count;d<g;d++)n.setXYZ(d,0,0,0);let i=new R,s=new R,a=new R,o=new R,c=new R,h=new R,u=new R,l=new R;if(e)for(let d=0,g=e.count;d<g;d+=3){let _=e.getX(d+0),m=e.getX(d+1),f=e.getX(d+2);i.fromBufferAttribute(t,_),s.fromBufferAttribute(t,m),a.fromBufferAttribute(t,f),u.subVectors(a,s),l.subVectors(i,s),u.cross(l),o.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),h.fromBufferAttribute(n,f),o.add(u),c.add(u),h.add(u),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(m,c.x,c.y,c.z),n.setXYZ(f,h.x,h.y,h.z)}else for(let d=0,g=t.count;d<g;d+=3)i.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),u.subVectors(a,s),l.subVectors(i,s),u.cross(l),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}merge(){return console.error("THREE.BufferGeometry.merge() has been removed. Use THREE.BufferGeometryUtils.mergeBufferGeometries() instead."),this}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)$t.fromBufferAttribute(e,t),$t.normalize(),e.setXYZ(t,$t.x,$t.y,$t.z)}toNonIndexed(){function e(o,c){let h=o.array,u=o.itemSize,l=o.normalized,d=new h.constructor(c.length*u),g=0,_=0;for(let m=0,f=c.length;m<f;m++){o.isInterleavedBufferAttribute?g=c[m]*o.data.stride+o.offset:g=c[m]*u;for(let b=0;b<u;b++)d[_++]=h[g++]}return new rn(d,u,l)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new r,n=this.index.array,i=this.attributes;for(let o in i){let c=i[o],h=e(c,n);t.setAttribute(o,h)}let s=this.morphAttributes;for(let o in s){let c=[],h=s[o];for(let u=0,l=h.length;u<l;u++){let d=h[u],g=e(d,n);c.push(g)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let h=a[o];t.addGroup(h.start,h.count,h.materialIndex)}return t}toJSON(){let e={metadata:{version:4.5,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let h in c)c[h]!==void 0&&(e[h]=c[h]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let h=n[c];e.data.attributes[c]=h.toJSON(e.data)}let i={},s=!1;for(let c in this.morphAttributes){let h=this.morphAttributes[c],u=[];for(let l=0,d=h.length;l<d;l++){let g=h[l];u.push(g.toJSON(e.data))}u.length>0&&(i[c]=u,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let i=e.attributes;for(let h in i){let u=i[h];this.setAttribute(h,u.clone(t))}let s=e.morphAttributes;for(let h in s){let u=[],l=s[h];for(let d=0,g=l.length;d<g;d++)u.push(l[d].clone(t));this.morphAttributes[h]=u}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let h=0,u=a.length;h<u;h++){let l=a[h];this.addGroup(l.start,l.count,l.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,e.parameters!==void 0&&(this.parameters=Object.assign({},e.parameters)),this}dispose(){this.dispatchEvent({type:"dispose"})}},Dc=new At,is=new ao,da=new Ms,di=new R,fi=new R,pi=new R,fa=new R,pa=new R,ma=new R,zr=new R,Fr=new R,kr=new R,Br=new Ue,Ur=new Ue,Vr=new Ue,ga=new R,Gr=new R,Ve=class extends jt{constructor(e=new Ut,t=new kt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){let o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}raycast(e,t){let n=this.geometry,i=this.material,s=this.matrixWorld;if(i===void 0||(n.boundingSphere===null&&n.computeBoundingSphere(),da.copy(n.boundingSphere),da.applyMatrix4(s),e.ray.intersectsSphere(da)===!1)||(Dc.copy(s).invert(),is.copy(e.ray).applyMatrix4(Dc),n.boundingBox!==null&&is.intersectsBox(n.boundingBox)===!1))return;let a,o=n.index,c=n.attributes.position,h=n.morphAttributes.position,u=n.morphTargetsRelative,l=n.attributes.uv,d=n.attributes.uv2,g=n.groups,_=n.drawRange;if(o!==null)if(Array.isArray(i))for(let m=0,f=g.length;m<f;m++){let b=g[m],P=i[b.materialIndex],A=Math.max(b.start,_.start),v=Math.min(o.count,Math.min(b.start+b.count,_.start+_.count));for(let w=A,O=v;w<O;w+=3){let U=o.getX(w),y=o.getX(w+1),L=o.getX(w+2);a=Hr(this,P,e,is,c,h,u,l,d,U,y,L),a&&(a.faceIndex=Math.floor(w/3),a.face.materialIndex=b.materialIndex,t.push(a))}}else{let m=Math.max(0,_.start),f=Math.min(o.count,_.start+_.count);for(let b=m,P=f;b<P;b+=3){let A=o.getX(b),v=o.getX(b+1),w=o.getX(b+2);a=Hr(this,i,e,is,c,h,u,l,d,A,v,w),a&&(a.faceIndex=Math.floor(b/3),t.push(a))}}else if(c!==void 0)if(Array.isArray(i))for(let m=0,f=g.length;m<f;m++){let b=g[m],P=i[b.materialIndex],A=Math.max(b.start,_.start),v=Math.min(c.count,Math.min(b.start+b.count,_.start+_.count));for(let w=A,O=v;w<O;w+=3){let U=w,y=w+1,L=w+2;a=Hr(this,P,e,is,c,h,u,l,d,U,y,L),a&&(a.faceIndex=Math.floor(w/3),a.face.materialIndex=b.materialIndex,t.push(a))}}else{let m=Math.max(0,_.start),f=Math.min(c.count,_.start+_.count);for(let b=m,P=f;b<P;b+=3){let A=b,v=b+1,w=b+2;a=Hr(this,i,e,is,c,h,u,l,d,A,v,w),a&&(a.faceIndex=Math.floor(b/3),t.push(a))}}}};function bd(r,e,t,n,i,s,a,o){let c;if(e.side===_n?c=n.intersectTriangle(a,s,i,!0,o):c=n.intersectTriangle(i,s,a,e.side!==yn,o),c===null)return null;Gr.copy(o),Gr.applyMatrix4(r.matrixWorld);let h=t.ray.origin.distanceTo(Gr);return h<t.near||h>t.far?null:{distance:h,point:Gr.clone(),object:r}}function Hr(r,e,t,n,i,s,a,o,c,h,u,l){di.fromBufferAttribute(i,h),fi.fromBufferAttribute(i,u),pi.fromBufferAttribute(i,l);let d=r.morphTargetInfluences;if(s&&d){zr.set(0,0,0),Fr.set(0,0,0),kr.set(0,0,0);for(let _=0,m=s.length;_<m;_++){let f=d[_],b=s[_];f!==0&&(fa.fromBufferAttribute(b,h),pa.fromBufferAttribute(b,u),ma.fromBufferAttribute(b,l),a?(zr.addScaledVector(fa,f),Fr.addScaledVector(pa,f),kr.addScaledVector(ma,f)):(zr.addScaledVector(fa.sub(di),f),Fr.addScaledVector(pa.sub(fi),f),kr.addScaledVector(ma.sub(pi),f)))}di.add(zr),fi.add(Fr),pi.add(kr)}r.isSkinnedMesh&&(r.boneTransform(h,di),r.boneTransform(u,fi),r.boneTransform(l,pi));let g=bd(r,e,t,n,di,fi,pi,ga);if(g){o&&(Br.fromBufferAttribute(o,h),Ur.fromBufferAttribute(o,u),Vr.fromBufferAttribute(o,l),g.uv=gs.getUV(ga,di,fi,pi,Br,Ur,Vr,new Ue)),c&&(Br.fromBufferAttribute(c,h),Ur.fromBufferAttribute(c,u),Vr.fromBufferAttribute(c,l),g.uv2=gs.getUV(ga,di,fi,pi,Br,Ur,Vr,new Ue));let _={a:h,b:u,c:l,normal:new R,materialIndex:0};gs.getNormal(di,fi,pi,_.normal),g.face=_}return g}var Un=class r extends Ut{constructor(e=1,t=1,n=1,i=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:a};let o=this;i=Math.floor(i),s=Math.floor(s),a=Math.floor(a);let c=[],h=[],u=[],l=[],d=0,g=0;_("z","y","x",-1,-1,n,t,e,a,s,0),_("z","y","x",1,-1,n,t,-e,a,s,1),_("x","z","y",1,1,e,n,t,i,a,2),_("x","z","y",1,-1,e,n,-t,i,a,3),_("x","y","z",1,-1,e,t,n,i,s,4),_("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(c),this.setAttribute("position",new gt(h,3)),this.setAttribute("normal",new gt(u,3)),this.setAttribute("uv",new gt(l,2));function _(m,f,b,P,A,v,w,O,U,y,L){let z=v/U,Z=w/y,re=v/2,Y=w/2,V=O/2,j=U+1,oe=y+1,fe=0,ie=0,le=new R;for(let ce=0;ce<oe;ce++){let ee=ce*Z-Y;for(let J=0;J<j;J++){let ye=J*z-re;le[m]=ye*P,le[f]=ee*A,le[b]=V,h.push(le.x,le.y,le.z),le[m]=0,le[f]=0,le[b]=O>0?1:-1,u.push(le.x,le.y,le.z),l.push(J/U),l.push(1-ce/y),fe+=1}}for(let ce=0;ce<y;ce++)for(let ee=0;ee<U;ee++){let J=d+ee+j*ce,ye=d+ee+j*(ce+1),ge=d+(ee+1)+j*(ce+1),ve=d+(ee+1)+j*ce;c.push(J,ye,ve),c.push(ye,ge,ve),ie+=6}o.addGroup(g,ie,L),g+=ie,d+=fe}}static fromJSON(e){return new r(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function ws(r){let e={};for(let t in r){e[t]={};for(let n in r[t]){let i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function hn(r){let e={};for(let t=0;t<r.length;t++){let n=ws(r[t]);for(let i in n)e[i]=n[i]}return e}function Md(r){let e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function bh(r){return r.getRenderTarget()===null&&r.outputEncoding===vt?Gn:Qs}var wd={clone:ws,merge:hn},Sd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Td=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ri=class extends si{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Sd,this.fragmentShader=Td,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv2:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ws(e.uniforms),this.uniformsGroups=Md(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},uo=class extends jt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new At,this.projectionMatrix=new At,this.projectionMatrixInverse=new At}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(-t[8],-t[9],-t[10]).normalize()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},sn=class extends uo{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=no*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Js*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return no*2*Math.atan(Math.tan(Js*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,n,i,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Js*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,h=a.fullHeight;s+=a.offsetX*i/c,t-=a.offsetY*n/h,i*=a.width/c,n*=a.height/h}let o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},ss=-90,rs=1,Na=class extends jt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n;let i=new sn(ss,rs,e,t);i.layers=this.layers,i.up.set(0,1,0),i.lookAt(1,0,0),this.add(i);let s=new sn(ss,rs,e,t);s.layers=this.layers,s.up.set(0,1,0),s.lookAt(-1,0,0),this.add(s);let a=new sn(ss,rs,e,t);a.layers=this.layers,a.up.set(0,0,-1),a.lookAt(0,1,0),this.add(a);let o=new sn(ss,rs,e,t);o.layers=this.layers,o.up.set(0,0,1),o.lookAt(0,-1,0),this.add(o);let c=new sn(ss,rs,e,t);c.layers=this.layers,c.up.set(0,1,0),c.lookAt(0,0,1),this.add(c);let h=new sn(ss,rs,e,t);h.layers=this.layers,h.up.set(0,1,0),h.lookAt(0,0,-1),this.add(h)}update(e,t){this.parent===null&&this.updateMatrixWorld();let n=this.renderTarget,[i,s,a,o,c,h]=this.children,u=e.getRenderTarget(),l=e.toneMapping,d=e.xr.enabled;e.toneMapping=ti,e.xr.enabled=!1;let g=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0),e.render(t,i),e.setRenderTarget(n,1),e.render(t,s),e.setRenderTarget(n,2),e.render(t,a),e.setRenderTarget(n,3),e.render(t,o),e.setRenderTarget(n,4),e.render(t,c),n.texture.generateMipmaps=g,e.setRenderTarget(n,5),e.render(t,h),e.setRenderTarget(u),e.toneMapping=l,e.xr.enabled=d,n.texture.needsPMREMUpdate=!0}},fo=class extends fn{constructor(e,t,n,i,s,a,o,c,h,u){e=e!==void 0?e:[],t=t!==void 0?t:_s,super(e,t,n,i,s,a,o,c,h,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Oa=class extends ii{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new fo(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.encoding),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Ln}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.encoding=t.encoding,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Un(5,5,5),s=new ri({name:"CubemapFromEquirect",uniforms:ws(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:_n,blending:gi});s.uniforms.tEquirect.value=t;let a=new Ve(i,s),o=t.minFilter;return t.minFilter===Eo&&(t.minFilter=Ln),new Na(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,i){let s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(s)}},xa=new R,Ad=new R,Ed=new Sn,Qn=class{constructor(e=new R(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=xa.subVectors(n,t).cross(Ad.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(this.normal).multiplyScalar(-this.distanceToPoint(e)).add(e)}intersectLine(e,t){let n=e.delta(xa),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(n).multiplyScalar(s).add(e.start)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Ed.getNormalMatrix(e),i=this.coplanarPoint(xa).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},os=new Ms,Wr=new R,nr=class{constructor(e=new Qn,t=new Qn,n=new Qn,i=new Qn,s=new Qn,a=new Qn){this.planes=[e,t,n,i,s,a]}set(e,t,n,i,s,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(s),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e){let t=this.planes,n=e.elements,i=n[0],s=n[1],a=n[2],o=n[3],c=n[4],h=n[5],u=n[6],l=n[7],d=n[8],g=n[9],_=n[10],m=n[11],f=n[12],b=n[13],P=n[14],A=n[15];return t[0].setComponents(o-i,l-c,m-d,A-f).normalize(),t[1].setComponents(o+i,l+c,m+d,A+f).normalize(),t[2].setComponents(o+s,l+h,m+g,A+b).normalize(),t[3].setComponents(o-s,l-h,m-g,A-b).normalize(),t[4].setComponents(o-a,l-u,m-_,A-P).normalize(),t[5].setComponents(o+a,l+u,m+_,A+P).normalize(),this}intersectsObject(e){let t=e.geometry;return t.boundingSphere===null&&t.computeBoundingSphere(),os.copy(t.boundingSphere).applyMatrix4(e.matrixWorld),this.intersectsSphere(os)}intersectsSprite(e){return os.center.set(0,0,0),os.radius=.7071067811865476,os.applyMatrix4(e.matrixWorld),this.intersectsSphere(os)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(Wr.x=i.normal.x>0?e.max.x:e.min.x,Wr.y=i.normal.y>0?e.max.y:e.min.y,Wr.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Wr)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Mh(){let r=null,e=!1,t=null,n=null;function i(s,a){t(s,a),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function Cd(r,e){let t=e.isWebGL2,n=new WeakMap;function i(h,u){let l=h.array,d=h.usage,g=r.createBuffer();r.bindBuffer(u,g),r.bufferData(u,l,d),h.onUploadCallback();let _;if(l instanceof Float32Array)_=5126;else if(l instanceof Uint16Array)if(h.isFloat16BufferAttribute)if(t)_=5131;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else _=5123;else if(l instanceof Int16Array)_=5122;else if(l instanceof Uint32Array)_=5125;else if(l instanceof Int32Array)_=5124;else if(l instanceof Int8Array)_=5120;else if(l instanceof Uint8Array)_=5121;else if(l instanceof Uint8ClampedArray)_=5121;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:g,type:_,bytesPerElement:l.BYTES_PER_ELEMENT,version:h.version}}function s(h,u,l){let d=u.array,g=u.updateRange;r.bindBuffer(l,h),g.count===-1?r.bufferSubData(l,0,d):(t?r.bufferSubData(l,g.offset*d.BYTES_PER_ELEMENT,d,g.offset,g.count):r.bufferSubData(l,g.offset*d.BYTES_PER_ELEMENT,d.subarray(g.offset,g.offset+g.count)),g.count=-1),u.onUploadCallback()}function a(h){return h.isInterleavedBufferAttribute&&(h=h.data),n.get(h)}function o(h){h.isInterleavedBufferAttribute&&(h=h.data);let u=n.get(h);u&&(r.deleteBuffer(u.buffer),n.delete(h))}function c(h,u){if(h.isGLBufferAttribute){let d=n.get(h);(!d||d.version<h.version)&&n.set(h,{buffer:h.buffer,type:h.type,bytesPerElement:h.elementSize,version:h.version});return}h.isInterleavedBufferAttribute&&(h=h.data);let l=n.get(h);l===void 0?n.set(h,i(h,u)):l.version<h.version&&(s(l.buffer,h,u),l.version=h.version)}return{get:a,remove:o,update:c}}var oi=class r extends Ut{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let s=e/2,a=t/2,o=Math.floor(n),c=Math.floor(i),h=o+1,u=c+1,l=e/o,d=t/c,g=[],_=[],m=[],f=[];for(let b=0;b<u;b++){let P=b*d-a;for(let A=0;A<h;A++){let v=A*l-s;_.push(v,-P,0),m.push(0,0,1),f.push(A/o),f.push(1-b/c)}}for(let b=0;b<c;b++)for(let P=0;P<o;P++){let A=P+h*b,v=P+h*(b+1),w=P+1+h*(b+1),O=P+1+h*b;g.push(A,v,O),g.push(v,w,O)}this.setIndex(g),this.setAttribute("position",new gt(_,3)),this.setAttribute("normal",new gt(m,3)),this.setAttribute("uv",new gt(f,2))}static fromJSON(e){return new r(e.width,e.height,e.widthSegments,e.heightSegments)}},Pd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vUv ).g;
#endif`,Ld=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Rd=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,Id=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Dd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Nd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Od="vec3 transformed = vec3( position );",zd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Fd=`vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float roughness ) {
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
	float D = D_GGX( alpha, dotNH );
	return F * ( V * D );
}
#ifdef USE_IRIDESCENCE
	vec3 BRDF_GGX_Iridescence( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float iridescence, const in vec3 iridescenceFresnel, const in float roughness ) {
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = mix( F_Schlick( f0, f90, dotVH ), iridescenceFresnel, iridescence );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif`,kd=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			 return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float R21 = R12;
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Bd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vUv );
		vec2 dSTdy = dFdy( vUv );
		float Hll = bumpScale * texture2D( bumpMap, vUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = dFdx( surf_pos.xyz );
		vec3 vSigmaY = dFdy( surf_pos.xyz );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Ud=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,Vd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Gd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Hd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Wd=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Xd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,qd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,Yd=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,Zd=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
struct GeometricContext {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal;
#endif
};
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}`,Jd=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_v0 0.339
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_v1 0.276
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_v4 0.046
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_v5 0.016
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_v6 0.0038
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,$d=`vec3 transformedNormal = objectNormal;
#ifdef USE_INSTANCING
	mat3 m = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
	transformedNormal = m * transformedNormal;
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	vec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Kd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,jd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vUv ).x * displacementScale + displacementBias );
#endif`,Qd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,ef=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,tf="gl_FragColor = linearToOutputTexel( gl_FragColor );",nf=`vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,sf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,rf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,of=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,af=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,lf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,cf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,hf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,uf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,df=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ff=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,pf=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vUv2 );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,mf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,gf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,xf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in GeometricContext geometry, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in GeometricContext geometry, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,yf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
uniform vec3 lightProbe[ 9 ];
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( PHYSICALLY_CORRECT_LIGHTS )
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#else
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometry.position;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometry.position;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,_f=`#if defined( USE_ENVMAP )
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
#endif`,vf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,bf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Mf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,wf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Sf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULARINTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vUv ).a;
		#endif
		#ifdef USE_SPECULARCOLORMAP
			specularColorFactor *= texture2D( specularColorMap, vUv ).rgb;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEENCOLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEENROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vUv ).a;
	#endif
#endif`,Tf=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
};
vec3 clearcoatSpecular = vec3( 0.0 );
vec3 sheenSpecular = vec3( 0.0 );
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometry.normal;
		vec3 viewDir = geometry.viewDir;
		vec3 position = geometry.position;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometry.clearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecular += ccIrradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.clearcoatNormal, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * BRDF_Sheen( directLight.direction, geometry.viewDir, geometry.normal, material.sheenColor, material.sheenRoughness );
	#endif
	#ifdef USE_IRIDESCENCE
		reflectedLight.directSpecular += irradiance * BRDF_GGX_Iridescence( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness );
	#else
		reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularF90, material.roughness );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecular += clearcoatRadiance * EnvironmentBRDF( geometry.clearcoatNormal, geometry.viewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * material.sheenColor * IBLSheenBRDF( geometry.normal, geometry.viewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Af=`
GeometricContext geometry;
geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
#ifdef USE_CLEARCOAT
	geometry.clearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometry.viewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometry, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Ef=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometry.normal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	radiance += getIBLRadiance( geometry.viewDir, geometry.normal, material.roughness );
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Cf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );
#endif`,Pf=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Lf=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Rf=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,If=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Df=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Nf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Of=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,zf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	uniform mat3 uvTransform;
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ff=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vUv );
	metalnessFactor *= texelMetalness.b;
#endif`,kf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Bf=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Uf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,Vf=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,Gf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,Hf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	#ifdef USE_TANGENT
		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );
		#ifdef DOUBLE_SIDED
			tangent = tangent * faceDirection;
			bitangent = bitangent * faceDirection;
		#endif
		#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )
			mat3 vTBN = mat3( tangent, bitangent, normal );
		#endif
	#endif
#endif
vec3 geometryNormal = normal;`,Wf=`#ifdef OBJECTSPACE_NORMALMAP
	normal = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( TANGENTSPACE_NORMALMAP )
	vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	#ifdef USE_TANGENT
		normal = normalize( vTBN * mapN );
	#else
		normal = perturbNormal2Arb( - vViewPosition, normal, mapN, faceDirection );
	#endif
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Xf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,qf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Yf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Zf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef OBJECTSPACE_NORMALMAP
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( TANGENTSPACE_NORMALMAP ) || defined ( USE_CLEARCOAT_NORMALMAP ) )
	vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( vUv.st );
		vec2 st1 = dFdy( vUv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );
		return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );
	}
#endif`,Jf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = geometryNormal;
#endif`,$f=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	#ifdef USE_TANGENT
		clearcoatNormal = normalize( vTBN * clearcoatMapN );
	#else
		clearcoatNormal = perturbNormal2Arb( - vViewPosition, clearcoatNormal, clearcoatMapN, faceDirection );
	#endif
#endif`,Kf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif`,jf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Qf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha + 0.1;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,ep=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
	return linearClipZ * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}`,tp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,np=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ip=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,sp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,rp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vUv );
	roughnessFactor *= texelRoughness.g;
#endif`,op=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ap=`#if NUM_SPOT_LIGHT_COORDS > 0
  varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
  uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
		bool inFrustum = all( inFrustumVec );
		bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );
		bool frustumTest = all( frustumTestVec );
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,lp=`#if NUM_SPOT_LIGHT_COORDS > 0
  uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
  varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,cp=`#if defined( USE_SHADOWMAP ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#if NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SPOT_LIGHT_COORDS > 0 || NUM_POINT_LIGHT_SHADOWS > 0
		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		vec4 shadowWorldPosition;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
		vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
		vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
	#endif
#endif`,hp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,up=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,dp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	uniform int boneTextureSize;
	mat4 getBoneMatrix( const in float i ) {
		float j = i * 4.0;
		float x = mod( j, float( boneTextureSize ) );
		float y = floor( j / float( boneTextureSize ) );
		float dx = 1.0 / float( boneTextureSize );
		float dy = 1.0 / float( boneTextureSize );
		y = dy * ( y + 0.5 );
		vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
		vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
		vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
		vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
		mat4 bone = mat4( v1, v2, v3, v4 );
		return bone;
	}
#endif`,fp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,pp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,mp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,gp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,xp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,yp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return toneMappingExposure * color;
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,_p=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmission = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmission.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );
#endif`,vp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float framebufferLod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		#ifdef texture2DLodEXT
			return texture2DLodEXT( transmissionSamplerMap, fragCoord.xy, framebufferLod );
		#else
			return texture2D( transmissionSamplerMap, fragCoord.xy, framebufferLod );
		#endif
	}
	vec3 applyVolumeAttenuation( const in vec3 radiance, const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return radiance;
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance * radiance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 attenuatedColor = applyVolumeAttenuation( transmittedLight.rgb, length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		return vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );
	}
#endif`,bp=`#if ( defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY ) )
	varying vec2 vUv;
#endif`,Mp=`#ifdef USE_UV
	#ifdef UVS_VERTEX_ONLY
		vec2 vUv;
	#else
		varying vec2 vUv;
	#endif
	uniform mat3 uvTransform;
#endif`,wp=`#ifdef USE_UV
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
#endif`,Sp=`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	varying vec2 vUv2;
#endif`,Tp=`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	attribute vec2 uv2;
	varying vec2 vUv2;
	uniform mat3 uv2Transform;
#endif`,Ap=`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;
#endif`,Ep=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Cp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Pp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,Lp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Rp=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,Ip=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Dp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,Np=`#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Op=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,zp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Fp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,kp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Bp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,Up=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Vp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Gp=`#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Hp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Xp=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Yp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Zp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Jp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,$p=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Kp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Qp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULARINTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
	#ifdef USE_SPECULARCOLORMAP
		uniform sampler2D specularColorMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEENCOLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEENROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;
	#endif
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,em=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,tm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,nm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,im=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sm=`#include <common>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,rm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,om=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,am=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,ot={alphamap_fragment:Pd,alphamap_pars_fragment:Ld,alphatest_fragment:Rd,alphatest_pars_fragment:Id,aomap_fragment:Dd,aomap_pars_fragment:Nd,begin_vertex:Od,beginnormal_vertex:zd,bsdfs:Fd,iridescence_fragment:kd,bumpmap_pars_fragment:Bd,clipping_planes_fragment:Ud,clipping_planes_pars_fragment:Vd,clipping_planes_pars_vertex:Gd,clipping_planes_vertex:Hd,color_fragment:Wd,color_pars_fragment:Xd,color_pars_vertex:qd,color_vertex:Yd,common:Zd,cube_uv_reflection_fragment:Jd,defaultnormal_vertex:$d,displacementmap_pars_vertex:Kd,displacementmap_vertex:jd,emissivemap_fragment:Qd,emissivemap_pars_fragment:ef,encodings_fragment:tf,encodings_pars_fragment:nf,envmap_fragment:sf,envmap_common_pars_fragment:rf,envmap_pars_fragment:of,envmap_pars_vertex:af,envmap_physical_pars_fragment:_f,envmap_vertex:lf,fog_vertex:cf,fog_pars_vertex:hf,fog_fragment:uf,fog_pars_fragment:df,gradientmap_pars_fragment:ff,lightmap_fragment:pf,lightmap_pars_fragment:mf,lights_lambert_fragment:gf,lights_lambert_pars_fragment:xf,lights_pars_begin:yf,lights_toon_fragment:vf,lights_toon_pars_fragment:bf,lights_phong_fragment:Mf,lights_phong_pars_fragment:wf,lights_physical_fragment:Sf,lights_physical_pars_fragment:Tf,lights_fragment_begin:Af,lights_fragment_maps:Ef,lights_fragment_end:Cf,logdepthbuf_fragment:Pf,logdepthbuf_pars_fragment:Lf,logdepthbuf_pars_vertex:Rf,logdepthbuf_vertex:If,map_fragment:Df,map_pars_fragment:Nf,map_particle_fragment:Of,map_particle_pars_fragment:zf,metalnessmap_fragment:Ff,metalnessmap_pars_fragment:kf,morphcolor_vertex:Bf,morphnormal_vertex:Uf,morphtarget_pars_vertex:Vf,morphtarget_vertex:Gf,normal_fragment_begin:Hf,normal_fragment_maps:Wf,normal_pars_fragment:Xf,normal_pars_vertex:qf,normal_vertex:Yf,normalmap_pars_fragment:Zf,clearcoat_normal_fragment_begin:Jf,clearcoat_normal_fragment_maps:$f,clearcoat_pars_fragment:Kf,iridescence_pars_fragment:jf,output_fragment:Qf,packing:ep,premultiplied_alpha_fragment:tp,project_vertex:np,dithering_fragment:ip,dithering_pars_fragment:sp,roughnessmap_fragment:rp,roughnessmap_pars_fragment:op,shadowmap_pars_fragment:ap,shadowmap_pars_vertex:lp,shadowmap_vertex:cp,shadowmask_pars_fragment:hp,skinbase_vertex:up,skinning_pars_vertex:dp,skinning_vertex:fp,skinnormal_vertex:pp,specularmap_fragment:mp,specularmap_pars_fragment:gp,tonemapping_fragment:xp,tonemapping_pars_fragment:yp,transmission_fragment:_p,transmission_pars_fragment:vp,uv_pars_fragment:bp,uv_pars_vertex:Mp,uv_vertex:wp,uv2_pars_fragment:Sp,uv2_pars_vertex:Tp,uv2_vertex:Ap,worldpos_vertex:Ep,background_vert:Cp,background_frag:Pp,backgroundCube_vert:Lp,backgroundCube_frag:Rp,cube_vert:Ip,cube_frag:Dp,depth_vert:Np,depth_frag:Op,distanceRGBA_vert:zp,distanceRGBA_frag:Fp,equirect_vert:kp,equirect_frag:Bp,linedashed_vert:Up,linedashed_frag:Vp,meshbasic_vert:Gp,meshbasic_frag:Hp,meshlambert_vert:Wp,meshlambert_frag:Xp,meshmatcap_vert:qp,meshmatcap_frag:Yp,meshnormal_vert:Zp,meshnormal_frag:Jp,meshphong_vert:$p,meshphong_frag:Kp,meshphysical_vert:jp,meshphysical_frag:Qp,meshtoon_vert:em,meshtoon_frag:tm,points_vert:nm,points_frag:im,shadow_vert:sm,shadow_frag:rm,sprite_vert:om,sprite_frag:am},be={common:{diffuse:{value:new ft(16777215)},opacity:{value:1},map:{value:null},uvTransform:{value:new Sn},uv2Transform:{value:new Sn},alphaMap:{value:null},alphaTest:{value:0}},specularmap:{specularMap:{value:null}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1}},emissivemap:{emissiveMap:{value:null}},bumpmap:{bumpMap:{value:null},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalScale:{value:new Ue(1,1)}},displacementmap:{displacementMap:{value:null},displacementScale:{value:1},displacementBias:{value:0}},roughnessmap:{roughnessMap:{value:null}},metalnessmap:{metalnessMap:{value:null}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ft(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ft(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaTest:{value:0},uvTransform:{value:new Sn}},sprite:{diffuse:{value:new ft(16777215)},opacity:{value:1},center:{value:new Ue(.5,.5)},rotation:{value:0},map:{value:null},alphaMap:{value:null},alphaTest:{value:0},uvTransform:{value:new Sn}}},Hn={basic:{uniforms:hn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.fog]),vertexShader:ot.meshbasic_vert,fragmentShader:ot.meshbasic_frag},lambert:{uniforms:hn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new ft(0)}}]),vertexShader:ot.meshlambert_vert,fragmentShader:ot.meshlambert_frag},phong:{uniforms:hn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new ft(0)},specular:{value:new ft(1118481)},shininess:{value:30}}]),vertexShader:ot.meshphong_vert,fragmentShader:ot.meshphong_frag},standard:{uniforms:hn([be.common,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.roughnessmap,be.metalnessmap,be.fog,be.lights,{emissive:{value:new ft(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ot.meshphysical_vert,fragmentShader:ot.meshphysical_frag},toon:{uniforms:hn([be.common,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.gradientmap,be.fog,be.lights,{emissive:{value:new ft(0)}}]),vertexShader:ot.meshtoon_vert,fragmentShader:ot.meshtoon_frag},matcap:{uniforms:hn([be.common,be.bumpmap,be.normalmap,be.displacementmap,be.fog,{matcap:{value:null}}]),vertexShader:ot.meshmatcap_vert,fragmentShader:ot.meshmatcap_frag},points:{uniforms:hn([be.points,be.fog]),vertexShader:ot.points_vert,fragmentShader:ot.points_frag},dashed:{uniforms:hn([be.common,be.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ot.linedashed_vert,fragmentShader:ot.linedashed_frag},depth:{uniforms:hn([be.common,be.displacementmap]),vertexShader:ot.depth_vert,fragmentShader:ot.depth_frag},normal:{uniforms:hn([be.common,be.bumpmap,be.normalmap,be.displacementmap,{opacity:{value:1}}]),vertexShader:ot.meshnormal_vert,fragmentShader:ot.meshnormal_frag},sprite:{uniforms:hn([be.sprite,be.fog]),vertexShader:ot.sprite_vert,fragmentShader:ot.sprite_frag},background:{uniforms:{uvTransform:{value:new Sn},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ot.background_vert,fragmentShader:ot.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:ot.backgroundCube_vert,fragmentShader:ot.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ot.cube_vert,fragmentShader:ot.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ot.equirect_vert,fragmentShader:ot.equirect_frag},distanceRGBA:{uniforms:hn([be.common,be.displacementmap,{referencePosition:{value:new R},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ot.distanceRGBA_vert,fragmentShader:ot.distanceRGBA_frag},shadow:{uniforms:hn([be.lights,be.fog,{color:{value:new ft(0)},opacity:{value:1}}]),vertexShader:ot.shadow_vert,fragmentShader:ot.shadow_frag}};Hn.physical={uniforms:hn([Hn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatNormalScale:{value:new Ue(1,1)},clearcoatNormalMap:{value:null},iridescence:{value:0},iridescenceMap:{value:null},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},sheen:{value:0},sheenColor:{value:new ft(0)},sheenColorMap:{value:null},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},transmission:{value:0},transmissionMap:{value:null},transmissionSamplerSize:{value:new Ue},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},attenuationDistance:{value:0},attenuationColor:{value:new ft(0)},specularIntensity:{value:1},specularIntensityMap:{value:null},specularColor:{value:new ft(1,1,1)},specularColorMap:{value:null}}]),vertexShader:ot.meshphysical_vert,fragmentShader:ot.meshphysical_frag};var Xr={r:0,b:0,g:0};function lm(r,e,t,n,i,s,a){let o=new ft(0),c=s===!0?0:1,h,u,l=null,d=0,g=null;function _(f,b){let P=!1,A=b.isScene===!0?b.background:null;A&&A.isTexture&&(A=(b.backgroundBlurriness>0?t:e).get(A));let v=r.xr,w=v.getSession&&v.getSession();w&&w.environmentBlendMode==="additive"&&(A=null),A===null?m(o,c):A&&A.isColor&&(m(A,1),P=!0),(r.autoClear||P)&&r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil),A&&(A.isCubeTexture||A.mapping===Ao)?(u===void 0&&(u=new Ve(new Un(1,1,1),new ri({name:"BackgroundCubeMaterial",uniforms:ws(Hn.backgroundCube.uniforms),vertexShader:Hn.backgroundCube.vertexShader,fragmentShader:Hn.backgroundCube.fragmentShader,side:_n,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(O,U,y){this.matrixWorld.copyPosition(y.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),u.material.uniforms.envMap.value=A,u.material.uniforms.flipEnvMap.value=A.isCubeTexture&&A.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,(l!==A||d!==A.version||g!==r.toneMapping)&&(u.material.needsUpdate=!0,l=A,d=A.version,g=r.toneMapping),u.layers.enableAll(),f.unshift(u,u.geometry,u.material,0,0,null)):A&&A.isTexture&&(h===void 0&&(h=new Ve(new oi(2,2),new ri({name:"BackgroundMaterial",uniforms:ws(Hn.background.uniforms),vertexShader:Hn.background.vertexShader,fragmentShader:Hn.background.fragmentShader,side:ys,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),Object.defineProperty(h.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(h)),h.material.uniforms.t2D.value=A,h.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,A.matrixAutoUpdate===!0&&A.updateMatrix(),h.material.uniforms.uvTransform.value.copy(A.matrix),(l!==A||d!==A.version||g!==r.toneMapping)&&(h.material.needsUpdate=!0,l=A,d=A.version,g=r.toneMapping),h.layers.enableAll(),f.unshift(h,h.geometry,h.material,0,0,null))}function m(f,b){f.getRGB(Xr,bh(r)),n.buffers.color.setClear(Xr.r,Xr.g,Xr.b,b,a)}return{getClearColor:function(){return o},setClearColor:function(f,b=1){o.set(f),c=b,m(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(f){c=f,m(o,c)},render:_}}function cm(r,e,t,n){let i=r.getParameter(34921),s=n.isWebGL2?null:e.get("OES_vertex_array_object"),a=n.isWebGL2||s!==null,o={},c=f(null),h=c,u=!1;function l(V,j,oe,fe,ie){let le=!1;if(a){let ce=m(fe,oe,j);h!==ce&&(h=ce,g(h.object)),le=b(V,fe,oe,ie),le&&P(V,fe,oe,ie)}else{let ce=j.wireframe===!0;(h.geometry!==fe.id||h.program!==oe.id||h.wireframe!==ce)&&(h.geometry=fe.id,h.program=oe.id,h.wireframe=ce,le=!0)}ie!==null&&t.update(ie,34963),(le||u)&&(u=!1,y(V,j,oe,fe),ie!==null&&r.bindBuffer(34963,t.get(ie).buffer))}function d(){return n.isWebGL2?r.createVertexArray():s.createVertexArrayOES()}function g(V){return n.isWebGL2?r.bindVertexArray(V):s.bindVertexArrayOES(V)}function _(V){return n.isWebGL2?r.deleteVertexArray(V):s.deleteVertexArrayOES(V)}function m(V,j,oe){let fe=oe.wireframe===!0,ie=o[V.id];ie===void 0&&(ie={},o[V.id]=ie);let le=ie[j.id];le===void 0&&(le={},ie[j.id]=le);let ce=le[fe];return ce===void 0&&(ce=f(d()),le[fe]=ce),ce}function f(V){let j=[],oe=[],fe=[];for(let ie=0;ie<i;ie++)j[ie]=0,oe[ie]=0,fe[ie]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:j,enabledAttributes:oe,attributeDivisors:fe,object:V,attributes:{},index:null}}function b(V,j,oe,fe){let ie=h.attributes,le=j.attributes,ce=0,ee=oe.getAttributes();for(let J in ee)if(ee[J].location>=0){let ge=ie[J],ve=le[J];if(ve===void 0&&(J==="instanceMatrix"&&V.instanceMatrix&&(ve=V.instanceMatrix),J==="instanceColor"&&V.instanceColor&&(ve=V.instanceColor)),ge===void 0||ge.attribute!==ve||ve&&ge.data!==ve.data)return!0;ce++}return h.attributesNum!==ce||h.index!==fe}function P(V,j,oe,fe){let ie={},le=j.attributes,ce=0,ee=oe.getAttributes();for(let J in ee)if(ee[J].location>=0){let ge=le[J];ge===void 0&&(J==="instanceMatrix"&&V.instanceMatrix&&(ge=V.instanceMatrix),J==="instanceColor"&&V.instanceColor&&(ge=V.instanceColor));let ve={};ve.attribute=ge,ge&&ge.data&&(ve.data=ge.data),ie[J]=ve,ce++}h.attributes=ie,h.attributesNum=ce,h.index=fe}function A(){let V=h.newAttributes;for(let j=0,oe=V.length;j<oe;j++)V[j]=0}function v(V){w(V,0)}function w(V,j){let oe=h.newAttributes,fe=h.enabledAttributes,ie=h.attributeDivisors;oe[V]=1,fe[V]===0&&(r.enableVertexAttribArray(V),fe[V]=1),ie[V]!==j&&((n.isWebGL2?r:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](V,j),ie[V]=j)}function O(){let V=h.newAttributes,j=h.enabledAttributes;for(let oe=0,fe=j.length;oe<fe;oe++)j[oe]!==V[oe]&&(r.disableVertexAttribArray(oe),j[oe]=0)}function U(V,j,oe,fe,ie,le){n.isWebGL2===!0&&(oe===5124||oe===5125)?r.vertexAttribIPointer(V,j,oe,ie,le):r.vertexAttribPointer(V,j,oe,fe,ie,le)}function y(V,j,oe,fe){if(n.isWebGL2===!1&&(V.isInstancedMesh||fe.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;A();let ie=fe.attributes,le=oe.getAttributes(),ce=j.defaultAttributeValues;for(let ee in le){let J=le[ee];if(J.location>=0){let ye=ie[ee];if(ye===void 0&&(ee==="instanceMatrix"&&V.instanceMatrix&&(ye=V.instanceMatrix),ee==="instanceColor"&&V.instanceColor&&(ye=V.instanceColor)),ye!==void 0){let ge=ye.normalized,ve=ye.itemSize,ne=t.get(ye);if(ne===void 0)continue;let lt=ne.buffer,Re=ne.type,Ge=ne.bytesPerElement;if(ye.isInterleavedBufferAttribute){let Ee=ye.data,pt=Ee.stride,je=ye.offset;if(Ee.isInstancedInterleavedBuffer){for(let Xe=0;Xe<J.locationSize;Xe++)w(J.location+Xe,Ee.meshPerAttribute);V.isInstancedMesh!==!0&&fe._maxInstanceCount===void 0&&(fe._maxInstanceCount=Ee.meshPerAttribute*Ee.count)}else for(let Xe=0;Xe<J.locationSize;Xe++)v(J.location+Xe);r.bindBuffer(34962,lt);for(let Xe=0;Xe<J.locationSize;Xe++)U(J.location+Xe,ve/J.locationSize,Re,ge,pt*Ge,(je+ve/J.locationSize*Xe)*Ge)}else{if(ye.isInstancedBufferAttribute){for(let Ee=0;Ee<J.locationSize;Ee++)w(J.location+Ee,ye.meshPerAttribute);V.isInstancedMesh!==!0&&fe._maxInstanceCount===void 0&&(fe._maxInstanceCount=ye.meshPerAttribute*ye.count)}else for(let Ee=0;Ee<J.locationSize;Ee++)v(J.location+Ee);r.bindBuffer(34962,lt);for(let Ee=0;Ee<J.locationSize;Ee++)U(J.location+Ee,ve/J.locationSize,Re,ge,ve*Ge,ve/J.locationSize*Ee*Ge)}}else if(ce!==void 0){let ge=ce[ee];if(ge!==void 0)switch(ge.length){case 2:r.vertexAttrib2fv(J.location,ge);break;case 3:r.vertexAttrib3fv(J.location,ge);break;case 4:r.vertexAttrib4fv(J.location,ge);break;default:r.vertexAttrib1fv(J.location,ge)}}}}O()}function L(){re();for(let V in o){let j=o[V];for(let oe in j){let fe=j[oe];for(let ie in fe)_(fe[ie].object),delete fe[ie];delete j[oe]}delete o[V]}}function z(V){if(o[V.id]===void 0)return;let j=o[V.id];for(let oe in j){let fe=j[oe];for(let ie in fe)_(fe[ie].object),delete fe[ie];delete j[oe]}delete o[V.id]}function Z(V){for(let j in o){let oe=o[j];if(oe[V.id]===void 0)continue;let fe=oe[V.id];for(let ie in fe)_(fe[ie].object),delete fe[ie];delete oe[V.id]}}function re(){Y(),u=!0,h!==c&&(h=c,g(h.object))}function Y(){c.geometry=null,c.program=null,c.wireframe=!1}return{setup:l,reset:re,resetDefaultState:Y,dispose:L,releaseStatesOfGeometry:z,releaseStatesOfProgram:Z,initAttributes:A,enableAttribute:v,disableUnusedAttributes:O}}function hm(r,e,t,n){let i=n.isWebGL2,s;function a(h){s=h}function o(h,u){r.drawArrays(s,h,u),t.update(u,s,1)}function c(h,u,l){if(l===0)return;let d,g;if(i)d=r,g="drawArraysInstanced";else if(d=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",d===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}d[g](s,h,u,l),t.update(u,s,l)}this.setMode=a,this.render=o,this.renderInstances=c}function um(r,e,t){let n;function i(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){let U=e.get("EXT_texture_filter_anisotropic");n=r.getParameter(U.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function s(U){if(U==="highp"){if(r.getShaderPrecisionFormat(35633,36338).precision>0&&r.getShaderPrecisionFormat(35632,36338).precision>0)return"highp";U="mediump"}return U==="mediump"&&r.getShaderPrecisionFormat(35633,36337).precision>0&&r.getShaderPrecisionFormat(35632,36337).precision>0?"mediump":"lowp"}let a=typeof WebGL2RenderingContext!="undefined"&&r instanceof WebGL2RenderingContext||typeof WebGL2ComputeRenderingContext!="undefined"&&r instanceof WebGL2ComputeRenderingContext,o=t.precision!==void 0?t.precision:"highp",c=s(o);c!==o&&(console.warn("THREE.WebGLRenderer:",o,"not supported, using",c,"instead."),o=c);let h=a||e.has("WEBGL_draw_buffers"),u=t.logarithmicDepthBuffer===!0,l=r.getParameter(34930),d=r.getParameter(35660),g=r.getParameter(3379),_=r.getParameter(34076),m=r.getParameter(34921),f=r.getParameter(36347),b=r.getParameter(36348),P=r.getParameter(36349),A=d>0,v=a||e.has("OES_texture_float"),w=A&&v,O=a?r.getParameter(36183):0;return{isWebGL2:a,drawBuffers:h,getMaxAnisotropy:i,getMaxPrecision:s,precision:o,logarithmicDepthBuffer:u,maxTextures:l,maxVertexTextures:d,maxTextureSize:g,maxCubemapSize:_,maxAttributes:m,maxVertexUniforms:f,maxVaryings:b,maxFragmentUniforms:P,vertexTextures:A,floatFragmentTextures:v,floatVertexTextures:w,maxSamples:O}}function dm(r){let e=this,t=null,n=0,i=!1,s=!1,a=new Qn,o=new Sn,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(l,d,g){let _=l.length!==0||d||n!==0||i;return i=d,t=u(l,g,0),n=l.length,_},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1,h()},this.setState=function(l,d,g){let _=l.clippingPlanes,m=l.clipIntersection,f=l.clipShadows,b=r.get(l);if(!i||_===null||_.length===0||s&&!f)s?u(null):h();else{let P=s?0:n,A=P*4,v=b.clippingState||null;c.value=v,v=u(_,d,A,g);for(let w=0;w!==A;++w)v[w]=t[w];b.clippingState=v,this.numIntersection=m?this.numPlanes:0,this.numPlanes+=P}};function h(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(l,d,g,_){let m=l!==null?l.length:0,f=null;if(m!==0){if(f=c.value,_!==!0||f===null){let b=g+m*4,P=d.matrixWorldInverse;o.getNormalMatrix(P),(f===null||f.length<b)&&(f=new Float32Array(b));for(let A=0,v=g;A!==m;++A,v+=4)a.copy(l[A]).applyMatrix4(P,o),a.normal.toArray(f,v),f[v+3]=a.constant}c.value=f,c.needsUpdate=!0}return e.numPlanes=m,e.numIntersection=0,f}}function fm(r){let e=new WeakMap;function t(a,o){return o===Aa?a.mapping=_s:o===Ea&&(a.mapping=vs),a}function n(a){if(a&&a.isTexture&&a.isRenderTargetTexture===!1){let o=a.mapping;if(o===Aa||o===Ea)if(e.has(a)){let c=e.get(a).texture;return t(c,a.mapping)}else{let c=a.image;if(c&&c.height>0){let h=new Oa(c.height/2);return h.fromEquirectangularTexture(r,a),e.set(a,h),a.addEventListener("dispose",i),t(h.texture,a.mapping)}else return null}}return a}function i(a){let o=a.target;o.removeEventListener("dispose",i);let c=e.get(o);c!==void 0&&(e.delete(o),c.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}var po=class extends uo{constructor(e=-1,t=1,n=1,i=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,s=n-e,a=n+e,o=i+t,c=i-t;if(this.view!==null&&this.view.enabled){let h=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=h*this.view.offsetX,a=s+h*this.view.width,o-=u*this.view.offsetY,c=o-u*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,c,this.near,this.far),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},fs=4,Nc=[.125,.215,.35,.446,.526,.582],Ci=20,ya=new po,Oc=new ft,_a=null,Ei=(1+Math.sqrt(5))/2,as=1/Ei,zc=[new R(1,1,1),new R(-1,1,1),new R(1,1,-1),new R(-1,1,-1),new R(0,Ei,as),new R(0,Ei,-as),new R(as,0,Ei),new R(-as,0,Ei),new R(Ei,as,0),new R(-Ei,as,0)],Ss=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){_a=this._renderer.getRenderTarget(),this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,i,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Bc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=kc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(_a),e.scissorTest=!1,qr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===_s||e.mapping===vs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),_a=this._renderer.getRenderTarget();let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Ln,minFilter:Ln,generateMipmaps:!1,type:js,format:Bn,encoding:Ni,depthBuffer:!1},i=Fc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Fc(e,t,n);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=pm(s)),this._blurMaterial=mm(s,e,t)}return i}_compileMaterial(e){let t=new Ve(this._lodPlanes[0],e);this._renderer.compile(t,ya)}_sceneToCubeUV(e,t,n,i){let o=new sn(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,l=u.autoClear,d=u.toneMapping;u.getClearColor(Oc),u.toneMapping=ti,u.autoClear=!1;let g=new kt({name:"PMREM.Background",side:_n,depthWrite:!1,depthTest:!1}),_=new Ve(new Un,g),m=!1,f=e.background;f?f.isColor&&(g.color.copy(f),e.background=null,m=!0):(g.color.copy(Oc),m=!0);for(let b=0;b<6;b++){let P=b%3;P===0?(o.up.set(0,c[b],0),o.lookAt(h[b],0,0)):P===1?(o.up.set(0,0,c[b]),o.lookAt(0,h[b],0)):(o.up.set(0,c[b],0),o.lookAt(0,0,h[b]));let A=this._cubeSize;qr(i,P*A,b>2?A:0,A,A),u.setRenderTarget(i),m&&u.render(_,o),u.render(e,o)}_.geometry.dispose(),_.material.dispose(),u.toneMapping=d,u.autoClear=l,e.background=f}_textureToCubeUV(e,t){let n=this._renderer,i=e.mapping===_s||e.mapping===vs;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Bc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=kc());let s=i?this._cubemapMaterial:this._equirectMaterial,a=new Ve(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;let c=this._cubeSize;qr(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,ya)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let i=1;i<this._lodPlanes.length;i++){let s=Math.sqrt(this._sigmas[i]*this._sigmas[i]-this._sigmas[i-1]*this._sigmas[i-1]),a=zc[(i-1)%zc.length];this._blur(e,i-1,i,s,a)}t.autoClear=n}_blur(e,t,n,i,s){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",s),this._halfBlur(a,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,a,o){let c=this._renderer,h=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,l=new Ve(this._lodPlanes[i],h),d=h.uniforms,g=this._sizeLods[n]-1,_=isFinite(s)?Math.PI/(2*g):2*Math.PI/(2*Ci-1),m=s/_,f=isFinite(s)?1+Math.floor(u*m):Ci;f>Ci&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${Ci}`);let b=[],P=0;for(let U=0;U<Ci;++U){let y=U/m,L=Math.exp(-y*y/2);b.push(L),U===0?P+=L:U<f&&(P+=2*L)}for(let U=0;U<b.length;U++)b[U]=b[U]/P;d.envMap.value=e.texture,d.samples.value=f,d.weights.value=b,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);let{_lodMax:A}=this;d.dTheta.value=_,d.mipInt.value=A-n;let v=this._sizeLods[i],w=3*v*(i>A-fs?i-A+fs:0),O=4*(this._cubeSize-v);qr(t,w,O,3*v,2*v),c.setRenderTarget(t),c.render(l,ya)}};function pm(r){let e=[],t=[],n=[],i=r,s=r-fs+1+Nc.length;for(let a=0;a<s;a++){let o=Math.pow(2,i);t.push(o);let c=1/o;a>r-fs?c=Nc[a-r+fs-1]:a===0&&(c=0),n.push(c);let h=1/(o-2),u=-h,l=1+h,d=[u,u,l,u,l,l,u,u,l,l,u,l],g=6,_=6,m=3,f=2,b=1,P=new Float32Array(m*_*g),A=new Float32Array(f*_*g),v=new Float32Array(b*_*g);for(let O=0;O<g;O++){let U=O%3*2/3-1,y=O>2?0:-1,L=[U,y,0,U+2/3,y,0,U+2/3,y+1,0,U,y,0,U+2/3,y+1,0,U,y+1,0];P.set(L,m*_*O),A.set(d,f*_*O);let z=[O,O,O,O,O,O];v.set(z,b*_*O)}let w=new Ut;w.setAttribute("position",new rn(P,m)),w.setAttribute("uv",new rn(A,f)),w.setAttribute("faceIndex",new rn(v,b)),e.push(w),i>fs&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Fc(r,e,t){let n=new ii(r,e,t);return n.texture.mapping=Ao,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function qr(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function mm(r,e,t){let n=new Float32Array(Ci),i=new R(0,1,0);return new ri({name:"SphericalGaussianBlur",defines:{n:Ci,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:ul(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:gi,depthTest:!1,depthWrite:!1})}function kc(){return new ri({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ul(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:gi,depthTest:!1,depthWrite:!1})}function Bc(){return new ri({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ul(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:gi,depthTest:!1,depthWrite:!1})}function ul(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function gm(r){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){let c=o.mapping,h=c===Aa||c===Ea,u=c===_s||c===vs;if(h||u)if(o.isRenderTargetTexture&&o.needsPMREMUpdate===!0){o.needsPMREMUpdate=!1;let l=e.get(o);return t===null&&(t=new Ss(r)),l=h?t.fromEquirectangular(o,l):t.fromCubemap(o,l),e.set(o,l),l.texture}else{if(e.has(o))return e.get(o).texture;{let l=o.image;if(h&&l&&l.height>0||u&&l&&i(l)){t===null&&(t=new Ss(r));let d=h?t.fromEquirectangular(o):t.fromCubemap(o);return e.set(o,d),o.addEventListener("dispose",s),d.texture}else return null}}}return o}function i(o){let c=0,h=6;for(let u=0;u<h;u++)o[u]!==void 0&&c++;return c===h}function s(o){let c=o.target;c.removeEventListener("dispose",s);let h=e.get(c);h!==void 0&&(e.delete(c),h.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function xm(r){let e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?t("EXT_color_buffer_float"):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){let i=t(n);return i===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function ym(r,e,t,n){let i={},s=new WeakMap;function a(l){let d=l.target;d.index!==null&&e.remove(d.index);for(let _ in d.attributes)e.remove(d.attributes[_]);d.removeEventListener("dispose",a),delete i[d.id];let g=s.get(d);g&&(e.remove(g),s.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(l,d){return i[d.id]===!0||(d.addEventListener("dispose",a),i[d.id]=!0,t.memory.geometries++),d}function c(l){let d=l.attributes;for(let _ in d)e.update(d[_],34962);let g=l.morphAttributes;for(let _ in g){let m=g[_];for(let f=0,b=m.length;f<b;f++)e.update(m[f],34962)}}function h(l){let d=[],g=l.index,_=l.attributes.position,m=0;if(g!==null){let P=g.array;m=g.version;for(let A=0,v=P.length;A<v;A+=3){let w=P[A+0],O=P[A+1],U=P[A+2];d.push(w,O,O,U,U,w)}}else{let P=_.array;m=_.version;for(let A=0,v=P.length/3-1;A<v;A+=3){let w=A+0,O=A+1,U=A+2;d.push(w,O,O,U,U,w)}}let f=new(_h(d)?ho:co)(d,1);f.version=m;let b=s.get(l);b&&e.remove(b),s.set(l,f)}function u(l){let d=s.get(l);if(d){let g=l.index;g!==null&&d.version<g.version&&h(l)}else h(l);return s.get(l)}return{get:o,update:c,getWireframeAttribute:u}}function _m(r,e,t,n){let i=n.isWebGL2,s;function a(d){s=d}let o,c;function h(d){o=d.type,c=d.bytesPerElement}function u(d,g){r.drawElements(s,g,o,d*c),t.update(g,s,1)}function l(d,g,_){if(_===0)return;let m,f;if(i)m=r,f="drawElementsInstanced";else if(m=e.get("ANGLE_instanced_arrays"),f="drawElementsInstancedANGLE",m===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[f](s,g,o,d*c,_),t.update(g,s,_)}this.setMode=a,this.setIndex=h,this.render=u,this.renderInstances=l}function vm(r){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(t.calls++,a){case 4:t.triangles+=o*(s/3);break;case 1:t.lines+=o*(s/2);break;case 3:t.lines+=o*(s-1);break;case 2:t.lines+=o*s;break;case 0:t.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){t.frame++,t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function bm(r,e){return r[0]-e[0]}function Mm(r,e){return Math.abs(e[1])-Math.abs(r[1])}function wm(r,e,t){let n={},i=new Float32Array(8),s=new WeakMap,a=new It,o=[];for(let h=0;h<8;h++)o[h]=[h,0];function c(h,u,l,d){let g=h.morphTargetInfluences;if(e.isWebGL2===!0){let _=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,m=_!==void 0?_.length:0,f=s.get(u);if(f===void 0||f.count!==m){let j=function(){Y.dispose(),s.delete(u),u.removeEventListener("dispose",j)};f!==void 0&&f.texture.dispose();let A=u.morphAttributes.position!==void 0,v=u.morphAttributes.normal!==void 0,w=u.morphAttributes.color!==void 0,O=u.morphAttributes.position||[],U=u.morphAttributes.normal||[],y=u.morphAttributes.color||[],L=0;A===!0&&(L=1),v===!0&&(L=2),w===!0&&(L=3);let z=u.attributes.position.count*L,Z=1;z>e.maxTextureSize&&(Z=Math.ceil(z/e.maxTextureSize),z=e.maxTextureSize);let re=new Float32Array(z*Z*4*m),Y=new oo(re,z,Z,m);Y.type=Li,Y.needsUpdate=!0;let V=L*4;for(let oe=0;oe<m;oe++){let fe=O[oe],ie=U[oe],le=y[oe],ce=z*Z*4*oe;for(let ee=0;ee<fe.count;ee++){let J=ee*V;A===!0&&(a.fromBufferAttribute(fe,ee),re[ce+J+0]=a.x,re[ce+J+1]=a.y,re[ce+J+2]=a.z,re[ce+J+3]=0),v===!0&&(a.fromBufferAttribute(ie,ee),re[ce+J+4]=a.x,re[ce+J+5]=a.y,re[ce+J+6]=a.z,re[ce+J+7]=0),w===!0&&(a.fromBufferAttribute(le,ee),re[ce+J+8]=a.x,re[ce+J+9]=a.y,re[ce+J+10]=a.z,re[ce+J+11]=le.itemSize===4?a.w:1)}}f={count:m,texture:Y,size:new Ue(z,Z)},s.set(u,f),u.addEventListener("dispose",j)}let b=0;for(let A=0;A<g.length;A++)b+=g[A];let P=u.morphTargetsRelative?1:1-b;d.getUniforms().setValue(r,"morphTargetBaseInfluence",P),d.getUniforms().setValue(r,"morphTargetInfluences",g),d.getUniforms().setValue(r,"morphTargetsTexture",f.texture,t),d.getUniforms().setValue(r,"morphTargetsTextureSize",f.size)}else{let _=g===void 0?0:g.length,m=n[u.id];if(m===void 0||m.length!==_){m=[];for(let v=0;v<_;v++)m[v]=[v,0];n[u.id]=m}for(let v=0;v<_;v++){let w=m[v];w[0]=v,w[1]=g[v]}m.sort(Mm);for(let v=0;v<8;v++)v<_&&m[v][1]?(o[v][0]=m[v][0],o[v][1]=m[v][1]):(o[v][0]=Number.MAX_SAFE_INTEGER,o[v][1]=0);o.sort(bm);let f=u.morphAttributes.position,b=u.morphAttributes.normal,P=0;for(let v=0;v<8;v++){let w=o[v],O=w[0],U=w[1];O!==Number.MAX_SAFE_INTEGER&&U?(f&&u.getAttribute("morphTarget"+v)!==f[O]&&u.setAttribute("morphTarget"+v,f[O]),b&&u.getAttribute("morphNormal"+v)!==b[O]&&u.setAttribute("morphNormal"+v,b[O]),i[v]=U,P+=U):(f&&u.hasAttribute("morphTarget"+v)===!0&&u.deleteAttribute("morphTarget"+v),b&&u.hasAttribute("morphNormal"+v)===!0&&u.deleteAttribute("morphNormal"+v),i[v]=0)}let A=u.morphTargetsRelative?1:1-P;d.getUniforms().setValue(r,"morphTargetBaseInfluence",A),d.getUniforms().setValue(r,"morphTargetInfluences",i)}}return{update:c}}function Sm(r,e,t,n){let i=new WeakMap;function s(c){let h=n.render.frame,u=c.geometry,l=e.get(c,u);return i.get(l)!==h&&(e.update(l),i.set(l,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),t.update(c.instanceMatrix,34962),c.instanceColor!==null&&t.update(c.instanceColor,34962)),l}function a(){i=new WeakMap}function o(c){let h=c.target;h.removeEventListener("dispose",o),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:s,dispose:a}}var wh=new fn,Sh=new oo,Th=new Da,Ah=new fo,Uc=[],Vc=[],Gc=new Float32Array(16),Hc=new Float32Array(9),Wc=new Float32Array(4);function Rs(r,e,t){let n=r[0];if(n<=0||n>0)return r;let i=e*t,s=Uc[i];if(s===void 0&&(s=new Float32Array(i),Uc[i]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,r[a].toArray(s,o)}return s}function qt(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function Yt(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function Co(r,e){let t=Vc[e];t===void 0&&(t=new Int32Array(e),Vc[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function Tm(r,e){let t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function Am(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(qt(t,e))return;r.uniform2fv(this.addr,e),Yt(t,e)}}function Em(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(qt(t,e))return;r.uniform3fv(this.addr,e),Yt(t,e)}}function Cm(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(qt(t,e))return;r.uniform4fv(this.addr,e),Yt(t,e)}}function Pm(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(qt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),Yt(t,e)}else{if(qt(t,n))return;Wc.set(n),r.uniformMatrix2fv(this.addr,!1,Wc),Yt(t,n)}}function Lm(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(qt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),Yt(t,e)}else{if(qt(t,n))return;Hc.set(n),r.uniformMatrix3fv(this.addr,!1,Hc),Yt(t,n)}}function Rm(r,e){let t=this.cache,n=e.elements;if(n===void 0){if(qt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),Yt(t,e)}else{if(qt(t,n))return;Gc.set(n),r.uniformMatrix4fv(this.addr,!1,Gc),Yt(t,n)}}function Im(r,e){let t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function Dm(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(qt(t,e))return;r.uniform2iv(this.addr,e),Yt(t,e)}}function Nm(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(qt(t,e))return;r.uniform3iv(this.addr,e),Yt(t,e)}}function Om(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(qt(t,e))return;r.uniform4iv(this.addr,e),Yt(t,e)}}function zm(r,e){let t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function Fm(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(qt(t,e))return;r.uniform2uiv(this.addr,e),Yt(t,e)}}function km(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(qt(t,e))return;r.uniform3uiv(this.addr,e),Yt(t,e)}}function Bm(r,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(qt(t,e))return;r.uniform4uiv(this.addr,e),Yt(t,e)}}function Um(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2D(e||wh,i)}function Vm(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Th,i)}function Gm(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Ah,i)}function Hm(r,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Sh,i)}function Wm(r){switch(r){case 5126:return Tm;case 35664:return Am;case 35665:return Em;case 35666:return Cm;case 35674:return Pm;case 35675:return Lm;case 35676:return Rm;case 5124:case 35670:return Im;case 35667:case 35671:return Dm;case 35668:case 35672:return Nm;case 35669:case 35673:return Om;case 5125:return zm;case 36294:return Fm;case 36295:return km;case 36296:return Bm;case 35678:case 36198:case 36298:case 36306:case 35682:return Um;case 35679:case 36299:case 36307:return Vm;case 35680:case 36300:case 36308:case 36293:return Gm;case 36289:case 36303:case 36311:case 36292:return Hm}}function Xm(r,e){r.uniform1fv(this.addr,e)}function qm(r,e){let t=Rs(e,this.size,2);r.uniform2fv(this.addr,t)}function Ym(r,e){let t=Rs(e,this.size,3);r.uniform3fv(this.addr,t)}function Zm(r,e){let t=Rs(e,this.size,4);r.uniform4fv(this.addr,t)}function Jm(r,e){let t=Rs(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function $m(r,e){let t=Rs(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function Km(r,e){let t=Rs(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function jm(r,e){r.uniform1iv(this.addr,e)}function Qm(r,e){r.uniform2iv(this.addr,e)}function eg(r,e){r.uniform3iv(this.addr,e)}function tg(r,e){r.uniform4iv(this.addr,e)}function ng(r,e){r.uniform1uiv(this.addr,e)}function ig(r,e){r.uniform2uiv(this.addr,e)}function sg(r,e){r.uniform3uiv(this.addr,e)}function rg(r,e){r.uniform4uiv(this.addr,e)}function og(r,e,t){let n=this.cache,i=e.length,s=Co(t,i);qt(n,s)||(r.uniform1iv(this.addr,s),Yt(n,s));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||wh,s[a])}function ag(r,e,t){let n=this.cache,i=e.length,s=Co(t,i);qt(n,s)||(r.uniform1iv(this.addr,s),Yt(n,s));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||Th,s[a])}function lg(r,e,t){let n=this.cache,i=e.length,s=Co(t,i);qt(n,s)||(r.uniform1iv(this.addr,s),Yt(n,s));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||Ah,s[a])}function cg(r,e,t){let n=this.cache,i=e.length,s=Co(t,i);qt(n,s)||(r.uniform1iv(this.addr,s),Yt(n,s));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||Sh,s[a])}function hg(r){switch(r){case 5126:return Xm;case 35664:return qm;case 35665:return Ym;case 35666:return Zm;case 35674:return Jm;case 35675:return $m;case 35676:return Km;case 5124:case 35670:return jm;case 35667:case 35671:return Qm;case 35668:case 35672:return eg;case 35669:case 35673:return tg;case 5125:return ng;case 36294:return ig;case 36295:return sg;case 36296:return rg;case 35678:case 36198:case 36298:case 36306:case 35682:return og;case 35679:case 36299:case 36307:return ag;case 35680:case 36300:case 36308:case 36293:return lg;case 36289:case 36303:case 36311:case 36292:return cg}}var za=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.setValue=Wm(t.type)}},Fa=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.size=t.size,this.setValue=hg(t.type)}},ka=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let i=this.seq;for(let s=0,a=i.length;s!==a;++s){let o=i[s];o.setValue(e,t[o.id],n)}}},va=/(\w+)(\])?(\[|\.)?/g;function Xc(r,e){r.seq.push(e),r.map[e.id]=e}function ug(r,e,t){let n=r.name,i=n.length;for(va.lastIndex=0;;){let s=va.exec(n),a=va.lastIndex,o=s[1],c=s[2]==="]",h=s[3];if(c&&(o=o|0),h===void 0||h==="["&&a+2===i){Xc(t,h===void 0?new za(o,r,e):new Fa(o,r,e));break}else{let l=t.map[o];l===void 0&&(l=new ka(o),Xc(t,l)),t=l}}}var xs=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,35718);for(let i=0;i<n;++i){let s=e.getActiveUniform(t,i),a=e.getUniformLocation(t,s.name);ug(s,a,this)}}setValue(e,t,n,i){let s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){let i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,a=t.length;s!==a;++s){let o=t[s],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,i)}}static seqWithValue(e,t){let n=[];for(let i=0,s=e.length;i!==s;++i){let a=e[i];a.id in t&&n.push(a)}return n}};function qc(r,e,t){let n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}var dg=0;function fg(r,e){let t=r.split(`
`),n=[],i=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=i;a<s;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}function pg(r){switch(r){case Ni:return["Linear","( value )"];case vt:return["sRGB","( value )"];default:return console.warn("THREE.WebGLProgram: Unsupported encoding:",r),["Linear","( value )"]}}function Yc(r,e,t){let n=r.getShaderParameter(e,35713),i=r.getShaderInfoLog(e).trim();if(n&&i==="")return"";let s=/ERROR: 0:(\d+)/.exec(i);if(s){let a=parseInt(s[1]);return t.toUpperCase()+`

`+i+`

`+fg(r.getShaderSource(e),a)}else return i}function mg(r,e){let t=pg(e);return"vec4 "+r+"( vec4 value ) { return LinearTo"+t[0]+t[1]+"; }"}function gg(r,e){let t;switch(e){case Au:t="Linear";break;case Eu:t="Reinhard";break;case Cu:t="OptimizedCineon";break;case Pu:t="ACESFilmic";break;case Lu:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function xg(r){return[r.extensionDerivatives||r.envMapCubeUVHeight||r.bumpMap||r.tangentSpaceNormalMap||r.clearcoatNormalMap||r.flatShading||r.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(r.extensionFragDepth||r.logarithmicDepthBuffer)&&r.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",r.extensionDrawBuffers&&r.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(r.extensionShaderTextureLOD||r.envMap||r.transmission)&&r.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(Zs).join(`
`)}function yg(r){let e=[];for(let t in r){let n=r[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function _g(r,e){let t={},n=r.getProgramParameter(e,35721);for(let i=0;i<n;i++){let s=r.getActiveAttrib(e,i),a=s.name,o=1;s.type===35674&&(o=2),s.type===35675&&(o=3),s.type===35676&&(o=4),t[a]={type:s.type,location:r.getAttribLocation(e,a),locationSize:o}}return t}function Zs(r){return r!==""}function Zc(r,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Jc(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var vg=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ba(r){return r.replace(vg,bg)}function bg(r,e){let t=ot[e];if(t===void 0)throw new Error("Can not resolve #include <"+e+">");return Ba(t)}var Mg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function $c(r){return r.replace(Mg,wg)}function wg(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function Kc(r){let e="precision "+r.precision+` float;
precision `+r.precision+" int;";return r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Sg(r){let e="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===To?e="SHADOWMAP_TYPE_PCF":r.shadowMapType===su?e="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===Ys&&(e="SHADOWMAP_TYPE_VSM"),e}function Tg(r){let e="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case _s:case vs:e="ENVMAP_TYPE_CUBE";break;case Ao:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Ag(r){let e="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case vs:e="ENVMAP_MODE_REFRACTION";break}return e}function Eg(r){let e="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case mh:e="ENVMAP_BLENDING_MULTIPLY";break;case Su:e="ENVMAP_BLENDING_MIX";break;case Tu:e="ENVMAP_BLENDING_ADD";break}return e}function Cg(r){let e=r.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function Pg(r,e,t,n){let i=r.getContext(),s=t.defines,a=t.vertexShader,o=t.fragmentShader,c=Sg(t),h=Tg(t),u=Ag(t),l=Eg(t),d=Cg(t),g=t.isWebGL2?"":xg(t),_=yg(s),m=i.createProgram(),f,b,P=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(f=[_].filter(Zs).join(`
`),f.length>0&&(f+=`
`),b=[g,_].filter(Zs).join(`
`),b.length>0&&(b+=`
`)):(f=[Kc(t),"#define SHADER_NAME "+t.shaderName,_,t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.supportsVertexTextures?"#define VERTEX_TEXTURES":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMap&&t.objectSpaceNormalMap?"#define OBJECTSPACE_NORMALMAP":"",t.normalMap&&t.tangentSpaceNormalMap?"#define TANGENTSPACE_NORMALMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.displacementMap&&t.supportsVertexTextures?"#define USE_DISPLACEMENTMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularIntensityMap?"#define USE_SPECULARINTENSITYMAP":"",t.specularColorMap?"#define USE_SPECULARCOLORMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEENCOLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEENROUGHNESSMAP":"",t.vertexTangents?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUvs?"#define USE_UV":"",t.uvsVertexOnly?"#define UVS_VERTEX_ONLY":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Zs).join(`
`),b=[g,Kc(t),"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",t.envMap?"#define "+l:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMap&&t.objectSpaceNormalMap?"#define OBJECTSPACE_NORMALMAP":"",t.normalMap&&t.tangentSpaceNormalMap?"#define TANGENTSPACE_NORMALMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularIntensityMap?"#define USE_SPECULARINTENSITYMAP":"",t.specularColorMap?"#define USE_SPECULARCOLORMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEENCOLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEENROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.vertexTangents?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUvs?"#define USE_UV":"",t.uvsVertexOnly?"#define UVS_VERTEX_ONLY":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.physicallyCorrectLights?"#define PHYSICALLY_CORRECT_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ti?"#define TONE_MAPPING":"",t.toneMapping!==ti?ot.tonemapping_pars_fragment:"",t.toneMapping!==ti?gg("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ot.encodings_pars_fragment,mg("linearToOutputTexel",t.outputEncoding),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Zs).join(`
`)),a=Ba(a),a=Zc(a,t),a=Jc(a,t),o=Ba(o),o=Zc(o,t),o=Jc(o,t),a=$c(a),o=$c(o),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(P=`#version 300 es
`,f=["precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,b=["#define varying in",t.glslVersion===Mc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Mc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+b);let A=P+f+a,v=P+b+o,w=qc(i,35633,A),O=qc(i,35632,v);if(i.attachShader(m,w),i.attachShader(m,O),t.index0AttributeName!==void 0?i.bindAttribLocation(m,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(m,0,"position"),i.linkProgram(m),r.debug.checkShaderErrors){let L=i.getProgramInfoLog(m).trim(),z=i.getShaderInfoLog(w).trim(),Z=i.getShaderInfoLog(O).trim(),re=!0,Y=!0;if(i.getProgramParameter(m,35714)===!1){re=!1;let V=Yc(i,w,"vertex"),j=Yc(i,O,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(m,35715)+`

Program Info Log: `+L+`
`+V+`
`+j)}else L!==""?console.warn("THREE.WebGLProgram: Program Info Log:",L):(z===""||Z==="")&&(Y=!1);Y&&(this.diagnostics={runnable:re,programLog:L,vertexShader:{log:z,prefix:f},fragmentShader:{log:Z,prefix:b}})}i.deleteShader(w),i.deleteShader(O);let U;this.getUniforms=function(){return U===void 0&&(U=new xs(i,m)),U};let y;return this.getAttributes=function(){return y===void 0&&(y=_g(i,m)),y},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.name=t.shaderName,this.id=dg++,this.cacheKey=e,this.usedTimes=1,this.program=m,this.vertexShader=w,this.fragmentShader=O,this}var Lg=0,Ua=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Va(e),t.set(e,n)),n}},Va=class{constructor(e){this.id=Lg++,this.code=e,this.usedTimes=0}};function Rg(r,e,t,n,i,s,a){let o=new lo,c=new Ua,h=[],u=i.isWebGL2,l=i.logarithmicDepthBuffer,d=i.vertexTextures,g=i.precision,_={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(y,L,z,Z,re){let Y=Z.fog,V=re.geometry,j=y.isMeshStandardMaterial?Z.environment:null,oe=(y.isMeshStandardMaterial?t:e).get(y.envMap||j),fe=oe&&oe.mapping===Ao?oe.image.height:null,ie=_[y.type];y.precision!==null&&(g=i.getMaxPrecision(y.precision),g!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",g,"instead."));let le=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,ce=le!==void 0?le.length:0,ee=0;V.morphAttributes.position!==void 0&&(ee=1),V.morphAttributes.normal!==void 0&&(ee=2),V.morphAttributes.color!==void 0&&(ee=3);let J,ye,ge,ve;if(ie){let pt=Hn[ie];J=pt.vertexShader,ye=pt.fragmentShader}else J=y.vertexShader,ye=y.fragmentShader,c.update(y),ge=c.getVertexShaderID(y),ve=c.getFragmentShaderID(y);let ne=r.getRenderTarget(),lt=y.alphaTest>0,Re=y.clearcoat>0,Ge=y.iridescence>0;return{isWebGL2:u,shaderID:ie,shaderName:y.type,vertexShader:J,fragmentShader:ye,defines:y.defines,customVertexShaderID:ge,customFragmentShaderID:ve,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:g,instancing:re.isInstancedMesh===!0,instancingColor:re.isInstancedMesh===!0&&re.instanceColor!==null,supportsVertexTextures:d,outputEncoding:ne===null?r.outputEncoding:ne.isXRRenderTarget===!0?ne.texture.encoding:Ni,map:!!y.map,matcap:!!y.matcap,envMap:!!oe,envMapMode:oe&&oe.mapping,envMapCubeUVHeight:fe,lightMap:!!y.lightMap,aoMap:!!y.aoMap,emissiveMap:!!y.emissiveMap,bumpMap:!!y.bumpMap,normalMap:!!y.normalMap,objectSpaceNormalMap:y.normalMapType===Ju,tangentSpaceNormalMap:y.normalMapType===yh,decodeVideoTexture:!!y.map&&y.map.isVideoTexture===!0&&y.map.encoding===vt,clearcoat:Re,clearcoatMap:Re&&!!y.clearcoatMap,clearcoatRoughnessMap:Re&&!!y.clearcoatRoughnessMap,clearcoatNormalMap:Re&&!!y.clearcoatNormalMap,iridescence:Ge,iridescenceMap:Ge&&!!y.iridescenceMap,iridescenceThicknessMap:Ge&&!!y.iridescenceThicknessMap,displacementMap:!!y.displacementMap,roughnessMap:!!y.roughnessMap,metalnessMap:!!y.metalnessMap,specularMap:!!y.specularMap,specularIntensityMap:!!y.specularIntensityMap,specularColorMap:!!y.specularColorMap,opaque:y.transparent===!1&&y.blending===ps,alphaMap:!!y.alphaMap,alphaTest:lt,gradientMap:!!y.gradientMap,sheen:y.sheen>0,sheenColorMap:!!y.sheenColorMap,sheenRoughnessMap:!!y.sheenRoughnessMap,transmission:y.transmission>0,transmissionMap:!!y.transmissionMap,thicknessMap:!!y.thicknessMap,combine:y.combine,vertexTangents:!!y.normalMap&&!!V.attributes.tangent,vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,vertexUvs:!!y.map||!!y.bumpMap||!!y.normalMap||!!y.specularMap||!!y.alphaMap||!!y.emissiveMap||!!y.roughnessMap||!!y.metalnessMap||!!y.clearcoatMap||!!y.clearcoatRoughnessMap||!!y.clearcoatNormalMap||!!y.iridescenceMap||!!y.iridescenceThicknessMap||!!y.displacementMap||!!y.transmissionMap||!!y.thicknessMap||!!y.specularIntensityMap||!!y.specularColorMap||!!y.sheenColorMap||!!y.sheenRoughnessMap,uvsVertexOnly:!(y.map||y.bumpMap||y.normalMap||y.specularMap||y.alphaMap||y.emissiveMap||y.roughnessMap||y.metalnessMap||y.clearcoatNormalMap||y.iridescenceMap||y.iridescenceThicknessMap||y.transmission>0||y.transmissionMap||y.thicknessMap||y.specularIntensityMap||y.specularColorMap||y.sheen>0||y.sheenColorMap||y.sheenRoughnessMap)&&!!y.displacementMap,fog:!!Y,useFog:y.fog===!0,fogExp2:Y&&Y.isFogExp2,flatShading:!!y.flatShading,sizeAttenuation:y.sizeAttenuation,logarithmicDepthBuffer:l,skinning:re.isSkinnedMesh===!0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:ce,morphTextureStride:ee,numDirLights:L.directional.length,numPointLights:L.point.length,numSpotLights:L.spot.length,numSpotLightMaps:L.spotLightMap.length,numRectAreaLights:L.rectArea.length,numHemiLights:L.hemi.length,numDirLightShadows:L.directionalShadowMap.length,numPointLightShadows:L.pointShadowMap.length,numSpotLightShadows:L.spotShadowMap.length,numSpotLightShadowsWithMaps:L.numSpotLightShadowsWithMaps,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:y.dithering,shadowMapEnabled:r.shadowMap.enabled&&z.length>0,shadowMapType:r.shadowMap.type,toneMapping:y.toneMapped?r.toneMapping:ti,physicallyCorrectLights:r.physicallyCorrectLights,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===yn,flipSided:y.side===_n,useDepthPacking:!!y.depthPacking,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionDerivatives:y.extensions&&y.extensions.derivatives,extensionFragDepth:y.extensions&&y.extensions.fragDepth,extensionDrawBuffers:y.extensions&&y.extensions.drawBuffers,extensionShaderTextureLOD:y.extensions&&y.extensions.shaderTextureLOD,rendererExtensionFragDepth:u||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:u||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:u||n.has("EXT_shader_texture_lod"),customProgramCacheKey:y.customProgramCacheKey()}}function f(y){let L=[];if(y.shaderID?L.push(y.shaderID):(L.push(y.customVertexShaderID),L.push(y.customFragmentShaderID)),y.defines!==void 0)for(let z in y.defines)L.push(z),L.push(y.defines[z]);return y.isRawShaderMaterial===!1&&(b(L,y),P(L,y),L.push(r.outputEncoding)),L.push(y.customProgramCacheKey),L.join()}function b(y,L){y.push(L.precision),y.push(L.outputEncoding),y.push(L.envMapMode),y.push(L.envMapCubeUVHeight),y.push(L.combine),y.push(L.vertexUvs),y.push(L.fogExp2),y.push(L.sizeAttenuation),y.push(L.morphTargetsCount),y.push(L.morphAttributeCount),y.push(L.numDirLights),y.push(L.numPointLights),y.push(L.numSpotLights),y.push(L.numSpotLightMaps),y.push(L.numHemiLights),y.push(L.numRectAreaLights),y.push(L.numDirLightShadows),y.push(L.numPointLightShadows),y.push(L.numSpotLightShadows),y.push(L.numSpotLightShadowsWithMaps),y.push(L.shadowMapType),y.push(L.toneMapping),y.push(L.numClippingPlanes),y.push(L.numClipIntersection),y.push(L.depthPacking)}function P(y,L){o.disableAll(),L.isWebGL2&&o.enable(0),L.supportsVertexTextures&&o.enable(1),L.instancing&&o.enable(2),L.instancingColor&&o.enable(3),L.map&&o.enable(4),L.matcap&&o.enable(5),L.envMap&&o.enable(6),L.lightMap&&o.enable(7),L.aoMap&&o.enable(8),L.emissiveMap&&o.enable(9),L.bumpMap&&o.enable(10),L.normalMap&&o.enable(11),L.objectSpaceNormalMap&&o.enable(12),L.tangentSpaceNormalMap&&o.enable(13),L.clearcoat&&o.enable(14),L.clearcoatMap&&o.enable(15),L.clearcoatRoughnessMap&&o.enable(16),L.clearcoatNormalMap&&o.enable(17),L.iridescence&&o.enable(18),L.iridescenceMap&&o.enable(19),L.iridescenceThicknessMap&&o.enable(20),L.displacementMap&&o.enable(21),L.specularMap&&o.enable(22),L.roughnessMap&&o.enable(23),L.metalnessMap&&o.enable(24),L.gradientMap&&o.enable(25),L.alphaMap&&o.enable(26),L.alphaTest&&o.enable(27),L.vertexColors&&o.enable(28),L.vertexAlphas&&o.enable(29),L.vertexUvs&&o.enable(30),L.vertexTangents&&o.enable(31),L.uvsVertexOnly&&o.enable(32),y.push(o.mask),o.disableAll(),L.fog&&o.enable(0),L.useFog&&o.enable(1),L.flatShading&&o.enable(2),L.logarithmicDepthBuffer&&o.enable(3),L.skinning&&o.enable(4),L.morphTargets&&o.enable(5),L.morphNormals&&o.enable(6),L.morphColors&&o.enable(7),L.premultipliedAlpha&&o.enable(8),L.shadowMapEnabled&&o.enable(9),L.physicallyCorrectLights&&o.enable(10),L.doubleSided&&o.enable(11),L.flipSided&&o.enable(12),L.useDepthPacking&&o.enable(13),L.dithering&&o.enable(14),L.specularIntensityMap&&o.enable(15),L.specularColorMap&&o.enable(16),L.transmission&&o.enable(17),L.transmissionMap&&o.enable(18),L.thicknessMap&&o.enable(19),L.sheen&&o.enable(20),L.sheenColorMap&&o.enable(21),L.sheenRoughnessMap&&o.enable(22),L.decodeVideoTexture&&o.enable(23),L.opaque&&o.enable(24),y.push(o.mask)}function A(y){let L=_[y.type],z;if(L){let Z=Hn[L];z=wd.clone(Z.uniforms)}else z=y.uniforms;return z}function v(y,L){let z;for(let Z=0,re=h.length;Z<re;Z++){let Y=h[Z];if(Y.cacheKey===L){z=Y,++z.usedTimes;break}}return z===void 0&&(z=new Pg(r,L,y,s),h.push(z)),z}function w(y){if(--y.usedTimes===0){let L=h.indexOf(y);h[L]=h[h.length-1],h.pop(),y.destroy()}}function O(y){c.remove(y)}function U(){c.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:A,acquireProgram:v,releaseProgram:w,releaseShaderCache:O,programs:h,dispose:U}}function Ig(){let r=new WeakMap;function e(s){let a=r.get(s);return a===void 0&&(a={},r.set(s,a)),a}function t(s){r.delete(s)}function n(s,a,o){r.get(s)[a]=o}function i(){r=new WeakMap}return{get:e,remove:t,update:n,dispose:i}}function Dg(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function jc(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function Qc(){let r=[],e=0,t=[],n=[],i=[];function s(){e=0,t.length=0,n.length=0,i.length=0}function a(l,d,g,_,m,f){let b=r[e];return b===void 0?(b={id:l.id,object:l,geometry:d,material:g,groupOrder:_,renderOrder:l.renderOrder,z:m,group:f},r[e]=b):(b.id=l.id,b.object=l,b.geometry=d,b.material=g,b.groupOrder=_,b.renderOrder=l.renderOrder,b.z=m,b.group=f),e++,b}function o(l,d,g,_,m,f){let b=a(l,d,g,_,m,f);g.transmission>0?n.push(b):g.transparent===!0?i.push(b):t.push(b)}function c(l,d,g,_,m,f){let b=a(l,d,g,_,m,f);g.transmission>0?n.unshift(b):g.transparent===!0?i.unshift(b):t.unshift(b)}function h(l,d){t.length>1&&t.sort(l||Dg),n.length>1&&n.sort(d||jc),i.length>1&&i.sort(d||jc)}function u(){for(let l=e,d=r.length;l<d;l++){let g=r[l];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:i,init:s,push:o,unshift:c,finish:u,sort:h}}function Ng(){let r=new WeakMap;function e(n,i){let s=r.get(n),a;return s===void 0?(a=new Qc,r.set(n,[a])):i>=s.length?(a=new Qc,s.push(a)):a=s[i],a}function t(){r=new WeakMap}return{get:e,dispose:t}}function Og(){let r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new R,color:new ft};break;case"SpotLight":t={position:new R,direction:new R,color:new ft,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new R,color:new ft,distance:0,decay:0};break;case"HemisphereLight":t={direction:new R,skyColor:new ft,groundColor:new ft};break;case"RectAreaLight":t={color:new ft,position:new R,halfWidth:new R,halfHeight:new R};break}return r[e.id]=t,t}}}function zg(){let r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}var Fg=0;function kg(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function Bg(r,e){let t=new Og,n=zg(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0};for(let u=0;u<9;u++)i.probe.push(new R);let s=new R,a=new At,o=new At;function c(u,l){let d=0,g=0,_=0;for(let Z=0;Z<9;Z++)i.probe[Z].set(0,0,0);let m=0,f=0,b=0,P=0,A=0,v=0,w=0,O=0,U=0,y=0;u.sort(kg);let L=l!==!0?Math.PI:1;for(let Z=0,re=u.length;Z<re;Z++){let Y=u[Z],V=Y.color,j=Y.intensity,oe=Y.distance,fe=Y.shadow&&Y.shadow.map?Y.shadow.map.texture:null;if(Y.isAmbientLight)d+=V.r*j*L,g+=V.g*j*L,_+=V.b*j*L;else if(Y.isLightProbe)for(let ie=0;ie<9;ie++)i.probe[ie].addScaledVector(Y.sh.coefficients[ie],j);else if(Y.isDirectionalLight){let ie=t.get(Y);if(ie.color.copy(Y.color).multiplyScalar(Y.intensity*L),Y.castShadow){let le=Y.shadow,ce=n.get(Y);ce.shadowBias=le.bias,ce.shadowNormalBias=le.normalBias,ce.shadowRadius=le.radius,ce.shadowMapSize=le.mapSize,i.directionalShadow[m]=ce,i.directionalShadowMap[m]=fe,i.directionalShadowMatrix[m]=Y.shadow.matrix,v++}i.directional[m]=ie,m++}else if(Y.isSpotLight){let ie=t.get(Y);ie.position.setFromMatrixPosition(Y.matrixWorld),ie.color.copy(V).multiplyScalar(j*L),ie.distance=oe,ie.coneCos=Math.cos(Y.angle),ie.penumbraCos=Math.cos(Y.angle*(1-Y.penumbra)),ie.decay=Y.decay,i.spot[b]=ie;let le=Y.shadow;if(Y.map&&(i.spotLightMap[U]=Y.map,U++,le.updateMatrices(Y),Y.castShadow&&y++),i.spotLightMatrix[b]=le.matrix,Y.castShadow){let ce=n.get(Y);ce.shadowBias=le.bias,ce.shadowNormalBias=le.normalBias,ce.shadowRadius=le.radius,ce.shadowMapSize=le.mapSize,i.spotShadow[b]=ce,i.spotShadowMap[b]=fe,O++}b++}else if(Y.isRectAreaLight){let ie=t.get(Y);ie.color.copy(V).multiplyScalar(j),ie.halfWidth.set(Y.width*.5,0,0),ie.halfHeight.set(0,Y.height*.5,0),i.rectArea[P]=ie,P++}else if(Y.isPointLight){let ie=t.get(Y);if(ie.color.copy(Y.color).multiplyScalar(Y.intensity*L),ie.distance=Y.distance,ie.decay=Y.decay,Y.castShadow){let le=Y.shadow,ce=n.get(Y);ce.shadowBias=le.bias,ce.shadowNormalBias=le.normalBias,ce.shadowRadius=le.radius,ce.shadowMapSize=le.mapSize,ce.shadowCameraNear=le.camera.near,ce.shadowCameraFar=le.camera.far,i.pointShadow[f]=ce,i.pointShadowMap[f]=fe,i.pointShadowMatrix[f]=Y.shadow.matrix,w++}i.point[f]=ie,f++}else if(Y.isHemisphereLight){let ie=t.get(Y);ie.skyColor.copy(Y.color).multiplyScalar(j*L),ie.groundColor.copy(Y.groundColor).multiplyScalar(j*L),i.hemi[A]=ie,A++}}P>0&&(e.isWebGL2||r.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=be.LTC_FLOAT_1,i.rectAreaLTC2=be.LTC_FLOAT_2):r.has("OES_texture_half_float_linear")===!0?(i.rectAreaLTC1=be.LTC_HALF_1,i.rectAreaLTC2=be.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),i.ambient[0]=d,i.ambient[1]=g,i.ambient[2]=_;let z=i.hash;(z.directionalLength!==m||z.pointLength!==f||z.spotLength!==b||z.rectAreaLength!==P||z.hemiLength!==A||z.numDirectionalShadows!==v||z.numPointShadows!==w||z.numSpotShadows!==O||z.numSpotMaps!==U)&&(i.directional.length=m,i.spot.length=b,i.rectArea.length=P,i.point.length=f,i.hemi.length=A,i.directionalShadow.length=v,i.directionalShadowMap.length=v,i.pointShadow.length=w,i.pointShadowMap.length=w,i.spotShadow.length=O,i.spotShadowMap.length=O,i.directionalShadowMatrix.length=v,i.pointShadowMatrix.length=w,i.spotLightMatrix.length=O+U-y,i.spotLightMap.length=U,i.numSpotLightShadowsWithMaps=y,z.directionalLength=m,z.pointLength=f,z.spotLength=b,z.rectAreaLength=P,z.hemiLength=A,z.numDirectionalShadows=v,z.numPointShadows=w,z.numSpotShadows=O,z.numSpotMaps=U,i.version=Fg++)}function h(u,l){let d=0,g=0,_=0,m=0,f=0,b=l.matrixWorldInverse;for(let P=0,A=u.length;P<A;P++){let v=u[P];if(v.isDirectionalLight){let w=i.directional[d];w.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(b),d++}else if(v.isSpotLight){let w=i.spot[_];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(b),w.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(b),_++}else if(v.isRectAreaLight){let w=i.rectArea[m];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(b),o.identity(),a.copy(v.matrixWorld),a.premultiply(b),o.extractRotation(a),w.halfWidth.set(v.width*.5,0,0),w.halfHeight.set(0,v.height*.5,0),w.halfWidth.applyMatrix4(o),w.halfHeight.applyMatrix4(o),m++}else if(v.isPointLight){let w=i.point[g];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(b),g++}else if(v.isHemisphereLight){let w=i.hemi[f];w.direction.setFromMatrixPosition(v.matrixWorld),w.direction.transformDirection(b),f++}}}return{setup:c,setupView:h,state:i}}function eh(r,e){let t=new Bg(r,e),n=[],i=[];function s(){n.length=0,i.length=0}function a(l){n.push(l)}function o(l){i.push(l)}function c(l){t.setup(n,l)}function h(l){t.setupView(n,l)}return{init:s,state:{lightsArray:n,shadowsArray:i,lights:t},setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o}}function Ug(r,e){let t=new WeakMap;function n(s,a=0){let o=t.get(s),c;return o===void 0?(c=new eh(r,e),t.set(s,[c])):a>=o.length?(c=new eh(r,e),o.push(c)):c=o[a],c}function i(){t=new WeakMap}return{get:n,dispose:i}}var Ga=class extends si{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Yu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ha=class extends si{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.referencePosition=new R,this.nearDistance=1,this.farDistance=1e3,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.referencePosition.copy(e.referencePosition),this.nearDistance=e.nearDistance,this.farDistance=e.farDistance,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},Vg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Gg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Hg(r,e,t){let n=new nr,i=new Ue,s=new Ue,a=new It,o=new Ga({depthPacking:Zu}),c=new Ha,h={},u=t.maxTextureSize,l={0:_n,1:ys,2:yn},d=new ri({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ue},radius:{value:4}},vertexShader:Vg,fragmentShader:Gg}),g=d.clone();g.defines.HORIZONTAL_PASS=1;let _=new Ut;_.setAttribute("position",new rn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let m=new Ve(_,d),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=To,this.render=function(v,w,O){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||v.length===0)return;let U=r.getRenderTarget(),y=r.getActiveCubeFace(),L=r.getActiveMipmapLevel(),z=r.state;z.setBlending(gi),z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);for(let Z=0,re=v.length;Z<re;Z++){let Y=v[Z],V=Y.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;i.copy(V.mapSize);let j=V.getFrameExtents();if(i.multiply(j),s.copy(V.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(s.x=Math.floor(u/j.x),i.x=s.x*j.x,V.mapSize.x=s.x),i.y>u&&(s.y=Math.floor(u/j.y),i.y=s.y*j.y,V.mapSize.y=s.y)),V.map===null){let fe=this.type!==Ys?{minFilter:xn,magFilter:xn}:{};V.map=new ii(i.x,i.y,fe),V.map.texture.name=Y.name+".shadowMap",V.camera.updateProjectionMatrix()}r.setRenderTarget(V.map),r.clear();let oe=V.getViewportCount();for(let fe=0;fe<oe;fe++){let ie=V.getViewport(fe);a.set(s.x*ie.x,s.y*ie.y,s.x*ie.z,s.y*ie.w),z.viewport(a),V.updateMatrices(Y,fe),n=V.getFrustum(),A(w,O,V.camera,Y,this.type)}V.isPointLightShadow!==!0&&this.type===Ys&&b(V,O),V.needsUpdate=!1}f.needsUpdate=!1,r.setRenderTarget(U,y,L)};function b(v,w){let O=e.update(m);d.defines.VSM_SAMPLES!==v.blurSamples&&(d.defines.VSM_SAMPLES=v.blurSamples,g.defines.VSM_SAMPLES=v.blurSamples,d.needsUpdate=!0,g.needsUpdate=!0),v.mapPass===null&&(v.mapPass=new ii(i.x,i.y)),d.uniforms.shadow_pass.value=v.map.texture,d.uniforms.resolution.value=v.mapSize,d.uniforms.radius.value=v.radius,r.setRenderTarget(v.mapPass),r.clear(),r.renderBufferDirect(w,null,O,d,m,null),g.uniforms.shadow_pass.value=v.mapPass.texture,g.uniforms.resolution.value=v.mapSize,g.uniforms.radius.value=v.radius,r.setRenderTarget(v.map),r.clear(),r.renderBufferDirect(w,null,O,g,m,null)}function P(v,w,O,U,y,L){let z=null,Z=O.isPointLight===!0?v.customDistanceMaterial:v.customDepthMaterial;if(Z!==void 0?z=Z:z=O.isPointLight===!0?c:o,r.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){let re=z.uuid,Y=w.uuid,V=h[re];V===void 0&&(V={},h[re]=V);let j=V[Y];j===void 0&&(j=z.clone(),V[Y]=j),z=j}return z.visible=w.visible,z.wireframe=w.wireframe,L===Ys?z.side=w.shadowSide!==null?w.shadowSide:w.side:z.side=w.shadowSide!==null?w.shadowSide:l[w.side],z.alphaMap=w.alphaMap,z.alphaTest=w.alphaTest,z.map=w.map,z.clipShadows=w.clipShadows,z.clippingPlanes=w.clippingPlanes,z.clipIntersection=w.clipIntersection,z.displacementMap=w.displacementMap,z.displacementScale=w.displacementScale,z.displacementBias=w.displacementBias,z.wireframeLinewidth=w.wireframeLinewidth,z.linewidth=w.linewidth,O.isPointLight===!0&&z.isMeshDistanceMaterial===!0&&(z.referencePosition.setFromMatrixPosition(O.matrixWorld),z.nearDistance=U,z.farDistance=y),z}function A(v,w,O,U,y){if(v.visible===!1)return;if(v.layers.test(w.layers)&&(v.isMesh||v.isLine||v.isPoints)&&(v.castShadow||v.receiveShadow&&y===Ys)&&(!v.frustumCulled||n.intersectsObject(v))){v.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,v.matrixWorld);let Z=e.update(v),re=v.material;if(Array.isArray(re)){let Y=Z.groups;for(let V=0,j=Y.length;V<j;V++){let oe=Y[V],fe=re[oe.materialIndex];if(fe&&fe.visible){let ie=P(v,fe,U,O.near,O.far,y);r.renderBufferDirect(O,null,Z,ie,v,oe)}}}else if(re.visible){let Y=P(v,re,U,O.near,O.far,y);r.renderBufferDirect(O,null,Z,Y,v,null)}}let z=v.children;for(let Z=0,re=z.length;Z<re;Z++)A(z[Z],w,O,U,y)}}function Wg(r,e,t){let n=t.isWebGL2;function i(){let F=!1,$=new It,ue=null,Ce=new It(0,0,0,0);return{setMask:function(ze){ue!==ze&&!F&&(r.colorMask(ze,ze,ze,ze),ue=ze)},setLocked:function(ze){F=ze},setClear:function(ze,ut,Et,Gt,Xn){Xn===!0&&(ze*=Gt,ut*=Gt,Et*=Gt),$.set(ze,ut,Et,Gt),Ce.equals($)===!1&&(r.clearColor(ze,ut,Et,Gt),Ce.copy($))},reset:function(){F=!1,ue=null,Ce.set(-1,0,0,0)}}}function s(){let F=!1,$=null,ue=null,Ce=null;return{setTest:function(ze){ze?lt(2929):Re(2929)},setMask:function(ze){$!==ze&&!F&&(r.depthMask(ze),$=ze)},setFunc:function(ze){if(ue!==ze){switch(ze){case xu:r.depthFunc(512);break;case yu:r.depthFunc(519);break;case _u:r.depthFunc(513);break;case Ta:r.depthFunc(515);break;case vu:r.depthFunc(514);break;case bu:r.depthFunc(518);break;case Mu:r.depthFunc(516);break;case wu:r.depthFunc(517);break;default:r.depthFunc(515)}ue=ze}},setLocked:function(ze){F=ze},setClear:function(ze){Ce!==ze&&(r.clearDepth(ze),Ce=ze)},reset:function(){F=!1,$=null,ue=null,Ce=null}}}function a(){let F=!1,$=null,ue=null,Ce=null,ze=null,ut=null,Et=null,Gt=null,Xn=null;return{setTest:function(Tt){F||(Tt?lt(2960):Re(2960))},setMask:function(Tt){$!==Tt&&!F&&(r.stencilMask(Tt),$=Tt)},setFunc:function(Tt,Nt,on){(ue!==Tt||Ce!==Nt||ze!==on)&&(r.stencilFunc(Tt,Nt,on),ue=Tt,Ce=Nt,ze=on)},setOp:function(Tt,Nt,on){(ut!==Tt||Et!==Nt||Gt!==on)&&(r.stencilOp(Tt,Nt,on),ut=Tt,Et=Nt,Gt=on)},setLocked:function(Tt){F=Tt},setClear:function(Tt){Xn!==Tt&&(r.clearStencil(Tt),Xn=Tt)},reset:function(){F=!1,$=null,ue=null,Ce=null,ze=null,ut=null,Et=null,Gt=null,Xn=null}}}let o=new i,c=new s,h=new a,u=new WeakMap,l=new WeakMap,d={},g={},_=new WeakMap,m=[],f=null,b=!1,P=null,A=null,v=null,w=null,O=null,U=null,y=null,L=!1,z=null,Z=null,re=null,Y=null,V=null,j=r.getParameter(35661),oe=!1,fe=0,ie=r.getParameter(7938);ie.indexOf("WebGL")!==-1?(fe=parseFloat(/^WebGL (\d)/.exec(ie)[1]),oe=fe>=1):ie.indexOf("OpenGL ES")!==-1&&(fe=parseFloat(/^OpenGL ES (\d)/.exec(ie)[1]),oe=fe>=2);let le=null,ce={},ee=r.getParameter(3088),J=r.getParameter(2978),ye=new It().fromArray(ee),ge=new It().fromArray(J);function ve(F,$,ue){let Ce=new Uint8Array(4),ze=r.createTexture();r.bindTexture(F,ze),r.texParameteri(F,10241,9728),r.texParameteri(F,10240,9728);for(let ut=0;ut<ue;ut++)r.texImage2D($+ut,0,6408,1,1,0,6408,5121,Ce);return ze}let ne={};ne[3553]=ve(3553,3553,1),ne[34067]=ve(34067,34069,6),o.setClear(0,0,0,1),c.setClear(1),h.setClear(0),lt(2929),c.setFunc(Ta),Mt(!1),Vt(Wl),lt(2884),st(gi);function lt(F){d[F]!==!0&&(r.enable(F),d[F]=!0)}function Re(F){d[F]!==!1&&(r.disable(F),d[F]=!1)}function Ge(F,$){return g[F]!==$?(r.bindFramebuffer(F,$),g[F]=$,n&&(F===36009&&(g[36160]=$),F===36160&&(g[36009]=$)),!0):!1}function Ee(F,$){let ue=m,Ce=!1;if(F)if(ue=_.get($),ue===void 0&&(ue=[],_.set($,ue)),F.isWebGLMultipleRenderTargets){let ze=F.texture;if(ue.length!==ze.length||ue[0]!==36064){for(let ut=0,Et=ze.length;ut<Et;ut++)ue[ut]=36064+ut;ue.length=ze.length,Ce=!0}}else ue[0]!==36064&&(ue[0]=36064,Ce=!0);else ue[0]!==1029&&(ue[0]=1029,Ce=!0);Ce&&(t.isWebGL2?r.drawBuffers(ue):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(ue))}function pt(F){return f!==F?(r.useProgram(F),f=F,!0):!1}let je={[ds]:32774,[ou]:32778,[au]:32779};if(n)je[Zl]=32775,je[Jl]=32776;else{let F=e.get("EXT_blend_minmax");F!==null&&(je[Zl]=F.MIN_EXT,je[Jl]=F.MAX_EXT)}let Xe={[lu]:0,[cu]:1,[hu]:768,[fh]:770,[gu]:776,[pu]:774,[du]:772,[uu]:769,[ph]:771,[mu]:775,[fu]:773};function st(F,$,ue,Ce,ze,ut,Et,Gt){if(F===gi){b===!0&&(Re(3042),b=!1);return}if(b===!1&&(lt(3042),b=!0),F!==ru){if(F!==P||Gt!==L){if((A!==ds||O!==ds)&&(r.blendEquation(32774),A=ds,O=ds),Gt)switch(F){case ps:r.blendFuncSeparate(1,771,1,771);break;case Xl:r.blendFunc(1,1);break;case ql:r.blendFuncSeparate(0,769,0,1);break;case Yl:r.blendFuncSeparate(0,768,0,770);break;default:console.error("THREE.WebGLState: Invalid blending: ",F);break}else switch(F){case ps:r.blendFuncSeparate(770,771,1,771);break;case Xl:r.blendFunc(770,1);break;case ql:r.blendFuncSeparate(0,769,0,1);break;case Yl:r.blendFunc(0,768);break;default:console.error("THREE.WebGLState: Invalid blending: ",F);break}v=null,w=null,U=null,y=null,P=F,L=Gt}return}ze=ze||$,ut=ut||ue,Et=Et||Ce,($!==A||ze!==O)&&(r.blendEquationSeparate(je[$],je[ze]),A=$,O=ze),(ue!==v||Ce!==w||ut!==U||Et!==y)&&(r.blendFuncSeparate(Xe[ue],Xe[Ce],Xe[ut],Xe[Et]),v=ue,w=Ce,U=ut,y=Et),P=F,L=!1}function Ft(F,$){F.side===yn?Re(2884):lt(2884);let ue=F.side===_n;$&&(ue=!ue),Mt(ue),F.blending===ps&&F.transparent===!1?st(gi):st(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.premultipliedAlpha),c.setFunc(F.depthFunc),c.setTest(F.depthTest),c.setMask(F.depthWrite),o.setMask(F.colorWrite);let Ce=F.stencilWrite;h.setTest(Ce),Ce&&(h.setMask(F.stencilWriteMask),h.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),h.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),mt(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?lt(32926):Re(32926)}function Mt(F){z!==F&&(F?r.frontFace(2304):r.frontFace(2305),z=F)}function Vt(F){F!==nu?(lt(2884),F!==Z&&(F===Wl?r.cullFace(1029):F===iu?r.cullFace(1028):r.cullFace(1032))):Re(2884),Z=F}function Dt(F){F!==re&&(oe&&r.lineWidth(F),re=F)}function mt(F,$,ue){F?(lt(32823),(Y!==$||V!==ue)&&(r.polygonOffset($,ue),Y=$,V=ue)):Re(32823)}function mn(F){F?lt(3089):Re(3089)}function en(F){F===void 0&&(F=33984+j-1),le!==F&&(r.activeTexture(F),le=F)}function I(F,$,ue){ue===void 0&&(le===null?ue=33984+j-1:ue=le);let Ce=ce[ue];Ce===void 0&&(Ce={type:void 0,texture:void 0},ce[ue]=Ce),(Ce.type!==F||Ce.texture!==$)&&(le!==ue&&(r.activeTexture(ue),le=ue),r.bindTexture(F,$||ne[F]),Ce.type=F,Ce.texture=$)}function T(){let F=ce[le];F!==void 0&&F.type!==void 0&&(r.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function Q(){try{r.compressedTexImage2D.apply(r,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function me(){try{r.compressedTexImage3D.apply(r,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function pe(){try{r.texSubImage2D.apply(r,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Te(){try{r.texSubImage3D.apply(r,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function We(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function E(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function G(){try{r.texStorage2D.apply(r,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function we(){try{r.texStorage3D.apply(r,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Pe(){try{r.texImage2D.apply(r,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Ae(){try{r.texImage3D.apply(r,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Oe(F){ye.equals(F)===!1&&(r.scissor(F.x,F.y,F.z,F.w),ye.copy(F))}function Ne(F){ge.equals(F)===!1&&(r.viewport(F.x,F.y,F.z,F.w),ge.copy(F))}function tt(F,$){let ue=l.get($);ue===void 0&&(ue=new WeakMap,l.set($,ue));let Ce=ue.get(F);Ce===void 0&&(Ce=r.getUniformBlockIndex($,F.name),ue.set(F,Ce))}function nt(F,$){let Ce=l.get($).get(F);u.get(F)!==Ce&&(r.uniformBlockBinding($,Ce,F.__bindingPointIndex),u.set(F,Ce))}function xt(){r.disable(3042),r.disable(2884),r.disable(2929),r.disable(32823),r.disable(3089),r.disable(2960),r.disable(32926),r.blendEquation(32774),r.blendFunc(1,0),r.blendFuncSeparate(1,0,1,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(513),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(519,0,4294967295),r.stencilOp(7680,7680,7680),r.clearStencil(0),r.cullFace(1029),r.frontFace(2305),r.polygonOffset(0,0),r.activeTexture(33984),r.bindFramebuffer(36160,null),n===!0&&(r.bindFramebuffer(36009,null),r.bindFramebuffer(36008,null)),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),d={},le=null,ce={},g={},_=new WeakMap,m=[],f=null,b=!1,P=null,A=null,v=null,w=null,O=null,U=null,y=null,L=!1,z=null,Z=null,re=null,Y=null,V=null,ye.set(0,0,r.canvas.width,r.canvas.height),ge.set(0,0,r.canvas.width,r.canvas.height),o.reset(),c.reset(),h.reset()}return{buffers:{color:o,depth:c,stencil:h},enable:lt,disable:Re,bindFramebuffer:Ge,drawBuffers:Ee,useProgram:pt,setBlending:st,setMaterial:Ft,setFlipSided:Mt,setCullFace:Vt,setLineWidth:Dt,setPolygonOffset:mt,setScissorTest:mn,activeTexture:en,bindTexture:I,unbindTexture:T,compressedTexImage2D:Q,compressedTexImage3D:me,texImage2D:Pe,texImage3D:Ae,updateUBOMapping:tt,uniformBlockBinding:nt,texStorage2D:G,texStorage3D:we,texSubImage2D:pe,texSubImage3D:Te,compressedTexSubImage2D:We,compressedTexSubImage3D:E,scissor:Oe,viewport:Ne,reset:xt}}function Xg(r,e,t,n,i,s,a){let o=i.isWebGL2,c=i.maxTextures,h=i.maxCubemapSize,u=i.maxTextureSize,l=i.maxSamples,d=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,g=typeof navigator=="undefined"?!1:/OculusBrowser/g.test(navigator.userAgent),_=new WeakMap,m,f=new WeakMap,b=!1;try{b=typeof OffscreenCanvas!="undefined"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function P(I,T){return b?new OffscreenCanvas(I,T):er("canvas")}function A(I,T,Q,me){let pe=1;if((I.width>me||I.height>me)&&(pe=me/Math.max(I.width,I.height)),pe<1||T===!0)if(typeof HTMLImageElement!="undefined"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&I instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&I instanceof ImageBitmap){let Te=T?io:Math.floor,We=Te(pe*I.width),E=Te(pe*I.height);m===void 0&&(m=P(We,E));let G=Q?P(We,E):m;return G.width=We,G.height=E,G.getContext("2d").drawImage(I,0,0,We,E),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+I.width+"x"+I.height+") to ("+We+"x"+E+")."),G}else return"data"in I&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+I.width+"x"+I.height+")."),I;return I}function v(I){return Ia(I.width)&&Ia(I.height)}function w(I){return o?!1:I.wrapS!==kn||I.wrapT!==kn||I.minFilter!==xn&&I.minFilter!==Ln}function O(I,T){return I.generateMipmaps&&T&&I.minFilter!==xn&&I.minFilter!==Ln}function U(I){r.generateMipmap(I)}function y(I,T,Q,me,pe=!1){if(o===!1)return T;if(I!==null){if(r[I]!==void 0)return r[I];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let Te=T;return T===6403&&(Q===5126&&(Te=33326),Q===5131&&(Te=33325),Q===5121&&(Te=33321)),T===33319&&(Q===5126&&(Te=33328),Q===5131&&(Te=33327),Q===5121&&(Te=33323)),T===6408&&(Q===5126&&(Te=34836),Q===5131&&(Te=34842),Q===5121&&(Te=me===vt&&pe===!1?35907:32856),Q===32819&&(Te=32854),Q===32820&&(Te=32855)),(Te===33325||Te===33326||Te===33327||Te===33328||Te===34842||Te===34836)&&e.get("EXT_color_buffer_float"),Te}function L(I,T,Q){return O(I,Q)===!0||I.isFramebufferTexture&&I.minFilter!==xn&&I.minFilter!==Ln?Math.log2(Math.max(T.width,T.height))+1:I.mipmaps!==void 0&&I.mipmaps.length>0?I.mipmaps.length:I.isCompressedTexture&&Array.isArray(I.image)?T.mipmaps.length:1}function z(I){return I===xn||I===$l||I===Kl?9728:9729}function Z(I){let T=I.target;T.removeEventListener("dispose",Z),Y(T),T.isVideoTexture&&_.delete(T)}function re(I){let T=I.target;T.removeEventListener("dispose",re),j(T)}function Y(I){let T=n.get(I);if(T.__webglInit===void 0)return;let Q=I.source,me=f.get(Q);if(me){let pe=me[T.__cacheKey];pe.usedTimes--,pe.usedTimes===0&&V(I),Object.keys(me).length===0&&f.delete(Q)}n.remove(I)}function V(I){let T=n.get(I);r.deleteTexture(T.__webglTexture);let Q=I.source,me=f.get(Q);delete me[T.__cacheKey],a.memory.textures--}function j(I){let T=I.texture,Q=n.get(I),me=n.get(T);if(me.__webglTexture!==void 0&&(r.deleteTexture(me.__webglTexture),a.memory.textures--),I.depthTexture&&I.depthTexture.dispose(),I.isWebGLCubeRenderTarget)for(let pe=0;pe<6;pe++)r.deleteFramebuffer(Q.__webglFramebuffer[pe]),Q.__webglDepthbuffer&&r.deleteRenderbuffer(Q.__webglDepthbuffer[pe]);else{if(r.deleteFramebuffer(Q.__webglFramebuffer),Q.__webglDepthbuffer&&r.deleteRenderbuffer(Q.__webglDepthbuffer),Q.__webglMultisampledFramebuffer&&r.deleteFramebuffer(Q.__webglMultisampledFramebuffer),Q.__webglColorRenderbuffer)for(let pe=0;pe<Q.__webglColorRenderbuffer.length;pe++)Q.__webglColorRenderbuffer[pe]&&r.deleteRenderbuffer(Q.__webglColorRenderbuffer[pe]);Q.__webglDepthRenderbuffer&&r.deleteRenderbuffer(Q.__webglDepthRenderbuffer)}if(I.isWebGLMultipleRenderTargets)for(let pe=0,Te=T.length;pe<Te;pe++){let We=n.get(T[pe]);We.__webglTexture&&(r.deleteTexture(We.__webglTexture),a.memory.textures--),n.remove(T[pe])}n.remove(T),n.remove(I)}let oe=0;function fe(){oe=0}function ie(){let I=oe;return I>=c&&console.warn("THREE.WebGLTextures: Trying to use "+I+" texture units while this GPU supports only "+c),oe+=1,I}function le(I){let T=[];return T.push(I.wrapS),T.push(I.wrapT),T.push(I.wrapR||0),T.push(I.magFilter),T.push(I.minFilter),T.push(I.anisotropy),T.push(I.internalFormat),T.push(I.format),T.push(I.type),T.push(I.generateMipmaps),T.push(I.premultiplyAlpha),T.push(I.flipY),T.push(I.unpackAlignment),T.push(I.encoding),T.join()}function ce(I,T){let Q=n.get(I);if(I.isVideoTexture&&mn(I),I.isRenderTargetTexture===!1&&I.version>0&&Q.__version!==I.version){let me=I.image;if(me===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(me.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Re(Q,I,T);return}}t.bindTexture(3553,Q.__webglTexture,33984+T)}function ee(I,T){let Q=n.get(I);if(I.version>0&&Q.__version!==I.version){Re(Q,I,T);return}t.bindTexture(35866,Q.__webglTexture,33984+T)}function J(I,T){let Q=n.get(I);if(I.version>0&&Q.__version!==I.version){Re(Q,I,T);return}t.bindTexture(32879,Q.__webglTexture,33984+T)}function ye(I,T){let Q=n.get(I);if(I.version>0&&Q.__version!==I.version){Ge(Q,I,T);return}t.bindTexture(34067,Q.__webglTexture,33984+T)}let ge={[Ca]:10497,[kn]:33071,[Pa]:33648},ve={[xn]:9728,[$l]:9984,[Kl]:9986,[Ln]:9729,[Ru]:9985,[Eo]:9987};function ne(I,T,Q){if(Q?(r.texParameteri(I,10242,ge[T.wrapS]),r.texParameteri(I,10243,ge[T.wrapT]),(I===32879||I===35866)&&r.texParameteri(I,32882,ge[T.wrapR]),r.texParameteri(I,10240,ve[T.magFilter]),r.texParameteri(I,10241,ve[T.minFilter])):(r.texParameteri(I,10242,33071),r.texParameteri(I,10243,33071),(I===32879||I===35866)&&r.texParameteri(I,32882,33071),(T.wrapS!==kn||T.wrapT!==kn)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),r.texParameteri(I,10240,z(T.magFilter)),r.texParameteri(I,10241,z(T.minFilter)),T.minFilter!==xn&&T.minFilter!==Ln&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),e.has("EXT_texture_filter_anisotropic")===!0){let me=e.get("EXT_texture_filter_anisotropic");if(T.type===Li&&e.has("OES_texture_float_linear")===!1||o===!1&&T.type===js&&e.has("OES_texture_half_float_linear")===!1)return;(T.anisotropy>1||n.get(T).__currentAnisotropy)&&(r.texParameterf(I,me.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,i.getMaxAnisotropy())),n.get(T).__currentAnisotropy=T.anisotropy)}}function lt(I,T){let Q=!1;I.__webglInit===void 0&&(I.__webglInit=!0,T.addEventListener("dispose",Z));let me=T.source,pe=f.get(me);pe===void 0&&(pe={},f.set(me,pe));let Te=le(T);if(Te!==I.__cacheKey){pe[Te]===void 0&&(pe[Te]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,Q=!0),pe[Te].usedTimes++;let We=pe[I.__cacheKey];We!==void 0&&(pe[I.__cacheKey].usedTimes--,We.usedTimes===0&&V(T)),I.__cacheKey=Te,I.__webglTexture=pe[Te].texture}return Q}function Re(I,T,Q){let me=3553;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(me=35866),T.isData3DTexture&&(me=32879);let pe=lt(I,T),Te=T.source;t.bindTexture(me,I.__webglTexture,33984+Q);let We=n.get(Te);if(Te.version!==We.__version||pe===!0){t.activeTexture(33984+Q),r.pixelStorei(37440,T.flipY),r.pixelStorei(37441,T.premultiplyAlpha),r.pixelStorei(3317,T.unpackAlignment),r.pixelStorei(37443,0);let E=w(T)&&v(T.image)===!1,G=A(T.image,E,!1,u);G=en(T,G);let we=v(G)||o,Pe=s.convert(T.format,T.encoding),Ae=s.convert(T.type),Oe=y(T.internalFormat,Pe,Ae,T.encoding,T.isVideoTexture);ne(me,T,we);let Ne,tt=T.mipmaps,nt=o&&T.isVideoTexture!==!0,xt=We.__version===void 0||pe===!0,F=L(T,G,we);if(T.isDepthTexture)Oe=6402,o?T.type===Li?Oe=36012:T.type===Pi?Oe=33190:T.type===ms?Oe=35056:Oe=33189:T.type===Li&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),T.format===Ri&&Oe===6402&&T.type!==xh&&T.type!==Pi&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),T.type=Pi,Ae=s.convert(T.type)),T.format===bs&&Oe===6402&&(Oe=34041,T.type!==ms&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),T.type=ms,Ae=s.convert(T.type))),xt&&(nt?t.texStorage2D(3553,1,Oe,G.width,G.height):t.texImage2D(3553,0,Oe,G.width,G.height,0,Pe,Ae,null));else if(T.isDataTexture)if(tt.length>0&&we){nt&&xt&&t.texStorage2D(3553,F,Oe,tt[0].width,tt[0].height);for(let $=0,ue=tt.length;$<ue;$++)Ne=tt[$],nt?t.texSubImage2D(3553,$,0,0,Ne.width,Ne.height,Pe,Ae,Ne.data):t.texImage2D(3553,$,Oe,Ne.width,Ne.height,0,Pe,Ae,Ne.data);T.generateMipmaps=!1}else nt?(xt&&t.texStorage2D(3553,F,Oe,G.width,G.height),t.texSubImage2D(3553,0,0,0,G.width,G.height,Pe,Ae,G.data)):t.texImage2D(3553,0,Oe,G.width,G.height,0,Pe,Ae,G.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){nt&&xt&&t.texStorage3D(35866,F,Oe,tt[0].width,tt[0].height,G.depth);for(let $=0,ue=tt.length;$<ue;$++)Ne=tt[$],T.format!==Bn?Pe!==null?nt?t.compressedTexSubImage3D(35866,$,0,0,0,Ne.width,Ne.height,G.depth,Pe,Ne.data,0,0):t.compressedTexImage3D(35866,$,Oe,Ne.width,Ne.height,G.depth,0,Ne.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):nt?t.texSubImage3D(35866,$,0,0,0,Ne.width,Ne.height,G.depth,Pe,Ae,Ne.data):t.texImage3D(35866,$,Oe,Ne.width,Ne.height,G.depth,0,Pe,Ae,Ne.data)}else{nt&&xt&&t.texStorage2D(3553,F,Oe,tt[0].width,tt[0].height);for(let $=0,ue=tt.length;$<ue;$++)Ne=tt[$],T.format!==Bn?Pe!==null?nt?t.compressedTexSubImage2D(3553,$,0,0,Ne.width,Ne.height,Pe,Ne.data):t.compressedTexImage2D(3553,$,Oe,Ne.width,Ne.height,0,Ne.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):nt?t.texSubImage2D(3553,$,0,0,Ne.width,Ne.height,Pe,Ae,Ne.data):t.texImage2D(3553,$,Oe,Ne.width,Ne.height,0,Pe,Ae,Ne.data)}else if(T.isDataArrayTexture)nt?(xt&&t.texStorage3D(35866,F,Oe,G.width,G.height,G.depth),t.texSubImage3D(35866,0,0,0,0,G.width,G.height,G.depth,Pe,Ae,G.data)):t.texImage3D(35866,0,Oe,G.width,G.height,G.depth,0,Pe,Ae,G.data);else if(T.isData3DTexture)nt?(xt&&t.texStorage3D(32879,F,Oe,G.width,G.height,G.depth),t.texSubImage3D(32879,0,0,0,0,G.width,G.height,G.depth,Pe,Ae,G.data)):t.texImage3D(32879,0,Oe,G.width,G.height,G.depth,0,Pe,Ae,G.data);else if(T.isFramebufferTexture){if(xt)if(nt)t.texStorage2D(3553,F,Oe,G.width,G.height);else{let $=G.width,ue=G.height;for(let Ce=0;Ce<F;Ce++)t.texImage2D(3553,Ce,Oe,$,ue,0,Pe,Ae,null),$>>=1,ue>>=1}}else if(tt.length>0&&we){nt&&xt&&t.texStorage2D(3553,F,Oe,tt[0].width,tt[0].height);for(let $=0,ue=tt.length;$<ue;$++)Ne=tt[$],nt?t.texSubImage2D(3553,$,0,0,Pe,Ae,Ne):t.texImage2D(3553,$,Oe,Pe,Ae,Ne);T.generateMipmaps=!1}else nt?(xt&&t.texStorage2D(3553,F,Oe,G.width,G.height),t.texSubImage2D(3553,0,0,0,Pe,Ae,G)):t.texImage2D(3553,0,Oe,Pe,Ae,G);O(T,we)&&U(me),We.__version=Te.version,T.onUpdate&&T.onUpdate(T)}I.__version=T.version}function Ge(I,T,Q){if(T.image.length!==6)return;let me=lt(I,T),pe=T.source;t.bindTexture(34067,I.__webglTexture,33984+Q);let Te=n.get(pe);if(pe.version!==Te.__version||me===!0){t.activeTexture(33984+Q),r.pixelStorei(37440,T.flipY),r.pixelStorei(37441,T.premultiplyAlpha),r.pixelStorei(3317,T.unpackAlignment),r.pixelStorei(37443,0);let We=T.isCompressedTexture||T.image[0].isCompressedTexture,E=T.image[0]&&T.image[0].isDataTexture,G=[];for(let $=0;$<6;$++)!We&&!E?G[$]=A(T.image[$],!1,!0,h):G[$]=E?T.image[$].image:T.image[$],G[$]=en(T,G[$]);let we=G[0],Pe=v(we)||o,Ae=s.convert(T.format,T.encoding),Oe=s.convert(T.type),Ne=y(T.internalFormat,Ae,Oe,T.encoding),tt=o&&T.isVideoTexture!==!0,nt=Te.__version===void 0||me===!0,xt=L(T,we,Pe);ne(34067,T,Pe);let F;if(We){tt&&nt&&t.texStorage2D(34067,xt,Ne,we.width,we.height);for(let $=0;$<6;$++){F=G[$].mipmaps;for(let ue=0;ue<F.length;ue++){let Ce=F[ue];T.format!==Bn?Ae!==null?tt?t.compressedTexSubImage2D(34069+$,ue,0,0,Ce.width,Ce.height,Ae,Ce.data):t.compressedTexImage2D(34069+$,ue,Ne,Ce.width,Ce.height,0,Ce.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):tt?t.texSubImage2D(34069+$,ue,0,0,Ce.width,Ce.height,Ae,Oe,Ce.data):t.texImage2D(34069+$,ue,Ne,Ce.width,Ce.height,0,Ae,Oe,Ce.data)}}}else{F=T.mipmaps,tt&&nt&&(F.length>0&&xt++,t.texStorage2D(34067,xt,Ne,G[0].width,G[0].height));for(let $=0;$<6;$++)if(E){tt?t.texSubImage2D(34069+$,0,0,0,G[$].width,G[$].height,Ae,Oe,G[$].data):t.texImage2D(34069+$,0,Ne,G[$].width,G[$].height,0,Ae,Oe,G[$].data);for(let ue=0;ue<F.length;ue++){let ze=F[ue].image[$].image;tt?t.texSubImage2D(34069+$,ue+1,0,0,ze.width,ze.height,Ae,Oe,ze.data):t.texImage2D(34069+$,ue+1,Ne,ze.width,ze.height,0,Ae,Oe,ze.data)}}else{tt?t.texSubImage2D(34069+$,0,0,0,Ae,Oe,G[$]):t.texImage2D(34069+$,0,Ne,Ae,Oe,G[$]);for(let ue=0;ue<F.length;ue++){let Ce=F[ue];tt?t.texSubImage2D(34069+$,ue+1,0,0,Ae,Oe,Ce.image[$]):t.texImage2D(34069+$,ue+1,Ne,Ae,Oe,Ce.image[$])}}}O(T,Pe)&&U(34067),Te.__version=pe.version,T.onUpdate&&T.onUpdate(T)}I.__version=T.version}function Ee(I,T,Q,me,pe){let Te=s.convert(Q.format,Q.encoding),We=s.convert(Q.type),E=y(Q.internalFormat,Te,We,Q.encoding);n.get(T).__hasExternalTextures||(pe===32879||pe===35866?t.texImage3D(pe,0,E,T.width,T.height,T.depth,0,Te,We,null):t.texImage2D(pe,0,E,T.width,T.height,0,Te,We,null)),t.bindFramebuffer(36160,I),mt(T)?d.framebufferTexture2DMultisampleEXT(36160,me,pe,n.get(Q).__webglTexture,0,Dt(T)):(pe===3553||pe>=34069&&pe<=34074)&&r.framebufferTexture2D(36160,me,pe,n.get(Q).__webglTexture,0),t.bindFramebuffer(36160,null)}function pt(I,T,Q){if(r.bindRenderbuffer(36161,I),T.depthBuffer&&!T.stencilBuffer){let me=33189;if(Q||mt(T)){let pe=T.depthTexture;pe&&pe.isDepthTexture&&(pe.type===Li?me=36012:pe.type===Pi&&(me=33190));let Te=Dt(T);mt(T)?d.renderbufferStorageMultisampleEXT(36161,Te,me,T.width,T.height):r.renderbufferStorageMultisample(36161,Te,me,T.width,T.height)}else r.renderbufferStorage(36161,me,T.width,T.height);r.framebufferRenderbuffer(36160,36096,36161,I)}else if(T.depthBuffer&&T.stencilBuffer){let me=Dt(T);Q&&mt(T)===!1?r.renderbufferStorageMultisample(36161,me,35056,T.width,T.height):mt(T)?d.renderbufferStorageMultisampleEXT(36161,me,35056,T.width,T.height):r.renderbufferStorage(36161,34041,T.width,T.height),r.framebufferRenderbuffer(36160,33306,36161,I)}else{let me=T.isWebGLMultipleRenderTargets===!0?T.texture:[T.texture];for(let pe=0;pe<me.length;pe++){let Te=me[pe],We=s.convert(Te.format,Te.encoding),E=s.convert(Te.type),G=y(Te.internalFormat,We,E,Te.encoding),we=Dt(T);Q&&mt(T)===!1?r.renderbufferStorageMultisample(36161,we,G,T.width,T.height):mt(T)?d.renderbufferStorageMultisampleEXT(36161,we,G,T.width,T.height):r.renderbufferStorage(36161,G,T.width,T.height)}}r.bindRenderbuffer(36161,null)}function je(I,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(36160,I),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(T.depthTexture).__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),ce(T.depthTexture,0);let me=n.get(T.depthTexture).__webglTexture,pe=Dt(T);if(T.depthTexture.format===Ri)mt(T)?d.framebufferTexture2DMultisampleEXT(36160,36096,3553,me,0,pe):r.framebufferTexture2D(36160,36096,3553,me,0);else if(T.depthTexture.format===bs)mt(T)?d.framebufferTexture2DMultisampleEXT(36160,33306,3553,me,0,pe):r.framebufferTexture2D(36160,33306,3553,me,0);else throw new Error("Unknown depthTexture format")}function Xe(I){let T=n.get(I),Q=I.isWebGLCubeRenderTarget===!0;if(I.depthTexture&&!T.__autoAllocateDepthBuffer){if(Q)throw new Error("target.depthTexture not supported in Cube render targets");je(T.__webglFramebuffer,I)}else if(Q){T.__webglDepthbuffer=[];for(let me=0;me<6;me++)t.bindFramebuffer(36160,T.__webglFramebuffer[me]),T.__webglDepthbuffer[me]=r.createRenderbuffer(),pt(T.__webglDepthbuffer[me],I,!1)}else t.bindFramebuffer(36160,T.__webglFramebuffer),T.__webglDepthbuffer=r.createRenderbuffer(),pt(T.__webglDepthbuffer,I,!1);t.bindFramebuffer(36160,null)}function st(I,T,Q){let me=n.get(I);T!==void 0&&Ee(me.__webglFramebuffer,I,I.texture,36064,3553),Q!==void 0&&Xe(I)}function Ft(I){let T=I.texture,Q=n.get(I),me=n.get(T);I.addEventListener("dispose",re),I.isWebGLMultipleRenderTargets!==!0&&(me.__webglTexture===void 0&&(me.__webglTexture=r.createTexture()),me.__version=T.version,a.memory.textures++);let pe=I.isWebGLCubeRenderTarget===!0,Te=I.isWebGLMultipleRenderTargets===!0,We=v(I)||o;if(pe){Q.__webglFramebuffer=[];for(let E=0;E<6;E++)Q.__webglFramebuffer[E]=r.createFramebuffer()}else{if(Q.__webglFramebuffer=r.createFramebuffer(),Te)if(i.drawBuffers){let E=I.texture;for(let G=0,we=E.length;G<we;G++){let Pe=n.get(E[G]);Pe.__webglTexture===void 0&&(Pe.__webglTexture=r.createTexture(),a.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(o&&I.samples>0&&mt(I)===!1){let E=Te?T:[T];Q.__webglMultisampledFramebuffer=r.createFramebuffer(),Q.__webglColorRenderbuffer=[],t.bindFramebuffer(36160,Q.__webglMultisampledFramebuffer);for(let G=0;G<E.length;G++){let we=E[G];Q.__webglColorRenderbuffer[G]=r.createRenderbuffer(),r.bindRenderbuffer(36161,Q.__webglColorRenderbuffer[G]);let Pe=s.convert(we.format,we.encoding),Ae=s.convert(we.type),Oe=y(we.internalFormat,Pe,Ae,we.encoding,I.isXRRenderTarget===!0),Ne=Dt(I);r.renderbufferStorageMultisample(36161,Ne,Oe,I.width,I.height),r.framebufferRenderbuffer(36160,36064+G,36161,Q.__webglColorRenderbuffer[G])}r.bindRenderbuffer(36161,null),I.depthBuffer&&(Q.__webglDepthRenderbuffer=r.createRenderbuffer(),pt(Q.__webglDepthRenderbuffer,I,!0)),t.bindFramebuffer(36160,null)}}if(pe){t.bindTexture(34067,me.__webglTexture),ne(34067,T,We);for(let E=0;E<6;E++)Ee(Q.__webglFramebuffer[E],I,T,36064,34069+E);O(T,We)&&U(34067),t.unbindTexture()}else if(Te){let E=I.texture;for(let G=0,we=E.length;G<we;G++){let Pe=E[G],Ae=n.get(Pe);t.bindTexture(3553,Ae.__webglTexture),ne(3553,Pe,We),Ee(Q.__webglFramebuffer,I,Pe,36064+G,3553),O(Pe,We)&&U(3553)}t.unbindTexture()}else{let E=3553;(I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(o?E=I.isWebGL3DRenderTarget?32879:35866:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(E,me.__webglTexture),ne(E,T,We),Ee(Q.__webglFramebuffer,I,T,36064,E),O(T,We)&&U(E),t.unbindTexture()}I.depthBuffer&&Xe(I)}function Mt(I){let T=v(I)||o,Q=I.isWebGLMultipleRenderTargets===!0?I.texture:[I.texture];for(let me=0,pe=Q.length;me<pe;me++){let Te=Q[me];if(O(Te,T)){let We=I.isWebGLCubeRenderTarget?34067:3553,E=n.get(Te).__webglTexture;t.bindTexture(We,E),U(We),t.unbindTexture()}}}function Vt(I){if(o&&I.samples>0&&mt(I)===!1){let T=I.isWebGLMultipleRenderTargets?I.texture:[I.texture],Q=I.width,me=I.height,pe=16384,Te=[],We=I.stencilBuffer?33306:36096,E=n.get(I),G=I.isWebGLMultipleRenderTargets===!0;if(G)for(let we=0;we<T.length;we++)t.bindFramebuffer(36160,E.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(36160,36064+we,36161,null),t.bindFramebuffer(36160,E.__webglFramebuffer),r.framebufferTexture2D(36009,36064+we,3553,null,0);t.bindFramebuffer(36008,E.__webglMultisampledFramebuffer),t.bindFramebuffer(36009,E.__webglFramebuffer);for(let we=0;we<T.length;we++){Te.push(36064+we),I.depthBuffer&&Te.push(We);let Pe=E.__ignoreDepthValues!==void 0?E.__ignoreDepthValues:!1;if(Pe===!1&&(I.depthBuffer&&(pe|=256),I.stencilBuffer&&(pe|=1024)),G&&r.framebufferRenderbuffer(36008,36064,36161,E.__webglColorRenderbuffer[we]),Pe===!0&&(r.invalidateFramebuffer(36008,[We]),r.invalidateFramebuffer(36009,[We])),G){let Ae=n.get(T[we]).__webglTexture;r.framebufferTexture2D(36009,36064,3553,Ae,0)}r.blitFramebuffer(0,0,Q,me,0,0,Q,me,pe,9728),g&&r.invalidateFramebuffer(36008,Te)}if(t.bindFramebuffer(36008,null),t.bindFramebuffer(36009,null),G)for(let we=0;we<T.length;we++){t.bindFramebuffer(36160,E.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(36160,36064+we,36161,E.__webglColorRenderbuffer[we]);let Pe=n.get(T[we]).__webglTexture;t.bindFramebuffer(36160,E.__webglFramebuffer),r.framebufferTexture2D(36009,36064+we,3553,Pe,0)}t.bindFramebuffer(36009,E.__webglMultisampledFramebuffer)}}function Dt(I){return Math.min(l,I.samples)}function mt(I){let T=n.get(I);return o&&I.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function mn(I){let T=a.render.frame;_.get(I)!==T&&(_.set(I,T),I.update())}function en(I,T){let Q=I.encoding,me=I.format,pe=I.type;return I.isCompressedTexture===!0||I.isVideoTexture===!0||I.format===Ra||Q!==Ni&&(Q===vt?o===!1?e.has("EXT_sRGB")===!0&&me===Bn?(I.format=Ra,I.minFilter=Ln,I.generateMipmaps=!1):T=so.sRGBToLinear(T):(me!==Bn||pe!==Di)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture encoding:",Q)),T}this.allocateTextureUnit=ie,this.resetTextureUnits=fe,this.setTexture2D=ce,this.setTexture2DArray=ee,this.setTexture3D=J,this.setTextureCube=ye,this.rebindTextures=st,this.setupRenderTarget=Ft,this.updateRenderTargetMipmap=Mt,this.updateMultisampleRenderTarget=Vt,this.setupDepthRenderbuffer=Xe,this.setupFrameBufferTexture=Ee,this.useMultisampledRTT=mt}function qg(r,e,t){let n=t.isWebGL2;function i(s,a=null){let o;if(s===Di)return 5121;if(s===Ou)return 32819;if(s===zu)return 32820;if(s===Iu)return 5120;if(s===Du)return 5122;if(s===xh)return 5123;if(s===Nu)return 5124;if(s===Pi)return 5125;if(s===Li)return 5126;if(s===js)return n?5131:(o=e.get("OES_texture_half_float"),o!==null?o.HALF_FLOAT_OES:null);if(s===Fu)return 6406;if(s===Bn)return 6408;if(s===Bu)return 6409;if(s===Uu)return 6410;if(s===Ri)return 6402;if(s===bs)return 34041;if(s===ku)return console.warn("THREE.WebGLRenderer: THREE.RGBFormat has been removed. Use THREE.RGBAFormat instead. https://github.com/mrdoob/three.js/pull/23228"),6408;if(s===Ra)return o=e.get("EXT_sRGB"),o!==null?o.SRGB_ALPHA_EXT:null;if(s===Vu)return 6403;if(s===Gu)return 36244;if(s===Hu)return 33319;if(s===Wu)return 33320;if(s===Xu)return 36249;if(s===Wo||s===Xo||s===qo||s===Yo)if(a===vt)if(o=e.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(s===Wo)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===Xo)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===qo)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===Yo)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=e.get("WEBGL_compressed_texture_s3tc"),o!==null){if(s===Wo)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===Xo)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===qo)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===Yo)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===jl||s===Ql||s===ec||s===tc)if(o=e.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(s===jl)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===Ql)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===ec)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===tc)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===qu)return o=e.get("WEBGL_compressed_texture_etc1"),o!==null?o.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===nc||s===ic)if(o=e.get("WEBGL_compressed_texture_etc"),o!==null){if(s===nc)return a===vt?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(s===ic)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===sc||s===rc||s===oc||s===ac||s===lc||s===cc||s===hc||s===uc||s===dc||s===fc||s===pc||s===mc||s===gc||s===xc)if(o=e.get("WEBGL_compressed_texture_astc"),o!==null){if(s===sc)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===rc)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===oc)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===ac)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===lc)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===cc)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===hc)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===uc)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===dc)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===fc)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===pc)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===mc)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===gc)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===xc)return a===vt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===yc)if(o=e.get("EXT_texture_compression_bptc"),o!==null){if(s===yc)return a===vt?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT}else return null;return s===ms?n?34042:(o=e.get("WEBGL_depth_texture"),o!==null?o.UNSIGNED_INT_24_8_WEBGL:null):r[s]!==void 0?r[s]:null}return{convert:i}}var Wa=class extends sn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},dn=class extends jt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Yg={type:"move"},Ks=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new dn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new dn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new R,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new R),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new dn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new R,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new R),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,a=null,o=this._targetRay,c=this._grip,h=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(h&&e.hand){a=!0;for(let m of e.hand.values()){let f=t.getJointPose(m,n),b=this._getHandJoint(h,m);f!==null&&(b.matrix.fromArray(f.transform.matrix),b.matrix.decompose(b.position,b.rotation,b.scale),b.jointRadius=f.radius),b.visible=f!==null}let u=h.joints["index-finger-tip"],l=h.joints["thumb-tip"],d=u.position.distanceTo(l.position),g=.02,_=.005;h.inputState.pinching&&d>g+_?(h.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!h.inputState.pinching&&d<=g-_&&(h.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Yg)))}return o!==null&&(o.visible=i!==null),c!==null&&(c.visible=s!==null),h!==null&&(h.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new dn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Xa=class extends fn{constructor(e,t,n,i,s,a,o,c,h,u){if(u=u!==void 0?u:Ri,u!==Ri&&u!==bs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===Ri&&(n=Pi),n===void 0&&u===bs&&(n=ms),super(null,i,s,a,o,c,u,n,h),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:xn,this.minFilter=c!==void 0?c:xn,this.flipY=!1,this.generateMipmaps=!1}},qa=class extends Wn{constructor(e,t){super();let n=this,i=null,s=1,a=null,o="local-floor",c=null,h=null,u=null,l=null,d=null,g=null,_=t.getContextAttributes(),m=null,f=null,b=[],P=[],A=new Set,v=new Map,w=new sn;w.layers.enable(1),w.viewport=new It;let O=new sn;O.layers.enable(2),O.viewport=new It;let U=[w,O],y=new Wa;y.layers.enable(1),y.layers.enable(2);let L=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ee){let J=b[ee];return J===void 0&&(J=new Ks,b[ee]=J),J.getTargetRaySpace()},this.getControllerGrip=function(ee){let J=b[ee];return J===void 0&&(J=new Ks,b[ee]=J),J.getGripSpace()},this.getHand=function(ee){let J=b[ee];return J===void 0&&(J=new Ks,b[ee]=J),J.getHandSpace()};function Z(ee){let J=P.indexOf(ee.inputSource);if(J===-1)return;let ye=b[J];ye!==void 0&&ye.dispatchEvent({type:ee.type,data:ee.inputSource})}function re(){i.removeEventListener("select",Z),i.removeEventListener("selectstart",Z),i.removeEventListener("selectend",Z),i.removeEventListener("squeeze",Z),i.removeEventListener("squeezestart",Z),i.removeEventListener("squeezeend",Z),i.removeEventListener("end",re),i.removeEventListener("inputsourceschange",Y);for(let ee=0;ee<b.length;ee++){let J=P[ee];J!==null&&(P[ee]=null,b[ee].disconnect(J))}L=null,z=null,e.setRenderTarget(m),d=null,l=null,u=null,i=null,f=null,ce.stop(),n.isPresenting=!1,n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ee){s=ee,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ee){o=ee,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(ee){c=ee},this.getBaseLayer=function(){return l!==null?l:d},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(ee){if(i=ee,i!==null){if(m=e.getRenderTarget(),i.addEventListener("select",Z),i.addEventListener("selectstart",Z),i.addEventListener("selectend",Z),i.addEventListener("squeeze",Z),i.addEventListener("squeezestart",Z),i.addEventListener("squeezeend",Z),i.addEventListener("end",re),i.addEventListener("inputsourceschange",Y),_.xrCompatible!==!0&&await t.makeXRCompatible(),i.renderState.layers===void 0||e.capabilities.isWebGL2===!1){let J={antialias:i.renderState.layers===void 0?_.antialias:!0,alpha:_.alpha,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(i,t,J),i.updateRenderState({baseLayer:d}),f=new ii(d.framebufferWidth,d.framebufferHeight,{format:Bn,type:Di,encoding:e.outputEncoding,stencilBuffer:_.stencil})}else{let J=null,ye=null,ge=null;_.depth&&(ge=_.stencil?35056:33190,J=_.stencil?bs:Ri,ye=_.stencil?ms:Pi);let ve={colorFormat:32856,depthFormat:ge,scaleFactor:s};u=new XRWebGLBinding(i,t),l=u.createProjectionLayer(ve),i.updateRenderState({layers:[l]}),f=new ii(l.textureWidth,l.textureHeight,{format:Bn,type:Di,depthTexture:new Xa(l.textureWidth,l.textureHeight,ye,void 0,void 0,void 0,void 0,void 0,void 0,J),stencilBuffer:_.stencil,encoding:e.outputEncoding,samples:_.antialias?4:0});let ne=e.properties.get(f);ne.__ignoreDepthValues=l.ignoreDepthValues}f.isXRRenderTarget=!0,this.setFoveation(1),c=null,a=await i.requestReferenceSpace(o),ce.setContext(i),ce.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}};function Y(ee){for(let J=0;J<ee.removed.length;J++){let ye=ee.removed[J],ge=P.indexOf(ye);ge>=0&&(P[ge]=null,b[ge].disconnect(ye))}for(let J=0;J<ee.added.length;J++){let ye=ee.added[J],ge=P.indexOf(ye);if(ge===-1){for(let ne=0;ne<b.length;ne++)if(ne>=P.length){P.push(ye),ge=ne;break}else if(P[ne]===null){P[ne]=ye,ge=ne;break}if(ge===-1)break}let ve=b[ge];ve&&ve.connect(ye)}}let V=new R,j=new R;function oe(ee,J,ye){V.setFromMatrixPosition(J.matrixWorld),j.setFromMatrixPosition(ye.matrixWorld);let ge=V.distanceTo(j),ve=J.projectionMatrix.elements,ne=ye.projectionMatrix.elements,lt=ve[14]/(ve[10]-1),Re=ve[14]/(ve[10]+1),Ge=(ve[9]+1)/ve[5],Ee=(ve[9]-1)/ve[5],pt=(ve[8]-1)/ve[0],je=(ne[8]+1)/ne[0],Xe=lt*pt,st=lt*je,Ft=ge/(-pt+je),Mt=Ft*-pt;J.matrixWorld.decompose(ee.position,ee.quaternion,ee.scale),ee.translateX(Mt),ee.translateZ(Ft),ee.matrixWorld.compose(ee.position,ee.quaternion,ee.scale),ee.matrixWorldInverse.copy(ee.matrixWorld).invert();let Vt=lt+Ft,Dt=Re+Ft,mt=Xe-Mt,mn=st+(ge-Mt),en=Ge*Re/Dt*Vt,I=Ee*Re/Dt*Vt;ee.projectionMatrix.makePerspective(mt,mn,en,I,Vt,Dt)}function fe(ee,J){J===null?ee.matrixWorld.copy(ee.matrix):ee.matrixWorld.multiplyMatrices(J.matrixWorld,ee.matrix),ee.matrixWorldInverse.copy(ee.matrixWorld).invert()}this.updateCamera=function(ee){if(i===null)return;y.near=O.near=w.near=ee.near,y.far=O.far=w.far=ee.far,(L!==y.near||z!==y.far)&&(i.updateRenderState({depthNear:y.near,depthFar:y.far}),L=y.near,z=y.far);let J=ee.parent,ye=y.cameras;fe(y,J);for(let ve=0;ve<ye.length;ve++)fe(ye[ve],J);y.matrixWorld.decompose(y.position,y.quaternion,y.scale),ee.matrix.copy(y.matrix),ee.matrix.decompose(ee.position,ee.quaternion,ee.scale);let ge=ee.children;for(let ve=0,ne=ge.length;ve<ne;ve++)ge[ve].updateMatrixWorld(!0);ye.length===2?oe(y,w,O):y.projectionMatrix.copy(w.projectionMatrix)},this.getCamera=function(){return y},this.getFoveation=function(){if(l!==null)return l.fixedFoveation;if(d!==null)return d.fixedFoveation},this.setFoveation=function(ee){l!==null&&(l.fixedFoveation=ee),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=ee)},this.getPlanes=function(){return A};let ie=null;function le(ee,J){if(h=J.getViewerPose(c||a),g=J,h!==null){let ye=h.views;d!==null&&(e.setRenderTargetFramebuffer(f,d.framebuffer),e.setRenderTarget(f));let ge=!1;ye.length!==y.cameras.length&&(y.cameras.length=0,ge=!0);for(let ve=0;ve<ye.length;ve++){let ne=ye[ve],lt=null;if(d!==null)lt=d.getViewport(ne);else{let Ge=u.getViewSubImage(l,ne);lt=Ge.viewport,ve===0&&(e.setRenderTargetTextures(f,Ge.colorTexture,l.ignoreDepthValues?void 0:Ge.depthStencilTexture),e.setRenderTarget(f))}let Re=U[ve];Re===void 0&&(Re=new sn,Re.layers.enable(ve),Re.viewport=new It,U[ve]=Re),Re.matrix.fromArray(ne.transform.matrix),Re.projectionMatrix.fromArray(ne.projectionMatrix),Re.viewport.set(lt.x,lt.y,lt.width,lt.height),ve===0&&y.matrix.copy(Re.matrix),ge===!0&&y.cameras.push(Re)}}for(let ye=0;ye<b.length;ye++){let ge=P[ye],ve=b[ye];ge!==null&&ve!==void 0&&ve.update(ge,J,c||a)}if(ie&&ie(ee,J),J.detectedPlanes){n.dispatchEvent({type:"planesdetected",data:J.detectedPlanes});let ye=null;for(let ge of A)J.detectedPlanes.has(ge)||(ye===null&&(ye=[]),ye.push(ge));if(ye!==null)for(let ge of ye)A.delete(ge),v.delete(ge),n.dispatchEvent({type:"planeremoved",data:ge});for(let ge of J.detectedPlanes)if(!A.has(ge))A.add(ge),v.set(ge,J.lastChangedTime),n.dispatchEvent({type:"planeadded",data:ge});else{let ve=v.get(ge);ge.lastChangedTime>ve&&(v.set(ge,ge.lastChangedTime),n.dispatchEvent({type:"planechanged",data:ge}))}}g=null}let ce=new Mh;ce.setAnimationLoop(le),this.setAnimationLoop=function(ee){ie=ee},this.dispose=function(){}}};function Zg(r,e){function t(m,f){f.color.getRGB(m.fogColor.value,bh(r)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function n(m,f,b,P,A){f.isMeshBasicMaterial||f.isMeshLambertMaterial?i(m,f):f.isMeshToonMaterial?(i(m,f),u(m,f)):f.isMeshPhongMaterial?(i(m,f),h(m,f)):f.isMeshStandardMaterial?(i(m,f),l(m,f),f.isMeshPhysicalMaterial&&d(m,f,A)):f.isMeshMatcapMaterial?(i(m,f),g(m,f)):f.isMeshDepthMaterial?i(m,f):f.isMeshDistanceMaterial?(i(m,f),_(m,f)):f.isMeshNormalMaterial?i(m,f):f.isLineBasicMaterial?(s(m,f),f.isLineDashedMaterial&&a(m,f)):f.isPointsMaterial?o(m,f,b,P):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function i(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map),f.alphaMap&&(m.alphaMap.value=f.alphaMap),f.bumpMap&&(m.bumpMap.value=f.bumpMap,m.bumpScale.value=f.bumpScale,f.side===_n&&(m.bumpScale.value*=-1)),f.displacementMap&&(m.displacementMap.value=f.displacementMap,m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap),f.normalMap&&(m.normalMap.value=f.normalMap,m.normalScale.value.copy(f.normalScale),f.side===_n&&m.normalScale.value.negate()),f.specularMap&&(m.specularMap.value=f.specularMap),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let b=e.get(f).envMap;if(b&&(m.envMap.value=b,m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap){m.lightMap.value=f.lightMap;let v=r.physicallyCorrectLights!==!0?Math.PI:1;m.lightMapIntensity.value=f.lightMapIntensity*v}f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity);let P;f.map?P=f.map:f.specularMap?P=f.specularMap:f.displacementMap?P=f.displacementMap:f.normalMap?P=f.normalMap:f.bumpMap?P=f.bumpMap:f.roughnessMap?P=f.roughnessMap:f.metalnessMap?P=f.metalnessMap:f.alphaMap?P=f.alphaMap:f.emissiveMap?P=f.emissiveMap:f.clearcoatMap?P=f.clearcoatMap:f.clearcoatNormalMap?P=f.clearcoatNormalMap:f.clearcoatRoughnessMap?P=f.clearcoatRoughnessMap:f.iridescenceMap?P=f.iridescenceMap:f.iridescenceThicknessMap?P=f.iridescenceThicknessMap:f.specularIntensityMap?P=f.specularIntensityMap:f.specularColorMap?P=f.specularColorMap:f.transmissionMap?P=f.transmissionMap:f.thicknessMap?P=f.thicknessMap:f.sheenColorMap?P=f.sheenColorMap:f.sheenRoughnessMap&&(P=f.sheenRoughnessMap),P!==void 0&&(P.isWebGLRenderTarget&&(P=P.texture),P.matrixAutoUpdate===!0&&P.updateMatrix(),m.uvTransform.value.copy(P.matrix));let A;f.aoMap?A=f.aoMap:f.lightMap&&(A=f.lightMap),A!==void 0&&(A.isWebGLRenderTarget&&(A=A.texture),A.matrixAutoUpdate===!0&&A.updateMatrix(),m.uv2Transform.value.copy(A.matrix))}function s(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity}function a(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function o(m,f,b,P){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*b,m.scale.value=P*.5,f.map&&(m.map.value=f.map),f.alphaMap&&(m.alphaMap.value=f.alphaMap),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let A;f.map?A=f.map:f.alphaMap&&(A=f.alphaMap),A!==void 0&&(A.matrixAutoUpdate===!0&&A.updateMatrix(),m.uvTransform.value.copy(A.matrix))}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map),f.alphaMap&&(m.alphaMap.value=f.alphaMap),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let b;f.map?b=f.map:f.alphaMap&&(b=f.alphaMap),b!==void 0&&(b.matrixAutoUpdate===!0&&b.updateMatrix(),m.uvTransform.value.copy(b.matrix))}function h(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function u(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function l(m,f){m.roughness.value=f.roughness,m.metalness.value=f.metalness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap),f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap),e.get(f).envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function d(m,f,b){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap)),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap),f.clearcoatNormalMap&&(m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),m.clearcoatNormalMap.value=f.clearcoatNormalMap,f.side===_n&&m.clearcoatNormalScale.value.negate())),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap)),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap)}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function _(m,f){m.referencePosition.value.copy(f.referencePosition),m.nearDistance.value=f.nearDistance,m.farDistance.value=f.farDistance}return{refreshFogUniforms:t,refreshMaterialUniforms:n}}function Jg(r,e,t,n){let i={},s={},a=[],o=t.isWebGL2?r.getParameter(35375):0;function c(P,A){let v=A.program;n.uniformBlockBinding(P,v)}function h(P,A){let v=i[P.id];v===void 0&&(_(P),v=u(P),i[P.id]=v,P.addEventListener("dispose",f));let w=A.program;n.updateUBOMapping(P,w);let O=e.render.frame;s[P.id]!==O&&(d(P),s[P.id]=O)}function u(P){let A=l();P.__bindingPointIndex=A;let v=r.createBuffer(),w=P.__size,O=P.usage;return r.bindBuffer(35345,v),r.bufferData(35345,w,O),r.bindBuffer(35345,null),r.bindBufferBase(35345,A,v),v}function l(){for(let P=0;P<o;P++)if(a.indexOf(P)===-1)return a.push(P),P;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(P){let A=i[P.id],v=P.uniforms,w=P.__cache;r.bindBuffer(35345,A);for(let O=0,U=v.length;O<U;O++){let y=v[O];if(g(y,O,w)===!0){let L=y.value,z=y.__offset;typeof L=="number"?(y.__data[0]=L,r.bufferSubData(35345,z,y.__data)):(y.value.isMatrix3?(y.__data[0]=y.value.elements[0],y.__data[1]=y.value.elements[1],y.__data[2]=y.value.elements[2],y.__data[3]=y.value.elements[0],y.__data[4]=y.value.elements[3],y.__data[5]=y.value.elements[4],y.__data[6]=y.value.elements[5],y.__data[7]=y.value.elements[0],y.__data[8]=y.value.elements[6],y.__data[9]=y.value.elements[7],y.__data[10]=y.value.elements[8],y.__data[11]=y.value.elements[0]):L.toArray(y.__data),r.bufferSubData(35345,z,y.__data))}}r.bindBuffer(35345,null)}function g(P,A,v){let w=P.value;if(v[A]===void 0)return typeof w=="number"?v[A]=w:v[A]=w.clone(),!0;if(typeof w=="number"){if(v[A]!==w)return v[A]=w,!0}else{let O=v[A];if(O.equals(w)===!1)return O.copy(w),!0}return!1}function _(P){let A=P.uniforms,v=0,w=16,O=0;for(let U=0,y=A.length;U<y;U++){let L=A[U],z=m(L);if(L.__data=new Float32Array(z.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=v,U>0){O=v%w;let Z=w-O;O!==0&&Z-z.boundary<0&&(v+=w-O,L.__offset=v)}v+=z.storage}return O=v%w,O>0&&(v+=w-O),P.__size=v,P.__cache={},this}function m(P){let A=P.value,v={boundary:0,storage:0};return typeof A=="number"?(v.boundary=4,v.storage=4):A.isVector2?(v.boundary=8,v.storage=8):A.isVector3||A.isColor?(v.boundary=16,v.storage=12):A.isVector4?(v.boundary=16,v.storage=16):A.isMatrix3?(v.boundary=48,v.storage=48):A.isMatrix4?(v.boundary=64,v.storage=64):A.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",A),v}function f(P){let A=P.target;A.removeEventListener("dispose",f);let v=a.indexOf(A.__bindingPointIndex);a.splice(v,1),r.deleteBuffer(i[A.id]),delete i[A.id],delete s[A.id]}function b(){for(let P in i)r.deleteBuffer(i[P]);a=[],i={},s={}}return{bind:c,update:h,dispose:b}}function $g(){let r=er("canvas");return r.style.display="block",r}function dl(r={}){this.isWebGLRenderer=!0;let e=r.canvas!==void 0?r.canvas:$g(),t=r.context!==void 0?r.context:null,n=r.depth!==void 0?r.depth:!0,i=r.stencil!==void 0?r.stencil:!0,s=r.antialias!==void 0?r.antialias:!1,a=r.premultipliedAlpha!==void 0?r.premultipliedAlpha:!0,o=r.preserveDrawingBuffer!==void 0?r.preserveDrawingBuffer:!1,c=r.powerPreference!==void 0?r.powerPreference:"default",h=r.failIfMajorPerformanceCaveat!==void 0?r.failIfMajorPerformanceCaveat:!1,u;t!==null?u=t.getContextAttributes().alpha:u=r.alpha!==void 0?r.alpha:!1;let l=null,d=null,g=[],_=[];this.domElement=e,this.debug={checkShaderErrors:!0},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.outputEncoding=Ni,this.physicallyCorrectLights=!1,this.toneMapping=ti,this.toneMappingExposure=1;let m=this,f=!1,b=0,P=0,A=null,v=-1,w=null,O=new It,U=new It,y=null,L=e.width,z=e.height,Z=1,re=null,Y=null,V=new It(0,0,L,z),j=new It(0,0,L,z),oe=!1,fe=new nr,ie=!1,le=!1,ce=null,ee=new At,J=new Ue,ye=new R,ge={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function ve(){return A===null?Z:1}let ne=t;function lt(C,W){for(let K=0;K<C.length;K++){let H=C[K],te=e.getContext(H,W);if(te!==null)return te}return null}try{let C={alpha:!0,depth:n,stencil:i,antialias:s,premultipliedAlpha:a,preserveDrawingBuffer:o,powerPreference:c,failIfMajorPerformanceCaveat:h};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${ll}`),e.addEventListener("webglcontextlost",Oe,!1),e.addEventListener("webglcontextrestored",Ne,!1),e.addEventListener("webglcontextcreationerror",tt,!1),ne===null){let W=["webgl2","webgl","experimental-webgl"];if(m.isWebGL1Renderer===!0&&W.shift(),ne=lt(W,C),ne===null)throw lt(W)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}ne.getShaderPrecisionFormat===void 0&&(ne.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(C){throw console.error("THREE.WebGLRenderer: "+C.message),C}let Re,Ge,Ee,pt,je,Xe,st,Ft,Mt,Vt,Dt,mt,mn,en,I,T,Q,me,pe,Te,We,E,G,we;function Pe(){Re=new xm(ne),Ge=new um(ne,Re,r),Re.init(Ge),E=new qg(ne,Re,Ge),Ee=new Wg(ne,Re,Ge),pt=new vm,je=new Ig,Xe=new Xg(ne,Re,Ee,je,Ge,E,pt),st=new fm(m),Ft=new gm(m),Mt=new Cd(ne,Ge),G=new cm(ne,Re,Mt,Ge),Vt=new ym(ne,Mt,pt,G),Dt=new Sm(ne,Vt,Mt,pt),pe=new wm(ne,Ge,Xe),T=new dm(je),mt=new Rg(m,st,Ft,Re,Ge,G,T),mn=new Zg(m,je),en=new Ng,I=new Ug(Re,Ge),me=new lm(m,st,Ft,Ee,Dt,u,a),Q=new Hg(m,Dt,Ge),we=new Jg(ne,pt,Ge,Ee),Te=new hm(ne,Re,pt,Ge),We=new _m(ne,Re,pt,Ge),pt.programs=mt.programs,m.capabilities=Ge,m.extensions=Re,m.properties=je,m.renderLists=en,m.shadowMap=Q,m.state=Ee,m.info=pt}Pe();let Ae=new qa(m,ne);this.xr=Ae,this.getContext=function(){return ne},this.getContextAttributes=function(){return ne.getContextAttributes()},this.forceContextLoss=function(){let C=Re.get("WEBGL_lose_context");C&&C.loseContext()},this.forceContextRestore=function(){let C=Re.get("WEBGL_lose_context");C&&C.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(C){C!==void 0&&(Z=C,this.setSize(L,z,!1))},this.getSize=function(C){return C.set(L,z)},this.setSize=function(C,W,K){if(Ae.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}L=C,z=W,e.width=Math.floor(C*Z),e.height=Math.floor(W*Z),K!==!1&&(e.style.width=C+"px",e.style.height=W+"px"),this.setViewport(0,0,C,W)},this.getDrawingBufferSize=function(C){return C.set(L*Z,z*Z).floor()},this.setDrawingBufferSize=function(C,W,K){L=C,z=W,Z=K,e.width=Math.floor(C*K),e.height=Math.floor(W*K),this.setViewport(0,0,C,W)},this.getCurrentViewport=function(C){return C.copy(O)},this.getViewport=function(C){return C.copy(V)},this.setViewport=function(C,W,K,H){C.isVector4?V.set(C.x,C.y,C.z,C.w):V.set(C,W,K,H),Ee.viewport(O.copy(V).multiplyScalar(Z).floor())},this.getScissor=function(C){return C.copy(j)},this.setScissor=function(C,W,K,H){C.isVector4?j.set(C.x,C.y,C.z,C.w):j.set(C,W,K,H),Ee.scissor(U.copy(j).multiplyScalar(Z).floor())},this.getScissorTest=function(){return oe},this.setScissorTest=function(C){Ee.setScissorTest(oe=C)},this.setOpaqueSort=function(C){re=C},this.setTransparentSort=function(C){Y=C},this.getClearColor=function(C){return C.copy(me.getClearColor())},this.setClearColor=function(){me.setClearColor.apply(me,arguments)},this.getClearAlpha=function(){return me.getClearAlpha()},this.setClearAlpha=function(){me.setClearAlpha.apply(me,arguments)},this.clear=function(C=!0,W=!0,K=!0){let H=0;C&&(H|=16384),W&&(H|=256),K&&(H|=1024),ne.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",Oe,!1),e.removeEventListener("webglcontextrestored",Ne,!1),e.removeEventListener("webglcontextcreationerror",tt,!1),en.dispose(),I.dispose(),je.dispose(),st.dispose(),Ft.dispose(),Dt.dispose(),G.dispose(),we.dispose(),mt.dispose(),Ae.dispose(),Ae.removeEventListener("sessionstart",Ce),Ae.removeEventListener("sessionend",ze),ce&&(ce.dispose(),ce=null),ut.stop()};function Oe(C){C.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),f=!0}function Ne(){console.log("THREE.WebGLRenderer: Context Restored."),f=!1;let C=pt.autoReset,W=Q.enabled,K=Q.autoUpdate,H=Q.needsUpdate,te=Q.type;Pe(),pt.autoReset=C,Q.enabled=W,Q.autoUpdate=K,Q.needsUpdate=H,Q.type=te}function tt(C){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",C.statusMessage)}function nt(C){let W=C.target;W.removeEventListener("dispose",nt),xt(W)}function xt(C){F(C),je.remove(C)}function F(C){let W=je.get(C).programs;W!==void 0&&(W.forEach(function(K){mt.releaseProgram(K)}),C.isShaderMaterial&&mt.releaseShaderCache(C))}this.renderBufferDirect=function(C,W,K,H,te,Be){W===null&&(W=ge);let Ze=te.isMesh&&te.matrixWorld.determinant()<0,Je=pr(C,W,K,H,te);Ee.setMaterial(H,Ze);let rt=K.index,dt=1;H.wireframe===!0&&(rt=Vt.getWireframeAttribute(K),dt=2);let it=K.drawRange,He=K.attributes.position,Pt=it.start*dt,tn=(it.start+it.count)*dt;Be!==null&&(Pt=Math.max(Pt,Be.start*dt),tn=Math.min(tn,(Be.start+Be.count)*dt)),rt!==null?(Pt=Math.max(Pt,0),tn=Math.min(tn,rt.count)):He!=null&&(Pt=Math.max(Pt,0),tn=Math.min(tn,He.count));let In=tn-Pt;if(In<0||In===1/0)return;G.setup(te,H,Je,K,rt);let qn,Ot=Te;if(rt!==null&&(qn=Mt.get(rt),Ot=We,Ot.setIndex(qn)),te.isMesh)H.wireframe===!0?(Ee.setLineWidth(H.wireframeLinewidth*ve()),Ot.setMode(1)):Ot.setMode(4);else if(te.isLine){let ht=H.linewidth;ht===void 0&&(ht=1),Ee.setLineWidth(ht*ve()),te.isLineSegments?Ot.setMode(1):te.isLineLoop?Ot.setMode(2):Ot.setMode(3)}else te.isPoints?Ot.setMode(0):te.isSprite&&Ot.setMode(4);if(te.isInstancedMesh)Ot.renderInstances(Pt,In,te.count);else if(K.isInstancedBufferGeometry){let ht=K._maxInstanceCount!==void 0?K._maxInstanceCount:1/0,xi=Math.min(K.instanceCount,ht);Ot.renderInstances(Pt,In,xi)}else Ot.render(Pt,In)},this.compile=function(C,W){function K(H,te,Be){H.transparent===!0&&H.side===yn?(H.side=_n,H.needsUpdate=!0,on(H,te,Be),H.side=ys,H.needsUpdate=!0,on(H,te,Be),H.side=yn):on(H,te,Be)}d=I.get(C),d.init(),_.push(d),C.traverseVisible(function(H){H.isLight&&H.layers.test(W.layers)&&(d.pushLight(H),H.castShadow&&d.pushShadow(H))}),d.setupLights(m.physicallyCorrectLights),C.traverse(function(H){let te=H.material;if(te)if(Array.isArray(te))for(let Be=0;Be<te.length;Be++){let Ze=te[Be];K(Ze,C,H)}else K(te,C,H)}),_.pop(),d=null};let $=null;function ue(C){$&&$(C)}function Ce(){ut.stop()}function ze(){ut.start()}let ut=new Mh;ut.setAnimationLoop(ue),typeof self!="undefined"&&ut.setContext(self),this.setAnimationLoop=function(C){$=C,Ae.setAnimationLoop(C),C===null?ut.stop():ut.start()},Ae.addEventListener("sessionstart",Ce),Ae.addEventListener("sessionend",ze),this.render=function(C,W){if(W!==void 0&&W.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(f===!0)return;C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),W.parent===null&&W.matrixWorldAutoUpdate===!0&&W.updateMatrixWorld(),Ae.enabled===!0&&Ae.isPresenting===!0&&(Ae.cameraAutoUpdate===!0&&Ae.updateCamera(W),W=Ae.getCamera()),C.isScene===!0&&C.onBeforeRender(m,C,W,A),d=I.get(C,_.length),d.init(),_.push(d),ee.multiplyMatrices(W.projectionMatrix,W.matrixWorldInverse),fe.setFromProjectionMatrix(ee),le=this.localClippingEnabled,ie=T.init(this.clippingPlanes,le,W),l=en.get(C,g.length),l.init(),g.push(l),Et(C,W,0,m.sortObjects),l.finish(),m.sortObjects===!0&&l.sort(re,Y),ie===!0&&T.beginShadows();let K=d.state.shadowsArray;if(Q.render(K,C,W),ie===!0&&T.endShadows(),this.info.autoReset===!0&&this.info.reset(),me.render(l,C),d.setupLights(m.physicallyCorrectLights),W.isArrayCamera){let H=W.cameras;for(let te=0,Be=H.length;te<Be;te++){let Ze=H[te];Gt(l,C,Ze,Ze.viewport)}}else Gt(l,C,W);A!==null&&(Xe.updateMultisampleRenderTarget(A),Xe.updateRenderTargetMipmap(A)),C.isScene===!0&&C.onAfterRender(m,C,W),G.resetDefaultState(),v=-1,w=null,_.pop(),_.length>0?d=_[_.length-1]:d=null,g.pop(),g.length>0?l=g[g.length-1]:l=null};function Et(C,W,K,H){if(C.visible===!1)return;if(C.layers.test(W.layers)){if(C.isGroup)K=C.renderOrder;else if(C.isLOD)C.autoUpdate===!0&&C.update(W);else if(C.isLight)d.pushLight(C),C.castShadow&&d.pushShadow(C);else if(C.isSprite){if(!C.frustumCulled||fe.intersectsSprite(C)){H&&ye.setFromMatrixPosition(C.matrixWorld).applyMatrix4(ee);let Ze=Dt.update(C),Je=C.material;Je.visible&&l.push(C,Ze,Je,K,ye.z,null)}}else if((C.isMesh||C.isLine||C.isPoints)&&(C.isSkinnedMesh&&C.skeleton.frame!==pt.render.frame&&(C.skeleton.update(),C.skeleton.frame=pt.render.frame),!C.frustumCulled||fe.intersectsObject(C))){H&&ye.setFromMatrixPosition(C.matrixWorld).applyMatrix4(ee);let Ze=Dt.update(C),Je=C.material;if(Array.isArray(Je)){let rt=Ze.groups;for(let dt=0,it=rt.length;dt<it;dt++){let He=rt[dt],Pt=Je[He.materialIndex];Pt&&Pt.visible&&l.push(C,Ze,Pt,K,ye.z,He)}}else Je.visible&&l.push(C,Ze,Je,K,ye.z,null)}}let Be=C.children;for(let Ze=0,Je=Be.length;Ze<Je;Ze++)Et(Be[Ze],W,K,H)}function Gt(C,W,K,H){let te=C.opaque,Be=C.transmissive,Ze=C.transparent;d.setupLightsView(K),Be.length>0&&Xn(te,W,K),H&&Ee.viewport(O.copy(H)),te.length>0&&Tt(te,W,K),Be.length>0&&Tt(Be,W,K),Ze.length>0&&Tt(Ze,W,K),Ee.buffers.depth.setTest(!0),Ee.buffers.depth.setMask(!0),Ee.buffers.color.setMask(!0),Ee.setPolygonOffset(!1)}function Xn(C,W,K){let H=Ge.isWebGL2;ce===null&&(ce=new ii(1,1,{generateMipmaps:!0,type:Re.has("EXT_color_buffer_half_float")?js:Di,minFilter:Eo,samples:H&&s===!0?4:0})),m.getDrawingBufferSize(J),H?ce.setSize(J.x,J.y):ce.setSize(io(J.x),io(J.y));let te=m.getRenderTarget();m.setRenderTarget(ce),m.clear();let Be=m.toneMapping;m.toneMapping=ti,Tt(C,W,K),m.toneMapping=Be,Xe.updateMultisampleRenderTarget(ce),Xe.updateRenderTargetMipmap(ce),m.setRenderTarget(te)}function Tt(C,W,K){let H=W.isScene===!0?W.overrideMaterial:null;for(let te=0,Be=C.length;te<Be;te++){let Ze=C[te],Je=Ze.object,rt=Ze.geometry,dt=H===null?Ze.material:H,it=Ze.group;Je.layers.test(K.layers)&&Nt(Je,W,K,rt,dt,it)}}function Nt(C,W,K,H,te,Be){C.onBeforeRender(m,W,K,H,te,Be),C.modelViewMatrix.multiplyMatrices(K.matrixWorldInverse,C.matrixWorld),C.normalMatrix.getNormalMatrix(C.modelViewMatrix),te.onBeforeRender(m,W,K,H,C,Be),te.transparent===!0&&te.side===yn?(te.side=_n,te.needsUpdate=!0,m.renderBufferDirect(K,W,H,te,C,Be),te.side=ys,te.needsUpdate=!0,m.renderBufferDirect(K,W,H,te,C,Be),te.side=yn):m.renderBufferDirect(K,W,H,te,C,Be),C.onAfterRender(m,W,K,H,te,Be)}function on(C,W,K){W.isScene!==!0&&(W=ge);let H=je.get(C),te=d.state.lights,Be=d.state.shadowsArray,Ze=te.state.version,Je=mt.getParameters(C,te.state,Be,W,K),rt=mt.getProgramCacheKey(Je),dt=H.programs;H.environment=C.isMeshStandardMaterial?W.environment:null,H.fog=W.fog,H.envMap=(C.isMeshStandardMaterial?Ft:st).get(C.envMap||H.environment),dt===void 0&&(C.addEventListener("dispose",nt),dt=new Map,H.programs=dt);let it=dt.get(rt);if(it!==void 0){if(H.currentProgram===it&&H.lightsStateVersion===Ze)return Io(C,Je),it}else Je.uniforms=mt.getUniforms(C),C.onBuild(K,Je,m),C.onBeforeCompile(Je,m),it=mt.acquireProgram(Je,rt),dt.set(rt,it),H.uniforms=Je.uniforms;let He=H.uniforms;(!C.isShaderMaterial&&!C.isRawShaderMaterial||C.clipping===!0)&&(He.clippingPlanes=T.uniform),Io(C,Je),H.needsLights=Do(C),H.lightsStateVersion=Ze,H.needsLights&&(He.ambientLightColor.value=te.state.ambient,He.lightProbe.value=te.state.probe,He.directionalLights.value=te.state.directional,He.directionalLightShadows.value=te.state.directionalShadow,He.spotLights.value=te.state.spot,He.spotLightShadows.value=te.state.spotShadow,He.rectAreaLights.value=te.state.rectArea,He.ltc_1.value=te.state.rectAreaLTC1,He.ltc_2.value=te.state.rectAreaLTC2,He.pointLights.value=te.state.point,He.pointLightShadows.value=te.state.pointShadow,He.hemisphereLights.value=te.state.hemi,He.directionalShadowMap.value=te.state.directionalShadowMap,He.directionalShadowMatrix.value=te.state.directionalShadowMatrix,He.spotShadowMap.value=te.state.spotShadowMap,He.spotLightMatrix.value=te.state.spotLightMatrix,He.spotLightMap.value=te.state.spotLightMap,He.pointShadowMap.value=te.state.pointShadowMap,He.pointShadowMatrix.value=te.state.pointShadowMatrix);let Pt=it.getUniforms(),tn=xs.seqWithValue(Pt.seq,He);return H.currentProgram=it,H.uniformsList=tn,it}function Io(C,W){let K=je.get(C);K.outputEncoding=W.outputEncoding,K.instancing=W.instancing,K.skinning=W.skinning,K.morphTargets=W.morphTargets,K.morphNormals=W.morphNormals,K.morphColors=W.morphColors,K.morphTargetsCount=W.morphTargetsCount,K.numClippingPlanes=W.numClippingPlanes,K.numIntersection=W.numClipIntersection,K.vertexAlphas=W.vertexAlphas,K.vertexTangents=W.vertexTangents,K.toneMapping=W.toneMapping}function pr(C,W,K,H,te){W.isScene!==!0&&(W=ge),Xe.resetTextureUnits();let Be=W.fog,Ze=H.isMeshStandardMaterial?W.environment:null,Je=A===null?m.outputEncoding:A.isXRRenderTarget===!0?A.texture.encoding:Ni,rt=(H.isMeshStandardMaterial?Ft:st).get(H.envMap||Ze),dt=H.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,it=!!H.normalMap&&!!K.attributes.tangent,He=!!K.morphAttributes.position,Pt=!!K.morphAttributes.normal,tn=!!K.morphAttributes.color,In=H.toneMapped?m.toneMapping:ti,qn=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,Ot=qn!==void 0?qn.length:0,ht=je.get(H),xi=d.state.lights;if(ie===!0&&(le===!0||C!==w)){let Zt=C===w&&H.id===v;T.setState(H,C,Zt)}let $e=!1;H.version===ht.__version?(ht.needsLights&&ht.lightsStateVersion!==xi.state.version||ht.outputEncoding!==Je||te.isInstancedMesh&&ht.instancing===!1||!te.isInstancedMesh&&ht.instancing===!0||te.isSkinnedMesh&&ht.skinning===!1||!te.isSkinnedMesh&&ht.skinning===!0||ht.envMap!==rt||H.fog===!0&&ht.fog!==Be||ht.numClippingPlanes!==void 0&&(ht.numClippingPlanes!==T.numPlanes||ht.numIntersection!==T.numIntersection)||ht.vertexAlphas!==dt||ht.vertexTangents!==it||ht.morphTargets!==He||ht.morphNormals!==Pt||ht.morphColors!==tn||ht.toneMapping!==In||Ge.isWebGL2===!0&&ht.morphTargetsCount!==Ot)&&($e=!0):($e=!0,ht.__version=H.version);let Dn=ht.currentProgram;$e===!0&&(Dn=on(H,W,te));let yi=!1,_i=!1,an=!1,Kt=Dn.getUniforms(),Yn=ht.uniforms;if(Ee.useProgram(Dn.program)&&(yi=!0,_i=!0,an=!0),H.id!==v&&(v=H.id,_i=!0),yi||w!==C){if(Kt.setValue(ne,"projectionMatrix",C.projectionMatrix),Ge.logarithmicDepthBuffer&&Kt.setValue(ne,"logDepthBufFC",2/(Math.log(C.far+1)/Math.LN2)),w!==C&&(w=C,_i=!0,an=!0),H.isShaderMaterial||H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshStandardMaterial||H.envMap){let Zt=Kt.map.cameraPosition;Zt!==void 0&&Zt.setValue(ne,ye.setFromMatrixPosition(C.matrixWorld))}(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&Kt.setValue(ne,"isOrthographic",C.isOrthographicCamera===!0),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial||H.isShadowMaterial||te.isSkinnedMesh)&&Kt.setValue(ne,"viewMatrix",C.matrixWorldInverse)}if(te.isSkinnedMesh){Kt.setOptional(ne,te,"bindMatrix"),Kt.setOptional(ne,te,"bindMatrixInverse");let Zt=te.skeleton;Zt&&(Ge.floatVertexTextures?(Zt.boneTexture===null&&Zt.computeBoneTexture(),Kt.setValue(ne,"boneTexture",Zt.boneTexture,Xe),Kt.setValue(ne,"boneTextureSize",Zt.boneTextureSize)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}let Vi=K.morphAttributes;if((Vi.position!==void 0||Vi.normal!==void 0||Vi.color!==void 0&&Ge.isWebGL2===!0)&&pe.update(te,K,H,Dn),(_i||ht.receiveShadow!==te.receiveShadow)&&(ht.receiveShadow=te.receiveShadow,Kt.setValue(ne,"receiveShadow",te.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(Yn.envMap.value=rt,Yn.flipEnvMap.value=rt.isCubeTexture&&rt.isRenderTargetTexture===!1?-1:1),_i&&(Kt.setValue(ne,"toneMappingExposure",m.toneMappingExposure),ht.needsLights&&mr(Yn,an),Be&&H.fog===!0&&mn.refreshFogUniforms(Yn,Be),mn.refreshMaterialUniforms(Yn,H,Z,z,ce),xs.upload(ne,ht.uniformsList,Yn,Xe)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(xs.upload(ne,ht.uniformsList,Yn,Xe),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&Kt.setValue(ne,"center",te.center),Kt.setValue(ne,"modelViewMatrix",te.modelViewMatrix),Kt.setValue(ne,"normalMatrix",te.normalMatrix),Kt.setValue(ne,"modelMatrix",te.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){let Zt=H.uniformsGroups;for(let Gi=0,No=Zt.length;Gi<No;Gi++)if(Ge.isWebGL2){let Hi=Zt[Gi];we.update(Hi,Dn),we.bind(Hi,Dn)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Dn}function mr(C,W){C.ambientLightColor.needsUpdate=W,C.lightProbe.needsUpdate=W,C.directionalLights.needsUpdate=W,C.directionalLightShadows.needsUpdate=W,C.pointLights.needsUpdate=W,C.pointLightShadows.needsUpdate=W,C.spotLights.needsUpdate=W,C.spotLightShadows.needsUpdate=W,C.rectAreaLights.needsUpdate=W,C.hemisphereLights.needsUpdate=W}function Do(C){return C.isMeshLambertMaterial||C.isMeshToonMaterial||C.isMeshPhongMaterial||C.isMeshStandardMaterial||C.isShadowMaterial||C.isShaderMaterial&&C.lights===!0}this.getActiveCubeFace=function(){return b},this.getActiveMipmapLevel=function(){return P},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(C,W,K){je.get(C.texture).__webglTexture=W,je.get(C.depthTexture).__webglTexture=K;let H=je.get(C);H.__hasExternalTextures=!0,H.__hasExternalTextures&&(H.__autoAllocateDepthBuffer=K===void 0,H.__autoAllocateDepthBuffer||Re.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(C,W){let K=je.get(C);K.__webglFramebuffer=W,K.__useDefaultFramebuffer=W===void 0},this.setRenderTarget=function(C,W=0,K=0){A=C,b=W,P=K;let H=!0,te=null,Be=!1,Ze=!1;if(C){let rt=je.get(C);rt.__useDefaultFramebuffer!==void 0?(Ee.bindFramebuffer(36160,null),H=!1):rt.__webglFramebuffer===void 0?Xe.setupRenderTarget(C):rt.__hasExternalTextures&&Xe.rebindTextures(C,je.get(C.texture).__webglTexture,je.get(C.depthTexture).__webglTexture);let dt=C.texture;(dt.isData3DTexture||dt.isDataArrayTexture||dt.isCompressedArrayTexture)&&(Ze=!0);let it=je.get(C).__webglFramebuffer;C.isWebGLCubeRenderTarget?(te=it[W],Be=!0):Ge.isWebGL2&&C.samples>0&&Xe.useMultisampledRTT(C)===!1?te=je.get(C).__webglMultisampledFramebuffer:te=it,O.copy(C.viewport),U.copy(C.scissor),y=C.scissorTest}else O.copy(V).multiplyScalar(Z).floor(),U.copy(j).multiplyScalar(Z).floor(),y=oe;if(Ee.bindFramebuffer(36160,te)&&Ge.drawBuffers&&H&&Ee.drawBuffers(C,te),Ee.viewport(O),Ee.scissor(U),Ee.setScissorTest(y),Be){let rt=je.get(C.texture);ne.framebufferTexture2D(36160,36064,34069+W,rt.__webglTexture,K)}else if(Ze){let rt=je.get(C.texture),dt=W||0;ne.framebufferTextureLayer(36160,36064,rt.__webglTexture,K||0,dt)}v=-1},this.readRenderTargetPixels=function(C,W,K,H,te,Be,Ze){if(!(C&&C.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Je=je.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Ze!==void 0&&(Je=Je[Ze]),Je){Ee.bindFramebuffer(36160,Je);try{let rt=C.texture,dt=rt.format,it=rt.type;if(dt!==Bn&&E.convert(dt)!==ne.getParameter(35739)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let He=it===js&&(Re.has("EXT_color_buffer_half_float")||Ge.isWebGL2&&Re.has("EXT_color_buffer_float"));if(it!==Di&&E.convert(it)!==ne.getParameter(35738)&&!(it===Li&&(Ge.isWebGL2||Re.has("OES_texture_float")||Re.has("WEBGL_color_buffer_float")))&&!He){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}W>=0&&W<=C.width-H&&K>=0&&K<=C.height-te&&ne.readPixels(W,K,H,te,E.convert(dt),E.convert(it),Be)}finally{let rt=A!==null?je.get(A).__webglFramebuffer:null;Ee.bindFramebuffer(36160,rt)}}},this.copyFramebufferToTexture=function(C,W,K=0){let H=Math.pow(2,-K),te=Math.floor(W.image.width*H),Be=Math.floor(W.image.height*H);Xe.setTexture2D(W,0),ne.copyTexSubImage2D(3553,K,0,0,C.x,C.y,te,Be),Ee.unbindTexture()},this.copyTextureToTexture=function(C,W,K,H=0){let te=W.image.width,Be=W.image.height,Ze=E.convert(K.format),Je=E.convert(K.type);Xe.setTexture2D(K,0),ne.pixelStorei(37440,K.flipY),ne.pixelStorei(37441,K.premultiplyAlpha),ne.pixelStorei(3317,K.unpackAlignment),W.isDataTexture?ne.texSubImage2D(3553,H,C.x,C.y,te,Be,Ze,Je,W.image.data):W.isCompressedTexture?ne.compressedTexSubImage2D(3553,H,C.x,C.y,W.mipmaps[0].width,W.mipmaps[0].height,Ze,W.mipmaps[0].data):ne.texSubImage2D(3553,H,C.x,C.y,Ze,Je,W.image),H===0&&K.generateMipmaps&&ne.generateMipmap(3553),Ee.unbindTexture()},this.copyTextureToTexture3D=function(C,W,K,H,te=0){if(m.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let Be=C.max.x-C.min.x+1,Ze=C.max.y-C.min.y+1,Je=C.max.z-C.min.z+1,rt=E.convert(H.format),dt=E.convert(H.type),it;if(H.isData3DTexture)Xe.setTexture3D(H,0),it=32879;else if(H.isDataArrayTexture)Xe.setTexture2DArray(H,0),it=35866;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}ne.pixelStorei(37440,H.flipY),ne.pixelStorei(37441,H.premultiplyAlpha),ne.pixelStorei(3317,H.unpackAlignment);let He=ne.getParameter(3314),Pt=ne.getParameter(32878),tn=ne.getParameter(3316),In=ne.getParameter(3315),qn=ne.getParameter(32877),Ot=K.isCompressedTexture?K.mipmaps[0]:K.image;ne.pixelStorei(3314,Ot.width),ne.pixelStorei(32878,Ot.height),ne.pixelStorei(3316,C.min.x),ne.pixelStorei(3315,C.min.y),ne.pixelStorei(32877,C.min.z),K.isDataTexture||K.isData3DTexture?ne.texSubImage3D(it,te,W.x,W.y,W.z,Be,Ze,Je,rt,dt,Ot.data):K.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),ne.compressedTexSubImage3D(it,te,W.x,W.y,W.z,Be,Ze,Je,rt,Ot.data)):ne.texSubImage3D(it,te,W.x,W.y,W.z,Be,Ze,Je,rt,dt,Ot),ne.pixelStorei(3314,He),ne.pixelStorei(32878,Pt),ne.pixelStorei(3316,tn),ne.pixelStorei(3315,In),ne.pixelStorei(32877,qn),te===0&&H.generateMipmaps&&ne.generateMipmap(it),Ee.unbindTexture()},this.initTexture=function(C){C.isCubeTexture?Xe.setTextureCube(C,0):C.isData3DTexture?Xe.setTexture3D(C,0):C.isDataArrayTexture||C.isCompressedArrayTexture?Xe.setTexture2DArray(C,0):Xe.setTexture2D(C,0),Ee.unbindTexture()},this.resetState=function(){b=0,P=0,A=null,Ee.reset(),G.reset()},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}var Ya=class extends dl{};Ya.prototype.isWebGL1Renderer=!0;var Ts=class extends jt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.backgroundIntensity=this.backgroundIntensity),t}get autoUpdate(){return console.warn("THREE.Scene: autoUpdate was renamed to matrixWorldAutoUpdate in r144."),this.matrixWorldAutoUpdate}set autoUpdate(e){console.warn("THREE.Scene: autoUpdate was renamed to matrixWorldAutoUpdate in r144."),this.matrixWorldAutoUpdate=e}},mo=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=La,this.updateRange={offset:0,count:-1},this.version=0,this.uuid=ni()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,s=this.stride;i<s;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ni()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ni()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},cn=new R,ir=class r{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i===!0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)cn.fromBufferAttribute(this,t),cn.applyMatrix4(e),this.setXYZ(t,cn.x,cn.y,cn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)cn.fromBufferAttribute(this,t),cn.applyNormalMatrix(e),this.setXYZ(t,cn.x,cn.y,cn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)cn.fromBufferAttribute(this,t),cn.transformDirection(e),this.setXYZ(t,cn.x,cn.y,cn.z);return this}setX(e,t){return this.normalized&&(t=St(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=St(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=St(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=St(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=ei(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=ei(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=ei(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=ei(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=St(t,this.array),n=St(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=St(t,this.array),n=St(n,this.array),i=St(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=St(t,this.array),n=St(n,this.array),i=St(i,this.array),s=St(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return new rn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new r(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},As=class extends si{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new ft(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},ls,Gs=new R,cs=new R,hs=new R,us=new Ue,Hs=new Ue,Eh=new At,Yr=new R,Ws=new R,Zr=new R,th=new Ue,ba=new Ue,nh=new Ue,sr=class extends jt{constructor(e){if(super(),this.isSprite=!0,this.type="Sprite",ls===void 0){ls=new Ut;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new mo(t,5);ls.setIndex([0,1,2,0,2,3]),ls.setAttribute("position",new ir(n,3,0,!1)),ls.setAttribute("uv",new ir(n,2,3,!1))}this.geometry=ls,this.material=e!==void 0?e:new As,this.center=new Ue(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),cs.setFromMatrixScale(this.matrixWorld),Eh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),hs.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&cs.multiplyScalar(-hs.z);let n=this.material.rotation,i,s;n!==0&&(s=Math.cos(n),i=Math.sin(n));let a=this.center;Jr(Yr.set(-.5,-.5,0),hs,a,cs,i,s),Jr(Ws.set(.5,-.5,0),hs,a,cs,i,s),Jr(Zr.set(.5,.5,0),hs,a,cs,i,s),th.set(0,0),ba.set(1,0),nh.set(1,1);let o=e.ray.intersectTriangle(Yr,Ws,Zr,!1,Gs);if(o===null&&(Jr(Ws.set(-.5,.5,0),hs,a,cs,i,s),ba.set(0,1),o=e.ray.intersectTriangle(Yr,Zr,Ws,!1,Gs),o===null))return;let c=e.ray.origin.distanceTo(Gs);c<e.near||c>e.far||t.push({distance:c,point:Gs.clone(),uv:gs.getUV(Gs,Yr,Ws,Zr,th,ba,nh,new Ue),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Jr(r,e,t,n,i,s){us.subVectors(r,t).addScalar(.5).multiply(n),i!==void 0?(Hs.x=s*us.x-i*us.y,Hs.y=i*us.x+s*us.y):Hs.copy(us),r.copy(e),r.x+=Hs.x,r.y+=Hs.y,r.applyMatrix4(Eh)}var rr=class extends rn{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ih=new At,sh=new At,$r=[],Kg=new At,Xs=new Ve,Es=class extends Ve{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new rr(new Float32Array(n*16),16),this.instanceColor=null,this.count=n,this.frustumCulled=!1;for(let i=0;i<n;i++)this.setMatrixAt(i,Kg)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){let n=this.matrixWorld,i=this.count;if(Xs.geometry=this.geometry,Xs.material=this.material,Xs.material!==void 0)for(let s=0;s<i;s++){this.getMatrixAt(s,ih),sh.multiplyMatrices(n,ih),Xs.matrixWorld=sh,Xs.raycast(e,$r);for(let a=0,o=$r.length;a<o;a++){let c=$r[a];c.instanceId=s,c.object=this,t.push(c)}$r.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new rr(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}},Cs=class extends si{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ft(16777215),this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},rh=new R,oh=new R,ah=new At,Ma=new ao,Kr=new Ms,Za=class extends jt{constructor(e=new Ut,t=new Cs){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let i=1,s=t.count;i<s;i++)rh.fromBufferAttribute(t,i-1),oh.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=rh.distanceTo(oh);e.setAttribute("lineDistance",new gt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,s=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Kr.copy(n.boundingSphere),Kr.applyMatrix4(i),Kr.radius+=s,e.ray.intersectsSphere(Kr)===!1)return;ah.copy(i).invert(),Ma.copy(e.ray).applyMatrix4(ah);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,h=new R,u=new R,l=new R,d=new R,g=this.isLineSegments?2:1,_=n.index,f=n.attributes.position;if(_!==null){let b=Math.max(0,a.start),P=Math.min(_.count,a.start+a.count);for(let A=b,v=P-1;A<v;A+=g){let w=_.getX(A),O=_.getX(A+1);if(h.fromBufferAttribute(f,w),u.fromBufferAttribute(f,O),Ma.distanceSqToSegment(h,u,d,l)>c)continue;d.applyMatrix4(this.matrixWorld);let y=e.ray.origin.distanceTo(d);y<e.near||y>e.far||t.push({distance:y,point:l.clone().applyMatrix4(this.matrixWorld),index:A,face:null,faceIndex:null,object:this})}}else{let b=Math.max(0,a.start),P=Math.min(f.count,a.start+a.count);for(let A=b,v=P-1;A<v;A+=g){if(h.fromBufferAttribute(f,A),u.fromBufferAttribute(f,A+1),Ma.distanceSqToSegment(h,u,d,l)>c)continue;d.applyMatrix4(this.matrixWorld);let O=e.ray.origin.distanceTo(d);O<e.near||O>e.far||t.push({distance:O,point:l.clone().applyMatrix4(this.matrixWorld),index:A,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){let o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}},lh=new R,ch=new R,or=class extends Za{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let i=0,s=t.count;i<s;i+=2)lh.fromBufferAttribute(t,i),ch.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+lh.distanceTo(ch);e.setAttribute("lineDistance",new gt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var ar=class extends fn{constructor(e,t,n,i,s,a,o,c,h){super(e,t,n,i,s,a,o,c,h),this.isCanvasTexture=!0,this.needsUpdate=!0}};var lr=class r extends Ut{constructor(e=1,t=8,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);let s=[],a=[],o=[],c=[],h=new R,u=new Ue;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let l=0,d=3;l<=t;l++,d+=3){let g=n+l/t*i;h.x=e*Math.cos(g),h.y=e*Math.sin(g),a.push(h.x,h.y,h.z),o.push(0,0,1),u.x=(a[d]/e+1)/2,u.y=(a[d+1]/e+1)/2,c.push(u.x,u.y)}for(let l=1;l<=t;l++)s.push(l,l+1,0);this.setIndex(s),this.setAttribute("position",new gt(a,3)),this.setAttribute("normal",new gt(o,3)),this.setAttribute("uv",new gt(c,2))}static fromJSON(e){return new r(e.radius,e.segments,e.thetaStart,e.thetaLength)}},vn=class r extends Ut{constructor(e=1,t=1,n=1,i=8,s=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:c};let h=this;i=Math.floor(i),s=Math.floor(s);let u=[],l=[],d=[],g=[],_=0,m=[],f=n/2,b=0;P(),a===!1&&(e>0&&A(!0),t>0&&A(!1)),this.setIndex(u),this.setAttribute("position",new gt(l,3)),this.setAttribute("normal",new gt(d,3)),this.setAttribute("uv",new gt(g,2));function P(){let v=new R,w=new R,O=0,U=(t-e)/n;for(let y=0;y<=s;y++){let L=[],z=y/s,Z=z*(t-e)+e;for(let re=0;re<=i;re++){let Y=re/i,V=Y*c+o,j=Math.sin(V),oe=Math.cos(V);w.x=Z*j,w.y=-z*n+f,w.z=Z*oe,l.push(w.x,w.y,w.z),v.set(j,U,oe).normalize(),d.push(v.x,v.y,v.z),g.push(Y,1-z),L.push(_++)}m.push(L)}for(let y=0;y<i;y++)for(let L=0;L<s;L++){let z=m[L][y],Z=m[L+1][y],re=m[L+1][y+1],Y=m[L][y+1];u.push(z,Z,Y),u.push(Z,re,Y),O+=6}h.addGroup(b,O,0),b+=O}function A(v){let w=_,O=new Ue,U=new R,y=0,L=v===!0?e:t,z=v===!0?1:-1;for(let re=1;re<=i;re++)l.push(0,f*z,0),d.push(0,z,0),g.push(.5,.5),_++;let Z=_;for(let re=0;re<=i;re++){let V=re/i*c+o,j=Math.cos(V),oe=Math.sin(V);U.x=L*oe,U.y=f*z,U.z=L*j,l.push(U.x,U.y,U.z),d.push(0,z,0),O.x=j*.5+.5,O.y=oe*.5*z+.5,g.push(O.x,O.y),_++}for(let re=0;re<i;re++){let Y=w+re,V=Z+re;v===!0?u.push(V,V+1,Y):u.push(V+1,V,Y),y+=3}h.addGroup(b,y,v===!0?1:2),b+=y}}static fromJSON(e){return new r(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},go=class r extends vn{constructor(e=1,t=1,n=8,i=1,s=!1,a=0,o=Math.PI*2){super(0,e,t,n,i,s,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(e){return new r(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Ja=class r extends Ut{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};let s=[],a=[];o(i),h(n),u(),this.setAttribute("position",new gt(s,3)),this.setAttribute("normal",new gt(s.slice(),3)),this.setAttribute("uv",new gt(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function o(P){let A=new R,v=new R,w=new R;for(let O=0;O<t.length;O+=3)g(t[O+0],A),g(t[O+1],v),g(t[O+2],w),c(A,v,w,P)}function c(P,A,v,w){let O=w+1,U=[];for(let y=0;y<=O;y++){U[y]=[];let L=P.clone().lerp(v,y/O),z=A.clone().lerp(v,y/O),Z=O-y;for(let re=0;re<=Z;re++)re===0&&y===O?U[y][re]=L:U[y][re]=L.clone().lerp(z,re/Z)}for(let y=0;y<O;y++)for(let L=0;L<2*(O-y)-1;L++){let z=Math.floor(L/2);L%2===0?(d(U[y][z+1]),d(U[y+1][z]),d(U[y][z])):(d(U[y][z+1]),d(U[y+1][z+1]),d(U[y+1][z]))}}function h(P){let A=new R;for(let v=0;v<s.length;v+=3)A.x=s[v+0],A.y=s[v+1],A.z=s[v+2],A.normalize().multiplyScalar(P),s[v+0]=A.x,s[v+1]=A.y,s[v+2]=A.z}function u(){let P=new R;for(let A=0;A<s.length;A+=3){P.x=s[A+0],P.y=s[A+1],P.z=s[A+2];let v=f(P)/2/Math.PI+.5,w=b(P)/Math.PI+.5;a.push(v,1-w)}_(),l()}function l(){for(let P=0;P<a.length;P+=6){let A=a[P+0],v=a[P+2],w=a[P+4],O=Math.max(A,v,w),U=Math.min(A,v,w);O>.9&&U<.1&&(A<.2&&(a[P+0]+=1),v<.2&&(a[P+2]+=1),w<.2&&(a[P+4]+=1))}}function d(P){s.push(P.x,P.y,P.z)}function g(P,A){let v=P*3;A.x=e[v+0],A.y=e[v+1],A.z=e[v+2]}function _(){let P=new R,A=new R,v=new R,w=new R,O=new Ue,U=new Ue,y=new Ue;for(let L=0,z=0;L<s.length;L+=9,z+=6){P.set(s[L+0],s[L+1],s[L+2]),A.set(s[L+3],s[L+4],s[L+5]),v.set(s[L+6],s[L+7],s[L+8]),O.set(a[z+0],a[z+1]),U.set(a[z+2],a[z+3]),y.set(a[z+4],a[z+5]),w.copy(P).add(A).add(v).divideScalar(3);let Z=f(w);m(O,z+0,P,Z),m(U,z+2,A,Z),m(y,z+4,v,Z)}}function m(P,A,v,w){w<0&&P.x===1&&(a[A]=P.x-1),v.x===0&&v.z===0&&(a[A]=w/2/Math.PI+.5)}function f(P){return Math.atan2(P.z,-P.x)}function b(P){return Math.atan2(-P.y,Math.sqrt(P.x*P.x+P.z*P.z))}}static fromJSON(e){return new r(e.vertices,e.indices,e.radius,e.details)}};var xo=class r extends Ja{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new r(e.radius,e.detail)}};var cr=class r extends Ut{constructor(e=.5,t=1,n=8,i=1,s=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:s,thetaLength:a},n=Math.max(3,n),i=Math.max(1,i);let o=[],c=[],h=[],u=[],l=e,d=(t-e)/i,g=new R,_=new Ue;for(let m=0;m<=i;m++){for(let f=0;f<=n;f++){let b=s+f/n*a;g.x=l*Math.cos(b),g.y=l*Math.sin(b),c.push(g.x,g.y,g.z),h.push(0,0,1),_.x=(g.x/t+1)/2,_.y=(g.y/t+1)/2,u.push(_.x,_.y)}l+=d}for(let m=0;m<i;m++){let f=m*(n+1);for(let b=0;b<n;b++){let P=b+f,A=P,v=P+n+1,w=P+n+2,O=P+1;o.push(A,v,O),o.push(v,w,O)}}this.setIndex(o),this.setAttribute("position",new gt(c,3)),this.setAttribute("normal",new gt(h,3)),this.setAttribute("uv",new gt(u,2))}static fromJSON(e){return new r(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var Ps=class r extends Ut{constructor(e=1,t=.4,n=8,i=6,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:s},n=Math.floor(n),i=Math.floor(i);let a=[],o=[],c=[],h=[],u=new R,l=new R,d=new R;for(let g=0;g<=n;g++)for(let _=0;_<=i;_++){let m=_/i*s,f=g/n*Math.PI*2;l.x=(e+t*Math.cos(f))*Math.cos(m),l.y=(e+t*Math.cos(f))*Math.sin(m),l.z=t*Math.sin(f),o.push(l.x,l.y,l.z),u.x=e*Math.cos(m),u.y=e*Math.sin(m),d.subVectors(l,u).normalize(),c.push(d.x,d.y,d.z),h.push(_/i),h.push(g/n)}for(let g=1;g<=n;g++)for(let _=1;_<=i;_++){let m=(i+1)*g+_-1,f=(i+1)*(g-1)+_-1,b=(i+1)*(g-1)+_,P=(i+1)*g+_;a.push(m,f,P),a.push(f,b,P)}this.setIndex(a),this.setAttribute("position",new gt(o,3)),this.setAttribute("normal",new gt(c,3)),this.setAttribute("uv",new gt(h,2))}static fromJSON(e){return new r(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var pn=class extends si{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new ft(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ft(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=yh,this.normalScale=new Ue(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function mi(r,e,t){return Ch(r)?new r.constructor(r.subarray(e,t!==void 0?t:r.length)):r.slice(e,t)}function jr(r,e,t){return!r||!t&&r.constructor===e?r:typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r)}function Ch(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}var Ls=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],s=t[n-1];n:{e:{let a;t:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=i,i=t[++n],e<i)break e}a=t.length;break t}if(!(e>=s)){let o=t[1];e<o&&(n=2,s=o);for(let c=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(i=s,s=t[--n-1],e>=s)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let a=0;a!==i;++a)t[a]=n[s+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},$a=class extends Ls{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:_c,endingEnd:_c}}intervalChanged_(e,t,n){let i=this.parameterPositions,s=e-2,a=e+1,o=i[s],c=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case vc:s=e,o=2*t-n;break;case bc:s=i.length-2,o=t+i[s]-i[s+1];break;default:s=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case vc:a=e,c=2*n-t;break;case bc:a=1,c=n+i[1]-i[0];break;default:a=e-1,c=t}let h=(n-t)*.5,u=this.valueSize;this._weightPrev=h/(t-o),this._weightNext=h/(c-n),this._offsetPrev=s*u,this._offsetNext=a*u}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,h=c-o,u=this._offsetPrev,l=this._offsetNext,d=this._weightPrev,g=this._weightNext,_=(n-t)/(i-t),m=_*_,f=m*_,b=-d*f+2*d*m-d*_,P=(1+d)*f+(-1.5-2*d)*m+(-.5+d)*_+1,A=(-1-g)*f+(1.5+g)*m+.5*_,v=g*f-g*m;for(let w=0;w!==o;++w)s[w]=b*a[u+w]+P*a[h+w]+A*a[c+w]+v*a[l+w];return s}},Ka=class extends Ls{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,h=c-o,u=(n-t)/(i-t),l=1-u;for(let d=0;d!==o;++d)s[d]=a[h+d]*l+a[c+d]*u;return s}},ja=class extends Ls{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},Vn=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=jr(t,this.TimeBufferType),this.values=jr(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:jr(e.times,Array),values:jr(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ja(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ka(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new $a(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case eo:t=this.InterpolantFactoryMethodDiscrete;break;case to:t=this.InterpolantFactoryMethodLinear;break;case Zo:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return eo;case this.InterpolantFactoryMethodLinear:return to;case this.InterpolantFactoryMethodSmooth:return Zo}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){let n=this.times,i=n.length,s=0,a=i-1;for(;s!==i&&n[s]<e;)++s;for(;a!==-1&&n[a]>t;)--a;if(++a,s!==0||a!==i){s>=a&&(a=Math.max(a,1),s=a-1);let o=this.getValueSize();this.times=mi(n,s,a),this.values=mi(this.values,s*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,i=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){let c=n[o];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(i!==void 0&&Ch(i))for(let o=0,c=i.length;o!==c;++o){let h=i[o];if(isNaN(h)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,h),e=!1;break}}return e}optimize(){let e=mi(this.times),t=mi(this.values),n=this.getValueSize(),i=this.getInterpolation()===Zo,s=e.length-1,a=1;for(let o=1;o<s;++o){let c=!1,h=e[o],u=e[o+1];if(h!==u&&(o!==1||h!==e[0]))if(i)c=!0;else{let l=o*n,d=l-n,g=l+n;for(let _=0;_!==n;++_){let m=t[l+_];if(m!==t[d+_]||m!==t[g+_]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];let l=o*n,d=a*n;for(let g=0;g!==n;++g)t[d+g]=t[l+g]}++a}}if(s>0){e[a]=e[s];for(let o=s*n,c=a*n,h=0;h!==n;++h)t[c+h]=t[o+h];++a}return a!==e.length?(this.times=mi(e,0,a),this.values=mi(t,0,a*n)):(this.times=e,this.values=t),this}clone(){let e=mi(this.times,0),t=mi(this.values,0),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}};Vn.prototype.TimeBufferType=Float32Array;Vn.prototype.ValueBufferType=Float32Array;Vn.prototype.DefaultInterpolation=to;var zi=class extends Vn{};zi.prototype.ValueTypeName="bool";zi.prototype.ValueBufferType=Array;zi.prototype.DefaultInterpolation=eo;zi.prototype.InterpolantFactoryMethodLinear=void 0;zi.prototype.InterpolantFactoryMethodSmooth=void 0;var Qa=class extends Vn{};Qa.prototype.ValueTypeName="color";var el=class extends Vn{};el.prototype.ValueTypeName="number";var tl=class extends Ls{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(i-t),h=e*o;for(let u=h+o;h!==u;h+=4)Tn.slerpFlat(s,0,a,h-o,a,h,c);return s}},hr=class extends Vn{InterpolantFactoryMethodLinear(e){return new tl(this.times,this.values,this.getValueSize(),e)}};hr.prototype.ValueTypeName="quaternion";hr.prototype.DefaultInterpolation=to;hr.prototype.InterpolantFactoryMethodSmooth=void 0;var Fi=class extends Vn{};Fi.prototype.ValueTypeName="string";Fi.prototype.ValueBufferType=Array;Fi.prototype.DefaultInterpolation=eo;Fi.prototype.InterpolantFactoryMethodLinear=void 0;Fi.prototype.InterpolantFactoryMethodSmooth=void 0;var nl=class extends Vn{};nl.prototype.ValueTypeName="vector";var yo={enabled:!1,files:{},add:function(r,e){this.enabled!==!1&&(this.files[r]=e)},get:function(r){if(this.enabled!==!1)return this.files[r]},remove:function(r){delete this.files[r]},clear:function(){this.files={}}},il=class{constructor(e,t,n){let i=this,s=!1,a=0,o=0,c,h=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(u){o++,s===!1&&i.onStart!==void 0&&i.onStart(u,a,o),s=!0},this.itemEnd=function(u){a++,i.onProgress!==void 0&&i.onProgress(u,a,o),a===o&&(s=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(u){i.onError!==void 0&&i.onError(u)},this.resolveURL=function(u){return c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,l){return h.push(u,l),this},this.removeHandler=function(u){let l=h.indexOf(u);return l!==-1&&h.splice(l,2),this},this.getHandler=function(u){for(let l=0,d=h.length;l<d;l+=2){let g=h[l],_=h[l+1];if(g.global&&(g.lastIndex=0),g.test(u))return _}return null}}},jg=new il,ur=class{constructor(e){this.manager=e!==void 0?e:jg,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,s){n.load(e,i,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};var sl=class extends ur{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=this,a=yo.get(e);if(a!==void 0)return s.manager.itemStart(e),setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a;let o=er("img");function c(){u(),yo.add(e,this),t&&t(this),s.manager.itemEnd(e)}function h(l){u(),i&&i(l),s.manager.itemError(e),s.manager.itemEnd(e)}function u(){o.removeEventListener("load",c,!1),o.removeEventListener("error",h,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",h,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),s.manager.itemStart(e),o.src=e,o}};var _o=class extends ur{constructor(e){super(e)}load(e,t,n,i){let s=new fn,a=new sl(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){s.image=o,s.needsUpdate=!0,t!==void 0&&t(s)},n,i),s}},dr=class extends jt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ft(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}},vo=class extends dr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(jt.DefaultUp),this.updateMatrix(),this.groundColor=new ft(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},wa=new At,hh=new R,uh=new R,bo=class{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ue(512,512),this.map=null,this.mapPass=null,this.matrix=new At,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new nr,this._frameExtents=new Ue(1,1),this._viewportCount=1,this._viewports=[new It(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;hh.setFromMatrixPosition(e.matrixWorld),t.position.copy(hh),uh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(uh),t.updateMatrixWorld(),wa.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(wa),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(wa)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var dh=new At,qs=new R,Sa=new R,rl=class extends bo{constructor(){super(new sn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Ue(4,2),this._viewportCount=6,this._viewports=[new It(2,1,1,1),new It(0,1,1,1),new It(3,1,1,1),new It(1,1,1,1),new It(3,0,1,1),new It(1,0,1,1)],this._cubeDirections=[new R(1,0,0),new R(-1,0,0),new R(0,0,1),new R(0,0,-1),new R(0,1,0),new R(0,-1,0)],this._cubeUps=[new R(0,1,0),new R(0,1,0),new R(0,1,0),new R(0,1,0),new R(0,0,1),new R(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,i=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),qs.setFromMatrixPosition(e.matrixWorld),n.position.copy(qs),Sa.copy(n.position),Sa.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Sa),n.updateMatrixWorld(),i.makeTranslation(-qs.x,-qs.y,-qs.z),dh.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(dh)}},Mo=class extends dr{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new rl}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},ol=class extends bo{constructor(){super(new po(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},wo=class extends dr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(jt.DefaultUp),this.updateMatrix(),this.target=new jt,this.shadow=new ol}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var So=class extends ur{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap=="undefined"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch=="undefined"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=this,a=yo.get(e);if(a!==void 0)return s.manager.itemStart(e),setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a;let o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,fetch(e,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(c){yo.add(e,c),t&&t(c),s.manager.itemEnd(e)}).catch(function(c){i&&i(c),s.manager.itemError(e),s.manager.itemEnd(e)}),s.manager.itemStart(e)}};var fl="\\[\\]\\.:\\/",Qg=new RegExp("["+fl+"]","g"),pl="[^"+fl+"]",e0="[^"+fl.replace("\\.","")+"]",t0=/((?:WC+[\/:])*)/.source.replace("WC",pl),n0=/(WCOD+)?/.source.replace("WCOD",e0),i0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",pl),s0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",pl),r0=new RegExp("^"+t0+n0+i0+s0+"$"),o0=["material","materials","bones","map"],al=class{constructor(e,t,n){let i=n||Rt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Rt=class r{constructor(e,t,n){this.path=t,this.parsedPath=n||r.parseTrackName(t),this.node=r.findNode(e,this.parsedPath.nodeName)||e,this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new r.Composite(e,t,n):new r(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Qg,"")}static parseTrackName(e){let t=r0.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let s=n.nodeName.substring(i+1);o0.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let a=0;a<s.length;a++){let o=s[a];if(o.name===t||o.uuid===t)return o;let c=n(o.children);if(c)return c}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,i=t.propertyName,s=t.propertyIndex;if(e||(e=r.findNode(this.rootNode,t.nodeName)||this.rootNode,this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.error("THREE.PropertyBinding: Trying to update node for track: "+this.path+" but it wasn't found.");return}if(n){let h=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===h){h=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(h!==void 0){if(e[h]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[h]}}let a=e[i];if(a===void 0){let h=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+h+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Rt.Composite=al;Rt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Rt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Rt.prototype.GetterByBindingType=[Rt.prototype._getValue_direct,Rt.prototype._getValue_array,Rt.prototype._getValue_arrayElement,Rt.prototype._getValue_toArray];Rt.prototype.SetterByBindingTypeAndVersioning=[[Rt.prototype._setValue_direct,Rt.prototype._setValue_direct_setNeedsUpdate,Rt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Rt.prototype._setValue_array,Rt.prototype._setValue_array_setNeedsUpdate,Rt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Rt.prototype._setValue_arrayElement,Rt.prototype._setValue_arrayElement_setNeedsUpdate,Rt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Rt.prototype._setValue_fromArray,Rt.prototype._setValue_fromArray_setNeedsUpdate,Rt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var u0=new Float32Array(1);var fr=class{constructor(e=1,t=0,n=0){return this.radius=e,this.phi=t,this.theta=n,this}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(un(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ll}}));typeof window!="undefined"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ll);var Ph={type:"change"},ml={type:"start"},Lh={type:"end"},Po=class extends Wn{constructor(e,t){super(),this.object=e,this.domElement=t,this.domElement.style.touchAction="none",this.enabled=!0,this.target=new R,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:ki.ROTATE,MIDDLE:ki.DOLLY,RIGHT:ki.PAN},this.touches={ONE:Bi.ROTATE,TWO:Bi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this.getPolarAngle=function(){return o.phi},this.getAzimuthalAngle=function(){return o.theta},this.getDistance=function(){return this.object.position.distanceTo(this.target)},this.listenToKeyEvents=function(E){E.addEventListener("keydown",en),this._domElementKeyEvents=E},this.saveState=function(){n.target0.copy(n.target),n.position0.copy(n.object.position),n.zoom0=n.object.zoom},this.reset=function(){n.target.copy(n.target0),n.object.position.copy(n.position0),n.object.zoom=n.zoom0,n.object.updateProjectionMatrix(),n.dispatchEvent(Ph),n.update(),s=i.NONE},this.update=function(){let E=new R,G=new Tn().setFromUnitVectors(e.up,new R(0,1,0)),we=G.clone().invert(),Pe=new R,Ae=new Tn,Oe=2*Math.PI;return function(){let tt=n.object.position;E.copy(tt).sub(n.target),E.applyQuaternion(G),o.setFromVector3(E),n.autoRotate&&s===i.NONE&&L(U()),n.enableDamping?(o.theta+=c.theta*n.dampingFactor,o.phi+=c.phi*n.dampingFactor):(o.theta+=c.theta,o.phi+=c.phi);let nt=n.minAzimuthAngle,xt=n.maxAzimuthAngle;return isFinite(nt)&&isFinite(xt)&&(nt<-Math.PI?nt+=Oe:nt>Math.PI&&(nt-=Oe),xt<-Math.PI?xt+=Oe:xt>Math.PI&&(xt-=Oe),nt<=xt?o.theta=Math.max(nt,Math.min(xt,o.theta)):o.theta=o.theta>(nt+xt)/2?Math.max(nt,o.theta):Math.min(xt,o.theta)),o.phi=Math.max(n.minPolarAngle,Math.min(n.maxPolarAngle,o.phi)),o.makeSafe(),o.radius*=h,o.radius=Math.max(n.minDistance,Math.min(n.maxDistance,o.radius)),n.enableDamping===!0?n.target.addScaledVector(u,n.dampingFactor):n.target.add(u),E.setFromSpherical(o),E.applyQuaternion(we),tt.copy(n.target).add(E),n.object.lookAt(n.target),n.enableDamping===!0?(c.theta*=1-n.dampingFactor,c.phi*=1-n.dampingFactor,u.multiplyScalar(1-n.dampingFactor)):(c.set(0,0,0),u.set(0,0,0)),h=1,l||Pe.distanceToSquared(n.object.position)>a||8*(1-Ae.dot(n.object.quaternion))>a?(n.dispatchEvent(Ph),Pe.copy(n.object.position),Ae.copy(n.object.quaternion),l=!1,!0):!1}}(),this.dispose=function(){n.domElement.removeEventListener("contextmenu",Q),n.domElement.removeEventListener("pointerdown",st),n.domElement.removeEventListener("pointercancel",Vt),n.domElement.removeEventListener("wheel",mn),n.domElement.removeEventListener("pointermove",Ft),n.domElement.removeEventListener("pointerup",Mt),n._domElementKeyEvents!==null&&n._domElementKeyEvents.removeEventListener("keydown",en)};let n=this,i={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},s=i.NONE,a=1e-6,o=new fr,c=new fr,h=1,u=new R,l=!1,d=new Ue,g=new Ue,_=new Ue,m=new Ue,f=new Ue,b=new Ue,P=new Ue,A=new Ue,v=new Ue,w=[],O={};function U(){return 2*Math.PI/60/60*n.autoRotateSpeed}function y(){return Math.pow(.95,n.zoomSpeed)}function L(E){c.theta-=E}function z(E){c.phi-=E}let Z=function(){let E=new R;return function(we,Pe){E.setFromMatrixColumn(Pe,0),E.multiplyScalar(-we),u.add(E)}}(),re=function(){let E=new R;return function(we,Pe){n.screenSpacePanning===!0?E.setFromMatrixColumn(Pe,1):(E.setFromMatrixColumn(Pe,0),E.crossVectors(n.object.up,E)),E.multiplyScalar(we),u.add(E)}}(),Y=function(){let E=new R;return function(we,Pe){let Ae=n.domElement;if(n.object.isPerspectiveCamera){let Oe=n.object.position;E.copy(Oe).sub(n.target);let Ne=E.length();Ne*=Math.tan(n.object.fov/2*Math.PI/180),Z(2*we*Ne/Ae.clientHeight,n.object.matrix),re(2*Pe*Ne/Ae.clientHeight,n.object.matrix)}else n.object.isOrthographicCamera?(Z(we*(n.object.right-n.object.left)/n.object.zoom/Ae.clientWidth,n.object.matrix),re(Pe*(n.object.top-n.object.bottom)/n.object.zoom/Ae.clientHeight,n.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),n.enablePan=!1)}}();function V(E){n.object.isPerspectiveCamera?h/=E:n.object.isOrthographicCamera?(n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom*E)),n.object.updateProjectionMatrix(),l=!0):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function j(E){n.object.isPerspectiveCamera?h*=E:n.object.isOrthographicCamera?(n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/E)),n.object.updateProjectionMatrix(),l=!0):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function oe(E){d.set(E.clientX,E.clientY)}function fe(E){P.set(E.clientX,E.clientY)}function ie(E){m.set(E.clientX,E.clientY)}function le(E){g.set(E.clientX,E.clientY),_.subVectors(g,d).multiplyScalar(n.rotateSpeed);let G=n.domElement;L(2*Math.PI*_.x/G.clientHeight),z(2*Math.PI*_.y/G.clientHeight),d.copy(g),n.update()}function ce(E){A.set(E.clientX,E.clientY),v.subVectors(A,P),v.y>0?V(y()):v.y<0&&j(y()),P.copy(A),n.update()}function ee(E){f.set(E.clientX,E.clientY),b.subVectors(f,m).multiplyScalar(n.panSpeed),Y(b.x,b.y),m.copy(f),n.update()}function J(E){E.deltaY<0?j(y()):E.deltaY>0&&V(y()),n.update()}function ye(E){let G=!1;switch(E.code){case n.keys.UP:E.ctrlKey||E.metaKey||E.shiftKey?z(2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):Y(0,n.keyPanSpeed),G=!0;break;case n.keys.BOTTOM:E.ctrlKey||E.metaKey||E.shiftKey?z(-2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):Y(0,-n.keyPanSpeed),G=!0;break;case n.keys.LEFT:E.ctrlKey||E.metaKey||E.shiftKey?L(2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):Y(n.keyPanSpeed,0),G=!0;break;case n.keys.RIGHT:E.ctrlKey||E.metaKey||E.shiftKey?L(-2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):Y(-n.keyPanSpeed,0),G=!0;break}G&&(E.preventDefault(),n.update())}function ge(){if(w.length===1)d.set(w[0].pageX,w[0].pageY);else{let E=.5*(w[0].pageX+w[1].pageX),G=.5*(w[0].pageY+w[1].pageY);d.set(E,G)}}function ve(){if(w.length===1)m.set(w[0].pageX,w[0].pageY);else{let E=.5*(w[0].pageX+w[1].pageX),G=.5*(w[0].pageY+w[1].pageY);m.set(E,G)}}function ne(){let E=w[0].pageX-w[1].pageX,G=w[0].pageY-w[1].pageY,we=Math.sqrt(E*E+G*G);P.set(0,we)}function lt(){n.enableZoom&&ne(),n.enablePan&&ve()}function Re(){n.enableZoom&&ne(),n.enableRotate&&ge()}function Ge(E){if(w.length==1)g.set(E.pageX,E.pageY);else{let we=We(E),Pe=.5*(E.pageX+we.x),Ae=.5*(E.pageY+we.y);g.set(Pe,Ae)}_.subVectors(g,d).multiplyScalar(n.rotateSpeed);let G=n.domElement;L(2*Math.PI*_.x/G.clientHeight),z(2*Math.PI*_.y/G.clientHeight),d.copy(g)}function Ee(E){if(w.length===1)f.set(E.pageX,E.pageY);else{let G=We(E),we=.5*(E.pageX+G.x),Pe=.5*(E.pageY+G.y);f.set(we,Pe)}b.subVectors(f,m).multiplyScalar(n.panSpeed),Y(b.x,b.y),m.copy(f)}function pt(E){let G=We(E),we=E.pageX-G.x,Pe=E.pageY-G.y,Ae=Math.sqrt(we*we+Pe*Pe);A.set(0,Ae),v.set(0,Math.pow(A.y/P.y,n.zoomSpeed)),V(v.y),P.copy(A)}function je(E){n.enableZoom&&pt(E),n.enablePan&&Ee(E)}function Xe(E){n.enableZoom&&pt(E),n.enableRotate&&Ge(E)}function st(E){n.enabled!==!1&&(w.length===0&&(n.domElement.setPointerCapture(E.pointerId),n.domElement.addEventListener("pointermove",Ft),n.domElement.addEventListener("pointerup",Mt)),me(E),E.pointerType==="touch"?I(E):Dt(E))}function Ft(E){n.enabled!==!1&&(E.pointerType==="touch"?T(E):mt(E))}function Mt(E){pe(E),w.length===0&&(n.domElement.releasePointerCapture(E.pointerId),n.domElement.removeEventListener("pointermove",Ft),n.domElement.removeEventListener("pointerup",Mt)),n.dispatchEvent(Lh),s=i.NONE}function Vt(E){pe(E)}function Dt(E){let G;switch(E.button){case 0:G=n.mouseButtons.LEFT;break;case 1:G=n.mouseButtons.MIDDLE;break;case 2:G=n.mouseButtons.RIGHT;break;default:G=-1}switch(G){case ki.DOLLY:if(n.enableZoom===!1)return;fe(E),s=i.DOLLY;break;case ki.ROTATE:if(E.ctrlKey||E.metaKey||E.shiftKey){if(n.enablePan===!1)return;ie(E),s=i.PAN}else{if(n.enableRotate===!1)return;oe(E),s=i.ROTATE}break;case ki.PAN:if(E.ctrlKey||E.metaKey||E.shiftKey){if(n.enableRotate===!1)return;oe(E),s=i.ROTATE}else{if(n.enablePan===!1)return;ie(E),s=i.PAN}break;default:s=i.NONE}s!==i.NONE&&n.dispatchEvent(ml)}function mt(E){switch(s){case i.ROTATE:if(n.enableRotate===!1)return;le(E);break;case i.DOLLY:if(n.enableZoom===!1)return;ce(E);break;case i.PAN:if(n.enablePan===!1)return;ee(E);break}}function mn(E){n.enabled===!1||n.enableZoom===!1||s!==i.NONE||(E.preventDefault(),n.dispatchEvent(ml),J(E),n.dispatchEvent(Lh))}function en(E){n.enabled===!1||n.enablePan===!1||ye(E)}function I(E){switch(Te(E),w.length){case 1:switch(n.touches.ONE){case Bi.ROTATE:if(n.enableRotate===!1)return;ge(),s=i.TOUCH_ROTATE;break;case Bi.PAN:if(n.enablePan===!1)return;ve(),s=i.TOUCH_PAN;break;default:s=i.NONE}break;case 2:switch(n.touches.TWO){case Bi.DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;lt(),s=i.TOUCH_DOLLY_PAN;break;case Bi.DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;Re(),s=i.TOUCH_DOLLY_ROTATE;break;default:s=i.NONE}break;default:s=i.NONE}s!==i.NONE&&n.dispatchEvent(ml)}function T(E){switch(Te(E),s){case i.TOUCH_ROTATE:if(n.enableRotate===!1)return;Ge(E),n.update();break;case i.TOUCH_PAN:if(n.enablePan===!1)return;Ee(E),n.update();break;case i.TOUCH_DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;je(E),n.update();break;case i.TOUCH_DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;Xe(E),n.update();break;default:s=i.NONE}}function Q(E){n.enabled!==!1&&E.preventDefault()}function me(E){w.push(E)}function pe(E){delete O[E.pointerId];for(let G=0;G<w.length;G++)if(w[G].pointerId==E.pointerId){w.splice(G,1);return}}function Te(E){let G=O[E.pointerId];G===void 0&&(G=new Ue,O[E.pointerId]=G),G.set(E.pageX,E.pageY)}function We(E){let G=E.pointerId===w[0].pointerId?w[1]:w[0];return O[G.pointerId]}n.domElement.addEventListener("contextmenu",Q),n.domElement.addEventListener("pointerdown",st),n.domElement.addEventListener("pointercancel",Vt),n.domElement.addEventListener("wheel",mn,{passive:!1}),this.update()}};function Ih(r,e=!1){let t=r[0].index!==null,n=new Set(Object.keys(r[0].attributes)),i=new Set(Object.keys(r[0].morphAttributes)),s={},a={},o=r[0].morphTargetsRelative,c=new Ut,h=0;for(let u=0;u<r.length;++u){let l=r[u],d=0;if(t!==(l.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let g in l.attributes){if(!n.has(g))return console.error("THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+g+'" attribute exists among all geometries, or in none of them.'),null;s[g]===void 0&&(s[g]=[]),s[g].push(l.attributes[g]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(o!==l.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let g in l.morphAttributes){if(!i.has(g))return console.error("THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;a[g]===void 0&&(a[g]=[]),a[g].push(l.morphAttributes[g])}if(e){let g;if(t)g=l.index.count;else if(l.attributes.position!==void 0)g=l.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;c.addGroup(h,g,u),h+=g}}if(t){let u=0,l=[];for(let d=0;d<r.length;++d){let g=r[d].index;for(let _=0;_<g.count;++_)l.push(g.getX(_)+u);u+=r[d].attributes.position.count}c.setIndex(l)}for(let u in s){let l=Rh(s[u]);if(!l)return console.error("THREE.BufferGeometryUtils: .mergeBufferGeometries() failed while trying to merge the "+u+" attribute."),null;c.setAttribute(u,l)}for(let u in a){let l=a[u][0].length;if(l===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[u]=[];for(let d=0;d<l;++d){let g=[];for(let m=0;m<a[u].length;++m)g.push(a[u][m][d]);let _=Rh(g);if(!_)return console.error("THREE.BufferGeometryUtils: .mergeBufferGeometries() failed while trying to merge the "+u+" morphAttribute."),null;c.morphAttributes[u].push(_)}}return c}function Rh(r){let e,t,n,i=0;for(let o=0;o<r.length;++o){let c=r[o];if(c.isInterleavedBufferAttribute)return console.error("THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. InterleavedBufferAttributes are not supported."),null;if(e===void 0&&(e=c.array.constructor),e!==c.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=c.itemSize),t!==c.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=c.normalized),n!==c.normalized)return console.error("THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;i+=c.array.length}let s=new e(i),a=0;for(let o=0;o<r.length;++o)s.set(r[o].array,a),a+=r[o].array.length;return new rn(s,t,n)}var Lo=class extends Ts{constructor(){super();let e=new Un;e.deleteAttribute("uv");let t=new pn({side:_n}),n=new pn,i=new Mo(16777215,5,28,2);i.position.set(.418,16.199,.3),this.add(i);let s=new Ve(e,t);s.position.set(-.757,13.219,.717),s.scale.set(31.713,28.305,28.591),this.add(s);let a=new Ve(e,n);a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),this.add(a);let o=new Ve(e,n);o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),this.add(o);let c=new Ve(e,n);c.position.set(6.167,.857,7.803),c.rotation.set(0,.561,0),c.scale.set(3.927,6.285,3.687),this.add(c);let h=new Ve(e,n);h.position.set(-2.017,.018,6.124),h.rotation.set(0,.333,0),h.scale.set(2.002,4.566,2.064),this.add(h);let u=new Ve(e,n);u.position.set(2.291,-.756,-2.621),u.rotation.set(0,-.286,0),u.scale.set(1.546,1.552,1.496),this.add(u);let l=new Ve(e,n);l.position.set(-2.193,-.369,-5.547),l.rotation.set(0,.516,0),l.scale.set(3.875,3.487,2.986),this.add(l);let d=new Ve(e,Is(50));d.position.set(-16.116,14.37,8.208),d.scale.set(.1,2.428,2.739),this.add(d);let g=new Ve(e,Is(50));g.position.set(-16.109,18.021,-8.207),g.scale.set(.1,2.425,2.751),this.add(g);let _=new Ve(e,Is(17));_.position.set(14.904,12.198,-1.832),_.scale.set(.15,4.265,6.331),this.add(_);let m=new Ve(e,Is(43));m.position.set(-.462,8.89,14.52),m.scale.set(4.38,5.441,.088),this.add(m);let f=new Ve(e,Is(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);let b=new Ve(e,Is(100));b.position.set(0,20,0),b.scale.set(1,.1,1),this.add(b)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function Is(r){let e=new kt;return e.color.setScalar(r),e}var Ui=[{key:"\u041D\u0435\u043F\u0440\u043E\u0432\u0430\u0440 (SW)",short:"\u041D\u0435\u043F\u0440\u043E\u0432\u0430\u0440",color:"#D3922A",mode:"lackfuse",what:"\u0448\u043F\u0438\u043B\u044C\u043A\u0438 \u043D\u0435\u0442, \u0447\u0451\u0440\u043D\u044B\u0439 \u043D\u0430\u0433\u0430\u0440 \u0441 \u0431\u0440\u044B\u0437\u0433\u0430\u043C\u0438"},{key:"\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442",short:"\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442",color:"#CF4339",mode:"missing",what:"\u043F\u0443\u0441\u0442\u043E\u0435 \u043C\u0435\u0441\u0442\u043E, \u043A\u043E\u043D\u0442\u0443\u0440 \u0448\u043F\u0438\u043B\u044C\u043A\u0438"},{key:"\u0421\u043B\u043E\u043C\u0430\u043D\u0430 \u043F\u043E \u0440\u0435\u0437\u044C\u0431\u0435",short:"\u0421\u043B\u043E\u043C\u0430\u043D\u0430 \u043F\u043E \u0440\u0435\u0437\u044C\u0431\u0435",color:"#7652C4",mode:"broken",what:"\u043E\u0431\u0440\u044B\u0432 \u043F\u043E \u0440\u0435\u0437\u044C\u0431\u0435, \u043A\u0443\u0441\u043E\u043A \u0440\u044F\u0434\u043E\u043C"},{key:"\u041F\u043E\u0433\u043D\u0443\u0442\u0430",short:"\u041F\u043E\u0433\u043D\u0443\u0442\u0430",color:"#0E9C82",mode:"bent",what:"\u0441\u0442\u0435\u0440\u0436\u0435\u043D\u044C \u0438\u0437\u043E\u0433\u043D\u0443\u0442"},{key:"\u0421\u043E\u0440\u0432\u0430\u043D\u0430 (\u0441\u0432\u0430\u0440\u043A\u0430 \u043E\u043A)",short:"\u0421\u043E\u0440\u0432\u0430\u043D\u0430",color:"#3570BF",mode:"torn",what:"\u0441\u043E\u0440\u0432\u0430\u043D\u0430, \u043F\u044F\u0442\u043D\u043E \u0441\u0432\u0430\u0440\u043A\u0438 \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C"},{key:"\u0421\u043C\u0435\u0449\u0435\u043D\u0438\u0435",short:"\u0421\u043C\u0435\u0449\u0435\u043D\u0438\u0435",color:"#C2458A",mode:"shift",what:"\u043F\u0440\u0438\u0432\u0430\u0440\u0435\u043D\u0430 \u043D\u0435 \u043D\u0430 \u0441\u0432\u043E\u0451\u043C \u043C\u0435\u0441\u0442\u0435"},{key:"\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E",short:"\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E",color:"#8A8F97",mode:"unknown",what:"\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F \u043D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u0430"}],ai=Object.fromEntries(Ui.map(r=>[r.key,r])),__oc=r=>ai[r]||ai["\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E"],se=r=>document.getElementById(r),de=(r,e,t)=>{let n=document.createElement(r);return e&&(n.className=e),t!==void 0&&(n.textContent=t),n},Ro=r=>r.slice(8,10)+"."+r.slice(5,7),Rn=r=>(r===0?"0":r<1?r.toLocaleString("ru-RU",{maximumSignificantDigits:2}):r.toLocaleString("ru-RU",{maximumFractionDigits:1}))+"%",Dh=r=>r.body_no||"?"+r.date,a0="http://www.w3.org/2000/svg",Qt=(r,e,t)=>{let n=document.createElementNS(a0,r);for(let i in e)n.setAttribute(i,e[i]);return t&&t.appendChild(n),n},bt=r=>String(r).replace(/\B(?=(\d{3})+(?!\d))/g,"\xA0"),Nh=matchMedia("(prefers-reduced-motion: reduce)").matches,An=matchMedia("(pointer: coarse)").matches||Math.min(screen.width,screen.height)<700;async function l0(){let r,e,t;try{[r,e,t]=await Promise.all(["views.json","defects.json","body.json"].map(p=>fetch(p).then(x=>x.json())))}catch{se("loading").textContent="\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 (views.json, defects.json). \u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 \u0447\u0435\u0440\u0435\u0437 \u0432\u0435\u0431-\u0441\u0435\u0440\u0432\u0435\u0440, \u043D\u0435 \u043A\u0430\u043A \u0444\u0430\u0439\u043B.";return}e.rows.forEach(p=>{p.category==="\u0421\u043A\u043B\u0435\u0439\u043A\u0430 (SW)"&&(p.category="\u041D\u0435\u043F\u0440\u043E\u0432\u0430\u0440 (SW)")});let n={...r,rows:e.rows,body:t.body,tex:t.tex,walls:t.walls||{},dims:t.dims,volume:e.volume||{},volumeAll:e.volumeAll||{},volumeModelTotal:e.volumeModelTotal||{},stationStuds:{}},i=e.stationStuds||{};new Set([...Object.keys(t.stations||{}),...Object.keys(i)]).forEach(p=>{n.stationStuds[p]={...(t.stations||{})[p],...i[p]}});let s=[...new Set(n.rows.map(p=>p.week).concat(Object.keys(n.volumeAll),Object.values(n.volume).flatMap(p=>Object.keys(p))))].sort(),__wy=new Set(s.map(k=>k.slice(0,4))).size,__wf=k=>{let q=/^(\d{4})-(W\d+)$/.exec(k);return q?q[2]+(__wy>1?"'"+q[1].slice(2):""):k},a=p=>{let x=(n.volume[l.model]||{})[p];return x>0?x:0},o="stud-map.drawOp",c="stud-map.zones",h=()=>{try{return localStorage.getItem(c)!=="0"}catch{return!0}},u=()=>{try{let p=parseFloat(localStorage.getItem(o));return p>=0&&p<=1?p:1}catch{return 1}},l={model:"A13T",view:null,week:"all",cats:new Set(Ui.map(p=>p.key)),ghost:!1,selected:null,mode:"body",drawOp:u(),trendMode:"n",trendScope:"model",zone:null,showZones:h(),trendHidden:new Set,catBase:"all"},d=n.rows.map(p=>p.date).sort();se("period")&&(se("period").textContent=Ro(d[0])+"\u2013"+Ro(d[d.length-1])+"."+d[0].slice(0,4));let g=p=>l.week==="all"||p.week===l.week,_=()=>n.rows.filter(p=>p.model===l.model),m=p=>n.views.filter(x=>x.model===p);function f(p){let x=new Set(p.studs.map(M=>M.no)),S=new Map;for(let M of n.rows)M.model!==p.model||M.stud_no==null||!x.has(M.stud_no)||!g(M)||!l.cats.has(M.category)||(S.has(M.stud_no)||S.set(M.stud_no,[]),S.get(M.stud_no).push(M));return S}let b=p=>{let x=0;return f(p).forEach(S=>S.forEach(M=>{x+=M.studs})),x},P=p=>{let x={},S=0;p.forEach(N=>{x[N.category]=(x[N.category]||0)+N.studs,S+=N.studs});let M=Object.keys(x).sort((N,D)=>x[D]-x[N])[0];return{n:S,byCat:x,top:M}},A=(p,x)=>p.img+"-"+(x?"2048":"1200")+".webp",v=null;try{if(v=new dl({antialias:!An&&(devicePixelRatio||1)<1.5,powerPreference:"high-performance"}),!v.getContext())throw new Error("no gl")}catch{v=null}let w=!!v;w||(l.mode="2d",se("mode3d").disabled=!0,se("mode3d").title="\u042D\u0442\u043E\u0442 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 3D (WebGL)");let O=se("scene"),U,y,L,z,Z,re=null,Y=100,V=66,j=0,oe=null,fe=new R,ie=!1,le=()=>{!ie&&w&&l.mode!=="2d"&&!j&&(j=requestAnimationFrame(ne))},ce=new R,ee=new R,J=0,ye=0,ge=0,ve=!1;function ne(p){j=0;let x=!1;if(!ve){try{x=lt(p)}catch(S){ie=!1,oe=null,ge++<3&&console.error("[3D] \u043E\u0448\u0438\u0431\u043A\u0430 \u043A\u0430\u0434\u0440\u0430",S),x=!1}finally{ie=!1}x&&le()}}function lt(p){let x=!1;if(ye++,oe)try{oe(p),x=!0}catch(k){throw oe=null,k}ie=!0;let S=L.update();if(ie=!1,S){let k=y.position.distanceTo(L.target)*2*Math.tan(hl.degToRad(y.fov)/2)/Math.max(1,v.domElement.clientHeight);Math.max(y.position.distanceTo(ce),L.target.distanceTo(ee))>k*.25?(J=0,x=!0):++J<3&&(x=!0)}ce.copy(y.position),ee.copy(L.target),x||Xe(),pt(p,x);let M=l.mode==="body"?34:58,N=l.drawOp<.5,D=[];for(let k of Z.children)if(k.userData.label){let B=k.userData,X=N||!B.nrm||fe.copy(y.position).sub(B.base).dot(B.nrm)>0;k.visible=B.no===l.selected||X&&(B.n>=2||window.__smRec||y.position.distanceTo(k.position)<M),k.visible&&D.push(k)}if(D.length>1){let k=y.projectionMatrix.elements,B=v.domElement.clientWidth,X=v.domElement.clientHeight,ae=.05*k[0]*B/2+3,Me=.0219*k[5]*X/2+2,xe=[];D.sort((he,Se)=>(Se.userData.no===l.selected)-(he.userData.no===l.selected)||Se.userData.n-he.userData.n);for(let he of D){fe.copy(he.position).project(y);let Se=fe.x*B/2,Fe=fe.y*X/2;if(he.userData.no!==l.selected&&xe.some(([Qe,qe])=>Math.abs(Qe-Se)<ae&&Math.abs(qe-Fe)<Me)){he.visible=!1;continue}xe.push([Se,Fe])}}return v.render(U,y),Gt(),x}let Re=0,Ge=0,Ee=0;function pt(p,x){if(!x){Ge=0,Ee=0;return}Ge&&(Ee=p-Ge>30?Ee+1:Math.max(0,Ee-2),Ee>24&&Re>1&&(Re=Math.max(1,Re-.25),v.setPixelRatio(Re),v.setSize(O.clientWidth,O.clientHeight,!1),Ee=0)),Ge=p}let je=0;function Xe(){An||!Je.length||je||(je=setTimeout(()=>{je=0,j||rt()},250))}let st={};if(w){Re=Math.min(devicePixelRatio||1,An?1.5:2),v.setPixelRatio(Re),v.outputEncoding=vt,v.shadowMap.enabled=!An,v.shadowMap.type=To,v.shadowMap.autoUpdate=!1,O.appendChild(v.domElement);let p=0;v.domElement.addEventListener("webglcontextlost",S=>{S.preventDefault(),ve=!0,j&&cancelAnimationFrame(j),j=0,oe=null,se("loading").hidden=!1,se("loading").textContent="\u0412\u0438\u0434\u0435\u043E\u043A\u0430\u0440\u0442\u0430 \u0441\u0431\u0440\u043E\u0441\u0438\u043B\u0430 3D \u2014 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u044E\u2026",clearTimeout(p),p=setTimeout(()=>{ve&&(se("loading").textContent="3D \u043D\u0435 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u043B\u043E\u0441\u044C \u2014 \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 (F5). \u0420\u0435\u0436\u0438\u043C \xAB2D\xBB \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0431\u0435\u0437 \u0432\u0438\u0434\u0435\u043E\u043A\u0430\u0440\u0442\u044B.")},5e3)}),v.domElement.addEventListener("webglcontextrestored",()=>{ve=!1,clearTimeout(p),se("loading").hidden=!0,K(),le()}),U=new Ts,U.background=new ft(window.__smBg||"#EFEBE4"),window.__smScene=U,window.__smRender=()=>le(),window.__smRedraw=()=>qi(!1),y=new sn(34,1,.5,2e3),L=new Po(y,v.domElement),L.enableDamping=!Nh,L.dampingFactor=.14,L.maxPolarAngle=Math.PI*.47,L.minDistance=6,L.maxDistance=260,L.screenSpacePanning=!0,L.addEventListener("change",le),U.add(new vo(16777215,14275270,.85)),z=new wo(16777215,.75),z.position.set(-40,90,45),z.castShadow=!An,z.shadow.mapSize.set(1024,1024),z.shadow.bias=-5e-4,U.add(z),Z=new dn,U.add(Z);let x=null;try{let S=new Ss(v);x=S.fromScene(new Lo,.04).texture,S.dispose()}catch{x=null}Object.assign(st,{copper:new pn({color:13924366,metalness:.9,roughness:.3,envMap:x,envMapIntensity:.75}),steel:new pn({color:12896720,metalness:.92,roughness:.24,envMap:x,envMapIntensity:1}),burn:new pn({color:3812906,metalness:.2,roughness:.9}),soot:new kt({color:723465}),weld:new pn({color:14343650,metalness:.95,roughness:.18}),hole:new kt({color:1842204}),miss:new kt({color:ai.\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442.color,wireframe:!0,transparent:!0,opacity:.55}),ghostCopper:new pn({color:13924366,metalness:.85,roughness:.32,envMap:x,envMapIntensity:1,transparent:!0,opacity:.78}),ghostSteel:new pn({color:12896720,metalness:.85,roughness:.32,envMap:x,envMapIntensity:.9,transparent:!0,opacity:.6}),ring:new kt({transparent:!0,opacity:.85,depthWrite:!1}),halo:new kt({transparent:!0,opacity:.16,depthWrite:!1}),sel:new kt({color:2906762,transparent:!0,opacity:.95,depthWrite:!1})})}let Ft={coarse:{h:2.4,r:.26,thread:.22,tube:.07,base:"collar"},coarselong:{h:3,r:.22,thread:.22,tube:.06,base:"collar"},fine:{h:2.1,r:.25,thread:.12,tube:.04,base:"none"},short:{h:1.2,r:.3,thread:.18,tube:.06,base:"collar"},hexbolt:{h:1.6,r:.24,thread:.14,tube:.045,base:"hex"},flangebolt:{h:2.4,r:.24,thread:.14,tube:.045,base:"flange"},pin:{h:2,r:.26,thread:0,base:"flange"},pinshort:{h:1.3,r:.3,thread:0,base:"flange"},pintall:{h:2.8,r:.24,thread:0,base:"flange"},pinstep:{h:2.6,r:.24,thread:0,base:"flange",step:!0}};function Mt(p,x,S,M){let N=new dn,D=new Ve(new vn(p.r,p.r,S,M?10:16),st[x]);if(D.position.y=S/2,N.add(D),p.step&&!M){let k=new Ve(new vn(p.r*.72,p.r*.72,S*.35,16),st[x]);k.position.y=S*.82,N.add(k),D.scale.y=.65,D.position.y=S*.325}if(p.thread&&!M)for(let k=p.thread;k<S-.05;k+=p.thread){let B=new Ve(new Ps(p.r+p.tube*.2,p.tube,5,16),st[x]);B.rotation.x=Math.PI/2,B.position.y=k,N.add(B)}return N}function Vt(p,x){let S=new dn;if(p.base==="collar"){let M=new Ve(new vn(p.r*1.55,p.r*1.75,.16,18),st[x]);M.position.y=.08,S.add(M)}if(p.base==="hex"){let M=new Ve(new vn(p.r*2.3,p.r*2.3,.38,6),st[x]);M.position.y=.19,S.add(M)}if(p.base==="flange"){let M=new Ve(new vn(p.r*2.2,p.r*2.3,.18,20),st[x]);M.position.y=.09,S.add(M)}return S}function Dt(p,x){let S=n.parts[p]||{kind:"coarse",metal:"copper"},M=Ft[S.kind]||Ft.coarse,N="copper",D=new dn,k=M.base==="hex"?.38:M.base==="none"?0:.16;if(x==="ghost"){let X="ghostCopper";D.add(Vt(M,X));let ae=Mt(M,X,M.h*.75,!0);return ae.position.y=k,D.add(ae),D.scale.setScalar(.7),D}if(x==="missing"){D.add(Vt(M,"miss"));let X=Mt(M,"miss",M.h,!0);X.position.y=k,D.add(X);let ae=new Ve(new lr(M.r*1.1,16),st.hole);return ae.rotation.x=-Math.PI/2,ae.position.y=.02,D.add(ae),D}if(x==="torn"){let X=new Ve(new vn(M.r*1.9,M.r*2.1,.08,20),st.weld);X.position.y=.04,D.add(X);let ae=new Ve(new vn(M.r*.9,M.r,.22,7),st[N]);return ae.position.y=.15,D.add(ae),D}if(x==="lackfuse"){let X=M.r*.55+.07,ae=new Ve(new vn(M.r*2.6,M.r*2.9,.035,28),st.soot);ae.position.y=.09,D.add(ae);let Me=new Ve(new Ps(M.r*1.55,M.r*.32,8,22),st.soot);Me.rotation.x=Math.PI/2,Me.position.y=.13,D.add(Me);for(let xe=0;xe<6;xe++){let he=xe*1.05+.3,Se=M.r*(2+xe%3*.35),Fe=new Ve(new xo(M.r*.22,0),st.soot);Fe.position.set(Math.cos(he)*Se,.11,Math.sin(he)*Se),D.add(Fe)}return D}if(D.add(Vt(M,N)),x==="broken"){let X=M.h*.42,ae=Mt(M,N,X);ae.position.y=k,D.add(ae);let Me=new Ve(new go(M.r*1.02,M.r*1.1,7,1,!0),st[N]);Me.position.y=k+X+M.r*.3,Me.rotation.y=.6,Me.scale.y=.6,D.add(Me);let xe=Mt(M,N,M.h*.5);return xe.rotation.z=Math.PI/2,xe.position.set(M.h*.75,M.r,.45),D.add(xe),D}if(x==="bent"){let X=Mt(M,N,M.h*.45);X.position.y=k,D.add(X);let ae=Mt(M,N,M.h*.55);return ae.position.y=k+M.h*.45,ae.rotation.z=-.75,D.add(ae),D}let B=Mt(M,N,M.h);return B.position.y=k,D.add(B),D}let mt=new Map;function mn(p,x){let S=p+"|"+x;if(mt.has(S))return mt.get(S);let M=Dt(p,x);M.updateMatrixWorld(!0);let N=new Map;M.traverse(k=>{if(!k.isMesh)return;let B=Object.keys(st).find(ae=>st[ae]===k.material),X=k.geometry.clone();X.applyMatrix4(k.matrixWorld),X.index&&(X=X.toNonIndexed()),["uv","uv2"].forEach(ae=>X.deleteAttribute(ae)),N.has(B)||N.set(B,[]),N.get(B).push(X),k.geometry.dispose()});let D=[...N].map(([k,B])=>({mk:k,geo:Ih(B)}));return en(N),mt.set(S,D),D}function en(p){p.forEach(x=>x.forEach(S=>S.dispose()))}let I=new Map;function T(p,x,S){let M=p+"|"+x+"|"+S,N=I.get(M);if(!N){let k=document.createElement("canvas");k.width=256,k.height=112;let B=k.getContext("2d");B.fillStyle="rgba(255,255,255,0.95)",B.strokeStyle=S,B.lineWidth=6;let X=26;B.beginPath(),B.moveTo(X,4),B.arcTo(252,4,252,108,X),B.arcTo(252,108,4,108,X),B.arcTo(4,108,4,4,X),B.arcTo(4,4,252,4,X),B.closePath(),B.fill(),B.stroke(),B.fillStyle="#22262B",B.font='600 50px "IBM Plex Mono", monospace',B.textBaseline="middle",x===""?(B.textAlign="center",B.fillText(String(p),128,58)):(B.fillText(String(p),22,58),B.fillStyle=S,B.beginPath(),B.arc(206,56,34,0,Math.PI*2),B.fill(),B.fillStyle="#fff",B.font='800 40px "Manrope", sans-serif',B.textAlign="center",B.fillText(String(x),206,58));let ae=new ar(k);ae.encoding=vt,N=new As({map:ae,depthTest:!1,sizeAttenuation:!1}),I.set(M,N)}let D=new sr(N);return D.scale.set(.05,.0219,1),D.renderOrder=10,D}let Q=w?new cr(.86,1,36):null,me=w?new lr(1,36):null,pe=w?new Ve(new cr(.92,1,48),st.sel):null;pe&&(pe.visible=!1);let Te=new R(0,1,0),We=new R(0,0,1),E=10,G=.32,we=[],Pe=p=>new R((p[0]-.5)*Y,.31,(p[1]-.5)*V);function Ae(){Z.children.slice().forEach(p=>{Z.remove(p),p.isInstancedMesh&&p.dispose()})}function Oe(){if(l.mode==="body")return Oo(l.model).map(S=>({s:{no:S.no,part:S.part,pts:S.pts,near:S.near},places:S.pts.map(M=>({pos:new R(M[0]*E,M[1]*E,M[2]*E),nrm:new R(M[3],M[4],M[5]).normalize()}))}));let p=l.view;return p?p.studs.map(x=>({s:x,places:x.pts.map(S=>({pos:Pe(S),nrm:Te.clone()}))})):[]}function Ne(){let p=new Map;for(let x of n.rows)x.model!==l.model||x.stud_no==null||!g(x)||!l.cats.has(x.category)||(p.has(x.stud_no)||p.set(x.stud_no,[]),p.get(x.stud_no).push(x));return p}function tt(){we=[];let p=l.mode==="body",x=Oe();if(!x.length&&!p)return;let S=p?Ne():f(l.view),M=p?G:1,N=new Map,D=[],k=[];if(x.forEach(({s:xe,places:he})=>{let Se=window.__smRec?P([]):P(S.get(xe.no)||[]);if(!Se.n&&!l.ghost&&!window.__smRec)return;let Fe=ai[Se.top]||ai["\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E"];he.forEach(({pos:Qe,nrm:qe})=>{let at=Qe.clone().addScaledVector(qe,1.4*M);we.push({s:xe,n:Se.n,byCat:Se.byCat,pos:Qe,nrm:qe,pick:at});let _t=Se.n?Fe.mode:window.__smRec?"ok":"ghost",zt=xe.part+"|"+_t;N.has(zt)||N.set(zt,[]),N.get(zt).push({pos:Qe,nrm:qe}),window.__smRec?k.push({pos:Qe,nrm:qe,s:xe,n:"",color:"#2C5A8A"}):Se.n&&(D.push({pos:Qe,nrm:qe,n:Se.n,color:Fe.color}),k.push({pos:Qe,nrm:qe,s:xe,n:Se.n,color:Fe.color}))})}),!w)return;Ae();let B=new At,X=new Tn,ae=new R(M,M,M);if(N.forEach((xe,he)=>{let[Se,Fe]=he.split("|");mn(Se,Fe).forEach(({mk:Qe,geo:qe})=>{let at=new Es(qe,st[Qe],xe.length);xe.forEach(({pos:_t,nrm:zt},Ht)=>{X.setFromUnitVectors(Te,zt),B.compose(_t,X,ae),at.setMatrixAt(Ht,B)}),at.frustumCulled=!1,at.castShadow=!An&&l.mode==="3d"&&!Qe.startsWith("ghost")&&Qe!=="miss",Z.add(at)})}),D.length){let xe=new Es(Q,st.ring,D.length),he=new Es(me,st.halo,D.length),Se=new ft;D.forEach((Fe,Qe)=>{let qe=(p?.78+Math.min(Fe.n,6)*.06:1.05+Math.min(Fe.n,6)*.22)*M;X.setFromUnitVectors(We,Fe.nrm);let at=Fe.pos.clone().addScaledVector(Fe.nrm,.03);B.compose(at,X,new R(qe,qe,1)),xe.setMatrixAt(Qe,B);let _t=Fe.pos.clone().addScaledVector(Fe.nrm,.02);B.compose(_t,X,new R(qe,qe,1)),he.setMatrixAt(Qe,B),Se.set(Fe.color),xe.setColorAt(Qe,Se),he.setColorAt(Qe,Se)}),xe.frustumCulled=!1,he.frustumCulled=!1,Z.add(he,xe)}k.forEach(xe=>{let he=T(xe.s.no,xe.n,xe.color),Se=p?xe.nrm.clone().multiplyScalar(1.7).add(new R(0,.4,0)):new R(0,4.3,0);he.position.copy(xe.pos).add(Se),he.userData={n:xe.n,no:xe.s.no,label:!0,base:xe.pos.clone(),nrm:xe.nrm.clone()},Z.add(he)});let Me=we.find(xe=>xe.s.no===l.selected&&(xe.n||window.__smRec));if(Me){let xe=(p?1.25:2.75)*M;X.setFromUnitVectors(We,Me.nrm),pe.quaternion.copy(X),pe.scale.set(xe,xe,1),pe.position.copy(Me.pos).addScaledVector(Me.nrm,.06),pe.visible=!0,Z.add(pe)}else pe.visible=!1;K(),ut(),Be(),le()}let nt={"ENGINE COMP":{at:[1.78,1.16,0],boxes:[[1.3,.42,-.56,2.15,1,.56]]},"FRONT FLOOR":{at:[.45,.62,0],boxes:[[-.4,.22,-.86,1.3,.5,.86]]},"REAR FLOOR":{at:[-1.45,.62,0],boxes:[[-2.25,.18,-.86,-.4,.46,.86]]},"WHEEL HOUSE":{at:[-1.3,1.08,0],boxes:[[-1.8,.28,.52,-.8,.84,.88],[-1.8,.28,-.88,-.8,.84,-.52]]},"FR WHEEL HOUSE":{at:[1.4,.98,.8],boxes:[[.95,.28,.52,1.95,.84,.88],[.95,.28,-.88,1.95,.84,-.52]]},"BODY SIDE":{at:[-.1,1.14,-.86],boxes:[[-2,.34,-.92,1.3,1.3,-.8]]}},xt={"ENGINE COMP":"EC","FRONT FLOOR":"FF","REAR FLOOR":"RF","WHEEL HOUSE":"WH","FR WHEEL HOUSE":"FWH","BODY SIDE":"BS"},F=de("div","zones");F.hidden=!0,se("stage").insertBefore(F,se("flat"));let $=[],ue=null,Ce=w?new kt({color:13583161,transparent:!0,opacity:.13,depthWrite:!1,side:yn}):null;function ze(){let p=new Map;for(let x of n.rows)x.model!==l.model||x.stud_no!=null||!g(x)||!l.cats.has(x.category)||(p.has(x.location)||p.set(x.location,[]),p.get(x.location).push(x));return p}function ut(){if(F.replaceChildren(),$=[],ue&&(U.remove(ue),ue.traverse(x=>{x.geometry&&x.geometry.dispose()}),ue=null),!w||l.mode!=="body"||!l.showZones||window.__smRec){F.hidden=!0;return}F.hidden=!1;let p=ze();l.zone&&!p.has(l.zone)&&(l.zone=null),p.forEach((x,S)=>{let M=nt[S];if(!M)return;let N=x.reduce((B,X)=>B+X.studs,0),D=de("button","zbadge");D.type="button",D.setAttribute("aria-pressed",String(l.zone===S));let k=de("span","zd");Ui.forEach(B=>{if(x.some(X=>X.category===B.key)){let X=de("span","dot");X.style.background=B.color,k.appendChild(X)}}),D.append(k,de("b","",bt(N)),de("span","zl","\u0431\u0435\u0437 \u2116 \xB7 "+S),de("span","zs",xt[S]||S)),D.title=S+": "+N+" \u0434\u0435\u0444\u0435\u043A\u0442\u043D\u044B\u0445 \u0448\u043F\u0438\u043B\u0435\u043A \u0431\u0435\u0437 \u043D\u043E\u043C\u0435\u0440\u0430 \u2014 \u0442\u043E\u0447\u043D\u043E\u0435 \u043C\u0435\u0441\u0442\u043E \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E. \u041D\u0430\u0436\u043C\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u0441\u043F\u0438\u0441\u043E\u043A.",D.onclick=()=>{l.zone=l.zone===S?null:S,l.selected=null,ut(),zs(),Fs(),l.zone&&Xn(S),le()},F.appendChild(D),$.push({b:D,pos:new R(M.at[0]*E,M.at[1]*E,M.at[2]*E)})}),$.forEach(x=>{x.bw=x.b.offsetWidth,x.bh=x.b.offsetHeight}),l.zone&&nt[l.zone]&&(ue=new dn,nt[l.zone].boxes.forEach(([x,S,M,N,D,k])=>{let B=new Ve(new Un((N-x)*E,(D-S)*E,(k-M)*E),Ce);B.position.set((x+N)/2*E,(S+D)/2*E,(M+k)/2*E),B.renderOrder=3,ue.add(B)}),U.add(ue)),Gt()}let Et=new R;function Gt(){if(F.hidden||!$.length)return;let p=O.clientWidth,x=O.clientHeight,S=[];$.map(({b:M,pos:N,bw:D,bh:k})=>{Et.copy(N).project(y);let B=Et.z<1&&Math.abs(Et.x)<1.05&&Math.abs(Et.y)<1.05;return M.hidden===B&&(M.hidden=!B),B?{b:M,x:(Et.x+1)/2*p,y:(1-Et.y)/2*x,bw:D,bh:k}:null}).filter(Boolean).sort((M,N)=>M.y-N.y).forEach(M=>{let N=M.y;for(let D=0;D<=S.length;D++){let k=!1;for(let B of S){let X=(B.bh+M.bh)/2+3;Math.abs(B.x-M.x)<(B.bw+M.bw)/2+4&&Math.abs(B.y-N)<X-.5&&(N=B.y+X,k=!0)}if(!k)break}S.push({x:M.x,y:N,bw:M.bw,bh:M.bh}),M.b.style.transform=`translate(${M.x.toFixed(1)}px, ${N.toFixed(1)}px) translate(-50%, -50%)`})}function Xn(p){let x=nt[p];if(!x)return;let S=new R(x.at[0]*E,x.at[1]*E*.75,x.at[2]*E);bn(S.clone().add(new R(26,22,x.at[2]<0?-34:34)),S)}let Tt=new _o,Nt=new Map,on=An?8:16,pr=typeof createImageBitmap=="function"&&!/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)?new So().setOptions({imageOrientation:"flipY",premultiplyAlpha:"none"}):null;function mr(p,x,S){if(!pr)return Tt.load(p,x,void 0,S);pr.load(p,M=>{let N=new fn(M);N.flipY=!1,N.needsUpdate=!0,x(N)},void 0,S)}function Do(p,x){if(Nt.has(p))return x(Nt.get(p));mr(p,S=>{S.encoding=vt,S.anisotropy=Math.min(4,v.capabilities.getMaxAnisotropy()),Ze(()=>{v.initTexture(S),Nt.set(p,S),x(S),C(S)})},()=>{})}function C(p){if(Nt.size<=on)return;let x=W();for(let[S,M]of Nt){if(Nt.size<=on)break;M===p||x.has(M)||(Nt.delete(S),M.dispose(),M.image&&M.image.close&&M.image.close())}}function W(){let p=new Set;return[He,re].forEach(x=>x&&x.traverse(S=>{S.material&&S.material.map&&p.add(S.material.map)})),p}let K=()=>{w&&v.shadowMap.enabled&&l.mode==="3d"&&(v.shadowMap.needsUpdate=!0)};function H(p,x){if(Nt.has(p)){let S=Nt.get(p);return Nt.delete(p),Nt.set(p,S),x(S)}mr(p,S=>{S.encoding=vt,S.anisotropy=Math.min(4,v.capabilities.getMaxAnisotropy()),v.initTexture(S),Nt.set(p,S),C(S),x(S),Be()},()=>{se("loading").hidden=!1,se("loading").textContent="\u041A\u0430\u0440\u0442\u0438\u043D\u043A\u0430 \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u043B\u0430\u0441\u044C: "+p})}let te=0;function Be(){!w||te||(te=setTimeout(()=>{te=0,Ze(()=>{try{v.compile(U,y)}catch{}})},150))}function Ze(p){!j&&!oe?p():setTimeout(()=>Ze(p),160)}let Je=[];function rt(){if(An||!Je.length)return;let p=y.position.distanceTo(L.target);for(let x=Je.length-1;x>=0;x--){let S=Je[x];if(!S.mesh.parent){Je.splice(x,1);continue}p<S.dist&&(Je.splice(x,1),Do(S.hiUrl,M=>{let N=S.mesh.material;N&&(N.map=M,N.emissiveMap&&(N.emissiveMap=M),N.bumpMap&&(N.bumpMap=M),le())}))}}function dt(p){w&&(se("loading").hidden=!1,se("loading").textContent="\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u0441\u0445\u0435\u043C\u0443\u2026",H(A(p),x=>{if(l.mode!=="3d")return;se("loading").hidden=!0,re&&(U.remove(re),re.traverse(D=>{D.geometry&&D.geometry.dispose(),D.material&&D.material.dispose()})),Y=100,V=100*p.h/p.w,re=new dn;let S=new Ve(new oi(Y,V),new pn({map:x,roughness:.92,metalness:0}));S.rotation.x=-Math.PI/2,S.position.y=.31,S.receiveShadow=!An,S.userData.drawing=!0,re.add(S),Je.push({mesh:S,hiUrl:A(p,!0),dist:vi(Y,V)*.8});let M=new Ve(new Un(Y,.6,V),new pn({color:14472650,roughness:1}));M.position.y=-.02,M.userData.drawing=!0,re.add(M),U.add(re),Os();let N=z.shadow.camera;N.left=-Y*.6,N.right=Y*.6,N.top=V*.7,N.bottom=-V*.7,N.near=1,N.far=300,N.updateProjectionMatrix(),K(),tt(),bi("tilt",!0)}))}let it=null,He=null,Pt=null,tn=(p,x)=>{for(let S=1;S<p.length;S++)if(x<=p[S][0]){let[M,N]=p[S-1],[D,k]=p[S];return N+(k-N)*(x-M)/(D-M)}return p[p.length-1][1]},In=[[-2.3,1],[-2.05,1.06],[-1.6,1.12],[-1.22,1.45],[-.4,1.55],[.55,1.52],[1.25,1],[1.6,.95],[2.3,.78]],qn=[[-2.3,.74],[-2,.87],[-1.5,.89],[1.6,.89],[2.05,.84],[2.3,.7]];function Ot(p){let x=tn(qn,p),S=tn(In,p),M=.2,N=Math.min(.98,S-.02),D=N+(S-N)*.7;return[[x,M],[x,N],[x*.9,D],[x*.72,S],[-x*.72,S],[-x*.9,D],[-x,N],[-x,M]]}function ht(){let p=new dn;p.scale.setScalar(E);let x=46,S=8,M=[],N=[],D=[];for(let Ke=0;Ke<=x;Ke++)D.push(-2.3+4.6*Ke/x);D.forEach(Ke=>Ot(Ke).forEach(([Ye,yt])=>M.push(Ke,yt,Ye)));for(let Ke=0;Ke<x;Ke++)for(let Ye=0;Ye<S-1;Ye++){let yt=Ke*S+Ye,wt=yt+S;N.push(yt,wt,yt+1,wt,wt+1,yt+1)}let k=new Ut;k.setAttribute("position",new gt(M,3)),k.setIndex(N),k.computeVertexNormals(),p.add(new Ve(k,new kt({color:10466503,transparent:!0,opacity:.12,side:yn,depthWrite:!1})));let B=[],X=(Ke,Ye)=>B.push(Ke[0],Ke[1],Ke[2],Ye[0],Ye[1],Ye[2]);[0,1,3,4,6,7].forEach(Ke=>{for(let Ye=0;Ye<x;Ye++)X(M.slice((Ye*S+Ke)*3,(Ye*S+Ke)*3+3),M.slice(((Ye+1)*S+Ke)*3,((Ye+1)*S+Ke)*3+3))}),[-2.3,-1.22,-.1,.55,1.25,2.3].forEach(Ke=>{let Ye=Ot(Ke);for(let yt=0;yt<S-1;yt++)X([Ke,Ye[yt][1],Ye[yt][0]],[Ke,Ye[yt+1][1],Ye[yt+1][0]])});let ae=new Ut;ae.setAttribute("position",new gt(B,3)),p.add(new or(ae,new Cs({color:7241100,transparent:!0,opacity:.6})));let Me=new Ve(new oi(1.5,.72),new kt({color:14275527,transparent:!0,opacity:.45,side:yn,depthWrite:!1}));Me.rotation.y=Math.PI/2,Me.position.set(n.dims.dashX,.66,0),p.add(Me);let xe=new kt({color:3817285,transparent:!0,opacity:.16,depthWrite:!1}),he=new pn({color:6121072,roughness:.7}),Se=new kt({color:13358044,transparent:!0,opacity:.35,side:yn,depthWrite:!1});[n.dims.frontAxle,n.dims.rearAxle].forEach(Ke=>[-1,1].forEach(Ye=>{let yt=new Ve(new vn(.34,.34,.22,28),xe);yt.rotation.x=Math.PI/2,yt.position.set(Ke,.34,Ye*.8),p.add(yt);let wt=new Ve(new Ps(.42,.018,6,32,Math.PI),he);wt.position.set(Ke,.34,Ye*.895),p.add(wt);let _e=new vn(.47,.47,.28,28,1,!0,0,Math.PI);_e.rotateZ(Math.PI/2),_e.rotateY(Math.PI/2);let et=new Ve(_e,Se);et.position.set(Ke,.32,Ye*(.875-.16)),p.add(et)}));let Fe=n.dims,Qe=Fe.dashX,qe=2.15,at=new kt({color:12174543,transparent:!0,opacity:.4,side:yn,depthWrite:!1}),_t=new kt({color:9214374,transparent:!0,opacity:.55,depthWrite:!1});[-1,1].forEach(Ke=>{let Ye=new Ve(new oi(qe-Qe,.55),at);Ye.position.set((Qe+qe)/2,.72,Ke*.565),p.add(Ye);let yt=new Ve(new Un(qe-Qe+.05,.1,.08),_t);yt.position.set((Qe+qe)/2,.46,Ke*.45),p.add(yt)});let zt=[];[[Qe,.44],[qe,.44],[qe,1],[Qe,1]].forEach((Ke,Ye,yt)=>{let wt=yt[(Ye+1)%4];[-.565,.565].forEach(_e=>zt.push(Ke[0],Ke[1],_e,wt[0],wt[1],_e))});let Ht=new Ut;Ht.setAttribute("position",new gt(zt,3)),p.add(new or(Ht,new Cs({color:7241100,transparent:!0,opacity:.75})));let En=(Ke,Ye,yt,wt)=>{let _e=document.createElement("canvas");_e.width=400,_e.height=96;let et=_e.getContext("2d");et.fillStyle="rgba(244,240,234,0.92)",et.fillRect(0,0,400,96),et.fillStyle="#5E6670",et.font='800 50px "Manrope", sans-serif',et.textAlign="center",et.textBaseline="middle",et.fillText(Ke,200,50);let Ct=new ar(_e);Ct.encoding=vt;let Jt=new sr(new As({map:Ct,depthTest:!1,sizeAttenuation:!1}));Jt.scale.set(.095/E,.0228/E,1),Jt.position.set(Ye,yt,wt),Jt.renderOrder=9,p.add(Jt)};return En("\u041F\u0415\u0420\u0401\u0414",2.75,.55,0),En("\u0417\u0410\u0414",-2.75,.55,0),En("\u041F\u0420\u0410\u0412. \u0411\u041E\u0420\u0422",.7,1.85,.95),En("\u041B\u0415\u0412. \u0411\u041E\u0420\u0422",-.7,1.85,-.95),En("\u041C\u041E\u0422. \u041E\u0422\u0421\u0415\u041A",1.85,1.3,0),p}let xi={A13T:{step:-.52,well:[-1.71,0,.33],tunnel:.13,bars:[[-.15,.1],[.35,.12]],detail:{tunnelX:[-.5,1.12],tunnelTop:[[-.5,.09],[0,.1],[.08,.13],[.72,.13],[.8,.1],[1.12,.1]],tunnelBase:[[-.5,.14],[0,.16],[.08,.19],[.72,.19],[.8,.15],[1.12,.15]],tunnelH:[[-.5,.07],[-.32,.1],[0,.12],[.75,.15],[1.12,.17]],bars:[[-.15,.1,.145,.06],[.35,.1,.145,.065]],pads:[[-.22,-.08,.14,.25,.082],[.28,.42,.14,.25,.088],[-.21,-.09,.56,.66,.075],[.29,.41,.56,.66,.08]],riser:[-.59,.1,.17,.075],blocks:[[-1.46,-1.17,.32,.62,.07]]}},A01:{step:-.47,well:[-1.75,0,.32],tunnel:.16,bars:[[.06,.1],[.52,.1]]},P01:{step:-.42,well:null,tunnel:.12,bars:[[-.1,.12],[.38,.12]]},CS55p:{step:-.45,well:[-1.55,0,.36],tunnel:.1,bars:[[.09,.12],[.58,.1]]}},$e=(p,x,S)=>{let M=Math.min(1,Math.max(0,(S-p)/(x-p)));return M*M*(3-2*M)},Dn=(p,x)=>{if(x<=p[0][0])return p[0][1];for(let S=1;S<p.length;S++)if(x<=p[S][0]){let[M,N]=p[S-1],[D,k]=p[S];return N+(k-N)*(x-M)/(D-M)}return p[p.length-1][1]},yi=(p,x,S,M)=>$e(x-M,x+M,p)*(1-$e(S-M,S+M,p));function _i(p,x,S){let M=p.detail,N=Math.abs(S),D=0,k=$e(M.tunnelX[0]-.03,M.tunnelX[0]+.05,x)*(1-$e(M.tunnelX[1]-.02,M.tunnelX[1]+.06,x));D=Math.max(D,k*Dn(M.tunnelH,x)*(1-$e(Dn(M.tunnelTop,x),Dn(M.tunnelBase,x),N)));let B=1-$e(.74,.78,N);if(M.bars.forEach(([ae,Me,xe,he])=>{D=Math.max(D,he*(1-$e(Me/2,xe/2,Math.abs(x-ae)))*B)}),M.pads.forEach(([ae,Me,xe,he,Se])=>{D=Math.max(D,Se*yi(x,ae,Me,.012)*yi(N,xe,he,.012))}),M.riser){let[ae,Me,xe,he]=M.riser;D=Math.max(D,he*(1-$e(Me/2,xe/2,Math.abs(x-ae)))*(1-$e(.76,.8,N)))}M.blocks.forEach(([ae,Me,xe,he,Se])=>{D=Math.max(D,Se*yi(x,ae,Me,.025)*yi(N,xe,he,.025))});let X=$e(.75,.8,N)*$e(-.95,-.8,x)*(1-$e(1,1.12,x));if(D=Math.max(D,.13*X),p.well){let ae=Math.hypot(x-p.well[0],S-p.well[1]);D-=.15*(1-$e(p.well[2]*.65,p.well[2]*1.05,ae))}return D+=$e(.97,1.3,x)*(.3-D),D+=.04*(1-$e(-2.2,-2.08,x)),D}function an(p,x,S){let M=xi[p]||xi.A13T,N=Math.abs(S);if(M.detail)return _i(M,x,S);let D=1-$e(M.step-.07,M.step+.07,x),k=0,B=$e(M.step+.02,M.step+.22,x);k+=B*(1-$e(M.tunnel,M.tunnel+.1,N))*(.12+.08*$e(M.step,1.1,x)),M.bars.forEach(([ae,Me])=>{k+=.045*(1-$e(Me/2,Me/2+.035,Math.abs(x-ae)))*$e(M.tunnel+.09,M.tunnel+.15,N)*(1-$e(.72,.77,N))*(1-D)});let X=$e(.75,.82,N)*$e(-.95,-.8,x)*(1-$e(1,1.12,x));if(k+=X*(.13-k),M.well){let ae=Math.hypot(x-M.well[0],S-M.well[1]);k-=.15*(1-$e(M.well[2]*.65,M.well[2]*1.05,ae))}return k+=$e(.97,1.3,x)*(.3-k),k+=.04*(1-$e(-2.2,-2.08,x)),k}function Kt(p,x,S,M){let D=an(p,x,S),k=(an(p,x+.008,S)-an(p,x-.008,S))/(2*.008),B=(an(p,x,S+.008)-an(p,x,S-.008))/(2*.008),X=new R(-k,1,-B).normalize();return M||X.negate(),{y:(M?n.dims.floorTop:n.dims.floorBot)+D,n:X}}function Yn(p,x,S){let M=n.dims,N=!!(xi[S]||{}).detail,D=An?N?210:150:N?380:300,k=An?N?100:70:N?180:140,B=new oi(p.x1-p.x0,M.W,D,k);B.rotateX(x?-Math.PI/2:Math.PI/2),B.translate((p.x0+p.x1)/2,x?M.floorTop:M.floorBot,0);let X=B.attributes.position;for(let Se=0;Se<X.count;Se++)X.setY(Se,X.getY(Se)+an(S,X.getX(Se),X.getZ(Se)));B.computeVertexNormals();let ae=B.attributes.normal,Me=new Float32Array(X.count*3),xe=.035,he=x?new R(-.35,.85,-.4).normalize():new R(.3,-.85,.42).normalize();for(let Se=0;Se<X.count;Se++){let Fe=X.getX(Se),Qe=X.getZ(Se),qe=an(S,Fe,Qe),at=(an(S,Fe+xe,Qe)+an(S,Fe-xe,Qe)+an(S,Fe,Qe+xe)+an(S,Fe,Qe-xe)-4*qe)/(xe*xe),_t=1-Math.min(.28,Math.max(0,x?at:-at)*.011),zt=.6+.4*Math.max(0,ae.getX(Se)*he.x+ae.getY(Se)*he.y+ae.getZ(Se)*he.z),Ht=Math.min(1,zt*_t*(x?1.04:1));Me[Se*3]=Ht,Me[Se*3+1]=Ht,Me[Se*3+2]=Ht}return B.setAttribute("color",new gt(Me,3)),B}let Vi="stud-map.paint",Zt={value:(()=>{try{return localStorage.getItem(Vi)==="color"?0:1}catch{return 1}})()};function Gi(p){return p.onBeforeCompile=x=>{x.uniforms.uMetal=Zt,x.fragmentShader=`uniform float uMetal;
`+x.fragmentShader.replace("#include <map_fragment>",`#include <map_fragment>
      if (uMetal > 0.5) {
        vec3 cs = pow(max(diffuseColor.rgb, vec3(0.0)), vec3(0.4545));
        {   // \u0432\u0441\u0451 \u0432 \u0441\u0435\u0440\u0435\u0431\u0440\u043E: \u0436\u0451\u043B\u0442\u044B\u0435/\u0446\u0432\u0435\u0442\u043D\u044B\u0435 \u043E\u0442\u043C\u0435\u0442\u043A\u0438 \u0441\u0445\u0435\u043C\u044B \u0443\u0431\u0440\u0430\u043D\u044B \u0438\u0437 \u043A\u0430\u0440\u0442\u0438\u043D\u043E\u043A (tools/floor_marks.py)
          float l = dot(cs, vec3(0.299, 0.587, 0.114));
          float lineV = 0.34 + 0.45 * l;                                 // \u043B\u0438\u043D\u0438\u0438 \u043A\u043E\u043D\u0442\u0443\u0440\u043E\u0432 \u2014 \u043C\u044F\u0433\u043A\u0438\u0439 \u0442\u0451\u043C\u043D\u043E-\u0441\u0435\u0440\u044B\u0439, \u043D\u0435 \u0447\u0451\u0440\u043D\u044B\u0439
          float panelV = mix(0.64, 0.91, smoothstep(0.25, 0.85, l));    // \u043F\u0430\u043D\u0435\u043B\u0438 \u2014 \u0441\u0432\u0435\u0442\u043B\u043E\u0435 \u043C\u0430\u0442\u043E\u0432\u043E\u0435 \u0441\u0435\u0440\u0435\u0431\u0440\u043E
          float sv = mix(lineV, panelV, smoothstep(0.14, 0.32, l));
          diffuseColor.rgb = pow(vec3(sv) * vec3(0.962, 0.976, 1.0), vec3(2.2));
        }
      }`)},p.customProgramCacheKey=()=>"metal2",p}let No=p=>Gi(new kt({map:p,vertexColors:!0,alphaTest:.5})),Hi=new Map,gr=.075;function Oh(p){let x=[];p.forEach((N,D)=>N.pts.forEach((k,B)=>x.push({bi:D,pi:B,no:N.no,p0:new R(k[0],k[1],k[2]),p:new R(k[0],k[1],k[2]),n:new R(k[3],k[4],k[5]).normalize()})));let S=[];for(let N=0;N<x.length;N++)for(let D=N+1;D<x.length;D++)x[N].n.dot(x[D].n)>.7&&x[N].p0.distanceTo(x[D].p0)<gr*3&&S.push([x[N],x[D]]);let M=new R;for(let N=0;N<60;N++){let D=!1;if(S.forEach(([k,B])=>{M.copy(B.p).sub(k.p),M.addScaledVector(k.n,-M.dot(k.n));let X=M.length();if(!(X>=gr-1e-4)){if(X<1e-4){let ae=(k.no*37+B.no*11)%360*Math.PI/180,Me=Math.abs(k.n.y)>.9?new R(Math.cos(ae),0,Math.sin(ae)):new R(0,Math.cos(ae),Math.sin(ae));M.copy(Me).addScaledVector(k.n,-Me.dot(k.n)),X=M.length()}M.multiplyScalar((gr-X)/2/X),k.p.sub(M),B.p.add(M),D=!0}}),!D)break}return x.forEach(N=>{let D=p[N.bi].pts[N.pi];if(p[N.bi].pts[N.pi]=[N.p.x,N.p.y,N.p.z,D[3],D[4],D[5]],N.p.distanceTo(N.p0)>.002){let k=S.filter(([B,X])=>(B===N||X===N)&&B.p0.distanceTo(X.p0)<gr).map(([B,X])=>B===N?X:B);p[N.bi].near=(p[N.bi].near||[]).concat(k.map(B=>({no:B.no,cm:Math.round(B.p0.distanceTo(N.p0)*1e3)/10})))}}),p}function Oo(p){if(Hi.has(p))return Hi.get(p);let x=n.dims,M=Oh((n.body[p]||[]).map(N=>({...N,pts:N.pts.map(D=>D.slice())}))).map(N=>({...N,pts:N.pts.map(D=>{let k=Math.abs(D[1]-x.floorTop)<.006&&D[4]>.9,B=Math.abs(D[1]-x.floorBot)<.006&&D[4]<-.9;if(!k&&!B)return D;let X=Kt(p,D[0],D[2],k);return[D[0],X.y,D[2],X.n.x,X.n.y,X.n.z]})}));return Hi.set(p,M),M}function gl(){if(!w)return;if(se("loading").hidden=!0,it||(it=ht(),U.add(it)),it.visible=!0,re&&(re.visible=!1),Pt!==l.model){He&&(U.remove(He),He.traverse(D=>{D.geometry&&D.geometry.dispose(),D.material&&D.material.dispose()})),He=new dn,He.scale.setScalar(E),Pt=l.model,U.add(He);let x=n.tex[l.model]||{},S=l.model,M=(D,k)=>H(D.img+"-1024.webp",B=>{if(Pt!==S)return;let X=new Ve(Yn(D,k,S),No(B));X.userData.drawing=!0,X.userData.alphaCut=.5,He.add(X),Os(),Je.push({mesh:X,hiUrl:D.img+".webp",dist:vi(56,30)*.8}),K(),le()});x.top&&M(x.top,!0),x.bottom&&M(x.bottom,!1);let N=He;(n.walls[l.model]||[]).forEach(D=>H(D.img+(An?"-512.webp":".webp"),k=>{if(N!==He)return;let B=new Ve(new oi(1,1),Gi(new kt({map:k,alphaTest:.5,polygonOffset:!0,polygonOffsetFactor:2,polygonOffsetUnits:4}))),X=new R(...D.u),ae=new R(...D.v),Me=new R().crossVectors(ae,X).normalize(),xe=new R(...D.p0).addScaledVector(X,.5).addScaledVector(ae,.5).addScaledVector(Me,-.015);B.matrix.makeBasis(X,ae.clone().negate(),Me).setPosition(xe),B.matrixAutoUpdate=!1,B.userData.drawing=!0,B.userData.alphaCut=.5,He.add(B),Os(),le()}))}He.visible=!0;let p=z.shadow.camera;p.left=-32,p.right=32,p.top=32,p.bottom=-32,p.near=1,p.far=300,p.updateProjectionMatrix(),tt()}function zh(){if(!w)return;let p=l.mode==="body";it&&(it.visible=p),He&&(He.visible=p),re&&(re.visible=l.mode==="3d"),p||ut(),L.maxPolarAngle=p?Math.PI-.02:Math.PI*.47,L.minDistance=p?3:6,L.maxDistance=p?160:260}function bn(p,x,S){if(!w)return;if(S||Nh){y.position.copy(p),L.target.copy(x),L.update(),le();return}let M=y.position.clone(),N=L.target.clone(),D=performance.now();oe=k=>{let B=Math.min(1,(k-D)/650),X=B<.5?2*B*B:1-Math.pow(-2*B+2,2)/2;y.position.lerpVectors(M,p,X),L.target.lerpVectors(N,x,X),B>=1&&(oe=null)},le()}function vi(p,x){let S=hl.degToRad(y.fov)/2,M=Math.atan(Math.tan(S)*y.aspect);return Math.max(p/2/Math.tan(M),x/2/Math.tan(S))*1.06}function bi(p,x){if(!w)return;if(l.mode==="body"){let M=new R(0,6,0),N=vi(56,30);return p==="top"?bn(new R(0,N*1.1,.01),new R(0,3,0),x):p==="bottom"?bn(new R(0,-N*1.1,.01),new R(0,3,0),x):bn(p==="side"?new R(0,7,N*1.05):new R(N*.62,N*.5,N*.72),M,x)}let S=vi(Y,V);p==="top"?bn(new R(0,S,.01),new R(0,0,0),x):bn(new R(0,S*.86,S*.52),new R(0,0,V*.05),x)}function Fh(p){if(!w||l.mode==="2d")return;let x=we.find(S=>S.s.no===p.no);if(x){if(l.mode==="body"){let S=x.nrm.clone().multiplyScalar(14).add(new R(6,6,6));return bn(x.pos.clone().add(S),x.pos.clone())}bn(new R(x.pos.x+6,30,x.pos.z+24),new R(x.pos.x,1,x.pos.z))}}function kh(){if(!w)return;l.mode!=="body"&&Xi("body");let p=new Set((n.walls[l.model]||[]).map(N=>N.kind)),x=new R(1.55*E,.7*E,0),S;p.has("dash_out")?S=new R(3.5*E,1.9*E,.9*E):p.has("bay_side")?S=new R(2.7*E,2*E,1.7*E):p.has("dash_in")?(S=new R(-.7*E,1.55*E,.45*E),x.set(1.3*E,.68*E,0)):S=new R(3.3*E,2.2*E,1.4*E),bn(S,x);let M=n.models.find(N=>N.id===l.model);vr(p.has("dash_out")||p.has("bay_side")||p.has("dash_in")?"\u041C\u043E\u0442\u043E\u0440\u043D\u044B\u0439 \u043E\u0442\u0441\u0435\u043A "+M.id+": "+[p.has("dash_out")&&"\u0449\u0438\u0442 \u0441\u043E \u0441\u0442\u043E\u0440\u043E\u043D\u044B \u043E\u0442\u0441\u0435\u043A\u0430",p.has("dash_in")&&"\u0449\u0438\u0442 \u0441\u043E \u0441\u0442\u043E\u0440\u043E\u043D\u044B \u0441\u0430\u043B\u043E\u043D\u0430",p.has("bay_side")&&"\u043B\u0435\u0432\u0430\u044F \u0441\u0442\u0435\u043D\u043A\u0430 \u043E\u0442\u0441\u0435\u043A\u0430"].filter(Boolean).join(", ")+"."+(p.has("dash_out")&&p.has("dash_in")?" \u0412\u0438\u0434 \u0438\u0437 \u0441\u0430\u043B\u043E\u043D\u0430 \u2014 \u043F\u043E\u0432\u0435\u0440\u043D\u0438\u0442\u0435 \u043A\u0430\u043C\u0435\u0440\u0443 \u043D\u0430\u0437\u0430\u0434.":""):"\u0423 "+M.id+" \u0432 Excel \u043D\u0435\u0442 \u0441\u0445\u0435\u043C\u044B \u043C\u043E\u0442\u043E\u0440\u043D\u043E\u0433\u043E \u043E\u0442\u0441\u0435\u043A\u0430 \u2014 \u043F\u043E\u043A\u0430\u0437\u0430\u043D\u0430 \u0437\u043E\u043D\u0430 \u0441\u0442\u0430\u043D\u0446\u0438\u0438 ENGINE COMP. \u0414\u0435\u0444\u0435\u043A\u0442\u044B \u043E\u0442\u0441\u0435\u043A\u0430 \u0431\u0435\u0437 \u043D\u043E\u043C\u0435\u0440\u0430 \u2014 \u043D\u0430 \u043F\u043B\u0430\u0448\u043A\u0435 \xAB\u0431\u0435\u0437 \u2116\xBB.")}let Bh=["FRONT FLOOR","REAR FLOOR","WHEEL HOUSE","FR WHEEL HOUSE","ENGINE COMP","BODY SIDE"],xr={"FRONT FLOOR":"\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u043F\u043E\u043B","REAR FLOOR":"\u0437\u0430\u0434\u043D\u0438\u0439 \u043F\u043E\u043B","WHEEL HOUSE":"\u0437\u0430\u0434\u043D\u0438\u0435 \u043A\u043E\u043B\u0451\u0441\u043D\u044B\u0435 \u0430\u0440\u043A\u0438","FR WHEEL HOUSE":"\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0435 \u043A\u043E\u043B\u0451\u0441\u043D\u044B\u0435 \u0430\u0440\u043A\u0438","ENGINE COMP":"\u043C\u043E\u0442\u043E\u0440\u043D\u044B\u0439 \u043E\u0442\u0441\u0435\u043A","BODY SIDE":"\u0431\u043E\u043A\u043E\u0432\u0438\u043D\u0430"},Wi=null,yr=0,Ds=p=>new R(p[0],p[1],p[2]),_r=p=>Ds(p.p0).addScaledVector(Ds(p.u),.5).addScaledVector(Ds(p.v),.5),Uh=(p,x)=>x.boxes.some(([S,M,N,D,k,B])=>p.x>S-.12&&p.x<D+.12&&p.y>M-.12&&p.y<k+.12&&p.z>N-.12&&p.z<B+.12);function zo(p){se("stBar").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.loc===p)))}function Vh(){let p=se("stBar");p.replaceChildren();let x={};n.rows.forEach(M=>{M.model===l.model&&g(M)&&l.cats.has(M.category)&&(x[M.location]=(x[M.location]||0)+M.studs)});let S=new Set([...Object.keys(n.stationStuds[l.model]||{}),...Object.keys(x)]);Bh.filter(M=>S.has(M)&&nt[M]).forEach(M=>{let N=de("button");N.type="button",N.dataset.loc=M,N.setAttribute("aria-pressed",String(Wi===M)),N.title=M+" \u2014 "+xr[M]+": \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043D\u0430 \u043A\u0443\u0437\u043E\u0432\u0435"+(x[M]?" \xB7 \u0434\u0435\u0444\u0435\u043A\u0442\u043D\u044B\u0445 \u0448\u043F\u0438\u043B\u0435\u043A: "+x[M]:""),N.append(document.createTextNode(xt[M]||M)),x[M]&&N.appendChild(de("span","",bt(x[M]))),N.onclick=()=>Gh(M),p.appendChild(N)})}function Gh(p){if(!w)return;if(l.mode!=="body"&&Xi("body"),yr=Wi===p?yr+1:0,Wi=p,zo(p),p==="ENGINE COMP"){kh();return}let S=nt[p],M=(n.walls[l.model]||[]).filter(he=>Uh(_r(he),S)).sort((he,Se)=>_r(he).z-_r(Se).z);if(M.length){let he=M[yr%M.length],Se=Ds(he.u),Fe=Ds(he.v),Qe=_r(he),qe=new R().crossVectors(Fe,Se).normalize(),at=Qe.clone().multiplyScalar(E),_t=vi(Se.length()*E*1.3,Fe.length()*E*1.3);bn(at.clone().addScaledVector(qe,_t).add(new R(0,_t*.25,0)),at);let zt=Qe.z<0?"\u043B\u0435\u0432\u0430\u044F":"\u043F\u0440\u0430\u0432\u0430\u044F";vr(p+" \xB7 "+xr[p]+": "+zt+" \u0441\u0442\u043E\u0440\u043E\u043D\u0430."+(M.length>1?" \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437 \u2014 "+(Qe.z<0?"\u043F\u0440\u0430\u0432\u0430\u044F":"\u043B\u0435\u0432\u0430\u044F")+".":""));return}let N=1/0,D=-1/0,k=1/0,B=-1/0,X=1/0,ae=-1/0;if(S.boxes.forEach(he=>{N=Math.min(N,he[0]),k=Math.min(k,he[1]),X=Math.min(X,he[2]),D=Math.max(D,he[3]),B=Math.max(B,he[4]),ae=Math.max(ae,he[5])}),p==="FRONT FLOOR"||p==="REAR FLOOR"){let he=yr%2===1,Se=new R((N+D)/2*E,.285*E,0),Fe=vi((D-N+.35)*E,2*E);bn(Se.clone().add(new R(0,he?-Fe*.9:Fe*.9,Fe*.42)),Se),vr(p+" \xB7 "+xr[p]+": "+(he?"\u0441\u043D\u0438\u0437\u0443 (\u0434\u043D\u0438\u0449\u0435). \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437 \u2014 \u0441\u0432\u0435\u0440\u0445\u0443.":"\u0441\u0432\u0435\u0440\u0445\u0443. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437 \u2014 \u0441\u043D\u0438\u0437\u0443 (\u0434\u043D\u0438\u0449\u0435)."));return}let Me=new R((N+D)/2*E,(k+B)/2*E,(X+ae)/2*E),xe=vi((D-N+.8)*E,(ae-X+.6)*E);bn(Me.clone().add(new R(.35,.75,.9).normalize().multiplyScalar(xe)),Me),vr(p+" \xB7 "+xr[p]+": \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u0445\u0435\u043C\u044B \u0432 Excel \u043D\u0435\u0442 \u2014 \u043F\u043E\u043A\u0430\u0437\u0430\u043D\u0430 \u0437\u043E\u043D\u0430 \u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u043D\u0430 \u043A\u0443\u0437\u043E\u0432\u0435.")}w&&L.addEventListener("start",()=>{Wi&&(Wi=null,zo(null))});let Mi=se("stage"),xl=()=>document.fullscreenElement||document.webkitFullscreenElement,Fo=()=>{let p=!!xl()||Mi.classList.contains("fs");se("fsBtn").setAttribute("aria-pressed",String(p)),se("fsBtn").title=p?"\u0412\u044B\u0439\u0442\u0438 \u0438\u0437 \u043F\u043E\u043B\u043D\u043E\u044D\u043A\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u0440\u0435\u0436\u0438\u043C\u0430 (Esc)":"\u0412\u043E \u0432\u0435\u0441\u044C \u044D\u043A\u0440\u0430\u043D (Esc \u2014 \u0432\u044B\u0439\u0442\u0438)",le()},Ns=p=>{Mi.classList.toggle("fs",p),document.documentElement.style.overflow=p?"hidden":"",Fo()};se("fsBtn").onclick=()=>{if(Mi.classList.contains("fs"))return Ns(!1);if(xl()){(document.exitFullscreen||document.webkitExitFullscreen).call(document);return}let p=Mi.requestFullscreen||Mi.webkitRequestFullscreen;if(!p||!(document.fullscreenEnabled||document.webkitFullscreenEnabled))return Ns(!0);try{let x=p.call(Mi);x&&x.catch&&x.catch(()=>Ns(!0))}catch{Ns(!0)}},document.addEventListener("fullscreenchange",Fo),document.addEventListener("webkitfullscreenchange",Fo),document.addEventListener("keydown",p=>{p.key==="Escape"&&Mi.classList.contains("fs")&&se("viewMenu").hidden&&Ns(!1)});let yl=0;function vr(p){}se("camTop").onclick=()=>bi("top"),se("camBottom").onclick=()=>bi("bottom"),se("camSide").onclick=()=>bi("side"),se("camTilt").onclick=()=>bi("tilt"),se("camReset").onclick=()=>{l.selected=null,Wi=null,zo(null),Nl(),bi("tilt")};let gn=se("tip"),br=new R;function _l(p){let x=v.domElement.getBoundingClientRect(),S=p.clientX-x.left,M=p.clientY-x.top,N=null,D=1e9,k=l.drawOp<.5;for(let B of we){if(!k&&l.mode==="body"&&fe.copy(y.position).sub(B.pos).dot(B.nrm)<0||(br.copy(B.pick).project(y),br.z>1))continue;let X=(br.x+1)/2*x.width,ae=(1-br.y)/2*x.height,Me=Math.hypot(X-S,ae-M)-(B.n?8:0);Me<D&&(D=Me,N=B)}return D<22?N:null}function Hh(p,x){gn.replaceChildren(de("b","","\u2116"+x.s.no));let S=n.parts[x.s.part];gn.appendChild(document.createTextNode(" \xB7 "+(S?S.pn:"")));let M=de("div","",x.n?Object.entries(x.byCat).map(([B,X])=>__oc(B).short+" "+X).join(", "):window.__smRec?(S?S.name:""):"\u043D\u0435\u0442 \u0434\u0435\u0444\u0435\u043A\u0442\u043E\u0432 \u0432 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C \u0444\u0438\u043B\u044C\u0442\u0440\u0435");M.className="muted",gn.appendChild(M);{let B=x.s,X=B.near&&B.near.length?"\u041D\u0430 \u043A\u0430\u0440\u0442\u0435 \u0440\u0430\u0437\u0434\u0432\u0438\u043D\u0443\u0442\u0430 \u0441 "+B.near.map(ae=>"\u2116"+ae.no+" (\u043D\u0430 \u0441\u0445\u0435\u043C\u0435 "+(ae.cm<1?"\u0432 \u043E\u0434\u043D\u043E\u0439 \u0442\u043E\u0447\u043A\u0435":"\u0432 "+String(ae.cm).replace(".",",")+" \u0441\u043C")+")").join(", ")+" \u2014 \u0434\u043B\u044F \u043D\u0430\u0433\u043B\u044F\u0434\u043D\u043E\u0441\u0442\u0438.":"";if(X){let ae=de("div","",X);ae.className="muted",ae.style.whiteSpace="normal",ae.style.maxWidth="260px",gn.appendChild(ae)}}let N=se("stage").getBoundingClientRect(),D=p.clientX-N.left+14,k=p.clientY-N.top+14;gn.hidden=!1,D+gn.offsetWidth>N.width-8&&(D=p.clientX-N.left-gn.offsetWidth-14),k+gn.offsetHeight>N.height-8&&(k=p.clientY-N.top-gn.offsetHeight-14),gn.style.left=D+"px",gn.style.top=k+"px"}if(w){let p=v.domElement,x=null;p.addEventListener("pointermove",S=>{if(S.buttons){gn.hidden=!0;return}let M=_l(S);if(p.style.cursor=M?"pointer":"",!M){gn.hidden=!0;return}Hh(S,M)}),p.addEventListener("pointerleave",()=>{gn.hidden=!0}),p.addEventListener("pointerdown",S=>{x=[S.clientX,S.clientY]}),p.addEventListener("pointerup",S=>{if(!x||Math.hypot(S.clientX-x[0],S.clientY-x[1])>6)return;let M=_l(S);M&&Mr(M.s)})}function Mr(p,x){l.selected=p.no,l.zone=null,Nl(),x!==!1&&Fh(p),window.__smPick&&window.__smPick(p.no,p)}function ko(){let p=se("flat");p.replaceChildren();let x=l.view;if(!x)return;let S=de("div","flat-wrap");S.style.aspectRatio=x.w+" / "+x.h;let M=de("img");M.src=A(x,!An),M.alt="\u0421\u0445\u0435\u043C\u0430 "+x.model+", "+x.name,M.decoding="async",M.style.opacity=l.drawOp,S.appendChild(M);let N=f(x);x.studs.forEach(D=>{let k=P(N.get(D.no)||[]);if(!k.n)return;let B=ai[k.top]||ai["\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E"];D.pts.forEach(X=>{let ae=de("button","pin",String(k.n));ae.type="button",ae.style.left=X[0]*100+"%",ae.style.top=X[1]*100+"%",ae.style.background=B.color,ae.setAttribute("aria-label","\u0428\u043F\u0438\u043B\u044C\u043A\u0430 "+D.no+", \u0434\u0435\u0444\u0435\u043A\u0442\u043E\u0432 "+k.n),l.selected===D.no&&ae.classList.add("on"),ae.onclick=()=>Mr(D,!1),S.appendChild(ae)})}),p.appendChild(S)}let Wh={body:"\u0423\u0441\u043B\u043E\u0432\u043D\u044B\u0439 \u043A\u0443\u0437\u043E\u0432: \u0442\u043E\u0447\u043A\u0438 \u0441\u043E \u0432\u0441\u0435\u0445 \u0441\u0445\u0435\u043C \u043F\u0435\u0440\u0435\u043D\u0435\u0441\u0435\u043D\u044B \u043D\u0430 \u043F\u043E\u043B, \u043C\u043E\u0442\u043E\u0440\u043D\u044B\u0439 \u0449\u0438\u0442, \u0431\u043E\u043A\u043E\u0432\u0438\u043D\u044B \u0438 \u0430\u0440\u043A\u0438. \u0412\u0440\u0430\u0449\u0430\u0442\u044C \u2014 \u043B\u0435\u0432\u0430\u044F \u043A\u043D\u043E\u043F\u043A\u0430, \u0434\u0432\u0438\u0433\u0430\u0442\u044C \u2014 \u043F\u0440\u0430\u0432\u0430\u044F, \u043A\u043E\u043B\u0435\u0441\u043E \u2014 \u043F\u0440\u0438\u0431\u043B\u0438\u0437\u0438\u0442\u044C.","3d":"\u0421\u0445\u0435\u043C\u0430 \u0438\u0437 Excel. \u0412\u0440\u0430\u0449\u0430\u0442\u044C \u2014 \u043B\u0435\u0432\u0430\u044F \u043A\u043D\u043E\u043F\u043A\u0430, \u0434\u0432\u0438\u0433\u0430\u0442\u044C \u2014 \u043F\u0440\u0430\u0432\u0430\u044F, \u043F\u0440\u0438\u0431\u043B\u0438\u0436\u0430\u0442\u044C \u2014 \u043A\u043E\u043B\u0435\u0441\u043E. \u041A\u043B\u0438\u043A \u043F\u043E \u0448\u043F\u0438\u043B\u044C\u043A\u0435 \u2014 \u0438\u0441\u0442\u043E\u0440\u0438\u044F.","2d":"\u0421\u0445\u0435\u043C\u0430 \u0432 2D. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u043A\u0440\u0443\u0436\u043E\u043A \u2014 \u043E\u0442\u043A\u0440\u043E\u0435\u0442\u0441\u044F \u0438\u0441\u0442\u043E\u0440\u0438\u044F \u0448\u043F\u0438\u043B\u044C\u043A\u0438."};function Os(){let p=l.drawOp,x=p<.999,S=D=>{if(!D.userData.drawing)return;let k=D.material;k.transparent!==x&&(k.transparent=x,k.needsUpdate=!0),k.opacity=p,k.depthWrite=!x,D.visible=p>.02,D.userData.alphaCut&&(k.alphaTest=D.userData.alphaCut*Math.max(p,.05))};w&&(re&&re.traverse(S),He&&He.traverse(S),le());let M=document.querySelector("#flat img");M&&(M.style.opacity=p);let N=Math.round(p*100);se("drawOp").value=N,se("drawOpVal").textContent=N+"%",se("drawToggle").setAttribute("aria-pressed",String(x))}let vl=l.drawOp<.999?l.drawOp:.3,Bo=(p,x)=>{if(l.drawOp=p,p<.999&&(vl=p),Os(),x)try{localStorage.setItem(o,String(p))}catch{}};se("drawOp").oninput=p=>Bo(p.target.value/100,!1),se("drawOp").onchange=p=>Bo(p.target.value/100,!0),se("drawToggle").onclick=()=>Bo(l.drawOp<.999?1:vl,!0);function Xi(p){p!=="2d"&&!w&&(p="2d"),l.mode=p,[["modeBody","body"],["mode3d","3d"],["mode2d","2d"]].forEach(([x,S])=>se(x).setAttribute("aria-pressed",String(p===S))),se("scene").hidden=p==="2d",se("flat").hidden=p!=="2d",document.querySelectorAll("[data-for]").forEach(x=>{x.hidden=!x.dataset.for.split(" ").includes(p)}),se("camTilt").textContent=p==="body"?"3/4":"\u041D\u0430\u043A\u043B\u043E\u043D",se("hint")&&(se("hint").textContent=Wh[p]),zh(),p==="2d"?(se("loading").hidden=!0,ko()):p==="body"?(gl(),bi("tilt",!0)):dt(l.view),Cl(),zs(),Fs()}se("modeBody").onclick=()=>Xi("body"),se("mode3d").onclick=()=>Xi("3d"),se("mode2d").onclick=()=>Xi("2d");let bl=()=>{se("paintMetal").setAttribute("aria-pressed",String(Zt.value===1)),se("paintColor").setAttribute("aria-pressed",String(Zt.value===0))},Ml=p=>{Zt.value=p,bl();try{localStorage.setItem(Vi,p?"metal":"color")}catch{}le()};bl(),se("paintMetal").onclick=()=>Ml(1),se("paintColor").onclick=()=>Ml(0);let wl="stud-map.kpiMore",Sl=(p,x)=>{if(se("kBodiesT").hidden=!p,se("kMapT").hidden=!p,se("kMore").setAttribute("aria-expanded",String(p)),se("kMore").firstChild.textContent=p?"\u0421\u043A\u0440\u044B\u0442\u044C":"\u0415\u0449\u0451 2",x)try{localStorage.setItem(wl,p?"1":"0")}catch{}};Sl((()=>{try{return localStorage.getItem(wl)==="1"}catch{return!1}})(),!1),se("kMore").onclick=()=>Sl(se("kMore").getAttribute("aria-expanded")!=="true",!0);let Uo=se("menuBtn"),wr=se("viewMenu"),Vo=(p,x)=>{wr.hidden=!p,Uo.setAttribute("aria-expanded",String(p)),!p&&x&&Uo.focus()};Uo.onclick=()=>Vo(wr.hidden),document.addEventListener("pointerdown",p=>{!wr.hidden&&!se("vmwrap").contains(p.target)&&Vo(!1)},!0),document.addEventListener("keydown",p=>{p.key==="Escape"&&!wr.hidden&&Vo(!1,!0)});let Tl=se("zonesToggle"),Al=()=>Tl.setAttribute("aria-checked",String(l.showZones));Al(),Tl.onclick=()=>{l.showZones=!l.showZones,Al();try{localStorage.setItem(c,l.showZones?"1":"0")}catch{}!l.showZones&&l.zone&&(l.zone=null,zs(),Fs()),ut(),le()};function Xh(){let p=se("models");p.replaceChildren(),n.models.forEach(x=>{let S=n.rows.filter(N=>N.model===x.id&&g(N)&&l.cats.has(N.category)).reduce((N,D)=>N+D.studs,0),M=de("button","chip");M.type="button",M.setAttribute("aria-pressed",String(l.model===x.id)),M.append(de("span","",x.brand+" "+x.id),de("span","n",bt(S))),M.onclick=()=>{l.model=x.id,l.selected=null,El(),qi(!0)},p.appendChild(M)})}function El(){let p=m(l.model);l.view=p.slice().sort((x,S)=>b(S)-b(x))[0]||p[0]}function Cl(){se("viewSec").hidden=l.mode==="body";let p=se("views");p.replaceChildren(),m(l.model).forEach(M=>{let N=b(M),D=de("button","tab");D.type="button",D.setAttribute("role","tab"),D.setAttribute("aria-selected",String(M===l.view)),D.append(de("span","",M.name),de("span","n"+(N?"":" z"),bt(N))),D.onclick=()=>{l.view=M,l.selected=null,qi(!0)},p.appendChild(D)});let x=n.models.find(M=>M.id===l.model);se("vtitle").replaceChildren(document.createTextNode(x.brand+" "+x.id))}function qh(){let p=se("weeks");p.replaceChildren();let x=_().filter(k=>l.cats.has(k.category));[["all","\u0412\u0441\u0435"]].concat(s.map(S=>[S,__wf(S)])).forEach(([S,M])=>{let N=x.filter(k=>S==="all"||k.week===S).reduce((k,B)=>k+B.studs,0),D=de("button","chip");D.type="button",D.setAttribute("aria-pressed",String(l.week===S)),D.append(de("span","",M),de("span","n",bt(N))),D.onclick=()=>{l.week=S,qi(!1)},p.appendChild(D)})}let Yh=(p,x)=>{let S="http://www.w3.org/2000/svg",M=document.createElementNS(S,"svg");M.setAttribute("viewBox","0 0 24 24"),M.setAttribute("aria-hidden","true");let N=(k,B)=>{let X=document.createElementNS(S,k);return Object.entries(B).forEach(([ae,Me])=>X.setAttribute(ae,Me)),M.appendChild(X),X};N("line",{x1:2,y1:21,x2:22,y2:21,stroke:"#9A948A","stroke-width":1.5});let D="#D4780E";return p==="ok"&&(N("rect",{x:6,y:18.5,width:12,height:2.5,fill:D}),N("rect",{x:10,y:4,width:4,height:15,fill:D})),p==="lackfuse"&&(N("ellipse",{cx:12,cy:19.6,rx:7.5,ry:2.4,fill:"#141210"}),N("ellipse",{cx:12,cy:19.3,rx:3.6,ry:1.1,fill:"#3B3631"}),[[3.2,17.4],[20.6,17.1],[6,15.6],[18.4,15.4],[12,15]].forEach(([k,B])=>N("circle",{cx:k,cy:B,r:.9,fill:"#141210"}))),p==="missing"&&(N("rect",{x:10,y:4,width:4,height:15,fill:"none",stroke:x,"stroke-dasharray":"2 2"}),N("ellipse",{cx:12,cy:20,rx:3,ry:1.2,fill:"#1C1C1C"})),p==="broken"&&(N("rect",{x:6,y:18.5,width:12,height:2.5,fill:D}),N("path",{d:"M10 19 V12 l1.2 -1.4 l1.2 1.2 l1.6 -1.6 V19 Z",fill:D}),N("rect",{x:15,y:15.5,width:7,height:3,fill:D,rx:.5})),p==="bent"&&(N("rect",{x:6,y:18.5,width:12,height:2.5,fill:D}),N("path",{d:"M10 19 V12 L17 5 L19.8 7.8 L14 13.6 V19 Z",fill:D})),p==="torn"&&(N("ellipse",{cx:12,cy:19.8,rx:6,ry:1.8,fill:"#C9CED6",stroke:"#8E959F","stroke-width":.6}),N("rect",{x:10.5,y:17,width:3,height:2.6,fill:D})),p==="shift"&&(N("rect",{x:3,y:18.5,width:18,height:2.5,fill:D}),N("rect",{x:6,y:4,width:4,height:15,fill:"none",stroke:x,"stroke-dasharray":"2 2"}),N("rect",{x:14,y:4,width:4,height:15,fill:D})),p==="unknown"&&(N("rect",{x:10,y:6,width:4,height:13,fill:"#B7BBC1"}),N("text",{x:18,y:9,"font-size":9,fill:x,"font-weight":700}).textContent="?"),M};function Zh(){let p=se("cats");p.replaceChildren();let x=_().filter(g),A$=Ui.filter(K$=>n.rows.some(k=>k.category===K$.key)).every(K$=>l.cats.has(K$.key));p.classList.toggle("all",A$);{let N=de("button","chip");N.type="button",N.dataset.all="1",N.setAttribute("aria-pressed",String(A$)),N.append(de("span","","\u0412\u0441\u0435"),de("span","n",bt(x.reduce((k,B)=>k+B.studs,0)))),N.onclick=()=>{l.cats=new Set(Ui.map(S$=>S$.key)),qi(!1)},p.appendChild(N)}Ui.forEach(S=>{if(!n.rows.some(k=>k.category===S.key))return;let M=x.filter(k=>k.category===S.key).reduce((k,B)=>k+B.studs,0),N=de("button","chip cat");N.type="button",N.setAttribute("aria-pressed",String(l.cats.has(S.key)));let D=de("span","dot");D.style.background=S.color,N.append(D,de("span","",S.short),de("span","n",bt(M))),N.onclick=()=>{A$?l.cats=new Set([S.key]):(l.cats.has(S.key)?l.cats.delete(S.key):l.cats.add(S.key),l.cats.size||(l.cats=new Set(Ui.map(S$=>S$.key)))),qi(!1)},p.appendChild(N)})}function Pl(p,x,S,M){if(p.replaceChildren(),!x.length){p.appendChild(de("span","empty","\u041D\u0435\u0442 \u0434\u0435\u0444\u0435\u043A\u0442\u043E\u0432 \u0432 \u044D\u0442\u043E\u0439 \u043D\u0435\u0434\u0435\u043B\u0435."));return}let N=Math.max(...x.map(D=>M?D.rate||0:D.v),1e-9);x.forEach(D=>{let k=de("span","lbl");if(D.color){let Me=de("span","dot");Me.style.background=D.color,k.appendChild(Me)}k.appendChild(document.createTextNode(D.label)),D.title&&(k.title=D.title);let B=de("span","track"),X=de("span","fill");X.style.width=100*(M?D.rate||0:D.v)/N+"%",X.style.background=D.color||"var(--accent)",B.appendChild(X);let ae=de("span","v",bt(D.v));ae.appendChild(de("small",""," "+(D.right!=null?D.right:M?"\u2014":Math.round(100*D.v/S)+"%"))),p.append(k,B,ae)})}function Ll(){let p=n.models.find(_e=>_e.id===l.model),x=_().filter(g).filter(_e=>l.cats.has(_e.category)),S=x.reduce((_e,et)=>_e+et.studs,0),M=x.filter(_e=>_e.stud_no!=null).reduce((_e,et)=>_e+et.studs,0);se("sumTitle").textContent=p.brand+" "+p.id+" \xB7 "+(l.week==="all"?"\u0432\u0441\u0435 \u043D\u0435\u0434\u0435\u043B\u0438":__wf(l.week))+(Ui.every(K$=>l.cats.has(K$.key)||!n.rows.some(r$=>r$.category===K$.key))?"":" \xB7 "+Ui.filter(K$=>l.cats.has(K$.key)&&n.rows.some(r$=>r$.category===K$.key)).map(K$=>K$.short).join(", "));let N=l.week==="all"?s:[l.week],D=N.filter(_e=>!a(_e)&&x.some(et=>et.week===_e)),k=0,B="";!D.length&&N.some(_e=>a(_e))?(k=N.reduce((_e,et)=>_e+a(et),0),B="\u043F\u043E \u043D\u0435\u0434\u0435\u043B\u044F\u043C (\u043B\u0438\u0441\u0442 \xAB\u0412\u044B\u043F\u0443\u0441\u043A\xBB)"):l.week==="all"&&n.volumeModelTotal[l.model]&&(k=n.volumeModelTotal[l.model],B="\u0437\u0430 \u0432\u0435\u0441\u044C \u043F\u0435\u0440\u0438\u043E\u0434 (\u043B\u0438\u0441\u0442 Graphs \u0440\u0435\u0435\u0441\u0442\u0440\u0430)");let X=k>0,ae=N.reduce((_e,et)=>_e+new Set(x.filter(Ct=>Ct.week===et).map(Dh)).size,0),Me=n.stationStuds[l.model]||{},xe=Object.values(Me).reduce((_e,et)=>_e+et,0),he=X&&xe>0;se("kProd").textContent=X?bt(k):"\u2014",se("kProdLbl").textContent=X?"\u0432\u044B\u043F\u0443\u0449\u0435\u043D\u043E \u043A\u0443\u0437\u043E\u0432\u043E\u0432":(l.week==="all"?"\u0432\u044B\u043F\u0443\u0441\u043A \u043D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D":"\u0432\u044B\u043F\u0443\u0441\u043A \u0437\u0430 "+__wf(l.week)+" \u043D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D"),se("kProd").parentElement.title=X?"\u0412\u044B\u043F\u0443\u0441\u043A "+p.id+" "+B:"\u0412 \u0440\u0435\u0435\u0441\u0442\u0440\u0435 \u0432\u044B\u043F\u0443\u0441\u043A \u043F\u043E \u043C\u043E\u0434\u0435\u043B\u044F\u043C \u0435\u0441\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u0437\u0430 \u0432\u0435\u0441\u044C \u043F\u0435\u0440\u0438\u043E\u0434 (\u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \xAB\u0412\u0441\u0435 \u043D\u0435\u0434\u0435\u043B\u0438\xBB)"+(n.volumeAll[l.week]?"; \u0432\u0441\u0435\u0445 \u043C\u043E\u0434\u0435\u043B\u0435\u0439 \u0437\u0430 "+__wf(l.week)+" \u2014 "+bt(n.volumeAll[l.week]):""),se("kBodies").textContent=bt(ae),se("kBodiesLbl").textContent="\u043A\u0443\u0437\u043E\u0432\u043E\u0432 \u0441 \u0434\u0435\u0444\u0435\u043A\u0442\u043E\u043C"+(X?" \xB7 "+Rn(100*ae/k):""),se("kTotal").textContent=bt(S),se("kTotalLbl").textContent="\u0434\u0435\u0444\u0435\u043A\u0442\u043D\u044B\u0445 \u0448\u043F\u0438\u043B\u0435\u043A"+(he?" \xB7 "+Rn(100*S/(xe*k)):""),se("kTotal").parentElement.title=he?"\u041F\u0440\u043E\u0446\u0435\u043D\u0442 \u2014 \u043E\u0442 \u0432\u0441\u0435\u0445 \u0448\u043F\u0438\u043B\u0435\u043A: "+xe+" \u0448\u043F\u0438\u043B\u0435\u043A \u043D\u0430 \u043A\u0443\u0437\u043E\u0432 \u043F\u043E \u0441\u0445\u0435\u043C\u0430\u043C \xD7 "+bt(k)+" \u043A\u0443\u0437\u043E\u0432\u043E\u0432":"",se("kMap").textContent=bt(M),se("kMap").parentElement.title="\u0418\u0437 "+bt(S)+" \u0434\u0435\u0444\u0435\u043A\u0442\u043D\u044B\u0445 \u0448\u043F\u0438\u043B\u0435\u043A \u0443 "+bt(M)+" \u0432 \u0440\u0435\u0435\u0441\u0442\u0440\u0435 \u0437\u0430\u043F\u0438\u0441\u0430\u043D \u043D\u043E\u043C\u0435\u0440 \u0448\u043F\u0438\u043B\u044C\u043A\u0438 \u2014 \u043E\u043D\u0438 \u0441\u0442\u043E\u044F\u0442 \u0442\u043E\u0447\u043A\u043E\u0439 \u043D\u0430 \u0441\u0445\u0435\u043C\u0435. \u041E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 "+bt(S-M)+" \u0431\u0435\u0437 \u043D\u043E\u043C\u0435\u0440\u0430 \u2014 \u043D\u0430 \u043A\u0443\u0437\u043E\u0432\u0435 \u043F\u043B\u0430\u0448\u043A\u0438 \xAB\u0431\u0435\u0437 \u2116\xBB \u043F\u043E \u0441\u0442\u0430\u043D\u0446\u0438\u044F\u043C",se("kMapLbl").textContent="\u0441 \u2116 \u0448\u043F\u0438\u043B\u044C\u043A\u0438 \u2014 \u0442\u043E\u0447\u043A\u043E\u0439 \u043D\u0430 \u0441\u0445\u0435\u043C\u0435"+(S?" \xB7 \u0438\u0437 "+bt(S):"");let Se=he?"\xB7 % \u043E\u0442 \u0448\u043F\u0438\u043B\u0435\u043A":"\xB7 \u0434\u043E\u043B\u044F \u0434\u0435\u0444\u0435\u043A\u0442\u043E\u0432";se("catUnit").textContent=Se,se("locUnit").textContent=he?"\xB7 % \u043E\u0442 \u0448\u043F\u0438\u043B\u0435\u043A \u0441\u0442\u0430\u043D\u0446\u0438\u0438":"\xB7 \u0434\u043E\u043B\u044F \u0434\u0435\u0444\u0435\u043A\u0442\u043E\u0432",se("catUnit").title=he?"\u0434\u0435\u0444\u0435\u043A\u0442\u043D\u044B\u0445 \u0448\u043F\u0438\u043B\u0435\u043A / ("+xe+" \u0448\u043F\u0438\u043B\u0435\u043A \u043D\u0430 \u043A\u0443\u0437\u043E\u0432 \xD7 "+bt(k)+" \u043A\u0443\u0437\u043E\u0432\u043E\u0432)":l.week!=="all"?"\u0412\u044B\u043F\u0443\u0441\u043A\u0430 \u043C\u043E\u0434\u0435\u043B\u0438 \u0437\u0430 \u043D\u0435\u0434\u0435\u043B\u044E \u043D\u0435\u0442 \u2014 \u043F\u043E\u043A\u0430\u0437\u0430\u043D\u0430 \u0434\u043E\u043B\u044F \u043E\u0442 \u0432\u0441\u0435\u0445 \u0434\u0435\u0444\u0435\u043A\u0442\u043E\u0432":"\u0414\u043E\u043B\u044F \u043E\u0442 \u0432\u0441\u0435\u0445 \u0434\u0435\u0444\u0435\u043A\u0442\u043E\u0432 \u043C\u043E\u0434\u0435\u043B\u0438";let Fe={};x.forEach(_e=>{Fe[_e.location]=(Fe[_e.location]||0)+_e.studs});let Qe=[...new Set([...Object.keys(Me),...Object.keys(Fe)])].filter(_e=>_e!=="\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E").sort((_e,et)=>(Me[et]||0)-(Me[_e]||0)||(Fe[et]||0)-(Fe[_e]||0));l.catBase!=="all"&&!Qe.includes(l.catBase)&&(l.catBase="all");let qe=l.catBase,at=se("catBase");at.replaceChildren(),[["all","\u0412\u0435\u0441\u044C \u043A\u0443\u0437\u043E\u0432",xe]].concat(Qe.map(_e=>[_e,_e,Me[_e]||0])).forEach(([_e,et,Ct])=>{let Jt=de("button","chip");Jt.type="button",Jt.setAttribute("aria-pressed",String(_e===qe)),Jt.append(document.createTextNode(et)),Jt.appendChild(de("span","n",Ct?Ct+" \u0448\u043F.":"\u2014")),Jt.title=Ct?(_e==="all"?"\u041F\u0440\u043E\u0446\u0435\u043D\u0442 \u043E\u0442 \u0432\u0441\u0435\u0445 \u0448\u043F\u0438\u043B\u0435\u043A \u043A\u0443\u0437\u043E\u0432\u0430: ":"\u041F\u0440\u043E\u0446\u0435\u043D\u0442 \u043E\u0442 \u0448\u043F\u0438\u043B\u0435\u043A \u0441\u0442\u0430\u043D\u0446\u0438\u0438: ")+Ct+" \u043D\u0430 \u043A\u0443\u0437\u043E\u0432 \xD7 \u0432\u044B\u043F\u0443\u0441\u043A":"\u0421\u0445\u0435\u043C\u044B \u044D\u0442\u043E\u0439 \u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u043D\u0435\u0442 \u2014 \u0447\u0438\u0441\u043B\u043E \u0448\u043F\u0438\u043B\u0435\u043A \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E, \u043F\u0440\u043E\u0446\u0435\u043D\u0442 \u043D\u0435 \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F",Jt.onclick=()=>{l.catBase=_e,Ll()},at.appendChild(Jt)});let _t=qe==="all"?x:x.filter(_e=>_e.location===qe),zt=qe==="all"?xe:Me[qe]||0,Ht=X&&zt>0,En=_t.reduce((_e,et)=>_e+et.studs,0);se("catUnit").textContent=(qe==="all"?"":"\xB7 "+qe+" ")+(Ht?"\xB7 % \u043E\u0442 \u0448\u043F\u0438\u043B\u0435\u043A"+(qe==="all"?"":" \u0441\u0442\u0430\u043D\u0446\u0438\u0438"):X?"\xB7 \u0434\u043E\u043B\u044F \u0434\u0435\u0444\u0435\u043A\u0442\u043E\u0432 (\u0448\u043F\u0438\u043B\u0435\u043A \u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u0432 \u0441\u0445\u0435\u043C\u0430\u0445 \u043D\u0435\u0442)":"\xB7 \u0434\u043E\u043B\u044F \u0434\u0435\u0444\u0435\u043A\u0442\u043E\u0432"),se("catUnit").title=Ht?"\u0434\u0435\u0444\u0435\u043A\u0442\u043D\u044B\u0445 \u0448\u043F\u0438\u043B\u0435\u043A"+(qe==="all"?"":" \u043D\u0430 "+qe)+" / ("+zt+" \u0448\u043F\u0438\u043B\u0435\u043A \u043D\u0430 \u043A\u0443\u0437\u043E\u0432 \xD7 "+bt(k)+" \u043A\u0443\u0437\u043E\u0432\u043E\u0432)":se("catUnit").title;let Ke={};_t.forEach(_e=>{Ke[_e.category]=(Ke[_e.category]||0)+_e.studs});let Ye=Ui.filter(_e=>Ke[_e.key]).map(_e=>{let et=Ke[_e.key],Ct=Ht?100*et/(zt*k):null;return{label:_e.short,v:et,color:_e.color,rate:Ct,right:Ct!=null?Rn(Ct):null}}).sort((_e,et)=>et.v-_e.v);Ye.length?Pl(se("catBars"),Ye,Math.max(1,En),Ht):se("catBars").replaceChildren(de("p","empty","\u041D\u0430 \u044D\u0442\u043E\u0439 \u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u043D\u0435\u0442 \u0434\u0435\u0444\u0435\u043A\u0442\u043E\u0432 \u0432 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C \u0444\u0438\u043B\u044C\u0442\u0440\u0435."));let yt={};x.forEach(_e=>{yt[_e.location]=(yt[_e.location]||0)+_e.studs});let wt=Object.entries(yt).map(([_e,et])=>{let Ct=Me[_e],Jt=he&&Ct?100*et/(Ct*k):null;return{label:Ct?_e+" \xB7 "+Ct+" \u0448\u043F.":_e,v:et,rate:Jt,right:Jt!=null?Rn(Jt):null,title:Ct?"":"\u0421\u0445\u0435\u043C\u044B \u044D\u0442\u043E\u0439 \u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u043D\u0435\u0442 \u2014 \u0447\u0438\u0441\u043B\u043E \u0448\u043F\u0438\u043B\u0435\u043A \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E"}}).sort((_e,et)=>(_e.label==="\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E")-(et.label==="\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D\u043E")||et.v-_e.v);Pl(se("locBars"),wt,Math.max(1,S),he&&wt.some(_e=>_e.rate!=null))}function Jh(p,x){if(!(p>0))return 1;let S=10**Math.floor(Math.log10(p)),M=p/S,N=x&&S<10?[1,2,5,10]:[1,2,2.5,5,10],D=10;for(let B of N)if(B>=M-1e-9){D=B;break}let k=D*S;return x?Math.max(1,Math.round(k)):k}function c0(p){if(p<=0)return 1;let x=10**Math.floor(Math.log10(p)),S=p/x;return(S<=1?1:S<=2?2:S<=2.5?2.5:S<=5?5:10)*x}function Sr(){let p=l.trendScope==="all",x=q=>p?n.volumeAll[q]||0:a(q),S=s.some(q=>x(q)>0);S||(l.trendMode="n");let M=l.trendMode==="pct";se("trendMode").hidden=!S,se("tctl").hidden=!S,se("trendMode").querySelectorAll("button").forEach(q=>q.setAttribute("aria-pressed",String(q.dataset.m===l.trendMode))),se("trendUnit").textContent=(p?"\xB7 \u0432\u0441\u0435 \u043C\u043E\u0434\u0435\u043B\u0438":"\xB7 "+l.model)+(M?" \xB7 \u0434\u0435\u0444\u0435\u043A\u0442\u043D\u043E\u0441\u0442\u044C, %":" \xB7 \u0448\u043F\u0438\u043B\u0435\u043A");let N=(p?n.rows:_()).filter(q=>l.cats.has(q.category)),D=q=>q.model+"|"+Dh(q),k=Ui.filter(q=>N.some(Ie=>Ie.category===q.key)),B=s.map(q=>{let Ie=N.filter(Le=>Le.week===q),ke=x(q),ct=k.map(Le=>{let Wt=Ie.filter(Yi=>Yi.category===Le.key),wi=Wt.reduce((Yi,tu)=>Yi+tu.studs,0),Ar=new Set(Wt.map(D)).size;return{c:Le,n:wi,b:Ar,v:M?ke?100*wi/ke:0:wi}}),De=Ie.reduce((Le,Wt)=>Le+Wt.studs,0),Lt=new Set(Ie.map(D)).size;return{w:q,vol:ke,seg:ct,n:De,b:Lt,total:M?ke?100*De/ke:null:De,top:ct.reduce((Le,Wt)=>Le+Wt.v,0)}}),X=se("trend");X.replaceChildren();let ae=Math.max(300,Math.round(X.clientWidth||340)),Me=ae>560?310:240,xe=ae>=440,he=40,Se=xe?182:10,Fe=22,Qe=26,qe=ae-he-Se,at=Me-Fe-Qe,_t=l.trendHidden,zt=Math.max(M?.01:4,...B.flatMap(q=>q.total==null?[]:k.map((Ie,ke)=>_t.has(Ie.key)?0:q.seg[ke].v||0))),Ht=Jh(zt/3,!M),En=zt*1.1,Ke=q=>Fe+at-at*q/En,Ye=q=>B.length>1?he+16+(qe-32)*q/(B.length-1):he+qe/2,yt=q=>M?Rn(q):bt(q),wt=Qt("svg",{viewBox:`0 0 ${ae} ${Me}`,width:ae,height:Me,role:"img","aria-label":"\u0422\u0440\u0435\u043D\u0434 \u0434\u0435\u0444\u0435\u043A\u0442\u043E\u0432 \u043F\u043E \u043D\u0435\u0434\u0435\u043B\u044F\u043C: \u0432\u0441\u0435\u0433\u043E \u0438 \u043F\u043E \u0432\u0438\u0434\u0430\u043C. \u0417\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u2014 \u0432 \u0442\u0430\u0431\u043B\u0438\u0446\u0435 \u043D\u0438\u0436\u0435."}),_e=[];for(let q=0;q<=zt+Ht*1e-6;q+=Ht)_e.push(+q.toFixed(6));_e.forEach(q=>{Qt("line",{x1:he,x2:he+qe,y1:Ke(q),y2:Ke(q),class:q?"grid":"base"},wt),Qt("text",{x:he-6,y:Ke(q)+3.5,class:"tick","text-anchor":"end"},wt).textContent=yt(q)});let et=B.findIndex(q=>q.w===l.week);et>=0&&Qt("rect",{x:Ye(et)-16,y:Fe-10,width:32,height:at+10,rx:5,class:"selband"},wt);let Ct=Qt("line",{x1:0,x2:0,y1:Fe-10,y2:Fe+at,class:"cross"},wt);Ct.style.display="none";let Jt=q=>{let Ie=[],ke=[];return q.forEach((ct,De)=>{ct==null?(ke.length&&Ie.push(ke),ke=[]):ke.push([Ye(De),Ke(ct)])}),ke.length&&Ie.push(ke),Ie},Kh=q=>{let Ie=q.length,ke=Le=>Le.toFixed(1);if(Ie<3)return q.map((Le,Wt)=>(Wt?"L":"M")+ke(Le[0])+","+ke(Le[1])).join("");let ct=[],De=[];for(let Le=0;Le<Ie-1;Le++)ct.push((q[Le+1][1]-q[Le][1])/(q[Le+1][0]-q[Le][0]));De[0]=ct[0],De[Ie-1]=ct[Ie-2];for(let Le=1;Le<Ie-1;Le++)De[Le]=ct[Le-1]*ct[Le]<=0?0:(ct[Le-1]+ct[Le])/2;for(let Le=0;Le<Ie-1;Le++){if(ct[Le]===0){De[Le]=0,De[Le+1]=0;continue}let Wt=De[Le]/ct[Le],wi=De[Le+1]/ct[Le],Ar=Wt*Wt+wi*wi;if(Ar>9){let Yi=3/Math.sqrt(Ar);De[Le]=Yi*Wt*ct[Le],De[Le+1]=Yi*wi*ct[Le]}}let Lt="M"+ke(q[0][0])+","+ke(q[0][1]);for(let Le=0;Le<Ie-1;Le++){let Wt=(q[Le+1][0]-q[Le][0])/3;Lt+="C"+ke(q[Le][0]+Wt)+","+ke(q[Le][1]+De[Le]*Wt)+" "+ke(q[Le+1][0]-Wt)+","+ke(q[Le+1][1]-De[Le+1]*Wt)+" "+ke(q[Le+1][0])+","+ke(q[Le+1][1])}return Lt},jh=q=>Jt(q).map(Kh).join(""),Cn=[],Fl=k.map((q,Ie)=>({c:q,k:Ie,vals:B.map(ke=>ke.total==null?null:ke.seg[Ie].v),sum:B.reduce((ke,ct)=>ke+ct.seg[Ie].n,0)})).filter(q=>!_t.has(q.c.key)).sort((q,Ie)=>q.sum-Ie.sum),Qh=Math.max(1,...Fl.map(q=>q.sum));if(Fl.forEach(q=>{let Ie=q.sum<Qh*.15;Qt("path",{d:jh(q.vals),fill:"none",stroke:q.c.color,"stroke-width":Ie?1.5:2.5,"stroke-opacity":Ie?.6:1,"stroke-linejoin":"round","stroke-linecap":"round"},wt),q.vals.forEach((ct,De)=>{ct!=null&&Qt("circle",{cx:Ye(De),cy:Ke(ct),r:Ie?2.5:3.5,fill:q.c.color,"fill-opacity":Ie?.7:1,stroke:"#FBFAF7","stroke-width":1.5},wt)});let ke=-1;q.vals.forEach((ct,De)=>{ct!=null&&(ke=De)}),ke>=0&&Cn.push({y0:Ke(q.vals[ke]),x0:Ye(ke),text:q.c.short,val:yt(q.vals[ke]),color:q.c.color,minor:Ie})}),xe&&Cn.length){Cn.sort((De,Lt)=>De.y0-Lt.y0);let q=16;Cn.forEach((De,Lt)=>{De.y=Lt?Math.max(De.y0,Cn[Lt-1].y+q):De.y0});let Ie=Fe+at+4,ke=Cn.length;if(Cn[ke-1].y>Ie){Cn[ke-1].y=Ie;for(let De=ke-2;De>=0;De--)Cn[De].y=Math.min(Cn[De].y,Cn[De+1].y-q)}let ct=he+qe+10;Cn.forEach(De=>{Qt("path",{d:`M${De.x0+5},${De.y0}L${ct-6},${De.y}`,class:"elink"},wt),Qt("circle",{cx:ct,cy:De.y,r:3.5,fill:De.color},wt);let Lt=Qt("text",{x:ct+8,y:De.y+4,class:"elab"+(De.minor?" minor":"")},wt);Lt.textContent=De.text+" ",Qt("tspan",{class:"ev"},Lt).textContent=De.val})}B.forEach((q,Ie)=>Qt("text",{x:Ye(Ie),y:Me-6,class:"wk"+(Ie===et?" on":""),"text-anchor":"middle"},wt).textContent=__wf(q.w));let Nn=de("div","ttip");Nn.hidden=!0;let kl=(q,Ie)=>{Nn.replaceChildren();let ke=de("div","th",__wf(q.w)+" \xB7 "+(M?q.total==null?"\u043D\u0435\u0442 \u0432\u044B\u043F\u0443\u0441\u043A\u0430":"\u0434\u0435\u0444\u0435\u043A\u0442\u043D\u043E\u0441\u0442\u044C "+Rn(q.total):"\u0432\u0441\u0435\u0433\u043E "+bt(q.n)+" \u0448\u0442"));Nn.appendChild(ke),q.vol&&Nn.appendChild(de("div","tv","\u0432\u044B\u043F\u0443\u0441\u043A "+bt(q.vol)+" \xB7 \u043A\u0443\u0437\u043E\u0432\u043E\u0432 \u0441 \u0434\u0435\u0444\u0435\u043A\u0442\u043E\u043C "+bt(q.b)+" ("+Rn(100*q.b/q.vol)+")")),q.seg.slice().sort((De,Lt)=>Lt.n-De.n).forEach(De=>{if(!De.n)return;let Lt=de("div","tr"),Le=de("span","dot");Le.style.background=De.c.color,Lt.append(Le,de("span","",De.c.short),de("b","",M?Rn(De.v)+" ("+De.n+" \u0448\u0442)":bt(De.n))),Nn.appendChild(Lt)}),q.n||Nn.appendChild(de("div","tv","\u0434\u0435\u0444\u0435\u043A\u0442\u043E\u0432 \u043D\u0435\u0442")),Ct.setAttribute("x1",Ye(Ie)),Ct.setAttribute("x2",Ye(Ie)),Ct.style.display="";let ct=Ie<B.length/2;Nn.style.left=(Ye(Ie)+(ct?14:-14))/ae*100+"%",Nn.style.transform=ct?"none":"translateX(-100%)",Nn.hidden=!1},Bl=()=>{Nn.hidden=!0,Ct.style.display="none"};B.forEach((q,Ie)=>{let ke=Ie===0?he:(Ye(Ie-1)+Ye(Ie))/2,ct=Ie===B.length-1?he+qe:(Ye(Ie)+Ye(Ie+1))/2,De=Qt("rect",{x:ke,y:0,width:ct-ke,height:Me,class:"hit",tabindex:0,role:"button","aria-pressed":String(l.week===q.w),"aria-label":__wf(q.w)+": "+(M?q.total==null?"\u043D\u0435\u0442 \u0432\u044B\u043F\u0443\u0441\u043A\u0430":"\u0434\u0435\u0444\u0435\u043A\u0442\u043D\u043E\u0441\u0442\u044C "+Rn(q.total):bt(q.n)+" \u0434\u0435\u0444\u0435\u043A\u0442\u043D\u044B\u0445 \u0448\u043F\u0438\u043B\u0435\u043A")+". \u041D\u0430\u0436\u043C\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u043D\u0435\u0434\u0435\u043B\u044E."},wt);De.addEventListener("pointerenter",()=>kl(q,Ie)),De.addEventListener("focus",()=>kl(q,Ie)),De.addEventListener("pointerleave",Bl),De.addEventListener("blur",Bl);let Lt=()=>{l.week=l.week===q.w?"all":q.w,qi(!1)};De.addEventListener("click",Lt),De.addEventListener("keydown",Le=>{(Le.key==="Enter"||Le.key===" ")&&(Le.preventDefault(),Lt())})}),X.append(wt,Nn);let Ul=se("trendLegend");Ul.replaceChildren();let eu=(q,Ie)=>{let ke=Qt("svg",{viewBox:"0 0 22 10",width:22,height:10,"aria-hidden":"true"});return Ie?Qt("rect",{x:1,y:2,width:20,height:7,rx:2,class:"tarea-sw"},ke):(Qt("line",{x1:1,x2:21,y1:5,y2:5,stroke:q,"stroke-width":2.5,"stroke-linecap":"round"},ke),Qt("circle",{cx:11,cy:5,r:3,fill:q},ke)),ke};k.forEach(q=>{let Ie=de("button","li"+(q.total?" tot":""));Ie.type="button",Ie.setAttribute("aria-pressed",String(!_t.has(q.key))),Ie.title=_t.has(q.key)?"\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C":"\u0421\u043A\u0440\u044B\u0442\u044C",Ie.append(eu(q.color,q.total),document.createTextNode(q.short)),Ie.onclick=()=>{_t.has(q.key)?_t.delete(q.key):_t.add(q.key),Sr()},Ul.appendChild(Ie)});let Vl=se("trendTable");Vl.replaceChildren();let Go=de("table","ttab"),Ho=de("tr");Ho.appendChild(de("th","",M?"\u0414\u0435\u0444\u0435\u043A\u0442\u043D\u043E\u0441\u0442\u044C, %":"\u0414\u0435\u0444\u0435\u043A\u0442\u043E\u0432, \u0448\u0442")),B.forEach(q=>Ho.appendChild(de("th",l.week===q.w?"on":"",__wf(q.w))));let Gl=de("thead");Gl.appendChild(Ho),Go.appendChild(Gl);let Hl=de("tbody"),Tr=(q,Ie,ke,ct)=>{let De=de("tr",ke||""),Lt=de("td");if(ct){let Le=de("span","dot");Le.style.background=ct,Lt.appendChild(Le)}Lt.appendChild(document.createTextNode(q)),De.appendChild(Lt),Ie.forEach((Le,Wt)=>De.appendChild(de("td",l.week===B[Wt].w?"on":"",Le))),Hl.appendChild(De)};k.forEach((q,Ie)=>Tr(q.short,B.map(ke=>M?ke.vol?Rn(ke.seg[Ie].v):"\u2014":bt(ke.seg[Ie].n)),"",q.color)),Tr("\u0412\u0441\u0435\u0433\u043E",B.map(q=>q.total==null?"\u2014":M?Rn(q.total):bt(q.total)),"tot"),S&&(Tr("\u0412\u044B\u043F\u0443\u0441\u043A, \u043A\u0443\u0437\u043E\u0432\u043E\u0432",B.map(q=>q.vol?bt(q.vol):"\u2014"),"sub"),Tr("\u041A\u0443\u0437\u043E\u0432\u043E\u0432 \u0441 \u0434\u0435\u0444\u0435\u043A\u0442\u043E\u043C",B.map(q=>q.vol?Rn(100*q.b/q.vol):"\u2014"),"sub")),Go.appendChild(Hl),Vl.appendChild(Go),se("trendNote").textContent=M?"\u0414\u0435\u0444\u0435\u043A\u0442\u043D\u043E\u0441\u0442\u044C = \u0434\u0435\u0444\u0435\u043A\u0442\u043D\u044B\u0445 \u0448\u043F\u0438\u043B\u0435\u043A / \u0432\u044B\u043F\u0443\u0441\u043A \u043D\u0435\u0434\u0435\u043B\u0438 \xD7 100, \u043A\u0430\u043A \u0432 WEEKLY ANALYSIS.":""}se("trendMode").querySelectorAll("button").forEach(p=>{p.onclick=()=>{l.trendMode=p.dataset.m,Sr()}});let Rl="stud-map.trendTable",Il=(p,x)=>{if(se("trendTable").hidden=!p,se("tblMore").setAttribute("aria-expanded",String(p)),se("tblMore").firstChild.textContent=p?"\u0421\u043A\u0440\u044B\u0442\u044C \u0442\u0430\u0431\u043B\u0438\u0446\u0443":"\u0422\u0430\u0431\u043B\u0438\u0446\u0430",x)try{localStorage.setItem(Rl,p?"1":"0")}catch{}};Il((()=>{try{return localStorage.getItem(Rl)==="1"}catch{return!1}})(),!1),se("tblMore").onclick=()=>Il(se("trendTable").hidden,!0);let Dl=0;new ResizeObserver(()=>{let p=Math.round(se("trend").clientWidth);p&&Math.abs(p-Dl)>8&&(Dl=p,Sr())}).observe(se("trend"));function zs(){let p=se("studList");p.replaceChildren();let x=l.mode==="body";se("studsTitle").textContent=x?"\u0414\u0435\u0444\u0435\u043A\u0442\u043D\u044B\u0435 \u0448\u043F\u0438\u043B\u044C\u043A\u0438 \u043D\u0430 \u043A\u0443\u0437\u043E\u0432\u0435":"\u0428\u043F\u0438\u043B\u044C\u043A\u0438 \u043D\u0430 \u044D\u0442\u043E\u043C \u0432\u0438\u0434\u0435";let S=x?Ne():f(l.view),N=(x?Oo(l.model).map(D=>({no:D.no,part:D.part,pts:D.pts})):l.view.studs).map(D=>({s:D,rs:S.get(D.no)||[]})).filter(D=>D.rs.length).sort((D,k)=>k.rs.length-D.rs.length||D.s.no-k.s.no);if(!N.length){p.appendChild(de("p","empty",x?"\u0423 \u044D\u0442\u043E\u0439 \u043C\u043E\u0434\u0435\u043B\u0438 \u043D\u0435\u0442 \u0434\u0435\u0444\u0435\u043A\u0442\u043D\u044B\u0445 \u0448\u043F\u0438\u043B\u0435\u043A \u0441 \u043D\u043E\u043C\u0435\u0440\u043E\u043C \u0432 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C \u0444\u0438\u043B\u044C\u0442\u0440\u0435.":"\u041D\u0430 \u044D\u0442\u043E\u043C \u0432\u0438\u0434\u0435 \u043D\u0435\u0442 \u0434\u0435\u0444\u0435\u043A\u0442\u043D\u044B\u0445 \u0448\u043F\u0438\u043B\u0435\u043A \u0432 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C \u0444\u0438\u043B\u044C\u0442\u0440\u0435."));return}N.forEach(({s:D,rs:k})=>{let B=de("button","studbtn");B.type="button",l.selected===D.no&&B.setAttribute("aria-current","true");let X=de("span","mid");[...new Set(k.map(Me=>Me.category))].forEach(Me=>{let xe=de("span","dot");xe.style.background=__oc(Me).color,xe.title=Me,X.appendChild(xe)});let ae=n.parts[D.part];X.appendChild(de("span","pn",ae?ae.pn:"")),B.append(de("span","no","\u2116"+D.no),X,de("span","cnt","\xD7"+k.reduce((Me,xe)=>Me+xe.studs,0))),B.onclick=()=>Mr(D),p.appendChild(B)})}function Fs(){let p=se("info");if(p.replaceChildren(),l.zone&&l.mode==="body"){let he=(ze().get(l.zone)||[]).slice().sort((at,_t)=>at.date.localeCompare(_t.date)),Se=he.reduce((at,_t)=>at+_t.studs,0),Fe=de("div","card"),Qe=de("div");Qe.append(de("div","title","\u0421\u0442\u0430\u043D\u0446\u0438\u044F "+l.zone),de("div","pn",bt(Se)+" \u0434\u0435\u0444\u0435\u043A\u0442\u043D\u044B\u0445 \u0448\u043F\u0438\u043B\u0435\u043A \u0431\u0435\u0437 \u043D\u043E\u043C\u0435\u0440\u0430")),Fe.appendChild(Qe),Fe.appendChild(de("p","note","\u0412 \u0440\u0435\u0435\u0441\u0442\u0440\u0435 \u0443 \u044D\u0442\u0438\u0445 \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u043D\u0435 \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D \xAB\u041D\u043E\u043C\u0435\u0440 \u0448\u043F\u0438\u043B\u044C\u043A\u0438\xBB, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u0442\u043E\u0447\u043D\u043E\u0433\u043E \u043C\u0435\u0441\u0442\u0430 \u043D\u0430 \u043A\u0443\u0437\u043E\u0432\u0435 \u043D\u0435\u0442 \u2014 \u043F\u043E\u0434\u0441\u0432\u0435\u0447\u0435\u043D\u0430 \u0437\u043E\u043D\u0430 \u0441\u0442\u0430\u043D\u0446\u0438\u0438. \u0417\u0430\u043F\u0438\u0441\u0435\u0439: "+he.length+"."));let qe=de("div","hist");he.forEach(at=>{let _t=de("div"),zt=de("span","c"),Ht=de("span","dot");Ht.style.background=__oc(at.category).color,zt.append(Ht,document.createTextNode(at.category));let En=de("span","x","\u043A\u0443\u0437\u043E\u0432 "+(at.body_no||"\u2014")+(at.studs>1?" \xB7 "+at.studs+" \u0448\u0442":""));at.mass&&En.appendChild(de("span","tag","\u043C\u0430\u0441\u0441\u043E\u0432\u043E\u0435")),_t.append(de("span","",Ro(at.date)),de("span","",__wf(at.week)),zt,En),qe.appendChild(_t)}),Fe.appendChild(qe),p.appendChild(Fe);return}let x=l.mode==="body"?Oo(l.model):l.view.studs,S=l.selected!=null?x.find(he=>he.no===l.selected):null;if(!S){p.appendChild(de("p","empty","\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u0448\u043F\u0438\u043B\u044C\u043A\u0443 \u043D\u0430 \u0441\u0445\u0435\u043C\u0435 \u0438\u043B\u0438 \u0432 \u0441\u043F\u0438\u0441\u043A\u0435."));return}let M=n.parts[S.part]||{},N=n.rows.filter(he=>he.model===l.model&&he.stud_no===S.no).sort((he,Se)=>he.date.localeCompare(Se.date)),D=m(l.model).filter(he=>he.studs.some(Se=>Se.no===S.no)).map(he=>he.name).join(", "),k=de("div","card"),B=de("div","head"),X=de("img","photo");X.src="parts/"+encodeURIComponent(S.part)+".png",X.alt="\u0424\u043E\u0442\u043E \u0448\u043F\u0438\u043B\u044C\u043A\u0438 "+(M.pn||""),X.loading="lazy",X.width=64,X.height=64;let ae=de("div");ae.append(de("div","title","\u0428\u043F\u0438\u043B\u044C\u043A\u0430 \u2116"+S.no),de("div","pn",M.pn||"\u2014"),de("div","note",M.name||"")),B.append(X,ae),k.appendChild(B);let Me=[...new Set(N.map(he=>he.location))].join(", ");k.appendChild(de("p","note","\u0421\u0445\u0435\u043C\u0430: "+(D||"\u2014")+(Me?" \xB7 \u0441\u0442\u0430\u043D\u0446\u0438\u044F: "+Me:"")+" \xB7 \u0432\u0441\u0435\u0433\u043E \u0437\u0430\u043F\u0438\u0441\u0435\u0439: "+N.length));{let he=S.near&&S.near.length?"\u041D\u0430 \u043A\u0430\u0440\u0442\u0435 \u0440\u0430\u0437\u0434\u0432\u0438\u043D\u0443\u0442\u0430 \u0441 "+S.near.map(Se=>"\u2116"+Se.no+" (\u043D\u0430 \u0441\u0445\u0435\u043C\u0435 "+(Se.cm<1?"\u0432 \u043E\u0434\u043D\u043E\u0439 \u0442\u043E\u0447\u043A\u0435":"\u0432 "+String(Se.cm).replace(".",",")+" \u0441\u043C")+")").join(", ")+" \u2014 \u0434\u043B\u044F \u043D\u0430\u0433\u043B\u044F\u0434\u043D\u043E\u0441\u0442\u0438.":"";he&&l.mode==="body"&&k.appendChild(de("p","note",he))}let xe=de("div","hist");N.forEach(he=>{let Se=de("div");(!g(he)||!l.cats.has(he.category))&&(Se.className="off");let Fe=de("span","c"),Qe=de("span","dot");Qe.style.background=__oc(he.category).color,Fe.append(Qe,document.createTextNode(he.category));let qe=de("span","x","\u043A\u0443\u0437\u043E\u0432 "+(he.body_no||"\u2014"));he.mass&&qe.appendChild(de("span","tag","\u043C\u0430\u0441\u0441\u043E\u0432\u043E\u0435")),Se.append(de("span","",Ro(he.date)),de("span","",__wf(he.week)),Fe,qe),xe.appendChild(Se)}),k.appendChild(xe),p.appendChild(k)}function $h(){let p=se("legend");p.replaceChildren(),[["ok","#D4780E","\u041D\u043E\u0440\u043C\u0430 (\u0448\u043F\u0438\u043B\u044C\u043A\u0430 \u0432\u0438\u0434\u0430)"]].concat(Ui.map(x=>[x.mode,x.color,x.short+" \u2014 "+x.what])).forEach(([x,S,M])=>{let N=de("div");N.append(Yh(x,S),de("span","",M)),p.appendChild(N)})}function Nl(){zs(),Fs(),l.mode==="2d"?ko():tt()}function qi(p){Xh(),Cl(),qh(),Zh(),Ll(),Sr(),zs(),Fs(),Vh(),l.mode!=="init"&&(l.mode==="2d"?ko():l.mode==="body"?p?gl():tt():p?dt(l.view):tt())}function h0(){}if(se("ghost").onchange=p=>{l.ghost=p.target.checked,l.mode!=="2d"&&tt()},w){let p=()=>{let x=O.clientWidth,S=O.clientHeight;!x||!S||(v.setSize(x,S,!1),y.aspect=x/S,y.updateProjectionMatrix(),le())};new ResizeObserver(p).observe(O),p(),document.addEventListener("visibilitychange",()=>{document.hidden||le()})}$h(),El();let Ol="stud-map.legend",zl=(p,x)=>{if(se("legend").hidden=!p,se("lgBtn").setAttribute("aria-expanded",String(p)),x)try{localStorage.setItem(Ol,p?"1":"0")}catch{}};zl((()=>{try{let p=localStorage.getItem(Ol);return p?p==="1":!matchMedia("(max-width: 600px)").matches}catch{return!0}})(),!1),se("lgBtn").onclick=()=>zl(se("legend").hidden,!0),l.mode="init",qi(!1),Xi(w?"body":"2d"),Os(),window.__viz={state:l,DATA:n,select:Mr,get points(){return we},get frames(){return ye},get tex(){return[...Nt.keys()]},setCam:(p,x)=>{w&&(y.position.set(p[0],p[1],p[2]),L.target.set(x[0],x[1],x[2]),L.update(),le())},cam:()=>w?{p:y.position.toArray().map(p=>+p.toFixed(2)),t:L.target.toArray().map(p=>+p.toFixed(2))}:null,get info(){return w?{calls:v.info.render.calls,tris:v.info.render.triangles,objects:Z.children.length}:null}}}l0();})();
