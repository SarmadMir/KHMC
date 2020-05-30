const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

    const systemAdminSchema = new mongoose.Schema({
        uuid: {
            type: String
        },
        username: {
            type: String,
            required: [true, 'Please add username']
        },
        password: {
            type: String,
            required: [true, 'Please add password']
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    });

    // Encrypt password using bcrypt
    // systemAdminSchema.pre('save', async function() {    
    //     const salt = await bcrypt.genSalt(10);
    //     this.password = await bcrypt.hash(this.password, salt);
    // });

    // systemAdminSchema.pre('get', async function() {   
    //     console.log("get pre calles");
    //     // return await bcrypt.compare(enteredPassword, this.password);
    // });

module.exports = mongoose.model('systemAdmin', systemAdminSchema);
