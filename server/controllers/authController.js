import bcrypt from 'bcryptjs';
import userModel from '../config/models/userModel.js';
import jwt from 'jsonwebtoken';
import { text } from 'express';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from '../config/emailTemplate.js';





const validRoles = ['admin', 'eleve', 'parent', 'prof'];
export const register = async (req,res)=>{
    const {name, email, password ,role}= req.body;
    if(!name || !email || !password || !role){
        return res.json({success:false,message: 'Missing Details'})
    }
    if (!validRoles.includes(role)){
        return res.json({success:false,message:'Invalid role'})};
    try{
        const existingUser = await userModel.findOne({email})
        if (existingUser){
           return res.json({success:false, message:"User already exists"});

        }
        const hashedPassword = await bcrypt.hash(password,10);

        const user = new userModel({name , email, password :hashedPassword,role});
        await user.save();
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token',token,{
            httpOnly:true,
            secure: process.env.NODE_ENV ==='production',
            sameSite:process.env.NODE_ENV ==='production' ? 'none':'strict',
            maxAge: 7*24*60*60*1000,
        });
        //sending welcome email
        const mailOptions = {
            from : process.env.SENDER_EMAIL,
            to: email,
            subject:'Bienvenue sur SCOLYZE ! ',
            text:`Bienvenue sur le site web de SCOLYZE ! Votre compte a bien été créé avec l'adresse e-mail suivante :${email}`
        }
        await transporter.sendMail(mailOptions);
        return res.json({success:true});

    }catch(error){
        res.json({success:false, message: error.message})
    }
}





export const login = async (req,res)=>{
    const {email,password}= req.body;
    if (!email || !password){
        return res.json({success: false,message:'Email and password are required'})

    }
    try {
        const user = await userModel.findOne({email});
        if (!user){
            return res.json({success:false,message:'invalid email'})
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if (!isMatch){
            return res.json({success:false,message:'invalid password'})
        }
        console.log(user.role);
        const token = jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token',token,{
            httpOnly:true,
            secure: process.env.NODE_ENV ==='production',
            sameSite:process.env.NODE_ENV ==='production' ? 'none':'strict',
            maxAge: 7*24*60*60*1000,
        });
        return res.json({success:true});


    }catch(error){
        return res.json({success:false, message:error.message});

    }
}



export const logout = async(req,res)=>{
    try{
        res.clearCookie('token',{
            httpOnly:true,
            secure: process.env.NODE_ENV ==='production',
            sameSite:process.env.NODE_ENV ==='production' ? 'none':'strict',
        })
        return res.json({success:true,message:"Logged Out"})

    }
    catch(error){
        return res.json({success:false,message:error.message});
    }
}





//send verificatio OTP to the user's email
export const sendVerifyOtp= async (req,res)=>{
    try {
        //req.body=req.body || {};
        const{userId}=req.body;
        const user= await userModel.findById(userId);
        if (user.isAccountVerified){
            return res.json({success:false,message:"Account Already verified"})
        }
       const otp =String( Math.floor(Math.random()*900000+100000));
       user.verifyOtp = otp;
       console.log("Requête reçue :", req.body);

       console.log(user.verifyOtp);
       user.verifyOtpExpireAt= Date.now()+24*60*60*1000;
       await user.save();
       console.log(user.verifyOtp);
       const mailOption={
        from : process.env.SENDER_EMAIL,
        to: user.email,
        subject:'Code de vérification du compte OTP ',
        text:`Voici votre code de vérification : ${otp} . Utilisez-le pour confirmer votre compte.`,
        html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)}
        await transporter.sendMail(mailOption);
        res.json({success:true,message:'Le code de vérification a été envoyé vers votre email'});

    }
    catch(error){
        res.json({success:false,message:error.message});
    }
}



export const verifyEmail = async(req,res)=>{
    const {userId,otp}=req.body;
    if (!userId || !otp){
        return res.json({success:false,message: 'Missing details'});

    }
    try{
        const user=await userModel.findById(userId);
        console.log(user.verifyOtp);
        if(!user){
            return res.json({success:false,message: 'User not found'});
        }
        if (user.verifyOtp === ''|| user.verifyOtp!==otp){
            console.log(user.verifyOtp ,otp,user.verifyOtp!==otp);
            return res.json({success:false,message: 'invalid OTP'});
        }
        if (user.verifyOtpExpireAt < Date.now()){
            return res.json({success:false,message: 'OTP Expired'});
        }
        user.isAccountVerified= true;
        user.verifyOtp='';
        user.verifyOtpExpiredAt=0;
        await user.save();
        return res.json({success: true, message:'email verified successfully'});
    }
    catch(error){
    return res.json({success:false,message:error.message});
    }
}




export const isAuthenticated =async (req,res)=>{
    try{

        return res.json({success:true});

    }
    catch(error){
        res.json({success:false,message:error.message});
    }
}





//send password reset otp
export const sendResetOtp = async(req,res)=>{
    const {email}=req.body;
    if(!email){
        return res.json({success:false, message:'Email is required'});
    }
    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false, message:'User not found'});
        }
        const otp =String( Math.floor(Math.random()*900000+100000));
        user.resetOtp = otp;
        console.log(user.verifyOtp);
        user.resetOtpExpireAt= Date.now()+20*60*1000;
        await user.save();
        const mailOption={
            from : process.env.SENDER_EMAIL,
            to: user.email,
            subject:'code de réinitialisation du mot de passe ',
            text:`Voici votre code de réinitialisation de mot de passe.${otp}.Utilisez ce code pour créer un nouveau mot de passe.`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        };
        await transporter.sendMail(mailOption);
        res.json({success:true,message:'Le code de réintialisation a été envoyé vers votre email'});

    }
    catch(error){
        res.json({success:false,message:error.message});
    }
}
//reset user password
export const resetPassword = async(req,res)=>{
    const{email,otp,newPassword}=req.body;
    if(!email || !otp||!newPassword){
        return res.json({success:false,message:'Email,OTP, and newpassword are requires'});

    }
    try{
        const user=await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:'user not found'});
        }
        if(user.resetOtp===""|| user.resetOtp!==otp){ 
            return res.json({success:false,message:'invalid otp'});

        }
        if(user.resetOtpExpireAt <Date.now()){
            return res.json({success:false,message:'otp expired'});
        }
        const hashedPassword= await bcrypt.hash(newPassword,10);
        user.password=hashedPassword;
        user.resetOtp="";
        user.resetOtpExpireAt=0;
        await user.save();
        return res.json({success:true,message:'password has been reset successfully'});
    }
    catch(error){
        res.json({success:false,message:error.message});
    }
}
















/* import userModel from "../config/models/userModel";

export const register = async (req,res)=>{
    const {name , email , password } = req.body;
    if(!name || !email || !password){
        return res.json({success:false,message:'User not found'});
    }
    }
    if (user.resetOtp === "" || userModel.resetOtp!==otp) {
         return res.json({success:false,message:'User not found'});

    }
    if (user.resetOtpExpireAt < Date.now()){
        return res.json({success:false,message:'OTP Expired'});
    }
    const hashedPassword= await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpireAt= 0;
    await user.save ();
    return res.json({success:true,message:'Password has been reset successfully'}); */