goog.provide('jdp.proc.GroupStep');

goog.require('jdp.proc.Step');
goog.require('jdp.proc.CountAggregation');
goog.require('jdp.proc.SumAggregation');
goog.require('jdp.proc.AvgAggregation');
goog.require('jdp.ColumnDefinition');
goog.require('lf.Type');


/**
 * @implements {jdp.proc.Step}
 * @param {!jdp.proc.Step} childStep
 * @param {!Array<!jdp.ColumnDefinition>} columnDefinitions
 * @param aggregations
 * @constructor
 */
jdp.proc.GroupStep = function (childStep, columnDefinitions, aggregations) {
  /** @private {!jdp.proc.Step} */
  this.childStep_ = childStep;

  /** @private {jdp.pred.Predicate} */
  this.columnDefinitions_ = columnDefinitions;

  /** @private */
  this.aggregations_ = aggregations;
};

/**
 * @override
 * @param prefix
 */
jdp.proc.GroupStep.prototype.generateCode = function (prefix) {
  var code,
    innerBody = [],
    declarations,
    columnDefinitions,
    f;
  var i,
    cd,
    first = true,
    groupKey,
    agg,
    pGroupCode,
    pMap = prefix + '_map',
    pGroupKey = prefix + '_key',
    pGroup = prefix + '_group',
    pI = prefix + '_i',
    pValues = prefix + '_values';
  f = this.childStep_.generateCode(prefix + 'p');
  declarations = f.declarations;
  code = f.code;
  columnDefinitions = this.columnDefinitions_;
  declarations.push(
    jdp.utils.codeGen.declaration(pMap),
    jdp.utils.codeGen.declaration(pGroupKey),
    jdp.utils.codeGen.declaration(pGroup),
    jdp.utils.codeGen.declaration(pI),
    jdp.utils.codeGen.declaration(pValues)
  );
  code.unshift(
    jdp.utils.codeGen.parse(pMap + ' = lf.structs.map.create();')[0]
  );
  if(this.columnDefinitions_.length > 0){
    groupKey = '';
    for (i = 0; i < this.columnDefinitions_.length; i++) {
      cd = this.columnDefinitions_[i];
      if (first) {
        groupKey += '"" +' + cd.getFullName();
        first = false;
      } else {
        groupKey += '+ "+++" + ' + cd.getFullName();
      }
    }
    // p_groupKey = order___order_id + '+++' + order___cust_id;
    f.innerBody.push(jdp.utils.codeGen.parse(pGroupKey + '=' + groupKey + ';')[0]);
  } else {
    // p_groupKey = 'ONLY_GROUP';
    f.innerBody.push(jdp.utils.codeGen.parse(pGroupKey + '= "ONLY_GROUP";')[0]);
  }

  // if(!p_map.get(p_groupKey)){p_map.set(p_groupKey, {});}
  f.innerBody.push(
    {
      "type": "IfStatement",
      "test": {
        "type": "UnaryExpression",
        "operator": "!",
        "argument": {
          "type": "CallExpression",
          "callee": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": pMap
            },
            "property": {
              "type": "Identifier",
              "name": "get"
            }
          },
          "arguments": [
            {
              "type": "Identifier",
              "name": pGroupKey
            }
          ]
        },
        "prefix": true
      },
      "consequent": {
        "type": "BlockStatement",
        "body": [
          {
            "type": "ExpressionStatement",
            "expression": {
              "type": "CallExpression",
              "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "Identifier",
                  "name": pMap
                },
                "property": {
                  "type": "Identifier",
                  "name": "set"
                }
              },
              "arguments": [
                {
                  "type": "Identifier",
                  "name": pGroupKey
                },
                {
                  "type": "ObjectExpression",
                  "properties": []
                }
              ]
            }
          }
        ]
      },
      "alternate": null
    }
  );
  // p_group = p_map.get(p_groupKey);
  f.innerBody.push(
    {
      "type": "ExpressionStatement",
      "expression": {
        "type": "AssignmentExpression",
        "operator": "=",
        "left": {
          "type": "Identifier",
          "name": pGroup
        },
        "right": {
          "type": "CallExpression",
          "callee": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": pMap
            },
            "property": {
              "type": "Identifier",
              "name": "get"
            }
          },
          "arguments": [
            {
              "type": "Identifier",
              "name": pGroupKey
            }
          ]
        }
      }
    }
  );
  // <generateProcessingCode()>
  for (i = 0; i < this.aggregations_.length; i++) {
    agg = this.aggregations_[i];
    pGroupCode = {
      "type": "Identifier",
      "name": pGroup
    };
    f.innerBody.push(agg.generateProcessingCode(pGroupCode));
  }
  //p_map.forEach(function(value, key){ <innerBody> }, this);
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
            "name": pMap
          },
          "property": {
            "type": "Identifier",
            "name": "forEach"
          }
        },
        "arguments": [
          {
            "type": "FunctionExpression",
            "id": null,
            "params": [
              {
                "type": "Identifier",
                "name": "value"
              },
              {
                "type": "Identifier",
                "name": "key"
              }
            ],
            "defaults": [],
            "body": {
              "type": "BlockStatement",
              "body": innerBody
            },
            "generator": false,
            "expression": false
          },
          {
            "type": "ThisExpression"
          }
        ]
      }
    }
  );
  if(this.columnDefinitions_.length > 0){
    // p_values = key.split('+++');
    innerBody.push(
      {
        "type": "ExpressionStatement",
        "expression": {
          "type": "AssignmentExpression",
          "operator": "=",
          "left": {
            "type": "Identifier",
            "name": "p_values"
          },
          "right": {
            "type": "CallExpression",
            "callee": {
              "type": "MemberExpression",
              "computed": false,
              "object": {
                "type": "Identifier",
                "name": "key"
              },
              "property": {
                "type": "Identifier",
                "name": "split"
              }
            },
            "arguments": [
              {
                "type": "Literal",
                "value": "+++",
                "raw": "'+++'"
              }
            ]
          }
        }
      }
    );

    for (i = 0; i < this.columnDefinitions_.length; i++) {
      cd = this.columnDefinitions_[i];
      switch (cd.getType()) {
        case lf.Type.DATE_TIME:
        case lf.Type.INTEGER:
        case lf.Type.NUMBER:
          // order___order_id = parseFloat(p_values[0]);
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
                  "type": "CallExpression",
                  "callee": {
                    "type": "Identifier",
                    "name": "parseFloat"
                  },
                  "arguments": [
                    {
                      "type": "MemberExpression",
                      "computed": true,
                      "object": {
                        "type": "Identifier",
                        "name": pValues
                      },
                      "property": {
                        "type": "Literal",
                        "value": i
                      }
                    }
                  ]
                }
              }
            }
          );
          break;
        default:
          // order___order_id = p_values[0];
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
                  "computed": true,
                  "object": {
                    "type": "Identifier",
                    "name": pValues
                  },
                  "property": {
                    "type": "Literal",
                    "value": i
                  }
                }
              }
            }
          );
      }
    }
  }
  // count = value.count; | count = value.avg__sum/value.avg__count;
  for (i = 0; i < this.aggregations_.length; i++) {
    agg = this.aggregations_[i];
    innerBody.push(
      {
        "type": "ExpressionStatement",
        "expression": {
          "type": "AssignmentExpression",
          "operator": "=",
          "left": {
            "type": "Identifier",
            "name": agg.alias_
          },
          "right": agg.generateGetResultCode()
        }
      }
    );
    columnDefinitions.push(new jdp.ColumnDefinition(this.aggregations_[i].alias_, lf.Type.NUMBER));
    declarations.push(jdp.utils.codeGen.declaration(this.aggregations_[i].alias_));
  }
  return new jdp.proc.StepCodeFragment(code, innerBody, declarations, columnDefinitions);
};
