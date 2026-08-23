const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,

    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowecase:true,
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true,
        enum:['user','admin']
    }
},{
    timestamps:true
});

userSchema.pre('save', async function (next) {
    console.log('pre save',this.password);
    
    if(this.isModified('password'))
    {
        this.password = await bcrypt.hash(this.password,12);
    }
 
})

userSchema.methods.isCorrectPassword = async function (inputPassword) {
    return await bcrypt.compare(inputPassword,this.password);
}


module.exports = mongoose.model('User',userSchema);
    
//$2b$12$DxZwOCVF7OUK61JvQ6vjReK8IPCeGIMZvNY2km8uAX.PPYf9JXkZi
//$2b$12$XS0pkU655kuTdEJ2ji0sWeaAVgVQNTIveKis.knVNTE1WYJJZOJMa