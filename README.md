# Rule Engine Server

This is a Node.js server that manages rules and data for a rule engine. It provides RESTful APIs to create, read, update, and delete rules and data stored in a MongoDB database. The server is built using Express.js and Mongoose for MongoDB interactions.

## Features

- **Add Rules**: Create rules with complex conditions.
- **Add Data**: Store user data that can be evaluated against rules.
- **List Rules and Data**: Retrieve all stored rules and data.
- **Evaluate Rules**: Evaluate user data against specific rules to determine if conditions are met.
- **Combine Rules**: Combine existing rules with logical operators to create new rules.

## Requirements

- Node.js (v14 or later)
- MongoDB (running instance or cluster)
- npm (Node package manager)
