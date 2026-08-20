const User= require('../models/user.model');

exports.getAllUsers =  async (req,res)=>{
const myUsers = await User.find();
res.status(200).json({message:'users list',data:myUsers});
}

exports.createUser = (role)=>{ 
    return async (req,res) => {
    const {name,email,password}= req.body;
    const myUser = await User.create({name,email,password,role});
    res.status(201).json({message:'user created',data:myUser})
}
}