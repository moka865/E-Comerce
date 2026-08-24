const {exec} = require('child_process');
const path = require('path');
const fs = require('fs');

exports.createBackup = ()=>{
    const timeStamp = new Date().toISOString().replace(/[:.]/g,'-');
    const backupFolder = path.join(__dirname,'..','backups',`backup-${timeStamp}`);

    if(!fs.existsSync(backupFolder)){
        fs.mkdirSync(backupFolder,{recursive:true});
    }
    const dbURI = process.env.DB_URI;
    const command = `mongodump --uri="${dbURI}" --out="${backupFolder}" --gzip`;

    exec(command,(error,stdout,stderr)=>{
        if(error){
            console.log(error);
            
        }else{
            console.log('backup created');
            
        }
    })
}