const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const dir = path.join(__dirname,'assets');
fs.mkdirSync(dir,{recursive:true});
(async () => {
  const file = path.join(__dirname, 'sources', 'opening-keyframes.png');
  const meta = await sharp(file).metadata();
  for (let i=0; i<8; i++) {
    const x = Math.round(i%4*meta.width/4), y = Math.round(Math.floor(i/4)*meta.height/2);
    const right = Math.round((i%4+1)*meta.width/4), bottom = Math.round((Math.floor(i/4)+1)*meta.height/2);
    await sharp(file).extract({left:x,top:y,width:right-x,height:bottom-y}).resize(444,444).png().toFile(path.join(dir,`pose-${i}.png`));
  }
  const effects = path.join(__dirname, 'sources', 'reveal-effects.png');
  const m = await sharp(effects).metadata();
  for (const [i,name] of ['scroll','glow','sparks','halo'].entries()) {
    const x=Math.floor(i%2*m.width/2),y=Math.floor(Math.floor(i/2)*m.height/2);
    await sharp(effects).extract({left:x,top:y,width:Math.floor(m.width/2),height:Math.floor(m.height/2)}).png().toFile(path.join(dir,`${name}.png`));
  }
  console.log('Prepared eight poses and four illustrated assets.');
})();
