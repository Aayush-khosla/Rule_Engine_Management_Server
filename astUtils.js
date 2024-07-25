class Node {
    constructor(type, value = null, left = null, right = null) {
      this.type = type;
      this.value = value;
      this.left = left;
      this.right = right;
    }
  }
  
  function tokenize(ruleString) {
    const regex = /(\(|\)|AND|OR|[A-Za-z_]+\s*(>|<|=|>=|<=|!=)\s*['"]?[A-Za-z0-9_]+['"]?)/g;
    return ruleString.match(regex) || [];
  }
  
  function parseOperand(operandString) {
    const match = operandString.match(/([A-Za-z_]+)\s*(>|<|=|>=|<=|!=)\s*(['"]?[A-Za-z0-9_]+['"]?)/);
    if (match) {
      const [, attribute, operator, value] = match;
      return new Node('operand', {
        attribute: attribute.trim(),
        operator: operator.trim(),
        value: value.trim().replace(/['"]/g, ''),
      });
    }
    throw new Error('Invalid operand: ' + operandString);
  }
  
  function createAST(ruleString) {
    const tokens = tokenize(ruleString);
    if (tokens.length === 0) {
      throw new Error('Invalid rule string.');
    }
  
    function parseExpression(tokens) {
      let stack = [];
      const operators = ['AND', 'OR'];
      
      while (tokens.length > 0) {
        let token = tokens.shift();
  
        if (token === '(') {
          stack.push(parseExpression(tokens));
        } else if (token === ')') {
          break;
        } else if (operators.includes(token)) {
          while (stack.length > 1 && precedence(stack[stack.length - 2]) >= precedence(token)) {
            let right = stack.pop();
            let operator = stack.pop();
            let left = stack.pop();
            stack.push(new Node('operator', operator, left, right));
          }
          stack.push(token);
        } else {
          stack.push(parseOperand(token));
        }
      }
  
      while (stack.length > 1) {
        let right = stack.pop();
        let operator = stack.pop();
        let left = stack.pop();
        stack.push(new Node('operator', operator, left, right));
      }
  
      return stack[0] || null;
    }
  
    function precedence(operator) {
      return operator === 'AND' ? 1 : 2;
    }
  
    return parseExpression(tokens);
  }
  
  function combineRules(ruleStrings, operator = 'AND') {
    const asts = ruleStrings.map(createAST);
    if (asts.length === 0) return null;
    return asts.reduce((combinedAST, currentAST) => {
      if (!combinedAST) return currentAST;
      return new Node('operator', operator, combinedAST, currentAST);
    }, null);
  }
  
  function evaluateAST(node, data) {
    // console.log(node)
    if (!node) return false;
    if (node.type === 'operand') {
      const { attribute, operator, value } = node.value;
      const userValue = data[attribute];
  
      switch (operator) {
        case '>':
          return userValue > parseFloat(value);
        case '<':
          return userValue < parseFloat(value);
        case '>=':
          return userValue >= parseFloat(value);
        case '<=':
          return userValue <= parseFloat(value);
        case '=':
          return userValue == value;
        case '!=':
          return userValue != value;
        default:
          throw new Error('Unsupported operator: ' + operator);
      }
    } else if (node.type === 'operator') {
      const leftResult = evaluateAST(node.left, data);
      const rightResult = evaluateAST(node.right, data);
  
      if (node.value === 'AND') {
        return leftResult && rightResult;
      } else if (node.value === 'OR') {
        return leftResult || rightResult;
      }
    }
    return false;
  }
  function combineRuleTexts(ruleText1, ruleText2, operator = 'AND') {
    const trimmedRuleText1 = ruleText1.trim();
    const trimmedRuleText2 = ruleText2.trim();
    return `(${trimmedRuleText1}) ${operator} (${trimmedRuleText2})`;
  }

  module.exports = {
    Node,
    tokenize,
    parseOperand,
    createAST,
    combineRules,
    evaluateAST,
    combineRuleTexts
  };
  

// // Example usage
const rule1 = "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience >5)";


// // const rule2 = "((age > 30 AND department = 'Marketing')) AND (salary > 20000 OR experience > 5)";

const ast1 = createAST(rule1);
// // console.log('AST for Rule 1:', JSON.stringify(ast1, null, 2));
// // console.log('AST for Rule 1:', ast1);
const userData ={ age: 35, department: 'Sales', salary: 60000, experience: 3 };
// // console.log(ast1  , "        "  ,userData );
const ansfor1 = evaluateAST(ast1 , userData) ;
console.log('result : ' , ansfor1)
  