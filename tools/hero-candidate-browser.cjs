// Offline concept catalogue validation; requires the repository's Playwright install.
const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),pack=path.join(root,'art/concepts/hero-candidates-v1');
(async()=>{
 const data=JSON.parse(fs.readFileSync(path.join(root,'docs/design/hero-gap-candidates.json'),'utf8'));
 const html=fs.readFileSync(path.join(root,'docs/design/hero-gap-profiles.html'),'utf8');
 const browser=await chromium.launch({executablePath:process.env.LF_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('data:'))requests.push(r.url())});
  await page.setContent(html);
  assert.equal(await page.locator('.portrait').count(),20);assert.equal(await page.locator('.concept img').count(),20);
  await page.evaluate(async()=>{const imgs=[...document.images];for(const im of imgs)im.loading='eager';await Promise.all(imgs.map(im=>im.decode()));if(imgs.some(im=>!im.naturalWidth))throw Error('Undecoded image')});
  for(const h of data.heroes){
   const card=page.locator('.card[data-rank="'+h.rank+'"]'),profile=page.locator('#'+h.id);
   assert.equal(await card.locator('.portrait').getAttribute('src'),'data:image/jpeg;base64,'+fs.readFileSync(path.join(pack,h.id+'.face.jpg')).toString('base64'));
   assert.equal(await profile.locator('.concept img').getAttribute('src'),'data:image/jpeg;base64,'+fs.readFileSync(path.join(pack,h.id+'.preview.jpg')).toString('base64'));
   await card.locator('.portrait-link').click();assert.equal(await page.evaluate(()=>location.hash),'#'+h.id);
   await card.locator('.open').click();assert.equal(await page.evaluate(()=>location.hash),'#'+h.id);
   assert.equal(await profile.locator('.skills li').count(),3);
   const download=await profile.locator('.concept a[download]').getAttribute('href');assert(fs.existsSync(path.resolve(root,'docs/design',download)));
  }
  assert.equal(await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).length),0);
  await page.locator('#shortlist-filter').click();assert.equal(await page.locator('.card:visible').count(),11);
  await page.locator('#family').selectOption('Ranger');assert.equal(await page.locator('.card:visible').count(),3);
  await page.locator('#search').fill('nonexistent hero');assert(await page.locator('#empty').isVisible());
  await page.locator('#search').fill('');await page.locator('#family').selectOption('');await page.locator('#shortlist-filter').click();
  await page.locator('#browse').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(pack,'catalogue-desktop.png')});
  for(const width of [390,740]){
   await page.setViewportSize({width,height:width===390?844:360});await page.locator('#browse').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:path.join(pack,'catalogue-'+width+'.png')});
  }
  const context=await browser.newContext({javaScriptEnabled:false});const nojs=await context.newPage();await nojs.setContent(html);
  for(const h of data.heroes){await nojs.locator('.card[data-rank="'+h.rank+'"] .portrait-link').click();assert.equal(await nojs.evaluate(()=>location.hash),'#'+h.id)}
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  const result={profiles:20,embeddedSheets:20,embeddedFaces:20,decodedImages:40,faceAndSheetMapping:'passed: exact preview bytes for each hero',nativeProfileLinks:40,javascriptDisabledPortraitLinks:20,originalPNGDownloadTargets:20,filters:'passed',mobileWidths:[390,740],horizontalOverflow:false,pageErrors:errors,externalRequests:requests,method:'Chromium setContent: managed environment blocks file://. Embedded previews and native fragment navigation validated, including JavaScript disabled.',artApproval:'None; pending concept drafts. Visual issues retained in review-notes.json and on profiles.'};
  fs.writeFileSync(path.join(pack,'browser-validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
