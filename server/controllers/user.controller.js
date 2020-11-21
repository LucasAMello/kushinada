const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/user.model');
const { v4: uuidv4 } = require('uuid');

const userSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9@$!%*#?&]{8,}$')).required(),
    repeatPassword: Joi.string().required().valid(Joi.ref('password'))
})

module.exports = {
    insert,
    verify
}

async function insert(user) {
    const validate = await userSchema.validate(user, { abortEarly: false });

    if (validate.error) {
        console.error(validate.error);
        if (validate.error.stack.indexOf('fails to match the required pattern') === -1)
            throw {
                message: 'Invalid request',
                data: validate.error
            };
        else
            throw {
                message: 'Password must contain 8 or more characters'
            };
    }

    user = validate.value;

    user.usernameLower = user.username.toLowerCase();
    user.email = user.email.toLowerCase();

    let find = { $or: [{ 'usernameLower': user.usernameLower }, { 'email': user.email }] };
    let users = await User.find(find);

    if (users.length > 0) {
        throw {
            message: 'Error: username or email is already in use.'
        };
    }

    user.hashedPassword = bcrypt.hashSync(user.password, 10);
    delete user.password;

    user.valid = false;
    user.validationCode = uuidv4();

    const count = await User.countDocuments();
    if (count == 0)
        user.roles = ["admin"];

    return await new User(user).save();
}

async function verify(validationCode) {
    const find = { 'validationCode': validationCode };
    const users = await User.find(find);

    if (users.length == 0) {
        throw {
            message: 'Error: user not found'
        };
    }

    const user = users[0];
    user.valid = true;

    return await new User(user).save();
}
