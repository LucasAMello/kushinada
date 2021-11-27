const escapeStringRegexp = require('escape-string-regexp');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const Guide = require('../models/guide.model');
const User = require('../models/user.model');
const nodemailer = require("nodemailer");
const config = require('../config/config');

const guideSchema = Joi.object({
    guideId: Joi.objectId().optional(),
    user: Joi.objectId().required(),
    title: Joi.string().required(),
    dungeonId: Joi.string().allow('', null).optional(),
    videoId: Joi.string().allow('', null).optional(),
    leaderId: Joi.number().integer().positive().required(),
    sub1Id: Joi.number().integer().positive(),
    sub2Id: Joi.number().integer().positive(),
    sub3Id: Joi.number().integer().positive(),
    sub4Id: Joi.number().integer().positive(),
    helperId: Joi.number().integer().positive().required(),
    badge: Joi.number().integer().allow(null).optional(),
    description: Joi.string().allow('', null).optional(),
    padDashFormation: Joi.string().allow('', null).optional(),
    version: Joi.number().integer().positive(),
});

module.exports = {
    insert,
    edit,
    like,
    dislike,
    report,
    approve,
    remove,
    getAll,
    get
}

const requireApproval = false;

async function insert(guide) {
    guide = await guideSchema.validate(guide, { abortEarly: false });

    if (guide.error) {
        console.error(guide.error);
        throw {
            message: 'Invalid request',
            data: guide.error
        };
    }

    const user = await User.findOne({ "_id": guide.value.user });
    if (!user) {
        throw {
            message: 'Error: User not found',
            data: guide.error
        };
    }

    if (requireApproval) {
        guide.value.awaitingApproval = user.roles.indexOf("trusted") == -1 && user.roles.indexOf("roles") == -1;
    } else {
        guide.value.awaitingApproval = false;
    }

    const savedGuide = await new Guide(guide.value).save();
    await notifyMe("Kushinada - New Guide", savedGuide.id);

    return savedGuide;
}

async function edit(body, user) {
    const guide = await Guide.findById(body.guideId);

    if (guide) {
        if (user.roles.indexOf("admin") !== -1 || guide.user._id.toString() === user._id.toString()) {
            body = await guideSchema.validate(body, { abortEarly: false });

            if (body.error) {
                console.error(body.error);
                throw {
                    message: 'Invalid request',
                    data: body.error
                };
            }

            if (requireApproval) {
                guide.awaitingApproval = user.roles.indexOf("trusted") == -1 && user.roles.indexOf("roles") == -1;
            } else {
                guide.awaitingApproval = false;
            }

            body = body.value;
            guide.title = body.title;
            guide.dungeonId = body.dungeonId;
            guide.videoId = body.videoId;
            guide.padDashFormation = body.padDashFormation;
            guide.leaderId = body.leaderId;
            guide.sub1Id = body.sub1Id;
            guide.sub2Id = body.sub2Id;
            guide.sub3Id = body.sub3Id;
            guide.sub4Id = body.sub4Id;
            guide.helperId = body.helperId;
            guide.description = body.description;
            guide.badge = body.badge;

            const savedGuide = await guide.save();
            await notifyMe("Kushinada - Guide Edited", savedGuide.id);

            return savedGuide;
        } else {
            throw {
                message: 'Unauthorized'
            };
        }
    } else {
        throw {
            message: 'Guide not found'
        };
    }
}

async function like(body) {
    const guide = await Guide.findById(body.guideId);

    if (guide) {
        let success = false;
        if (guide.likes.indexOf(body.userId) === -1) {
            guide.likes.push(body.userId);
            await guide.save();
            success = true;
        }

        if (guide.dislikes.indexOf(body.userId) !== -1) {
            guide.dislikes.remove(body.userId);
            await guide.save();
        }

        return { success };
    } else {
        throw {
            message: 'Guide not found'
        };
    }
}

async function dislike(body) {
    const guide = await Guide.findById(body.guideId);

    if (guide) {
        let success = false;
        if (guide.likes.indexOf(body.userId) !== -1) {
            guide.likes.remove(body.userId);
            await guide.save();
        }

        if (guide.dislikes.indexOf(body.userId) === -1) {
            guide.dislikes.push(body.userId);
            await guide.save();
            success = true;
        }

        return { success };
    } else {
        throw {
            message: 'Guide not found'
        };
    }
}

async function report(body) {
    const guide = await Guide.findById(body.guideId);

    if (guide) {
        let success = false;
        if (guide.reports.indexOf(body.userId) === -1) {
            guide.reports.push(body.userId);
            await guide.save();
            success = true;

            await notifyMe("Kushinada - New Report", guide.id);
        }

        return { success };
    } else {
        throw {
            message: 'Guide not found'
        };
    }
}

async function approve(body) {
    const guide = await Guide.findById(body.guideId);

    if (guide) {
        guide.awaitingApproval = false;
        await guide.save();

        return { success: true };
    } else {
        throw {
            message: 'Guide not found'
        };
    }
}

async function remove(body, user) {
    const guide = await Guide.findById(body.guideId);

    if (guide) {
        if (user.roles.indexOf("admin") !== -1 || guide.user._id.toString() === user._id.toString()) {
            Guide.deleteOne({ _id: body.guideId }, function (err) {
                if (err)
                    throw { message: err };
            });

            return { success: true };
        } else {
            throw {
                message: 'Unauthorized'
            };
        }
    } else {
        throw {
            message: 'Guide not found'
        };
    }
}

async function getAll(body) {
    let sort = body.order == 'recent' ? { 'createdAt': -1 } : { "likes": -1, "createdAt": -1 };

    let find = { $and: [] };

    if (body.title)
        find.$and.push({ 'title': { '$regex': escapeStringRegexp(body.title), '$options': 'i' } });

    if (body.leaderId) {
        if (body.transformId) {
            const arr = [ { 'leaderId': body.leaderId }, { 'helperId': body.leaderId } ];
            body.transformId.forEach(id => arr.push({ 'leaderId': id }, { 'helperId': id }))
            find.$and.push({ $or: arr });
        } else {
            find.$and.push({ $or: [{ 'leaderId': body.leaderId }, { 'helperId': body.leaderId }] });
        }
    }

    if (body.dungeonId) {
        find.$and.push({ 'dungeonId': body.dungeonId });
    }

    if (body.withVideo)
        find.$and.push({ 'videoId': { '$nin': [null, ''] } });

    if (body.withFormation)
        find.$and.push({ 'padDashFormation': { '$nin': [null, ''] } });

    if (body.awaitingApproval !== undefined) {
        if (body.user) {
            find.$and.push({ $or: [{ 'awaitingApproval': body.awaitingApproval }, { 'user': body.user }] });
        } else {
            find.$and.push({ 'awaitingApproval': body.awaitingApproval });
        }
    }

    if (body.showMine && body.user)
        find.$and.push({ 'user': body.user._id });

    if (find.$and.length == 0)
        find = {};

    return await Guide.find(find).sort(sort).limit(20).populate('user');
}

async function get(id) {
    return await Guide.find({ '_id': id });
}

async function notifyMe(event, guideId) {
    if (config.mailUser && config.mailPass) {
        const admin = await User.findOne({ "roles": "admin" });

        if (!admin)
            return;

        const link = config.siteUrl + "/admin?id=" + guideId;

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: config.mailUser,
                pass: config.mailPass
            }
        });

        transporter.sendMail({
            from: '"Kushinada" <kushinada.web@gmail.com>',
            to: admin.email,
            subject: event,
            text: "Follow the link: " + link,
            html: "Follow the link: <br><a href=" + link + ">" + link + "</a>",
        }, function (error, response) {
            if (error) {
                console.log('Error sending notification email: ' + error);
                res.json({ error });
            } else {
                if (response.accepted.length > 0)
                    res.json({ email: response.accepted[0] });
                else
                    res.json({ error: 'Email ' + user.email + ' did not accept the message.' });
            }
        });
    }
}