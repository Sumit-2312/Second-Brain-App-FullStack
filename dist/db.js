"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Links = exports.Contents = exports.Users = void 0;
const mongoose_1 = require("mongoose");
const Schema = mongoose_1.default.Schema;
const objectId = mongoose_1.default.Types.ObjectId;
const Model = mongoose_1.default.model;
const userSchema = new Schema({
    username: String,
    password: String,
});
const contentSchema = new Schema({
    link: String,
    type: String,
    title: String,
    tags: [{ type: objectId, ref: 'Tags' }],
    userId: { type: objectId, ref: 'Users' }
});
const TagsSchema = new Schema({
    userId: objectId,
    tag: String
});
const LinkSchema = new Schema({
    link: String,
    userId: { type: objectId, ref: 'Users', required: true, unique: true },
});
const UsersModel = Model('Users', userSchema);
exports.Users = UsersModel;
const contenModel = Model('Contents', contentSchema);
exports.Contents = contenModel;
const linkModel = Model('links', LinkSchema);
exports.Links = linkModel;
