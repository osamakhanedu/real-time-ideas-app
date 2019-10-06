const feathers = require("@feathersjs/feathers");
const express = require("@feathersjs/express");
const socketio = require("@feathersjs/socketio");
const moment = require("moment");

// A idea service that allows to create new
// and return all existing ideas
class IdeaService {
  constructor() {
    this.ideas = [];
  }

  async find() {
    // Just return all our idea
    return this.ideas;
  }

  async create(data) {
    // The new idea is the data merged with a unique identifier
    // using the idea length since it changes whenever we add one
    const idea = {
      id: this.ideas.length,
      text: data.text,
      tech: data.tech,
      viewer: data.viewer
    };
    idea.time = moment().format("h:mm:ss a");

    // Add new idea to the list
    this.ideas.push(idea);

    return idea;
  }
}

// Creates an ExpressJS compatible Feathers application
const app = express(feathers());

//Parse JSON
app.use(express.json());

// Host static files from the current folder
app.use(express.static(__dirname));

// Add REST API support
app.configure(express.rest());

// Configure Socket.io real-time APIs
app.configure(socketio());

// Register an in-memory messages service
app.use("/ideas", new IdeaService());

// Add any new real-time connection to the `everybody` channel
app.on("connection", connection => app.channel("everybody").join(connection));

// Publish all events to the `everybody` channel
app.publish(data => app.channel("everybody"));

const PORT = process.env.PORT || 3030;

// Start the server
app
  .listen(PORT)
  .on("listening", () =>
    console.log(`Feathers server listening on localhost:${PORT}`)
  );
