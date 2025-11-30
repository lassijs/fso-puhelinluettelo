const express = require('express')
const morgan = require('morgan')
const app = express()

let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": "1"
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": "2"
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": "3"
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": "4"
    }
  ]

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
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${String(Date())}</p>
  `)
})


app.get('/api/persons', (request, response) => {
    response.json(persons)
})


app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)

  if (person) response.json(person)
  else return response.status(404).end('<h1>404</h1>')
})


app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)

  if (person) {
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
  }
  else response.status(404).end()
})


app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Missing name or number'
    })
  }
  else if (persons.find(p => p.name === body.name)) {
    return response.status(400).json({
      error: 'Name already exists'
    })
  }
  
  const newId = Math.floor(Math.random() * 1000)
  const newPerson = {
    name: body.name,
    number: body.number,
    id: newId.toString()
  }
  persons = persons.concat(newPerson)

  response.json(newPerson)
})


const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`"Puhelinluettelo backend" running on port ${PORT}`)