const connectToDatabase = require('./db') // initialize connection

// simple Error constructor for handling HTTP error codes
function HTTPError (statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}
'use strict';

module.exports.hello = async (event, context) => {
  
  if(event.queryStringParameters && event.queryStringParameters.name){
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Hello ' + event.queryStringParameters.name + ' nice to meet you :D',
      }),
    }
  }

  if(event.httpMethod === "POST" && event.body){
    let json = JSON.parse(event.body);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Hi I have received a JSON object from you :D',
        object: json
      }),
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.healthCheck = async () => {
  await connectToDatabase()
  console.log('Connection successful.')
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Connection successful.' })
  }
}

module.exports.create = async (event) => {
  console.log("--------------------------")
  try {
    const { Note } = await connectToDatabase()
    const deserializedBody = JSON.parse(event.body)
    //deserializedBody = {}

    deserializedBody.hobbies = JSON.stringify(deserializedBody.hobbies)
    const note = await Note.create(deserializedBody)
    note.hobbies = JSON.parse(note.hobbies)
    return {
      statusCode: 200,
      body: JSON.stringify(note)
    }
  } catch (err) {
    return {

      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not create the note.'
    }
  }
}

module.exports.getOne = async (event) => {
  try {
    const { Note } = await connectToDatabase()
    
    const note = await Note.findById(event.pathParameters.id)
    note.hobbies = JSON.parse(note.hobbies)
    if (!note) throw new HTTPError(404, `Note with id: ${event.pathParameters.id} was not found`)
    return {
      statusCode: 200,
      body: JSON.stringify(note)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: err.message || 'Could not fetch the Note.'
    }
  }
}

module.exports.getAll = async () => {
  try {
    const { Note } = await connectToDatabase()
    const notes = await Note.findAll()
    return {
      statusCode: 200,
      body: JSON.stringify(notes)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not fetch the notes.'
    }
  }
}

module.exports.update = async (event) => {
  try {
    const input = JSON.parse(event.body)
    const { Note } = await connectToDatabase()
    const note = await Note.findById(event.pathParameters.id)
    if (!note) throw new HTTPError(404, `Note with id: ${event.pathParameters.id} was not found`)
    if (input.title) note.title = input.title
    if (input.description) note.description = input.description
    await note.save()
    return {
      statusCode: 200,
      body: JSON.stringify(note)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: err.message || 'Could not update the Note.'
    }
  }
}

module.exports.destroy = async (event) => {
  try {
    const { Note } = await connectToDatabase()
    const note = await Note.findById(event.pathParameters.id)
    if (!note) throw new HTTPError(404, `Note with id: ${event.pathParameters.id} was not found`)
    await note.destroy()
    return {
      statusCode: 200,
      body: JSON.stringify(note)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: err.message || 'Could destroy fetch the Note.'
    }
  }
}
