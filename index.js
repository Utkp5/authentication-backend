const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const logger = require("morgan");
var cors = require('cors')




const User = require("./models/user");

const dbConfig = require("./Service/dbConfig");
dbConfig();



app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));


const routes = require("./routes/userRoute");
app.use("/api",routes);



app.listen(PORT,function(error) {
    if (error) {
        console.log("Error in starting server");
    }
    console.log(`Server started successfully on PORT : ${PORT}`);
});