const { createBackup } = require('../services/backup.service');
const { restoreBackup } = require('../services/restore.service');
const catchAsync = require('../utilities/catchAsync.util');

exports.createBackup = catchAsync(async (req, res) => {
  const backupPath = await createBackup();
  res.status(200).json({ success: true, message: 'Backup created', data: { path: backupPath } });
});

exports.restore = catchAsync(async (req, res) => {
  const { folderName } = req.body;
  if (!folderName) {
    return res.status(400).json({ success: false, message: 'folderName is required' });
  }

  await restoreBackup(folderName);
  res.status(200).json({ success: true, message: 'Backup restored' });
});