const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../utilities/logger.util');

exports.createBackup = () => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFolder = path.join(__dirname, '..', 'backups', `backup-${timestamp}`);

    if (!fs.existsSync(backupFolder)) {
      fs.mkdirSync(backupFolder, { recursive: true });
    }

    const dbURI = process.env.DB_URI;
    const command = `mongodump --uri="${dbURI}" --out="${backupFolder}" --gzip`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Backup failed: ${error.message}`);
        reject(error);
      } else {
        logger.info(`Backup created: ${backupFolder}`);
        resolve(backupFolder);
      }
    });
  });
};