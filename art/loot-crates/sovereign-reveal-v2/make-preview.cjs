const fs=require('fs');
const path=require('path');
const sharp=require('sharp');
(async()=>{
  const out=path.join(__dirname,'out','sovereign-reveal-v2-preview.gif');
  await sharp(path.join(__dirname,'out','sovereign-reveal-v2-50fps.gif'),{animated:true})
    .resize({width:720})
    .gif({reuse:false,effort:3,dither:.15,interFrameMaxError:1,interPaletteMaxError:3,keepDuplicateFrames:true})
    .toFile(out);
  const m=await sharp(out,{animated:true}).metadata();
  if(m.pages!==400||m.delay.some(x=>x!==20)||m.width!==720||m.pageHeight!==480)throw new Error('Preview timing/dimensions changed');
  await sharp(out,{page:250,pages:1}).png().toFile(path.join(__dirname,'out','decoded-preview.png'));
  const result={width:m.width,height:m.pageHeight,frames:m.pages,fps:50,durationMs:m.delay.reduce((a,b)=>a+b,0),bytes:fs.statSync(out).size};
  fs.writeFileSync(path.join(__dirname,'out','preview-validation.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
})();
