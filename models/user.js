const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    phno: {
        type: Number,
        required: true
    }
});

userSchema.plugin(passportLocalMongoose); // Apply passport-local-mongoose plugin

module.exports = mongoose.model("User", userSchema);
