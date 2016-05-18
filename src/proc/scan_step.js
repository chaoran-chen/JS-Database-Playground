goog.provide('jdp.proc.ScanStep');

goog.require('jdp.proc.Step');
goog.require('jdp.ColumnDefinition');
goog.require('jdp.utils.codeGen');


/**
 * @implements {jdp.proc.Step}
 * @param {string} tableName
 * @param {!Array<jdp.ColumnDefinition>} columnDefinitions
 * @constructor
 */
jdp.proc.ScanStep = function (tableName, columnDefinitions) {
  this.tableName_ = tableName;
  this.columnDefinitions_ = columnDefinitions;
};


/**
 * @override
 * @param prefix
 */
jdp.proc.ScanStep.prototype.generateCode = function (prefix) {
  var code = [],
    declarations = [],
    innerBody,
    columnDefinitions = this.columnDefinitions_;
  var i, cd,
    valueAssignments = [];
  // declares p_table, p_i
  declarations.push(
    jdp.utils.codeGen.declaration(prefix + '_table'),
    jdp.utils.codeGen.declaration(prefix + '_i'));
  // p_table = this.store.getTables().get("tableName");
  code.push(
    {
      "type": "ExpressionStatement",
      "expression": {
        "type": "AssignmentExpression",
        "operator": "=",
        "left": {
          "type": "Identifier",
          "name": prefix + "_table"
        },
        "right": {
          "type": "CallExpression",
          "callee": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
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
                    "name": "store"
                  }
                },
                "property": {
                  "type": "Identifier",
                  "name": "getTables"
                }
              },
              "arguments": []
            },
            "property": {
              "type": "Identifier",
              "name": "get"
            }
          },
          "arguments": [
            {
              "type": "Literal",
              "value": this.tableName_
            }
          ]
        }
      }
    });

  for (i = 0; i < this.columnDefinitions_.length; i++) {
    cd = this.columnDefinitions_[i];
    // declares p_col_order_id, order___order_id
    declarations.push(
      jdp.utils.codeGen.declaration(prefix + '_col_' + cd.getName()),
      jdp.utils.codeGen.declaration(cd.getFullName()));
    // p_col_order_id = p_table.getColumns().get('order_id');
    code.push(
      {
        "type": "ExpressionStatement",
        "expression": {
          "type": "AssignmentExpression",
          "operator": "=",
          "left": {
            "type": "Identifier",
            "name": prefix + "_col_" + cd.getName()
          },
          "right": {
            "type": "CallExpression",
            "callee": {
              "type": "MemberExpression",
              "computed": false,
              "object": {
                "type": "CallExpression",
                "callee": {
                  "type": "MemberExpression",
                  "computed": false,
                  "object": {
                    "type": "Identifier",
                    "name": prefix + "_table"
                  },
                  "property": {
                    "type": "Identifier",
                    "name": "getColumns"
                  }
                },
                "arguments": []
              },
              "property": {
                "type": "Identifier",
                "name": "get"
              }
            },
            "arguments": [
              {
                "type": "Literal",
                "value": cd.getName()
              }
            ]
          }
        }
      });
    // order___order_id = p_col_order_id.get(p_i);
    valueAssignments.push(
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
            "type": "CallExpression",
            "callee": {
              "type": "MemberExpression",
              "computed": false,
              "object": {
                "type": "Identifier",
                "name": prefix + "_col_" + cd.getName()
              },
              "property": {
                "type": "Identifier",
                "name": "get"
              }
            },
            "arguments": [
              {
                "type": "Identifier",
                "name": prefix + "_i"
              }
            ]
          }
        }
      });
  }
  // for(p_i = 0; i < p_table.size(); i++){ <valueAssignments>, <innerBody> }
  code.push(
    {
      "type": "ForStatement",
      "init": {
        "type": "AssignmentExpression",
        "operator": "=",
        "left": {
          "type": "Identifier",
          "name": prefix + "_i"
        },
        "right": {
          "type": "Literal",
          "value": 0,
          "raw": "0"
        }
      },
      "test": {
        "type": "BinaryExpression",
        "operator": "<",
        "left": {
          "type": "Identifier",
          "name": prefix + "_i"
        },
        "right": {
          "type": "CallExpression",
          "callee": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": prefix + "_table"
            },
            "property": {
              "type": "Identifier",
              "name": "size"
            }
          },
          "arguments": []
        }
      },
      "update": {
        "type": "UpdateExpression",
        "operator": "++",
        "argument": {
          "type": "Identifier",
          "name": prefix+ "_i"
        },
        "prefix": false
      },
      "body": {
        "type": "BlockStatement",
        "body": valueAssignments
      }
    });
  innerBody = valueAssignments;
  return new jdp.proc.StepCodeFragment(code, innerBody, declarations, columnDefinitions);
};
