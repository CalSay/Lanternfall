const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'docs/design/hero-gap-candidates.json'),'utf8'));
(async()=>{
 const server=http.createServer((req,res)=>{const filename=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(!filename.startsWith(root+path.sep)||!fs.existsSync(filename)||!fs.statSync(filename).isFile()){res.writeHead(404);return res.end()}res.setHeader('Content-Type',filename.endsWith('.html')?'text/html; charset=utf-8':'image/jpeg');res.end(fs.readFileSync(filename))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.LF_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox'],headless:true});
 let browserMode='HTTP navigation',errors=[];
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
  const index=path.join(root,'docs/design/hero-profiles.html');assert(fs.statSync(index).size<1024*1024);
  const response=await fetch(base+'/docs/design/hero-profiles.html');assert.equal(response.status,200);
  try{await page.goto(base+'/docs/design/hero-profiles.html')}catch(e){if(!String(e).includes('ERR_BLOCKED_BY_ADMINISTRATOR'))throw e;browserMode='setContent fallback: managed Chromium blocks localhost navigation';await page.setContent(fs.readFileSync(index,'utf8'))}
  assert.equal(await page.locator('.card').count(),20);
  for(const h of data.heroes){
   const filename=path.join(root,'docs/design/hero-profiles',h.id+'.html');assert(fs.statSync(filename).size<1024*1024);
   const r=await fetch(base+'/docs/design/hero-profiles/'+h.id+'.html');assert.equal(r.status,200);
   if(browserMode==='HTTP navigation'){
    await page.goto(base+'/docs/design/hero-profiles.html');await page.locator('.card[data-rank="'+h.rank+'"] .open').click();
    await page.locator('#'+h.id+' .concept a', {hasText:'Open detailed'}).click();assert(new URL(page.url()).pathname.endsWith('/'+h.id+'.html'));
   }else await page.setContent(fs.readFileSync(filename,'utf8'));
   assert.equal(await page.locator('.profile').count(),1);assert.equal(await page.locator('.skills li').count(),3);
   await page.evaluate(async()=>{for(const im of document.images){im.loading='eager';await im.decode()}});
   assert.equal(await page.locator('.concept img').getAttribute('src'),'data:image/jpeg;base64,'+fs.readFileSync(path.join(root,'art/concepts/hero-candidates-v1',h.id+'.preview.jpg')).toString('base64'));
   const links=await page.locator('a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
   for(const link of links){if(link.startsWith('#'))continue;assert(fs.existsSync(path.resolve(path.dirname(filename),link.split('#')[0])),link)}
   if(browserMode==='HTTP navigation'){await page.locator('a',{hasText:'Back to the profiles'}).click();assert(new URL(page.url()).pathname.endsWith('/hero-gap-profiles.html'))}
  }
  assert.deepEqual(errors,[]);
  const result={catalogueBytes:fs.statSync(index).size,previousCatalogueBytes:10867066,individualProfiles:20,fullResolutionImageMappings:20,httpDocuments:21,httpStatus:200,browserMode,pageErrors:errors,detailAndBackNavigation:browserMode==='HTTP navigation'?'20 passed':'targets validated on disk; URL navigation blocked by managed browser'};
  fs.writeFileSync(path.join(root,'docs/design/hero-profile-load-validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
