export const ribbonWidth = 640;
export const ribbonHeight = 480;
export const ribbonSpacing = 22.5;
export type RibbonNode = { x:number;y:number;z:number;vx:number;vy:number;vz:number;twist:number;spin:number;age:number };
export type RibbonGrab = { index:number;x:number;y:number;phase?:number };
export type RibbonBounds = { left:number;right:number;top:number;bottom:number };

export function createRibbon():RibbonNode[]{return Array.from({length:25},(_,index)=>{const x=110+index*ribbonSpacing;return{x,y:444-(x-380)*.11,z:0,vx:0,vy:0,vz:0,twist:0,spin:0,age:0};});}
export function dropRibbon(nodes:RibbonNode[]){for(const node of nodes){node.vx*=.12;node.vy*=.08;node.vz=Math.min(0,node.vz*.12);node.spin*=.5;}}

export function stepRibbon(nodes:RibbonNode[],grab:RibbonGrab|null,elapsed:number,reduced=false,bounds?:RibbonBounds,wind=0){
  const clamp=(node:RibbonNode)=>{
    node.z=Math.max(0,node.z);
    if(!bounds)return;
    // The right/top/bottom edges remain ordinary limits. The left edge is a
    // cloth wall: penetration is stopped, horizontal velocity is killed, but
    // neighboring nodes are allowed to pile vertically and in Z.
    if(node.x<bounds.left){node.x=bounds.left;node.vx=Math.max(0,node.vx)*.08;}
    node.x=Math.min(bounds.right,node.x);
  };
  if(reduced){
    if(grab){const dx=grab.x-nodes[grab.index].x,dy=grab.y-nodes[grab.index].y;for(const node of nodes){node.x+=dx;node.y+=dy;clamp(node);}}
    for(const node of nodes){node.z=node.vx=node.vy=node.vz=node.spin=0;node.twist=Math.round(node.twist/Math.PI)*Math.PI;}return false;
  }
  const duration=Math.max(0,Math.min(48,elapsed))/1000,steps=Math.max(1,Math.ceil(duration*120)),dt=duration/steps;
  if(!dt)return Boolean(grab)||wind>.02;
  for(let step=0;step<steps;step++){
    const previous=nodes.map(node=>({x:node.x,y:node.y,z:node.z}));
    for(const [index,node] of nodes.entries()){
      node.age+=dt;if(grab?.index===index){node.x=grab.x;node.y=grab.y;node.z=78;continue;}
      const airy=Math.max(0,Math.min(1.5,wind)),distanceFromRight=nodes.length-1-index,wave=node.age*5-distanceFromRight*.54,crest=Math.max(0,Math.sin(wave)),cross=Math.sin(wave-.8);
      const onPage=node.z<.2&&!grab&&airy<.025,drag=Math.exp(-(onPage?26:airy>.025?3.8:2.1)*dt),handBreeze=grab?Math.sin(node.age*2.1+index*.3+(grab.phase??0))*16:0;
      const windX=-150*airy*(.55+crest*.45),windLift=(90+crest*760)*airy,windSide=cross*52*airy;
      node.vx=(node.vx+(handBreeze+windX)*dt)*drag;node.vy=(node.vy+((grab?950:node.z>.2?450:0)+windSide)*dt)*drag;node.vz=(node.vz+windLift*dt-1400*dt)*drag;
      node.x+=node.vx*dt;node.y+=node.vy*dt;node.z+=node.vz*dt;
      if(bounds&&node.x<bounds.left+28&&airy>.025&&!grab){
        const compression=Math.max(0,1-(node.x-bounds.left)/28);
        node.vy+=(index%2?1:-1)*(180+index*5)*compression*airy*dt;
        node.vz+=(420+index*9)*compression*airy*dt;
        node.spin+=(index%2?1:-1)*2.8*compression*airy*dt;
      }
      const sideLength=index<(grab?.index??12)?(grab?.index??12):nodes.length-1-(grab?.index??12),fromGrip=grab?Math.abs(index-grab.index)/Math.max(1,sideLength):0;
      const handTarget=grab?Math.pow(fromGrip,1.5)*1.8+Math.sin(node.age*1.3+(grab.phase??0))*.06*fromGrip:0,windTarget=!grab?cross*.42*airy:0,target=handTarget+windTarget;
      node.spin=(node.spin+(target-node.twist)*(grab?24:13)*dt)*Math.exp(-(grab?9:5.5)*dt);node.twist+=node.spin*dt;node.twist=Math.max(-.7,Math.min(1.9,node.twist));clamp(node);
    }
    const constrain=(a:number,b:number,length:number,stiffness=1)=>{const first=nodes[a],second=nodes[b],dx=second.x-first.x,dy=second.y-first.y,dz=second.z-first.z,distance=Math.hypot(dx,dy,dz)||.001,wa=grab?.index===a?0:1,wb=grab?.index===b?0:1,correction=(distance-length)/distance*stiffness/(wa+wb);first.x+=dx*correction*wa;first.y+=dy*correction*wa;first.z+=dz*correction*wa;second.x-=dx*correction*wb;second.y-=dy*correction*wb;second.z-=dz*correction*wb;};
    for(let pass=0;pass<16;pass++){for(let i=0;i<nodes.length-1;i++){const a=pass%2?nodes.length-2-i:i;constrain(a,a+1,ribbonSpacing);}
      if(grab||wind>.02||nodes.some(node=>node.z>.2)){for(let i=0;i<nodes.length-2;i++)constrain(i,i+2,ribbonSpacing*2,.11);for(let i=0;i<nodes.length;i++)for(let j=i+4;j<nodes.length;j++)if(Math.hypot(nodes[j].x-nodes[i].x,nodes[j].y-nodes[i].y,nodes[j].z-nodes[i].z)<40)constrain(i,j,40,.45);}
      for(let i=1;i<nodes.length;i++){const difference=nodes[i].twist-nodes[i-1].twist;if(Math.abs(difference)>.24){const correction=(Math.abs(difference)-.24)*Math.sign(difference)/2;nodes[i].twist-=correction;nodes[i-1].twist+=correction;}}
      for(const node of nodes)clamp(node);if(grab){nodes[grab.index].x=grab.x;nodes[grab.index].y=grab.y;nodes[grab.index].z=78;}
    }
    for(const [index,node] of nodes.entries()){const before=previous[index],cap=(value:number)=>Math.max(-1800,Math.min(1800,value));node.vx=cap((node.x-before.x)/dt);node.vy=cap((node.y-before.y)/dt);node.vz=cap((node.z-before.z)/dt);if(!grab&&wind<.02&&node.z<.2&&Math.hypot(node.vx,node.vy)<.6)node.vx=node.vy=node.vz=0;if(!grab&&wind<.02&&Math.abs(node.twist)<.002&&Math.abs(node.spin)<.002){node.twist=0;node.spin=0;}}
  }
  return Boolean(grab)||wind>.02||nodes.some(node=>node.z>.2||Math.hypot(node.vx,node.vy)>.6||Math.abs(node.spin)>.002);
}
type Point={x:number;y:number};const pointString=(p:Point)=>`${p.x.toFixed(2)},${p.y.toFixed(2)}`;
function interval(points:Point[],index:number,reverse=false){const before=points[Math.max(0,index-1)],current=points[index],next=points[index+1],after=points[Math.min(points.length-1,index+2)],first={x:current.x+(next.x-before.x)/6,y:current.y+(next.y-before.y)/6},second={x:next.x-(after.x-current.x)/6,y:next.y-(after.y-current.y)/6};return reverse?`C${pointString(second)} ${pointString(first)} ${pointString(current)}`:`C${pointString(first)} ${pointString(second)} ${pointString(next)}`;}
function curve(points:Point[]){return`M${pointString(points[0])} ${points.slice(0,-1).map((_,index)=>interval(points,index)).join(" ")}`;}
export function ribbonPaths(nodes:RibbonNode[]){const upper:Point[]=[],lower:Point[]=[],normals:Point[]=[];nodes.forEach((node,index)=>{const before=nodes[Math.max(0,index-1)],after=nodes[Math.min(nodes.length-1,index+1)],angle=Math.atan2(after.y-before.y,after.x-before.x),halfWidth=Math.max(1.6,19*Math.abs(Math.cos(node.twist)))*(1+node.z/1800),normal={x:-Math.sin(angle),y:Math.cos(angle)};normals.push(normal);upper.push({x:node.x-normal.x*halfWidth,y:node.y-normal.y*halfWidth});lower.push({x:node.x+normal.x*halfWidth,y:node.y+normal.y*halfWidth});});const cap=(index:number,end:Point)=>{const node=nodes[index],normal=normals[index],direction=index===0?-1:1;return`Q${pointString({x:node.x+normal.y*direction*2,y:node.y-normal.x*direction*2})} ${pointString(end)}`;};const segments=nodes.slice(0,-1).map((node,index)=>{const next=nodes[index+1],twist=(node.twist+next.twist)/2,across=index===nodes.length-2?cap(index+1,lower[index+1]):`L${pointString(lower[index+1])}`,close=index===0?cap(0,upper[0]):`L${pointString(upper[index])}`;return{path:`M${pointString(upper[index])} ${interval(upper,index)} ${across} ${interval(lower,index,true)} ${close} Z`,front:Math.cos(twist)>=0,depth:(node.z+next.z)/2};});const bottom=nodes.slice(0,-1).map((_,index)=>interval(lower,nodes.length-2-index,true)).join(" ");return{body:`${curve(upper)} ${cap(nodes.length-1,lower[nodes.length-1])} ${bottom} ${cap(0,upper[0])} Z`,lettering:curve(nodes.map(node=>({x:node.x,y:node.y+5}))),front:segments.filter(segment=>segment.front).map(segment=>segment.path).join(" "),back:segments.filter(segment=>!segment.front).map(segment=>segment.path).join(" "),segments,height:nodes.reduce((sum,node)=>sum+node.z,0)/nodes.length};}
