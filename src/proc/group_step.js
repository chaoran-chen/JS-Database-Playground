goog.provide('jdp.proc.GroupStep');
goog.provide('jdp.proc.CountAggregation');
goog.provide('jdp.proc.SumAggregation');

goog.require('jdp.proc.Step');
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
    pGroupAggCode,
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
  groupKey = '';
  for (i = 0; i < this.columnDefinitions_.length; i++) {
    cd = this.columnDefinitions_[i];
    if (first) {
      groupKey += '"" +' + cd.getFullName();
    } else {
      groupKey += '+ "+++" + ' + cd.getFullName();
    }
  }
  // p_groupKey = order___order_id + '+++' + order___cust_id;
  f.innerBody.push(jdp.utils.codeGen.parse(pGroupKey + '=' + groupKey + ';')[0]);
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
  // if(!p_group.count){ [...] } else { [...} }
  for (i = 0; i < this.aggregations_.length; i++) {
    agg = this.aggregations_[i];
    pGroupAggCode = {
      "type": "MemberExpression",
      "computed": false,
      "object": {
        "type": "Identifier",
        "name": pGroup
      },
      "property": {
        "type": "Identifier",
        "name": agg.alias_
      }
    };
    f.innerBody.push(
      {
        "type": "IfStatement",
        "test": {
          "type": "BinaryExpression",
          "operator": "!==",
          "left": pGroupAggCode,
          "right": {
            "type": "Identifier",
            "name": "undefined"
          }
        },
        "consequent": {
          "type": "BlockStatement",
          "body": [
            {
              "type": "ExpressionStatement",
              "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": pGroupAggCode,
                "right": agg.generateAddCode(pGroupAggCode)
              }
            }
          ]
        },
        "alternate": {
          "type": "BlockStatement",
          "body": [
            {
              "type": "ExpressionStatement",
              "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": pGroupAggCode,
                "right": agg.generateFirstCode(pGroupAggCode)
              }
            }
          ]
        }
      }
    );
    columnDefinitions.push(new jdp.ColumnDefinition(this.aggregations_[i].alias_, lf.Type.INTEGER));
    declarations.push(jdp.utils.codeGen.declaration(this.aggregations_[i].alias_));
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
  // order___order_id = p_values[0];
  for (i = 0; i < this.columnDefinitions_.length; i++) {
    cd = this.columnDefinitions_[i];
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
  // count = value.count;
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
          "right": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": "value"
            },
            "property": {
              "type": "Identifier",
              "name": agg.alias_
            }
          }
        }
      }
    );
  }
  return new jdp.proc.StepCodeFragment(code, innerBody, declarations, columnDefinitions);
};

/**
 *
 * @param {string} alias
 * @constructor
 */
jdp.proc.CountAggregation = function (alias) {
  this.alias_ = alias;
};

jdp.proc.CountAggregation.prototype.generateFirstCode = function (pGroupAggCode) {
  return {
    "type": "Literal",
    "value": 1,
    "raw": "1"
  };
};

jdp.proc.CountAggregation.prototype.generateAddCode = function (pGroupAggCode) {
  return {
    "type": "BinaryExpression",
    "operator": "+",
    "left": pGroupAggCode,
    "right": {
      "type": "Literal",
      "value": 1,
      "raw": "1"
    }
  };
};

/**
 *
 * @param {string} alias
 * @param {jdp.ColumnDefinition} columnDefinition
 * @constructor
 */
jdp.proc.SumAggregation = function (alias, columnDefinition) {
  this.alias_ = alias;
  this.columnDefinition_ = columnDefinition;
};

jdp.proc.SumAggregation.prototype.generateFirstCode = function (pGroupAggCode) {
  return {
    "type": "Identifier",
    "name": this.columnDefinition_.getFullName()
  };
};

jdp.proc.SumAggregation.prototype.generateAddCode = function (pGroupAggCode) {
  return {
    "type": "BinaryExpression",
    "operator": "+",
    "left": pGroupAggCode,
    "right": {
      "type": "Identifier",
      "name": this.columnDefinition_.getFullName()
    }
  };
};
