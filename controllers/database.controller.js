const {createBackup} = require('../services/backup.service');
const {restoreBackup} = require('../services/restore.service');
exports.createBackup= (req,res)=>{
   try{
    createBackup()
res.status(200).json({message:'backup ceated'})
   }catch(err){
res.status(500).json({error:err.message});
   }
}

exports.restore=(req,res)=>{
    try{
    const folderName = req.body.folderName;
    restoreBackup(folderName);
    res.status(200).json({message:'backup restored '});
    }
    catch(err){
        res.status(500).json({error:'restore error'})
    }
}