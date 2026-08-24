const { exec } = require('child_process');
const path = require('path');


exports.restoreBackup = (folderName) => {
    const dbURI = process.env.DB_URI;
    const backupPath = path.join(__dirname, '..', 'backups', folderName);
    const command = `mongorestore --uri="${dbURI}" --drop --gzip "${backupPath}"`;
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            else {
                console.log('backup restored');
                resolve('backup restored');
            }
        })
    })
}