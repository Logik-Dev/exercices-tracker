const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./User');
const Exercice = require('./Exercice');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const path = require('path');


// DB Connect
mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useCreateIndex: true }
    , error => {
        if(error) console.log(error);
});

// Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use('/static', express.static(__dirname + '/public'));


// POST USER
app.post('/api/exercice/new-user', async (req, res) => {
    const username = req.body.username;
    try {
        let user = await User.findOne({username});
        if(user){
            res.json({error: 'Cet utilisateur existe !'})
        }
        else {
            const userId = shortid.generate();
            user = new User({
                username,
                userId
            });
            user = await user.save();
            if(user) res.json({
                username,
                userId
            });
        }
    }
    catch(error){
        console.log(error);
        res.json({error: "Impossible de sauvegarder l'utilisateur"});
    }
});

const transformDate = date =>  new Date(date.split('-').reverse().join('-'));


// POST EXERCICE
app.post('/api/exercice/add', async(req, res) => {
    // transform date
    const date = transformDate(req.body.date);
    const userId = req.body.userId;
    try {
        let user = await User.findOne({userId});
        // this id doesn't exists
        if(!user){
            res.json({error: 'Cet identifiant est inconnu!'})
        }
        // this user exist create Exercice
        else {

            const description = req.body.description,
                  duration    = parseInt(req.body.duration),
                  username    = user.username;
            let exercice = new Exercice({
                username,
                description,
                duration,
                date
            });
            exercice = await exercice.save();
            res.json({
                username: exercice.username,
                description: exercice.description,
                duration: exercice.duration,
                date: exercice.date.toDateString()
            })
        }
    }
    catch(error){
        console.log(error)
        res.json({error: JSON.stringify(error)})
    }
})

// GET
app.get('/api/exercice/log', async (req, res) => {
    const userId = req.query.userId,
          from   = req.query.from ? transformDate(req.query.from) : "1970-01-01",
          to     = req.query.to ? transformDate(req.query.to) : new Date(),
          limit  = req.query.limit ? parseInt(req.query.limit) : 1000;
    try{
        let user = await User.findOne({userId});
        if(user){
            // find exercice using lead() to obtain plain JS object
            Exercice
            .find({
                username: user.username,
                date: {
                 $gte: from,
                 $lte: to
                }})
            .limit(limit)
            .lean()
            .select("-__v -_id -username")
            .exec((err, docs) => {
                docs = docs.map(o => {
                    o.date = o.date.toDateString();
                    return o;
                });
                if(docs) res.json({
                    _id: userId,
                    username: user.username,
                    count: docs.length,
                    log: docs});
                else res.json({error: "Pas d'exercices correspondant"})
            })
            
        }
        else res.json({error: "Cet identifiant est inconnu!"});
    }
    catch(error){
        console.log(error)
        res.json({error: error})
    }
} )
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})
// Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=> {
    console.log('Le serveur écoute sur le port '+PORT );
})