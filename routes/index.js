const express = require('express');
const {ensureAuth ,ensureGuest} = require('../middleware/auth');
const router = express.Router();
const Blog = require('../models/Blog');
// Login/Landing Page
// route GET/

router.get('/',ensureGuest,(req,res)=>{
    res.render('login',{
        layout : 'login'
    });
});



// Dashboard Page
// route GET/dashboard

router.get('/dashboard',ensureAuth,async (req,res)=>{
    try {
        const blogs = await Blog.find({user : req.user.id}).lean();
        res.render('dashboard',{
            name : req.user.firstName,
            blogs
        });
    } catch (err) {
        console.log(err);
        res.render('errors/500');
    }
});

module.exports = router;