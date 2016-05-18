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