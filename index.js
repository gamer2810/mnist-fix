const express = require("express");
const expressHbs = require("express-handlebars");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const child_process = require("child_process");
const session = require("express-session");
const fs = require("fs");

const app = express();

app.use(express.static(__dirname + "/public"));
app.engine(
    "hbs",
    expressHbs({
        extname: "hbs",
        defaultLayout: "layout",
        layoutsDir: __dirname + "/views/layouts",
        partialsDir: __dirname + "/views/partials"
    })
);

app.set("view engine", "hbs");

// parse application/x-www-form-urlencoded
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

// parse application/json
app.use(bodyParser.json());
app.use(
    session({
        secret: "secret",
        saveUninitialized: false,
        resave: false
    })
);

app.use(flash());

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function(req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single("avatar");

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb("Error: Images Only!");
    }
}

app.get("/", (req, res) => {
    const flash = req.flash("result");
    let result = null;
    if (flash[0]) {
        result = JSON.parse(flash[0]);
        res.locals.result = result;
    }
    res.render("index");
});

app.post("/upload-base64", async (req, res) => {
    let base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");

    let filename = `uploads/input.png`;
    let filePath = "./public/uploads/input.png";

    fs.writeFileSync("./public/uploads/input.png", base64Data, "base64");

    let pythonProcess = child_process.spawn("python3", [
        "./public/ml/predict.py",
        filePath
    ]);
    pythonProcess.stdout.pipe(process.stdout);
    pythonProcess.stderr.pipe(process.stderr);
    let result = "";
    pythonProcess.stdout.on("data", data => {
        result += data.toString("utf8");
        console.log(`INFO::: python-data: ${result}`)
    });
    pythonProcess.on("exit", function() {
        result = result.substr(0, result.length - 1);
        result = result.split("\n");
        result = result.map(r => Number(r) * 100);
        let prediction = 0;
        result.forEach(
            (r, index) =>
                (prediction = r > result[prediction] ? index : prediction)
        );
        // req.flash("result", JSON.stringify(result));
        let response = { result, prediction };
        console.log(`INFO:::: predict.reponse ${JSON.stringify(response)}`)
        res.json(response);
    });
});

app.post("/upload", (req, res) => {
    upload(req, res, err => {
        if (err) {
            res.render("index", {
                msg: err
            });
        } else {
            if (req.file == undefined) {
                res.render("index", {
                    msg: "Error: No File Selected!"
                });
            } else {
                let filename = `uploads/${req.file.filename}`;
                let filePath = `./public/` + filename;
                let pythonProcess = child_process.spawn("python3", [
                    "./public/ml/predict.py",
                    filePath
                ]);
                pythonProcess.stdout.pipe(process.stdout);
                pythonProcess.stderr.pipe(process.stderr);
                let prediction = -1;
                pythonProcess.stdout.on("data", data => {
                    prediction = data.toString("utf8");
                });
                pythonProcess.on("exit", function() {
                    const result = { filename, prediction };
                    req.flash("result", JSON.stringify(result));
                    res.redirect("/");
                });
            }
        }
    });
});

app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), () => {
    console.log(`Server is listening on ${app.get("port")}`);
});
