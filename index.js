const express = require('express');
const expressHbs = require('express-handlebars');
const multer = require('multer');
const app = express();
const path = require('path');
let models = require('./models');
const bodyParser = require('body-parser');

const child_process = require("child_process");


app.use(express.static(__dirname + '/public'));
app.engine('hbs', expressHbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
}));

app.set('view engine', 'hbs');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// parse application/json
app.use(bodyParser.json());

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('avatar');

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

app.get('/', (req, res) => {
    models.Users.findAll().then(users => {
        res.render('index', {
            users: users
        });
    });
});

app.get('/users', (req, res) => {
    res.render('user');
});

app.delete('/users/:id', (req, res) => {
    models.Users.destroy({
        where: {id: req.params.id}
    }).then(users => {
        res.sendStatus(200);
    });
})

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.render('index', {
                msg: err
            });
        } else {
            if (req.file == undefined) {
                res.render('index', {
                    msg: 'Error: No File Selected!'
                });
            } else {
                let filename = `uploads/${req.file.filename}`;
                let fullPath = "./upload-file-multer-master/public/" + filename;
                console.log(fullPath);
                let username = req.body.username;
                let pythonProcess= child_process.spawn('python',["./public/ml/predict.py",fullPath]);
                pythonProcess.stdout.pipe(process.stdout);
                pythonProcess.stderr.pipe(process.stderr);
                let prediction = -1;
                pythonProcess.stdout.on('data',(data)=>{
                    prediction = data;
                });
                pythonProcess.on('exit', function() {
                    models.Users.create({
                        username: username,
                        imagepath: filename,
                        prediction: prediction,
                    }).then(user => {
                        res.redirect('/');
                    });
                  });
            }
        }
    });
})

app.get('/sync', (req, res) => {
    models.sequelize.sync().then(() => {
        res.send('database create');
    });
});

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), () => {
    console.log(`Server is listening on ${app.get('port')}`);
});