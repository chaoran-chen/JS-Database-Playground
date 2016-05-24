goog.provide('jdp.Query');


goog.require('jdp.proc.ScanStep');
goog.require('jdp.proc.SelectionStep');
goog.require('jdp.proc.CrossProductStep');
goog.require('jdp.proc.GroupStep');
goog.require('jdp.proc.CountAggregation');
goog.require('jdp.pred.Comparison');
goog.require('jdp.pred.comparison.Type');
goog.require('lf.structs.map');

jdp.Query = function (store, step) {
  this.store = store;
  this.step = step;
  this.results = [];
  this.executed_ = false;
};

/**
 *
 * @param {boolean} [collectResults=true] - if the results should be collected.
 */
jdp.Query.prototype.exec = function (collectResults) {
  if (this.executed_) {
    throw new Error('Query was already executed.');
  } else {
    this.executed_ = true;
  }
  var generationStartTime,
    generationTime,
    executionStartTime,
    executionTime,
    code,
    cd,
    valueCode,
    resultProperties = [],
    f;
  if (collectResults === undefined) {
    collectResults = true;
  }
  generationStartTime = new Date();
  f = this.step.generateCode('p');
  f.declarations.push(jdp.utils.codeGen.declaration('value'));
  if (collectResults) {
    for (var i = 0; i < f.columnDefinitions.length; i++) {
      cd = f.columnDefinitions[i];
      switch (cd.getType()) {
        case lf.Type.DATE_TIME:
          // new Date(order___order_id)
          valueCode = {
            "type": "NewExpression",
            "callee": {
              "type": "Identifier",
              "name": "Date"
            },
            "arguments": [
              {
                "type": "Identifier",
                "name": cd.getFullName()
              }
            ]
          };
          break;
        case lf.Type.INTEGER:
        case lf.Type.NUMBER:
        case lf.Type.STRING:
          // order___order_id
          valueCode = {
            "type": "Identifier",
            "name": cd.getFullName()
          };
          break;
        default:
          throw new Error('Type not implemented');
      }

      // [...] order___order_id: order___order_id [...]
      resultProperties.push(
        {
          "type": "Property",
          "key": {
            "type": "Identifier",
            "name": cd.getFullName()
          },
          "computed": false,
          "value": valueCode,
          "kind": "init",
          "method": false,
          "shorthand": false
        }
      );
    }
    // this.results.push({order___order_id: order___order_id});
    f.innerBody.push(
      {
        "type": "ExpressionStatement",
        "expression": {
          "type": "CallExpression",
          "callee": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "MemberExpression",
              "computed": false,
              "object": {
                "type": "ThisExpression"
              },
              "property": {
                "type": "Identifier",
                "name": "results"
              }
            },
            "property": {
              "type": "Identifier",
              "name": "push"
            }
          },
          "arguments": [
            {
              "type": "ObjectExpression",
              "properties": resultProperties
            }
          ]
        }
      }
    );
  }
  code = this.generate_(f.declarations, f.code);
  generationTime = new Date() - generationStartTime;
  executionStartTime = new Date();
  eval(code);
  executionTime = new Date() - executionStartTime;
  return {
    results: this.results,
    code: code,
    codeGenerationTime: generationTime,
    executionTime: executionTime
  };
};

jdp.Query.prototype.generate_ = function (declarations, code) {
  code.unshift({
    "type": "VariableDeclaration",
    "declarations": declarations,
    "kind": "var"
  });
  var program = {
    "type": "Program",
    "body": code,
    "sourceType": "script"
  };
  return escodegen.generate(program)
};
