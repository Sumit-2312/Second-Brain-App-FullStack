"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose_1 = require("mongoose");
const db_1 = require("./db");
const utils_1 = require("./utils");
const cors = require("cors");
const app = express();
// @ts-ignore
app.use(cors());
app.use(express.json({ strict: false }));
mongoose_1.default.connect('mongodb+srv://Sumit:hdW2hmE1Tp9d3Gov@cluster0.wpjvi.mongodb.net/Second-Brain-App');
function auth(req, res, next) {
    const { token } = req.headers;
    if (!token) {
        res.json({ message: "Something went wrong" });
        return;
    }
    // @ts-ignore
    const decoded = jwt.verify(token, "SecretKey");
    if (!decoded) {
        res.json({ message: "Something went wrong" });
        return;
    }
    // @ts-ignore
    req.username = decoded.username;
    next();
}
app.post("/api/v1/Signup", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, password } = req.body;
            // Check if the user already exists
            const user = yield db_1.Users.findOne({ username });
            if (user) {
                res.status(409).json({ message: "User already exists" });
                return;
            }
            // Hash password
            const hashedPassword = yield bcrypt.hash(password, 5);
            // Create new user
            const newUser = yield db_1.Users.create({
                username,
                password: hashedPassword,
            });
            res.status(200).json({ message: "You are signed up", user: newUser });
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error", error: error });
        }
    });
});
app.post("/api/v1/Login", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, password } = req.body;
            // Find the user
            const user = yield db_1.Users.findOne({ username });
            if (!user) {
                res.status(404).json({ message: "No such user exists" });
                return;
            }
            // Compare passwords
            const isMatch = bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(401).json({ message: "Wrong credentials" });
                return;
            }
            // Generate token
            const token = jwt.sign({ username }, "SecretKey", { expiresIn: '1h' });
            res.status(200).json({
                message: "You are logged in",
                token,
            });
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    });
});
// app.use(auth);
app.post("/api/v1/Content", auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { link, title, type } = req.body;
        // @ts-ignore
        const username = req.username;
        const user = yield db_1.Users.findOne({ username });
        if (!user) {
            res.json({ message: "User not found" });
            return;
        }
        const isExist = yield db_1.Contents.findOne({ link, title, type });
        if (isExist) {
            res.status(404).json({ message: "Can not enter same entry again" });
            return;
        }
        const content = yield db_1.Contents.create({
            link,
            title,
            type,
            tags: [],
            userId: user._id
        });
        res.status(200).json({ message: "Content added", link: content.link });
    }
    catch (err) {
        res.json({ message: "Something went wrong in catch function" });
        return;
    }
}));
app.get("/api/v1/Content", auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const username = req.username;
        const user = yield db_1.Users.findOne({ username });
        // @ts-ignore
        const content = yield db_1.Contents.find({ userId: user._id });
        if (content.length === 0) {
            res.json({ message: "No content found" });
            return;
        }
        res.status(200).json({ content });
        return;
    }
    catch (err) {
        res.send(err);
        return;
    }
}));
app.delete("/api/v1/Content", auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const username = req.username;
        const contentId = req.body.contentId;
        const user = yield db_1.Users.findOne({ username });
        const deleted = yield db_1.Contents.deleteOne({ userId: user._id, _id: contentId });
        // @ts-ignore
        if (deleted.length === 0) {
            res.json({ message: "No content found" });
            return;
        }
        res.json({ message: "Content deleted", deleted });
    }
    catch (err) {
        res.json({ error: err.message });
        return;
    }
}));
app.post("/api/v1/brain/share", auth, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { share } = req.body;
            if (share) {
                //@ts-ignore
                const user = yield db_1.Users.findOne({ username: req.username });
                // generate the link 
                let link = (0, utils_1.default)((Math.random() * 10) + 10);
                // store it in the Link collection
                // @ts-ignore
                const Data = yield db_1.Links.create({
                    userId: user._id,
                    link,
                });
                res.json({ message: "Linked has been generated", link });
                return;
            }
            else {
                //@ts-ignore
                const deleted = yield db_1.Links.deleteOne({ username: req.username });
                //@ts-ignore
                if (deleted.length === 0) {
                    res.status(200).json({ message: "no link is being shared" });
                }
                res.status(200).json({ message: "Stopped sharing your Link" });
            }
        }
        catch (err) {
            res.json({ error: err.message });
            return;
        }
    });
});
app.get("/api/v1/brain/:shareLink", auth, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const hashLink = req.params.shareLink;
            const link = yield db_1.Links.findOne({ link: hashLink });
            if (!link) {
                res.status(404).json({ message: "Wrong input" });
                return;
            }
            const user = yield db_1.Users.findOne({ _id: link.userId });
            if (!user) {
                res.status(500).json({ message: "Something went wrong" });
                return;
            }
            const content = yield db_1.Contents.find({ userId: user._id });
            res.status(200).json({
                user: user.username,
                contents: content
            });
        }
        catch (err) {
            res.status(500).json({ error: err.message || "Something went wrong" });
        }
    });
});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
