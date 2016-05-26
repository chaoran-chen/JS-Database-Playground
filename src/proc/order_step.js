goog.provide('jdp.proc.OrderStep');

goog.require('jdp.proc.Step');
goog.require('jdp.ColumnDefinition');
goog.require('jdp.utils.codeGen');
goog.require('lf.Order');


/**
 * @implements {jdp.proc.Step}
 * @param {!jdp.proc.Step} childStep
 * @param {!Array<{column: !jdp.ColumnDefinition, order: !lf.Order}>} columns
 * @constructor
 */
jdp.proc.OrderStep = function (childStep, columns) {
  /** @private {!jdp.proc.Step} */
  this.childStep_ = childStep;

  /** @private {!Array<{column: !jdp.ColumnDefinition, order: !lf.Order}>} */
  this.columns_ = columns;
};

/**
 * @override
 * @param prefix
 */
jdp.proc.OrderStep.prototype.generateCode = function (prefix) {
  var code,
    innerBody = [],
    declarations,
    columnDefinitions,
    f;
  var i,
    cd,
    resultProperties = [],
    order,
    sortFuncBody = [],
    minusOneCode,
    oneCode,
    pTuples = prefix + '_tuples',
    pI = prefix + '_i';
  f = this.childStep_.generateCode(prefix + 'p');
  declarations = f.declarations;
  code = f.code;
  declarations.push(
    jdp.utils.codeGen.declaration(pTuples),
    jdp.utils.codeGen.declaration(pI)
  );
  code.unshift(jdp.utils.codeGen.parse(pTuples + ' = [];')[0]);
  // Push all tuples in to a normal array.
  for (i = 0; i < f.columnDefinitions.length; i++) {
    cd = f.columnDefinitions[i];
    // [...] order___order_id: order___order_id [...]
    resultProperties.push(
      {
        "type": "Property",
        "key": {
          "type": "Identifier",
          "name": cd.getFullName()
        },
        "computed": false,
        "value": {
          "type": "Identifier",
          "name": cd.getFullName()
        },
        "kind": "init",
        "method": false,
        "shorthand": false
      }
    );
  }
  // p_tuples.push({order___order_id: order___order_id});
  f.innerBody.push(
    {
      "type": "ExpressionStatement",
      "expression": {
        "type": "CallExpression",
        "callee": {
          "type": "MemberExpression",
          "computed": false,
          "object": {
            "type": "Identifier",
            "name": pTuples
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
  // Sort the tuple array.
  // -1
  minusOneCode = jdp.utils.codeGen.parse('-1')[0].expression;
  oneCode = jdp.utils.codeGen.parse('1')[0].expression;
  for (i = 0; i < this.columns_.length; i++) {
    cd = this.columns_[i].column;
    order = this.columns_[i].order;
    // if(tuple1.o___o_totalprice < tuple2.o___o_totalprice){ return -1; } 
    // if(tuple1.o___o_totalprice > tuple2.o___o_totalprice){ return 1; }
    sortFuncBody.push(
      {
        "type": "IfStatement",
        "test": {
          "type": "BinaryExpression",
          "operator": "<",
          "left": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": "tuple1"
            },
            "property": {
              "type": "Identifier",
              "name": cd.getFullName()
            }
          },
          "right": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": "tuple2"
            },
            "property": {
              "type": "Identifier",
              "name": cd.getFullName()
            }
          }
        },
        "consequent": {
          "type": "BlockStatement",
          "body": [
            {
              "type": "ReturnStatement",
              "argument": order === lf.Order.ASC ? minusOneCode : oneCode
            }
          ]
        },
        "alternate": null
      },
      {
        "type": "IfStatement",
        "test": {
          "type": "BinaryExpression",
          "operator": ">",
          "left": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": "tuple1"
            },
            "property": {
              "type": "Identifier",
              "name": cd.getFullName()
            }
          },
          "right": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": "tuple2"
            },
            "property": {
              "type": "Identifier",
              "name": cd.getFullName()
            }
          }
        },
        "consequent": {
          "type": "BlockStatement",
          "body": [
            {
              "type": "ReturnStatement",
              "argument": order === lf.Order.ASC ? oneCode : minusOneCode
            }
          ]
        },
        "alternate": null
      }
    );
  }
  // return 0;
  sortFuncBody.push(
    {
      "type": "ReturnStatement",
      "argument": {
        "type": "Literal",
        "value": 0
      }
    }
  );
  // p_tuples.sort(function(tuple1, tuple2){ <sortFuncBody> })
  code.push(
    {
      "type": "ExpressionStatement",
      "expression": {
        "type": "CallExpression",
        "callee": {
          "type": "MemberExpression",
          "computed": false,
          "object": {
            "type": "Identifier",
            "name": pTuples
          },
          "property": {
            "type": "Identifier",
            "name": "sort"
          }
        },
        "arguments": [
          {
            "type": "FunctionExpression",
            "id": null,
            "params": [
              {
                "type": "Identifier",
                "name": "tuple1"
              },
              {
                "type": "Identifier",
                "name": "tuple2"
              }
            ],
            "defaults": [],
            "body": {
              "type": "BlockStatement",
              "body": sortFuncBody
            },
            "generator": false,
            "expression": false
          }
        ]
      }
    }
  );
  // Iterating through the sorted array.
  // for(p_i = 0; i < p_tuples.length; i++){ <innerBody> }
  code.push(
    {
      "type": "ForStatement",
      "init": {
        "type": "AssignmentExpression",
        "operator": "=",
        "left": {
          "type": "Identifier",
          "name": pI
        },
        "right": {
          "type": "Literal",
          "value": 0
        }
      },
      "test": {
        "type": "BinaryExpression",
        "operator": "<",
        "left": {
          "type": "Identifier",
          "name": pI
        },
        "right": {
          "type": "MemberExpression",
          "computed": false,
          "object": {
            "type": "Identifier",
            "name": pTuples
          },
          "property": {
            "type": "Identifier",
            "name": "length"
          }
        }
      },
      "update": {
        "type": "UpdateExpression",
        "operator": "++",
        "argument": {
          "type": "Identifier",
          "name": pI
        },
        "prefix": false
      },
      "body": {
        "type": "BlockStatement",
        "body": innerBody
      }
    }
  );
  // order___order_id = p_leftTuple.order___order_id
  for (i = 0; i < f.columnDefinitions.length; i++) {
    cd = f.columnDefinitions[i];
    innerBody.push(
      {
        "type": "ExpressionStatement",
        "expression": {
          "type": "AssignmentExpression",
          "operator": "=",
          "left": {
            "type": "Identifier",
            "name": cd.getFullName()
          },
          "right": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "MemberExpression",
              "computed": true,
              "object": {
                "type": "Identifier",
                "name": pTuples
              },
              "property": {
                "type": "Identifier",
                "name": pI
              }
            },
            "property": {
              "type": "Identifier",
              "name": cd.getFullName()
            }
          }
        }
      }
    );
  }
  return new jdp.proc.StepCodeFragment(code, innerBody, declarations, f.columnDefinitions);
};
