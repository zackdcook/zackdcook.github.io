/**
 * Versioned completed-stroke transport. Canonical points and ownership stay in
 * storage. Decimal-grid strokes are encoded exactly as delta/zigzag varints;
 * legacy higher-precision points use a raw fallback instead of losing detail.
 * No Buffer dependency: the same decoder runs in browsers and on the server.
 */
export type Point = [number, number];
export type EncodedPoints =
  | { encoding: "delta-v1"; count: number; data: string }
  | { encoding: "raw-v1"; points: Point[] };

const MAX_POINTS = 30_000;
const MAX_COORDINATE = 1_000_000_000;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function valid(point: Point) {
  if (point.length !== 2 || point.some(v => !Number.isFinite(v) || v < 0 || v > MAX_COORDINATE)) throw new Error("Invalid stroke point.");
}
function toBase64(bytes: number[]) {
  let result = "";
  for(let i=0;i<bytes.length;i+=3) {
    const n=bytes[i]*65536+(bytes[i+1]||0)*256+(bytes[i+2]||0);
    result+=alphabet[(n>>>18)&63]+alphabet[(n>>>12)&63]+(i+1<bytes.length?alphabet[(n>>>6)&63]:"=")+(i+2<bytes.length?alphabet[n&63]:"=");
  }
  return result;
}
function fromBase64(value:string) {
  if(value.length > MAX_POINTS*20 || value.length%4 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw new Error("Invalid stroke encoding.");
  const result:number[]=[];
  for(let i=0;i<value.length;i+=4) {
    const n=alphabet.indexOf(value[i])*262144+alphabet.indexOf(value[i+1])*4096+Math.max(0,alphabet.indexOf(value[i+2]))*64+Math.max(0,alphabet.indexOf(value[i+3]));
    result.push((n>>>16)&255);if(value[i+2]!=="=")result.push((n>>>8)&255);if(value[i+3]!=="=")result.push(n&255);
  }
  return result;
}
function writeVarint(value:number,bytes:number[]) {
  let n=value<0?-value*2-1:value*2;
  do {const part=n%128;n=Math.floor(n/128);bytes.push(part+(n?128:0));} while(n);
}

export function encodePoints(points:Point[]):EncodedPoints {
  if(points.length>MAX_POINTS)throw new Error("Stroke exceeds point budget.");
  points.forEach(valid);
  if(points.some(p=>p.some(v=>Math.round(v*10)/10!==v))) return {encoding:"raw-v1",points};
  const bytes:number[]=[];let x=0,y=0;
  for(const p of points){const nx=Math.round(p[0]*10),ny=Math.round(p[1]*10);writeVarint(nx-x,bytes);writeVarint(ny-y,bytes);x=nx;y=ny;}
  return {encoding:"delta-v1",count:points.length,data:toBase64(bytes)};
}

export function decodePoints(encoded:EncodedPoints):Point[] {
  if(encoded.encoding==="raw-v1") {
    if(!Array.isArray(encoded.points)||encoded.points.length>MAX_POINTS)throw new Error("Invalid stroke point count.");
    encoded.points.forEach(valid);return encoded.points;
  }
  if(encoded.encoding!=="delta-v1"||!Number.isSafeInteger(encoded.count)||encoded.count<0||encoded.count>MAX_POINTS)throw new Error("Invalid stroke version or count.");
  const bytes=fromBase64(encoded.data);let cursor=0,x=0,y=0;
  function read() {
    let n=0,factor=1;
    for(let i=0;i<7;i++) {
      if(cursor>=bytes.length)throw new Error("Truncated stroke.");
      const b=bytes[cursor++];n+=(b&127)*factor;
      if(!Number.isSafeInteger(n))throw new Error("Stroke integer overflow.");
      if(b<128)return n%2?-(n+1)/2:n/2;
      factor*=128;
    }
    throw new Error("Stroke integer overflow.");
  }
  const points:Point[]=[];
  for(let i=0;i<encoded.count;i++){x+=read();y+=read();const p:Point=[x/10,y/10];valid(p);points.push(p);}
  if(cursor!==bytes.length)throw new Error("Trailing stroke data.");
  return points;
}

/** Iterative RDP for optional render projections only; never replaces originals. */
export function simplifyPoints(points:Point[],tolerance:number):Point[] {
  if(points.length<3||tolerance<=0)return points;
  const retained=new Uint8Array(points.length);retained[0]=retained[points.length-1]=1;
  const stack:Array<[number,number]>=[[0,points.length-1]],limit=tolerance*tolerance;
  while(stack.length){const [start,end]=stack.pop()!,a=points[start],b=points[end];let furthest=-1,max=limit;
    const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;
    for(let i=start+1;i<end;i++){const p=points[i],t=length?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length)):0;
      const d=(p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2;
      if(d>max){max=d;furthest=i;}
    }
    if(furthest>=0){retained[furthest]=1;stack.push([start,furthest],[furthest,end]);}
  }
  return points.filter((_,i)=>retained[i]);
}
