import express from "express";
import cors from "cors";
import dotenv from 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js'




const app =express();
const port =process.env.port || 3000
connectDB();


const allowedOrigins=['http://localhost:3001']
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins,credentials:true}))

//API Endpoints
app.get('/',(req,res)=>res.send("API working fine"));
app.use('/api/auth',authRouter)
//app.use('/api/user', userRouter)


app.listen(port,()=> console.log(`server started on PORT:${port}`));








// Charger les variables d'environnement

// require('dotenv').config();

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();

// // Middlewares
// app.use(cors({origin: allowedOrigins,credentials:true}))
// app.use(express.json());
// app.use(cookieParser());

// // Connexion à MongoDB
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log("MongoDB connecté !"))
//     .catch(err => console.error("Erreur de connexion MongoDB :", err));

// // Route de test
// app.get('/', (req, res) => {
//     res.send('Backend HR HumanReach fonctionne !');
// });

// // Démarrer le serveur
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
