//find the token from a cokkie then find the userId from the token
import jwt from "jsonwebtoken";
const userAuth = async (req,res,next)=>{
    const{token}=req.cookies;
    
    if(!token){
        return res.json({success:false, message:"Not Authorized. Login Again"})
    }
    try{
        const tokenDecode =jwt.verify(token,process.env.JWT_SECRET);
        console.log("Token décodé :", tokenDecode);

        if(tokenDecode.id){
            //req.body.userId=tokenDecode.id
            req.userId = tokenDecode.id;
        }else{
            return res.json({success: false,message:'Not Authorized. Login Again'});
        }
        next()

    }
    catch(error){
        res.json({success:false,message:error.message});
    }
}
export default userAuth;