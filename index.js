// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Rule = require('./models/rules');
const Data = require('./models/data');
const { createAST, evaluateAST, combineRules,combineRuleTexts } = require('./astUtils'); // Import your AST functions

const app = express();
app.use(bodyParser.json());
const cors = require("cors"); 
app.use(cors({
  credentials: true,
  origin: true
})); 
app.use(express.json());
// Connect to MongoDB

const conn = async()=>{
    try{
        await mongoose.connect("mongodb+srv://aayush:aayush@cluster0.gpvettn.mongodb.net/rules_ast");
        console.log("DB connected ... ")
    }
    catch(err){
        console.error(err);
    }
}
conn();

// Add a new rule
app.post('/addrule', async (req, res) => {
  try {
    const { string } = req.body;
    const node = createAST(string);
    const rule = new Rule({ string, node });
    await rule.save();
    res.status(201).send(rule);

  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Add new data
app.post('/adddata', async (req, res) => {
  try {
    const {  string } = req.body;
    const data = new Data({ string });
    await data.save();
    res.status(201).send(data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// List all rules
app.get('/rules', async (req, res) => {
  try {
    const rules = await Rule.find();
    res.status(200).send(rules);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// List all data
app.get('/data', async (req, res) => {
  try {
    const data = await Data.find();
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Check a rule
app.get('/checkrule/:ruleid/:dataid', async (req, res) => {
    try {
      const { ruleid, dataid } = req.params;
      
      const rule = await Rule.findOne({ _id: ruleid });
      if (!rule) {
        return res.status(404).send({ error: 'Rule not found' });
      }
      
      const dataEntry = await Data.findOne({ _id: dataid });
      if (!dataEntry) {
        return res.status(404).send({ error: 'Data not found' });
      }
      
      console.log(dataEntry.string)

      const userData = JSON.parse(dataEntry.string);
       console.log(userData)
      const result = evaluateAST(rule.node, userData);
  
      res.status(200).send({ result });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });
  

// Combine rules
app.post('/combineRules', async (req, res) => {
    try {
      const { ruleIds, operator } = req.body;
  
      if (!ruleIds || !Array.isArray(ruleIds) || ruleIds.length !== 2) {
        return res.status(400).json({ error: 'Invalid input. Two rule IDs are required.' });
      }
  
      if (!operator || (operator !== 'AND' && operator !== 'OR')) {
        return res.status(400).json({ error: 'Invalid operator. Only "AND" or "OR" is allowed.' });
      }
  
      const rules = await Rule.find({ _id: { $in: ruleIds } });
  
      if (rules.length !== ruleIds.length) {
        return res.status(404).json({ error: 'Some rules not found.' });
      }
  
      const ruleTexts = rules.map(rule => rule.string);
      const newRuleText = combineRuleTexts(ruleTexts[0], ruleTexts[1], operator);
      const mynode = createAST(newRuleText);
      const newRule = new Rule({
        string: newRuleText,
        node: mynode
      });
  
      await newRule.save();
  
      res.status(200).json({ newRuleText, newRuleId: newRule._id });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/delrule/:id', async (req, res) => {
    try {
      const result = await Rule.findByIdAndDelete(req.params.id);
      if (!result) {
        return res.status(404).json({ error: 'Rule not found.' });
      }
      res.status(200).json({ message: 'Rule deleted successfully.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  app.delete('/deldata/:id', async (req, res) => {
    try {
      const result = await Data.findByIdAndDelete(req.params.id);
      if (!result) {
        return res.status(404).json({ error: 'Data not found.' });
      }
      res.status(200).json({ message: 'Data deleted successfully.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  
// Start the server..
app.listen(8080, () => {
  console.log(`Server running on 8080`);
});
