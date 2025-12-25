const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose.connect(url, { family: 4 })
  .then(result => {
    console.log('Connected to MongoDB')
  })
  .catch(error => console.log('Error connecting to MongoDB: ', error.message))


const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    minlength: 8,
    maxLength: 15,
    validate: {
      validator: v => /^\d{2,3}-\d{6,}$/.test(v),
      message: 'Phone number format invalid'
    },
    required: true
  }
})

contactSchema.set('toJSON', {
  transform: (document, retObj) => {
    retObj.id = retObj._id.toString()
    delete retObj._id
    delete retObj.__v
  }
})


module.exports = mongoose.model('Person', contactSchema)