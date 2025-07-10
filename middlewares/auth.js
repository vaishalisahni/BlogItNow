const { validateToken } = require("../services/auth");

function checkForAuthentication(req,res,next)
{
    const tokenCookie=req.cookies?.token;
    req.user=null;
    if(!tokenCookie ){
        return next();
    }
    const token=tokenCookie;
    try{
        const userPayload=validateToken(token);
        req.user=userPayload;
    }
    catch(error){}
    return next();
}

module.exports={
    checkForAuthentication,
}