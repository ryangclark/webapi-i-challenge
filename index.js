// import express from 'express';
const express = require('express');

// import db from './data/db';
const db = require('./data/db.js');

const server = express();

server.use(express.json());

server.post('/api/users', (req, res) => {
  const newUser = req.body;

  newUser.hasOwnProperty('name') && newUser.hasOwnProperty('bio')
  ? db.insert(req.body)
    .then(user => res.status(201).json(user))
    .catch(error => res.status(500).json({ message: `There was an error while saving user ${error} to the database` }))
  : res.status(400)
      .json({ errorMessage: "Please provide name and bio for the user." });
});

server.get('/api/users', (req, res) => {
  db.find()
    .then(userList => res.status(200).json(userList))
    .catch(error => res.status(500).json({ message: 'The users information could not be retrieved.' }));
});

server.get('/api/users/:id', (req, res) => {
  db.findById(req.params.id)
    .then(user => 
      user
        ? res.status(200).json(user)
        : res.status(404).json({ message: 'The user with the specified ID does not exist.' })
    )
    .catch(error => res.status(500)
      .json({ message: `Error retrieving user ${req.params.id}. ${error}` })
    );
});

server.delete('/api/users/:id', (req, res) => {
  db.remove(req.params.id)
    .then(deleted => {
      deleted === 1
        ? res.status(204).end()
        : res.status(404)
            .json({ message: 'The user with the specified ID does not exist.' });
    })
    .catch(error => res.status(500)
      .json({ message: `Error deleting user: ${req.params.id}` })
    );
});

server.put('/api/users/:id', (req, res) => {
  db.findById(req.params.id)
    .then(user => 
      user
      ? req.body.hasOwnProperty('name') || req.body.hasOwnProperty('bio')
        ? db.update(req.params.id, req.body)
          .then(updated => {
            if (updated) {
              db.findById(req.params.id)
                .then(user => res.status(200).json(user))
                .catch(() => res.status(500)
                  .json({ error: 'Update indicated as successful, error retrieving updated record from database.' })
                );
            }
          })
          .catch(error => res.status(500)
            .json({ error: 'The user information could not be modified.' })
          )
        : res.status(400).json({ errorMessage: 'Please provide name or bio for the user.'})
      : res.status(404)
          .json({ message: 'The user with the specified ID does not exist.'})
    )
    .catch(error => res.status(500)
      .json({ error: 'The user information could not be modified.' })
    );
});

server.listen(4000, () => console.log('** API running on port 4000 **'));