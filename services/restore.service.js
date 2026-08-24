const {exec} = require('child_process');
const path = require('path');

exports.restoreBackup = (folderName)=>{
const dbURI = process.env.DB_URI;
const backupPath = path.join(__dirname,'..','backups',folderName,process.env.DB_NAME);

const command= `mongorestore --uri="${dbURI}" --drop --gzip "${backupPath}"`
exec(command, (error, stout,sterr)=>{
    if(error){
        console.log(error);
    }else{
        console.log('restore created');
        
    }
})
}