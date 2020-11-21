const mongoose = require('mongoose');

const GuideSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    videoId: { type: String },
    leaderId: { type: Number, required: true },
    sub1Id: { type: Number },
    sub2Id: { type: Number },
    sub3Id: { type: Number },
    sub4Id: { type: Number },
    helperId: { type: Number, required: true },
    badge: { type: Number },
    likes: [{ type: mongoose.Schema.Types.ObjectId }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId }],
    reports: [{ type: mongoose.Schema.Types.ObjectId }],
    description: { type: String },
    padDashFormation: { type: String },
    awaitingApproval: { type: Boolean },
    createdAt: { type: Date, default: Date.now }
}, {
    versionKey: false
});

module.exports = mongoose.model('Guide', GuideSchema);
