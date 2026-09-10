const { exec } = require('child_process');
const path = require('path');
const logger = require('../utilities/logger.util');

exports.restoreBackup = (folderName) => {
  return new Promise((resolve, reject) => {
    const dbURI = process.env.DB_URI;
    const backupPath = path.join(__dirname, '..', 'backups', folderName, process.env.DB_NAME);
    const command = `mongorestore --uri="${dbURI}" --drop --gzip "${backupPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Restore failed: ${error.message}`);
        reject(error);
      } else {
        logger.info(`Backup restored from: ${folderName}`);
        resolve('Backup restored');
      }
    });
  });
};