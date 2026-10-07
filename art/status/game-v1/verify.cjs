const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),path=require('node:path');
const root=__dirname,pack=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const data=vm.runInNewContext(fs.readFileSync(path.join(root,'status-icons.js'),'utf8')+';STATUS_ICONS');let count=0;
if(Object.keys(data).length!==15)throw Error('15 IDs required');
for(const [id,item] of Object.entries(pack.icons))for(const size of pack.sizes){const meta=item.files[size],raw=fs.readFileSync(path.join(root,meta.path));if(!raw.equals(Buffer.from(data[id][size].split(',')[1],'base64')))throw Error('embedded mismatch '+id);if(raw.readUInt32BE(16)!==size||raw.readUInt32BE(20)!==size)throw Error('size '+id);if(crypto.createHash('sha256').update(raw).digest('hex')!==meta.sha256)throw Error('hash '+id);count++;}
if(count!==90)throw Error('count');console.log('PASS:90 embedded PNGs match files, dimensions and hashes');
