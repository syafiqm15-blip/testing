const CONFIG = {
  spreadsheetId: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '',
  licenseSheet: 'LESEN',
  progressSheet: 'KEMAJUAN',
  sessionSeconds: 21600
};

function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Bandar Ceria: Misi Bahasa Melayu')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

function setupDatabase() {
  const ss = CONFIG.spreadsheetId ? SpreadsheetApp.openById(CONFIG.spreadsheetId) : SpreadsheetApp.create('Database Bandar Ceria');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  let licenses = ss.getSheetByName(CONFIG.licenseSheet) || ss.insertSheet(CONFIG.licenseSheet);
  if (!licenses.getLastRow()) {
    licenses.appendRow(['LICENSE_HASH','NAMA_PEMBELI','STATUS','HAD_PERANTI','PERANTI_JSON','TARIKH_CIPTA']);
    licenses.getRange('A1:F1').setFontWeight('bold').setBackground('#5b4bdb').setFontColor('#fff');
    licenses.setFrozenRows(1);
    licenses.appendRow([hash_('DEMO-BAHASA'),'Akaun Demo','ACTIVE',3,'[]',new Date()]);
  }
  let progress = ss.getSheetByName(CONFIG.progressSheet) || ss.insertSheet(CONFIG.progressSheet);
  if (!progress.getLastRow()) {
    progress.appendRow(['LICENSE_HASH','XP','SYILING','MISI_SELESAI','JAWAPAN_BETUL','DIKEMAS_KINI','STESEN']);
    progress.getRange('A1:F1').setFontWeight('bold').setBackground('#10b981').setFontColor('#fff');
    progress.setFrozenRows(1);
  }
  if (!progress.getRange(1,7).getValue()) progress.getRange(1,7).setValue('STESEN');
  return {spreadsheetUrl:ss.getUrl(), demoCode:'DEMO-BAHASA'};
}

function createLicense(buyerName, deviceLimit) {
  const code = 'BC-' + randomBlock_() + '-' + randomBlock_();
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    getSheet_(CONFIG.licenseSheet).appendRow([
      hash_(code), String(buyerName || 'Pembeli'), 'ACTIVE',
      Math.max(1, Math.min(Number(deviceLimit) || 2, 5)), '[]', new Date()
    ]);
  } finally { lock.releaseLock(); }
  return code;
}

function verifyLicense(code, deviceId) {
  code = String(code || '').trim().toUpperCase();
  deviceId = String(deviceId || '').trim();
  if (!code || !deviceId) return {ok:false,message:'Sila masukkan kod lesen.'};
  const sheet = getSheet_(CONFIG.licenseSheet), values = sheet.getDataRange().getValues();
  const targetHash = hash_(code); let rowIndex = -1;
  for (let i=1;i<values.length;i++) if (values[i][0] === targetHash) { rowIndex=i+1; break; }
  if (rowIndex < 0) return {ok:false,message:'Kod lesen tidak ditemui.'};
  const row = sheet.getRange(rowIndex,1,1,6).getValues()[0];
  if (String(row[2]).toUpperCase() !== 'ACTIVE') return {ok:false,message:'Lesen ini tidak aktif.'};
  const limit=Number(row[3])||1; let devices=[];
  try { devices=JSON.parse(row[4]||'[]'); } catch(e) {}
  const deviceHash=hash_(deviceId);
  if (!devices.includes(deviceHash)) {
    if (devices.length >= limit) return {ok:false,message:'Had peranti telah dicapai.'};
    const lock=LockService.getScriptLock(); lock.waitLock(10000);
    try { devices.push(deviceHash); sheet.getRange(rowIndex,5).setValue(JSON.stringify(devices)); }
    finally { lock.releaseLock(); }
  }
  const token=Utilities.getUuid()+Utilities.getUuid();
  CacheService.getScriptCache().put('SESSION_'+token,JSON.stringify({licenseHash:targetHash,buyer:row[1]}),CONFIG.sessionSeconds);
  return {ok:true,token:token,buyer:row[1],progress:loadProgressByHash_(targetHash)};
}

function saveProgress(token,payload) {
  const session=getSession_(token), data=payload||{};
  const row=[session.licenseHash,Math.max(0,Number(data.xp)||0),Math.max(0,Number(data.coins)||0),data.completed?'YA':'TIDAK',Math.max(0,Number(data.correct)||0),new Date(),Math.max(0,Math.min(Number(data.stage)||0,3))];
  const sheet=getSheet_(CONFIG.progressSheet), values=sheet.getDataRange().getValues(); let rowIndex=-1;
  for(let i=1;i<values.length;i++) if(values[i][0]===session.licenseHash){rowIndex=i+1;break;}
  const lock=LockService.getScriptLock(); lock.waitLock(10000);
  try { if(rowIndex>0) sheet.getRange(rowIndex,1,1,row.length).setValues([row]); else sheet.appendRow(row); }
  finally { lock.releaseLock(); }
  return {ok:true};
}

function getSession_(token) {
  const raw=CacheService.getScriptCache().get('SESSION_'+String(token||''));
  if(!raw) throw new Error('Sesi tamat. Sila muat semula dan log masuk.');
  return JSON.parse(raw);
}

function loadProgressByHash_(hash) {
  const values=getSheet_(CONFIG.progressSheet).getDataRange().getValues();
  for(let i=1;i<values.length;i++) if(values[i][0]===hash) return {xp:Number(values[i][1])||0,coins:Number(values[i][2])||0,completed:String(values[i][3]).toUpperCase()==='YA',correct:Number(values[i][4])||0,stage:Number(values[i][6])||0};
  return {xp:0,coins:0,completed:false,correct:0,stage:0};
}

function getSheet_(name) {
  const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if(!id) throw new Error('Jalankan setupDatabase() dahulu.');
  const sheet=SpreadsheetApp.openById(id).getSheetByName(name);
  if(!sheet) throw new Error('Sheet '+name+' tidak ditemui.');
  return sheet;
}

function hash_(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value))
    .map(b=>('0'+((b<0?b+256:b).toString(16))).slice(-2)).join('');
}
function randomBlock_() {
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let out='';
  for(let i=0;i<4;i++) out+=chars[Math.floor(Math.random()*chars.length)];
  return out;
}
