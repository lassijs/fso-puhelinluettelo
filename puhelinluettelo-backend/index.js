require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()


morgan.token('req-body', function (req, res) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  else return null
})

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))


app.get('/', (request, response) => {
  response.send(`
    <h1>Puhelinluettelo</h1>
    <a href="/api/persons">/persons</a>
    <a href="/info">/info</a>
    <a href="/api/persons/1">/persons/1</a>
  `)
})


app.get('/info', (request, response) => {
  Person.find({})
    .then(people => {
      response.send(`
        <p>Phonebook has info for ${people.length} people</p>
        <p>${String(Date())}</p>
      `)
    })
})


// Get all people
app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

// Get one person
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      response.json(person)
    })
    .catch(error => next(error))
})

// Delete person
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


// Add new person
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Missing name or number'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })
  
  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error => next(error))
})


// Update phone number
app.put('/api/persons/:id', (request, response, next) => {
  const {name, number} = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) return response.status(404).end()

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    response.status(400).send({error: 'Malformatted id'})
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`"Puhelinluettelo backend" running on port ${PORT}`)