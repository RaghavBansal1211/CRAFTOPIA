const mongoose=require("mongoose");
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/alpha');
}   
main().then(()=>{
    console.log("connected");
}
).catch((err)=>{
    console.log(err);
})

const dataa=require("../init/data.js");
const listing = require("../models/listing");


async function connect(){
    await listing.deleteMany({});
    dataa.data=dataa.data.map((obj)=>({...obj,owner:"65f37ed45bf772046e379712"}))
    await listing.insertMany(dataa.data)


}

connect().then(()=>{
    console.log("data saved");
}).catch((err)=>{
    console.log(err);
})