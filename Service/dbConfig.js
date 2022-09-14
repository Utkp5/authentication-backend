const mongoose = require("mongoose");

const dbconnect = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/authentication", {
            useUnifiedTopology : true,
            useNewUrlParser : true,
        });

        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.log(`Error in Connecting to mongoDB ${error}`);
    }
};


module.exports = dbconnect;