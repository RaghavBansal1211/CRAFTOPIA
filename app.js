const express=require("express");
const ejs=require("ejs");
const mongoose=require("mongoose");
const path=require("path");
const methodoverride=require("method-override");
const ejsmate=require("ejs-mate");
const wrapasync=require("./utils/wrapasync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");

const user=require("./models/user.js");


//new
const session = require('express-session');
const passport=require("passport");
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');

const {isLoggedIn, saveRedirectUrl}=require("./middleware.js");
const sessionOptions = {
    secret: '@123', // Replace 'your-secret-key' with an actual secret key
    resave: false,
    saveUninitialized: true
    // Add other options as needed

};









const app=express();
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodoverride("_method"));
app.engine("ejs",ejsmate);  
app.use(express.static(path.join(__dirname,"/public")));

const port=3000;


const Listing=require("./models/listing.js");
const Review=require("./models/review.js");

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/alpha');
        console.log("Connected to Db");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
main();


app.listen(port,(req,res)=>{
    console.log('ported started');
})

const validation=(req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        const errmsg=error.details.map((el) =>el.message).join(',');
        throw new ExpressError(400,errmsg);
    }
    else{
       next();
    }

}
const reviewvalidation=(req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        const errmsg=error.details.map((el) =>el.message).join(',');
        throw new ExpressError(400,errmsg);
    }
    else{
       next();
    }

}





  //new 
  app.use(session(sessionOptions));
  app.use(flash()); 
app.use(passport.initialize());
app.use(passport.session());
 

passport.use(new LocalStrategy(user.authenticate()));



  
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.success = req.flash("success");
    res.locals.curruser = req.user;
     
     // Setting currUser correctly
     console.log(res.locals.curruser);
    next();
});



app.get('/', (req, res) => {
    res.render("./listings/home.ejs");
});


app.get("/listings",wrapasync(async (req,res)=>{
  const allListings=await Listing.find({});
  res.render("./listings/index.ejs",{allListings})
    
 }));
          
 app.get("/listings/new", isLoggedIn,(req, res) => {
   
    res.render("./listings/new.ejs");
});

app.get("/listings/:id",wrapasync(async (req,res)=>{
    const id=req.params.id;
    const listings=await Listing.findById(id).populate("owner").populate("reviews");
    console.log(listings);

    res.render("./listings/show.ejs",{listings})
}))



app.post("/listings",validation,wrapasync(async (req,res,next)=>{
  
    const title=req.body.title;
    const description=req.body.description;
    const image=req.body.image;
    const price=req.body.price;
    const location=req.body.location;
    
    const listing={ title:title,
        description:description,
        image:image,
        price:price,
       location:location
    }
       listing.owner=req.user._id;

       
    const listingg=new Listing(listing)
    

    await listingg.save();
    res.redirect("/listings")

  
}))

app.get("/listings/:id/edit", isLoggedIn,wrapasync(async (req,res)=>{
    const id=req.params.id;
    const listing=await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing})
}))

app.put("/listings/:id",isLoggedIn,validation,wrapasync(async (req,res)=>{
    const id=req.params.id;
    const listing=await Listing.findById(id);

    listing.title=req.body.title;
    listing.description=req.body.description;
    listing.image=req.body.image;
    listing.price=req.body.price;
    listing.location=req.body.location;



    await listing.save();

    res.redirect(`/listings`)
}))
app.delete("/listings/:id",isLoggedIn,wrapasync(async (req,res)=>{
    const id=req.params.id;
   await Listing.findByIdAndDelete(id);
   res.redirect("/listings");
}))




// app.get("/demo-user",async (req,res)=>{
//     let fakeUser=new user({
//         phno:9868472084,
//         username:"priyansh"
//     })
//     const newuser=await user.register(fakeUser,"ganesh");
//     console.log(newuser);
//     res.send(newuser);
// })
app.get("/signup",(req,res)=>{
    res.render("users/signup.ejs"); 
})

app.post("/signup",async (req,res)=>{
    try{
        let {username,phno,password}=req.body
        const newuser=await  new user({
             phno,
             username,
         })
         const registeredUser=await user.register(newuser,password);
         req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
          
            res.redirect("/listings");
         })
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }

})



app.get("/login",(req,res)=>{

    res.render("users/login.ejs")
})

app.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),async (req,res)=>{

    let redirectUrl=res.locals.redirectUrl || "/listings";
    console.log(redirectUrl);

    res.redirect(redirectUrl);

})

app.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","you are loggedout now");
        res.redirect("/");  
    })
})


app.post("/listings/:id/reviews", isLoggedIn,reviewvalidation,wrapasync(async(req, res) => {

    
        let listing = await Listing.findById(req.params.id);
       
        let comment = req.body.review;
        let rating = req.body.rating;
       
        let newReview = new Review({
            comment:comment,
            rating:rating
        });
        console.log(newReview)
          await newReview.save();
        
       listing.reviews.push(newReview);

      
        await listing.save();

       res.redirect(`/listings/${req.params.id}`);
   
}));


// app.delete("/listings/:id/reviews/:id",wrapasync(async(req,res)=>{
//     let {id,reviewId}=req.params;

//     await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
//     await Review.findByIdAndDelete(reviewId);

//     const listings=await Listing.findByIdAndUpdate(id);
//     res.redirect(`/listings/${id}`,{listings});

// }))





app.get("/payments", saveRedirectUrl,isLoggedIn,(req,res)=>{
    res.render("./payments/vehicle.ejs");
})

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
})

app.use((err,req,res,next)=>{
    const {status=500,message="Something went wrong"}=err;
    res.status(status).render("error.ejs",{err})
    // res.status(status).send(message)
})
