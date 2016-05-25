goog.provide('jdp.utils.codeGen');

/**
 * @param {string} variableName
 * @returns {object} - Statement
 */
jdp.utils.codeGen.declaration = function(variableName){
  return {
    "type": "VariableDeclarator",
    "id": {
      "type": "Identifier",
      "name": variableName
    },
    "init": null
  };
};

/**
 * 
 * @param {string} code
 * @returns {!Array<object>} - An array of Statements.
 */
jdp.utils.codeGen.parse = function(code){
  return esprima.parse(code).body;
};


jdp.utils.codeGen.identifier = function(name){
  return {
    "type": "Identifier",
    "name": name
  };
};

jdp.utils.codeGen.literal = function(value){
  return {
    "type": "Literal",
    "value": value
  };
};
