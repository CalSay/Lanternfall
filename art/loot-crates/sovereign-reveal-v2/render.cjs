/* Concept animation only. Drawn assets are generated with imagegen; this
   compositor positions, blends and times them. No game files are modified. */
const fs = require('fs');
const path = require('path');
const {createCanvas, loadImage, GlobalFonts, GifEncoder} = require('@napi-rs/canvas');
const sharp = require('sharp');
const DIR=__dirname, OUT=path.join(DIR,'out'), W=960, H=640, FPS=50, SECONDS=8.0, COUNT=Math.round(FPS*SECONDS);
fs.mkdirSync(OUT,{recursive:true});
// Use installed fonts; do not bundle third-party font files in this art pack.
const fontDir=process.env.LF_ART_FONT_DIR || (process.platform==='win32' ? path.join(process.env.WINDIR || 'C:/Windows','Fonts') : null);
for(const [file,family] of [['georgia.ttf','Georgia'],['segoeui.ttf','Segoe UI'],['segoeuisl.ttf','Segoe Light']]){
  const font=fontDir && path.join(fontDir,file);
  if(font && fs.existsSync(font))GlobalFonts.registerFromPath(font,family);
}
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const out=x=>1-Math.pow(1-clamp(x),3);
const mix=(a,b,t)=>a+(b-a)*t;
const ramp=(t,a,b)=>smooth((t-a)/(b-a));
const canvas=createCanvas(W,H), ctx=canvas.getContext('2d');
const layer=createCanvas(444,444), lc=layer.getContext('2d');
const warpCanvas=createCanvas(444,444), wc=warpCanvas.getContext('2d');
const base=createCanvas(444,444), bc=base.getContext('2d');
const mask=createCanvas(444,444), mc=mask.getContext('2d');
const background=createCanvas(W,H), bg=background.getContext('2d');
const guides=[
  [0,48,141,239,260,444], [0,47,139,228,260,444],
  [0,31,124,217,260,444], [0,7,99,170,260,444],
  [0,10,88,139,260,444], [0,1,76,110,260,444],
  [0,1,71,95,260,444], [0,1,71,94,260,444]
];
const horizontal=[
  [0,48,224,402,444],[0,48,226,402,444],
  [0,48,227,402,444],[0,50,228,405,444],
  [0,82,262,419,444],[0,98,266,419,444],
  [0,101,267,421,444],[0,104,265,420,444]
];
function bodyPath(c){
  c.beginPath(); c.moveTo(45,242); c.lineTo(167,246);
  c.lineTo(170,230); c.lineTo(184,222); c.lineTo(204,229);c.lineTo(217,246);
  c.lineTo(329,254);c.lineTo(404,226); c.lineTo(444,444);c.lineTo(0,444);c.closePath();
}
function text(c,s,x,y,size,color,font='Segoe UI',align='left'){
  c.font=`${size}px "${font}"`;c.fillStyle=color;c.textAlign=align;c.fillText(s,x,y);
}
function sprite(c,img,x,y,w,h,alpha=1,angle=0){
  if(alpha<0.001)return;
  c.save(); c.globalAlpha=clamp(alpha);c.translate(x,y);c.rotate(angle);c.drawImage(img,-w/2,-h/2,w,h);c.restore();
}
function warp(img,g,gx,target,targetX){
  wc.clearRect(0,0,444,444); wc.imageSmoothingEnabled=true;
  for(let k=0;k<g.length-1;k++){
    const s0=g[k],s1=g[k+1],d0=target[k],d1=target[k+1];
    // Match both crest position and lid corners, not just vertical travel.
    for(let j=0;j<gx.length-1;j++)
      wc.drawImage(img,gx[j],s0,gx[j+1]-gx[j],s1-s0,
        targetX[j],d0,targetX[j+1]-targetX[j]+.12,d1-d0+.12);
  }
  return warpCanvas;
}
function chestAt(p,images){
  const q=clamp(p)*7, a=Math.floor(q), b=Math.min(7,a+1), f=q-a;
  const g=guides[a].map((v,k)=>mix(v,guides[b][k],f));
  const gx=horizontal[a].map((v,k)=>mix(v,horizontal[b][k],f));
  lc.clearRect(0,0,444,444);lc.globalCompositeOperation='source-over';lc.globalAlpha=1;
  lc.drawImage(warp(images[a],guides[a],horizontal[a],g,gx),0,0);
  if(f>0.001){
    // Weighted premultiplied crossfade avoids dimming translucent edges.
    lc.globalCompositeOperation='destination-in';lc.fillStyle=`rgba(255,255,255,${1-f})`;lc.fillRect(0,0,444,444);
    lc.globalCompositeOperation='lighter';lc.globalAlpha=f;lc.drawImage(warp(images[b],guides[b],horizontal[b],g,gx),0,0);
  }
  lc.globalAlpha=1;lc.globalCompositeOperation='destination-out';lc.drawImage(mask,0,0);
  lc.globalCompositeOperation='source-over';lc.drawImage(base,0,0);
  return layer;
}
function makeBackground(){
  bg.fillStyle='#0b0a12';bg.fillRect(0,0,W,H);
  const r=bg.createRadialGradient(460,349,30,470,350,510);
  r.addColorStop(0,'#302238');r.addColorStop(.58,'#191421');r.addColorStop(1,'#0b0a12');bg.fillStyle=r;bg.fillRect(0,0,W,H);
  const shade=bg.createLinearGradient(0,433,0,H);shade.addColorStop(0,'rgba(7,5,12,0)');shade.addColorStop(1,'rgba(5,4,8,.75)');bg.fillStyle=shade;bg.fillRect(0,433,W,H-433);
  bg.strokeStyle='#57422e';bg.lineWidth=1;bg.strokeRect(24.5,24.5,W-49,H-49);
  text(bg,'L A N T E R N F A L L',W/2,58,12,'#b19b76','Segoe UI','center');
  text(bg,'Sovereign Cache',W/2,104,33,'#f0d8a4','Georgia','center');
  text(bg,'IV  /  BOSS REWARD',W/2,132,11,'#b299c7','Segoe UI','center');
  bg.strokeStyle='rgba(183,138,62,.28)';bg.beginPath();bg.moveTo(362,147.5);bg.lineTo(598,147.5);bg.stroke();
  text(bg,'REVEAL CONCEPT  /  II',53,599,10,'#81768d');
  text(bg,'SAMPLE REWARD',W-53,599,10,'#81768d','Segoe UI','right');
}
(async()=>{
  const input=path.join(DIR,'assets');
  const atlas=path.join(DIR,'sources','sovereign-ceremonial-effects.png');
  const m=await sharp(atlas).metadata();
  for(const [i,name] of ['fan','wave','trail','wreath'].entries()){
    const left=Math.round(i%2*m.width/2),top=Math.round(Math.floor(i/2)*m.height/2);
    const width=Math.round((i%2+1)*m.width/2)-left,height=Math.round((Math.floor(i/2)+1)*m.height/2)-top;
    const cell=await sharp(atlas).extract({left,top,width,height}).png().toBuffer();
    await sharp(cell).trim({threshold:3}).png().toFile(path.join(OUT,`${name}.png`));
  }
  const poses=await Promise.all(Array.from({length:8},(_,i)=>loadImage(path.join(input,`pose-${i}.png`))));
  const fx={};
  for(const name of ['scroll','glow','sparks','halo'])fx[name]=await loadImage(path.join(input,`${name}.png`));
  for(const name of ['fan','wave','trail','wreath'])fx[name]=await loadImage(path.join(OUT,`${name}.png`));
  // One actual artist-drawn glint for the motes; no procedural spark artwork.
  const sm=await sharp(path.join(input,'sparks.png')).metadata();
  await sharp(path.join(input,'sparks.png')).extract({left:Math.round(sm.width*.39),top:Math.round(sm.height*.29),width:Math.round(sm.width*.21),height:Math.round(sm.height*.23)}).png().toFile(path.join(OUT,'glint.png'));
  fx.glint=await loadImage(path.join(OUT,'glint.png'));
  bodyPath(mc);mc.fillStyle='#fff';mc.fill();
  bc.drawImage(poses[0],0,0);bc.globalCompositeOperation='destination-in';bc.drawImage(mask,0,0);
  const lidPoses=poses.map(img=>{const c=createCanvas(444,444),x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='destination-out';x.drawImage(mask,0,0);return c;});
  makeBackground();
  const scene=createCanvas(W,H),sc=scene.getContext('2d');
  function screenSprite(img,x,y,w,h,alpha=1,angle=0){sc.save();sc.globalCompositeOperation='screen';sprite(sc,img,x,y,w,h,alpha,angle);sc.restore();}
  function draw(t){
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.drawImage(background,0,0);
    const opacity=t<6.55?1:t<7.18?1-ramp(t,6.55,7.13):ramp(t,7.3,7.95);
    const clock=t>=7.18?0:t;
    const opening=smooth((clock-1.50)/.90);
    const charge=ramp(clock,.45,1.55)*(1-ramp(clock,1.83,2.26));
    const breath=1+.15*Math.sin((clock-.45)*Math.PI*2.2);
    const release=ramp(clock,1.76,1.96)*(1-ramp(clock,2.45,3.15));
    const flare=Math.exp(-Math.pow((clock-1.98)/.125,2));
    const placement=smooth((clock-2.10)/1.05);
    const chestX=mix(480,309,placement);
    const scale=1.025-.025*placement+.026*charge*(1-opening);
    const baseline=581;
    const ox=chestX-222*scale,oy=baseline-427*scale;
    const mouthX=ox+235*scale,mouthY=oy+230*scale;
    const gemX=ox+188*scale,gemY=oy+282*scale;
    const emergence=out((clock-2.11)/1.02);
    const arrival=ramp(clock,2.94,3.36);
    const rewardX=mix(482,714,emergence);
    const rewardY=mix(373,328,emergence)-Math.sin(emergence*Math.PI)*135;
    const itemSize=mix(40,274,emergence)*(1+.035*Math.sin(clamp((clock-2.91)/.43)*Math.PI)*(clock<3.34?1:0));
    const float=arrival*Math.sin((clock-3.35)*1.6)*1.8;
    sc.clearRect(0,0,W,H);sc.globalAlpha=1;sc.globalCompositeOperation='source-over';
    // Slightly darken the stage during the charge; the interface stays legible.
    sc.fillStyle=`rgba(4,2,10,${charge*.17})`;sc.fillRect(26,153,W-52,433);
    sc.save();sc.translate(chestX,568);sc.scale(1,.19);
    const shadow=sc.createRadialGradient(0,0,12,0,0,230);shadow.addColorStop(0,'rgba(0,0,0,.82)');shadow.addColorStop(1,'rgba(0,0,0,0)');sc.fillStyle=shadow;sc.fillRect(-235,-235,470,470);sc.restore();
    screenSprite(fx.glow,chestX,365,520,480,.045+.18*charge+.22*release);
    // The floor pulse spreads once and fades, so it reads as the lid's impact.
    const shock=out((clock-1.87)/.82);
    if(clock>1.87&&clock<2.85)screenSprite(fx.wave,480,543,mix(90,830,shock),mix(24,100,shock),ramp(clock,1.87,2.04)*(1-ramp(clock,2.13,2.84))*.87);
    if(release>0){
      const reach=mix(175,242,ramp(clock,1.76,2.38));
      // The bright origin stays at the chest mouth; ray tips remain below title.
      screenSprite(fx.fan,mouthX,mouthY-reach*.43,reach*1.40,reach,release*.53);
      screenSprite(fx.trail,chestX-126,359,137,277,release*.40,-.37);
      screenSprite(fx.trail,chestX+133,354,118,253,release*.32,.51);
    }
    sc.save();
    const impact=clock>=1.93&&clock<2.22?Math.sin((clock-1.93)/.29*Math.PI)*.007:0;
    sc.translate(chestX,baseline);sc.scale(1+impact,1+impact);sc.translate(-chestX,-baseline);
    sc.drawImage(chestAt(opening,lidPoses),ox,oy,444*scale,444*scale);sc.restore();
    screenSprite(fx.glow,gemX,gemY,170,170,.04+.45*charge*breath+.25*flare);
    screenSprite(fx.glow,ox+224*scale,oy+98*scale,115,115,charge*.25*(1-opening));
    screenSprite(fx.glow,mouthX,mouthY,330+180*flare,220+100*flare,release*.16+flare*.78);
    // Gold motes gather into the lantern before the release.
    if(clock>.5&&clock<1.93){
      for(let i=0;i<14;i++){
        const p=clamp((clock-(.52+i*.044))/(.86-i*.014));
        if(p<=0||p>=1)continue;
        const a=i*2.399963+clock*.10,rad=mix(156+(i%4)*21,6,smooth(p));
        const x=gemX+Math.cos(a)*rad,y=gemY+Math.sin(a)*rad*.67-24*(1-p);
        screenSprite(fx.glint,x,y,12+(i%3)*5,12+(i%3)*5,Math.sin(p*Math.PI)*.82,a*.2);
      }
    }
    // Illustrated glints disperse upward and settle in a few restrained trails.
    if(clock>1.99&&clock<4.70){
      for(let i=0;i<26;i++){
        const age=clock-1.99-i*.012,life=1.05+(i%6)*.23,p=clamp(age/life);
        if(age<=0||p>=1)continue;
        const a=-Math.PI*.88+(i/25)*Math.PI*.76;
        const speed=120+(i%7)*24;
        const x=482+Math.cos(a)*speed*p,y=378+Math.sin(a)*speed*p+145*p*p;
        screenSprite(fx.glint,x,y,8+(i%5)*4,8+(i%5)*4,Math.sin(p*Math.PI)*.92,i*.8+p);
      }
    }
    if(emergence>0){
      const itemAlpha=ramp(clock,2.11,2.35);
      const trail=ramp(clock,2.18,2.42)*(1-ramp(clock,2.70,3.30));
      screenSprite(fx.trail,rewardX-70,rewardY+45,130,230,trail*.52,.75);
      screenSprite(fx.glow,rewardX,rewardY,itemSize*1.9,itemSize*1.9,itemAlpha*.23);
      // The crown stays upright, reflecting the Sovereign tier identity.
      sprite(sc,fx.wreath,rewardX,rewardY+float,365,365,arrival*.95);
      sprite(sc,fx.halo,rewardX,rewardY+float,355,355,arrival*.12,clock*.07);
      sprite(sc,fx.scroll,rewardX,rewardY+float,itemSize,itemSize,itemAlpha,mix(-.22,0,emergence));
      const arrivePulse=Math.exp(-Math.pow((clock-3.13)/.16,2));
      screenSprite(fx.sparks,rewardX,rewardY,316,316,arrivePulse*.80);
      for(let i=0;i<4;i++){
        const a=clock*.34+i*Math.PI/2,shimmer=.10+.14*Math.pow(Math.sin(clock*1.4+i),2);
        screenSprite(fx.glint,rewardX+Math.cos(a)*151,rewardY+Math.sin(a)*151,14,14,arrival*shimmer,a);
      }
    }
    const caption=ramp(clock,3.04,3.42);
    sc.save();sc.globalAlpha=caption;
    text(sc,'Ability Scroll',714,533+mix(14,0,caption),27,'#ffe2a7','Georgia','center');
    text(sc,'REWARD REVEALED',714,558+mix(14,0,caption),11,'#c8addc','Segoe UI','center');
    sc.restore();
    ctx.save();ctx.globalAlpha=opacity;ctx.drawImage(scene,0,0);ctx.restore();
  }
  const times=[0,1.25,1.80,1.98,2.22,2.62,3.14,3.62,5.0],snapshots=[];
  for(const t of times){draw(t);const file=path.join(OUT,`check-${t.toFixed(2)}.png`);fs.writeFileSync(file,canvas.toBuffer('image/png'));snapshots.push(file);}
  const contact=createCanvas(960,640),cc=contact.getContext('2d');
  for(let i=0;i<snapshots.length;i++)cc.drawImage(await loadImage(snapshots[i]),i%3*320,Math.floor(i/3)*640/3,320,640/3);
  fs.writeFileSync(path.join(OUT,'timing-contact-sheet.png'),contact.toBuffer('image/png'));
  draw(5.0);fs.writeFileSync(path.join(OUT,'reward-hold.png'),canvas.toBuffer('image/png'));
  if(process.argv.includes('--stills')){console.log('Saved revised timing stills.');return;}
  const encoder=new GifEncoder(W,H,{repeat:0,quality:3});let previous=null;
  for(let i=0;i<COUNT;i++){
    draw(i/FPS);
    const rgba=ctx.getImageData(0,0,W,H).data,pixels=new Uint32Array(rgba.buffer,rgba.byteOffset,W*H);
    let left=0,top=0,width=W,height=H;
    if(previous){
      let minX=W,minY=H,maxX=-1,maxY=-1;
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){const j=y*W+x;if(pixels[j]!==previous[j]){minX=Math.min(x,minX);maxX=Math.max(x,maxX);minY=Math.min(y,minY);maxY=Math.max(y,maxY);}}
      if(maxX<0){left=0;top=0;width=1;height=1;}
      else {left=Math.max(0,minX-2);top=Math.max(0,minY-2);width=Math.min(W-1,maxX+2)-left+1;height=Math.min(H-1,maxY+2)-top+1;}
    }
    const crop=ctx.getImageData(left,top,width,height).data;
    encoder.addFrame(new Uint8Array(crop.buffer,crop.byteOffset,crop.byteLength),width,height,{delay:20,left,top});
    previous=new Uint32Array(pixels);if(i%50===0)console.log(`Encoded ${i}/${COUNT}`);
  }
  const file=path.join(OUT,'sovereign-reveal-v2-50fps.gif'),gif=encoder.finish();fs.writeFileSync(file,gif);
  const meta=await sharp(file,{animated:true}).metadata();
  if(meta.pages!==COUNT||meta.delay.some(x=>x!==20)||meta.width!==W||meta.pageHeight!==H)throw new Error('GIF timing or dimensions differ from render');
  const ends=await Promise.all([0,COUNT-1].map(page=>sharp(file,{page,pages:1}).ensureAlpha().raw().toBuffer()));
  let difference=0;for(let i=0;i<ends[0].length;i++)difference+=Math.abs(ends[0][i]-ends[1][i]);
  const loopError=difference/ends[0].length;if(loopError>3)throw new Error('Loop boundary differs by '+loopError);
  await sharp(file,{page:99,pages:1}).png().toFile(path.join(OUT,'decoded-burst.png'));
  await sharp(file,{page:250,pages:1}).png().toFile(path.join(OUT,'decoded-reward.png'));
  const result={width:meta.width,height:meta.pageHeight,frames:meta.pages,fps:FPS,durationMs:meta.delay.reduce((a,b)=>a+b,0),loop:meta.loop,loopBoundaryMeanChannelError:loopError,bytes:gif.length};
  fs.writeFileSync(path.join(OUT,'validation.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})();
