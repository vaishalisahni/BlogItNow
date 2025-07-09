const crypto = require('crypto');
const { randomBytes } = require('crypto');
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: { // this needs to be hashed - we use salt 
        type: String,
        required: true,
    },
    profileImageUrl: {
        type: String,
        default: '/images/default.png',
    },
    role: {
        type: String,
        enum: ["ADMIN", "USER"],
        default: "USER",
    }
}, { timestamps: true });

userSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified("password")) return;

    const salt = randomBytes(16).toString();
    const hashedPassword = crypto.createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

    this.salt=salt;
    this.password=hashedPassword;

    next();
})
// Virtual funct
userSchema.static('matchPassword', async function(email,password){
    const user= await this.findOne({email});

    if(!user) throw new Error("User not found");

    const salt=user.salt;
    const hashedPassword=user.password;

    const userProvidedHash=crypto.createHmac("sha256", salt)
    .update(password)
    .digest("hex");

    if(hashedPassword !== userProvidedHash) throw new Error("Incorrect Password");

    return user;
})

const User = model('user', userSchema);

module.exports = User;

