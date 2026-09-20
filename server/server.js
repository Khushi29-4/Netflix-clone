const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

const app = express();
const PORT = 3000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "../public")));


// ===============================
// MONGODB CONNECTION
// ===============================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
    });


// ===============================
// USER MODEL
// ===============================

const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },
myList: {
    type: [
        {
            title: String,
            image: String,
            video: String
        }
    ],
    default: []
},

continueWatching: {
    type: [
        {
            title: String,
            image: String,
            video: String,
            progress: Number,
            duration: Number
        }
    ],
    default: []
}
});

const User = mongoose.model("User", userSchema);


// ===============================
// TEST BACKEND
// ===============================

app.get("/api/test", (req, res) => {

    res.json({
        message: "Netflix backend is working!"
    });

});


// ===============================
// SIGN UP
// ===============================

app.post("/api/signup", async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {

            return res.status(400).json({
                message: "Email and password are required."
            });

        }

        // Check existing user
        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {

            return res.status(409).json({
                message: "An account with this email already exists."
            });

        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // Create user
        const newUser = new User({

            email: email.toLowerCase(),

            password: hashedPassword

        });

        await newUser.save();

        console.log(
            "New user registered:",
            email
        );

        res.status(201).json({

            message: "Account created successfully!"

        });

    } catch (error) {

        console.error(
            "SIGNUP ERROR:",
            error
        );

        res.status(500).json({

            message: error.message

        });

    }

});


// ===============================
// SIGN IN
// ===============================

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {

            return res.status(400).json({
                message: "Email and password are required."
            });

        }

        // Find user
        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {

            return res.status(401).json({
                message: "Invalid email or password."
            });

        }

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {

            return res.status(401).json({
                message: "Invalid email or password."
            });

        }

        // Create JWT
        const token = jwt.sign(

            {
                userId: user._id,
                email: user.email
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );

        // Store JWT in HTTP-only cookie
        res.cookie("token", token, {

            httpOnly: true,

            secure: false,

            sameSite: "lax",

            maxAge: 24 * 60 * 60 * 1000

        });

        console.log(
            "User signed in:",
            user.email
        );

        res.json({

            message: "Sign in successful!",

            email: user.email

        });

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error.message
        );

        res.status(500).json({

            message: "Server error. Please try again."

        });

    }

});


// ===============================
// CHECK LOGGED-IN USER
// ===============================

app.get("/api/me", async (req, res) => {

    try {

        const token = req.cookies.token;

        // No token
        if (!token) {

            return res.status(401).json({

                message: "Not logged in."

            });

        }

        // Verify JWT
        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        // Find user
        const user = await User.findById(
            decoded.userId
        ).select("-password");

        if (!user) {

            return res.status(401).json({

                message: "User not found."

            });

        }

        res.json({

            loggedIn: true,

            user: user

        });

    } catch (error) {

        res.status(401).json({

            message: "Invalid or expired login."

        });

    }

});

// ===============================
// GET MY LIST
// ===============================

app.get("/api/mylist", async (req, res) => {

    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Not logged in."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "User not found."
            });
        }

        res.json({
            myList: user.myList
        });

    } catch (error) {

        console.error("Get My List error:", error.message);

        res.status(401).json({
            message: "Invalid or expired login."
        });

    }

});


// ===============================
// ADD TO MY LIST
// ===============================

app.post("/api/mylist", async (req, res) => {

    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Not logged in."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

         const { title, image, video } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Movie title is required."
            });
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "User not found."
            });
        }

        const alreadyAdded = user.myList.some(
    movie => movie.title === title
);

if (!alreadyAdded) {

    user.myList.push({
        title: title,
        image: image,
        video: video
    });

    await user.save();

}

        res.json({
            message: "Added to My List.",
            myList: user.myList
        });

    } catch (error) {

        console.error("Add My List error:", error.message);

        res.status(500).json({
            message: "Server error."
        });

    }

});
// ===============================
// REMOVE FROM MY LIST
// ===============================

app.delete("/api/mylist/:title", async (req, res) => {

    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Not logged in."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const title = decodeURIComponent(req.params.title);

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "User not found."
            });
        }

        user.myList = user.myList.filter(
            movie => movie.title !== title
        );

        await user.save();

        res.json({
            message: "Removed from My List.",
            myList: user.myList
        });

    } catch (error) {

        console.error(
            "Remove My List error:",
            error.message
        );

        res.status(500).json({
            message: "Server error."
        });

    }

});
// ===============================
// GET CONTINUE WATCHING
// ===============================

app.get("/api/continue-watching", async (req, res) => {

    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Not logged in."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "User not found."
            });
        }

        res.json({
            continueWatching: user.continueWatching
        });

    } catch (error) {

        console.error(
            "Get Continue Watching error:",
            error.message
        );

        res.status(401).json({
            message: "Invalid or expired login."
        });

    }

});


// ===============================
// SAVE CONTINUE WATCHING
// ===============================

app.post("/api/continue-watching", async (req, res) => {

    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Not logged in."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const {
            title,
            image,
            video,
            progress,
            duration
        } = req.body;

        if (!title || !video) {
            return res.status(400).json({
                message: "Movie information is required."
            });
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "User not found."
            });
        }

        const existingMovie =
            user.continueWatching.find(
                movie => movie.title === title
            );

        if (existingMovie) {

            existingMovie.progress = progress;
            existingMovie.duration = duration;

        } else {

            user.continueWatching.push({

                title: title,
                image: image,
                video: video,
                progress: progress,
                duration: duration

            });

        }

        await user.save();

        res.json({

            message: "Watch progress saved.",

            continueWatching:
                user.continueWatching

        });

    } catch (error) {

        console.error(
            "Save Continue Watching error:",
            error.message
        );

        res.status(500).json({
            message: "Server error."
        });

    }

});
// ===============================
// LOGOUT
// ===============================

app.post("/api/logout", (req, res) => {

    res.clearCookie("token");

    res.json({

        message: "Logged out successfully."

    });

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(
        `Netflix server running at http://localhost:${PORT}`
    );

});