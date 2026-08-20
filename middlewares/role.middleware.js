exports.authorize=(...allowedRolre)=>{
    return (req,res,next)=>{
        if(!allowedRolre.includes(req.user.role)){
            return res.status(403).json({error:'Access denied'})
        }
        next();
    }

}