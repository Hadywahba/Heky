import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum/index.js";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'FirstName is required'],
        minlength: [2, 'FirstName must be at least 2 characters'],
        maxlength: [20, 'FirstName must not exceed 20 characters'],
    },
    lastName: {
        type: String,
        required: [true, 'LastName is required'],
        minlength: [2, 'LastName must be at least 2 characters'],
        maxlength: [20, 'LastName must not exceed 20 characters'],
    },

    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true
    },

    password: {
        type: String,
        required: function () {
            return this.provider === ProviderEnum.SYSTEM;
        },
    },

    phone: {
        type: String,
        unique: true
    },
    DOB: Date,
    ChangeAllCredintialTime: Date,
    image: String,
    confirmEmail: {
        type: Date,
    },
    confirmEmailOTP: {
        type: String,
    },
    forgotpasswordOTP: {
        type: String,
    },
    coverimage: [String],
    gender: {
        type: Number,
        enum: Object.values(GenderEnum),
        default: GenderEnum.MALE
    },
    role: {
        type: Number,
        enum: Object.values(RoleEnum),
        default: RoleEnum.User
    },
    provider: {
        type: Number,
        enum: Object.values(ProviderEnum),
        default: ProviderEnum.SYSTEM
    },

}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    optimisticConcurrency: true,
    collection: "Users",
})

userSchema.virtual("userName").set(function (values) {
    const [firstName, lastName] = values?.split(" ") || [];
    this.set({ firstName, lastName })
}).get(function () {

    return `${this.firstName}  ${this.lastName}`
})

userSchema.virtual("age").get(function () {
    if (!this.DOB) return null;

    const today = new Date();
    const birthDate = new Date(this.DOB);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age;
});


export const UserModel = mongoose.models.User || mongoose.model("User", userSchema)