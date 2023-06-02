require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Note = require('./models/note');

const app = express();

app.use(express.static('dist'));
app.use(express.json());
app.use(cors());

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

// Handlers

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes);
  })
})

app.get('/api/notes/:id', (req, res, next) => {
  Note.findById(req.params.id).then(note => {
    if (note) {
      res.json(note);
    } else {
      res.status(404).end()
    }
  }).catch(error => next(error))
})

app.post('/api/notes', (req, res) => {
  
  const body = req.body;

  if (body.content === undefined) {
    return res.status(400).json({error: 'content missing'})
  }

  const note = new Note({
    content: body.content,
    important: body.important || false
  })

  note.save().then(savedNote => {
    res.json(savedNote);
  })
})

app.delete('/api/notes/:id', (req, res) => {
  Note.findByIdAndRemove(req.params.id).then(result => {
    res.status(204).end()
  }).catch(error => next(error))
})

app.put('/api/notes/:id', (req, res, next) => {
  const body = req.body;
  const note = {
    content: body.content,
    important: body.important
  }

  Note.findByIdAndUpdate(req.params.id, note, {new: true}).then(updatedNote => {
    res.json(updatedNote)
  }).catch(error => next(error))
})

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})