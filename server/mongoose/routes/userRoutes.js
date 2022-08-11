const router = require('express').Router()

// const { json } = require('express')
const userModel = require('../models/userModel')

//Creating a user
router.post('/', async(req, res) => {
    try{
        const { name, surname, password, email, picture} = req.body
        // console.log(req.body)
        const User = await userModel.create({name, surname, email, password, picture})
        res.status(201).json(User)
    } catch(e){
        let msg = e.code==11000? 'user already exists' : e.message
        console.log(e)
        res.status(400).json(msg)
    }
})

//Log in user
router.post('/login', async(req, res)=>{
    try{
        const {email, password } = req.body
        const User = await userModel.findByCredentials(email, password)
        User.status = 'online'
        await User.save()
        // console.log(User)
        res.status(200).json(User)
    }catch(e){
        res.status(400).json(e.message)
    }
})

module.exports= router