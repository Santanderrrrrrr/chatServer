const mongoose = require('mongoose');

const server = '127.0.0.1:27017'
const db = 'mernChat'

exports._connect = async()=>{
    try{
        await mongoose.connect(`mongodb://${server}/${db}`)
        console.log('Database connection done!')
    }
    catch(err){
        console.log(`Connection failed with error message: ${err.message}`)
    }
}