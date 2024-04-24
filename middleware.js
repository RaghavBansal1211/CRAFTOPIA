module.exports.isLoggedIn=async (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error", "You must be logged in to rent your vehicle");
        return res.render("users/login.ejs"); // Corrected the path
    }
    next();
}




module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

// module.exports.