import mongoose from "mongoose";
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: "Please provide a valid email",
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        validate: {
            validator: function (value) {
                return validator.isStrongPassword(value, {
                    minLength: 6,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1
                })
            }
        }
    }
}, { timestamps: true })


userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10)
})


userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        id: this._id,
        email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:"15m"
    }
)
}

userSchema.methods.generateRefreshToken=  function(){
    return jwt.sign({
        id:this._id,
        email:this.email
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:"7d"
    }
);
}
export default mongoose.model('User', userSchema)