const express = require('express');
const mongoose  = require('mongoose');
const dotenv = require('dotenv');
const exhbs = require('express-handlebars');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Load config
dotenv.config({
    path : './config/config.env'
})
// Passport config
require('./config/passport')(passport);

// connect to database

connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended : false}));
app.use(express.json());

// Method override
app.use(
    methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
  )

// Logging
if(process.env.NODE_ENV == 'development'){
    app.use(morgan('dev'));
}
// handlebar helpers
const { formatDate , stripTags, truncate,editIcon,select } = require('./helpers/hbs'); 

// handlebars
app.engine('.hbs', exhbs.engine({ helpers : {
    formatDate,stripTags,truncate,editIcon,select

},defaultLayout : 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

// Sessions
app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        store : MongoStore.create({mongoUrl : process.env.MONGO_URI})
    })
)

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// set global variables
app.use(function(req, res, next){
    res.locals.user = req.user || null;
    next();

});

// Static folder
app.use(express.static(path.join(__dirname,'public')));

// Routes
app.use('/',require('./routes/index'));
app.use('/auth',require('./routes/auth'));
app.use('/blogs',require('./routes/blogs'));

const PORT = process.env.PORT || 5000;

app.listen(PORT,console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`));

