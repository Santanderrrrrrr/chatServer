const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')	

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        
        required: [true, "Can't be blank"]
    },
    surname:{
        type: String,
        required: [true, "Can't be blank"]
        
    },
    email:{
        type: String,
        lowercase: true,
        unique: true,
        index: true,
        validate: [isEmail, "invalid email"],
        required: true
    },
    password:{
        type: String,
        required:[ true, "Can not be blank"]
    },
    picture:{
        type: String,

    },
    newMessages:{
        type: Object,
        default: {}
    },
    status:{
        type: String,
        default: 'offline'
    }

},
{minimize: false})

//This is a pre-save function to hash the password before storing in database
//It uses next middleware
UserSchema.pre('save', function(next){
    const user = this
    if(!user.isModified('password')) return next()

    //Here, a salt is generated, then bound to the user.password and hashed
    const saltPromise = new Promise((resolve, reject) =>{
        bcrypt.genSalt(10, function(err, salt){
        if(err) reject(next(err))
        resolve(salt)
    })
    
    })
    saltPromise.then((salt)=>{
        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err)

            user.password = hash
            next()
        })
    })
        
})

//This is to remove the password when returning the user
UserSchema.methods.toJSON = function (){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

//Creating the custom method to return user by specific properties
UserSchema.statics.findByCredentials = async function(email, password){
    const user = await this.findOne({email}) 
    if(!user) throw new Error('Invalid email or password')

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) throw new Error('Invalid email or password')
    return user
}

module.exports = mongoose.model('User', UserSchema)