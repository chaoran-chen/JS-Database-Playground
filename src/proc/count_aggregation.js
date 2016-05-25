goog.provide('jdp.proc.CountAggregation');

goog.require('jdp.proc.Aggregation');
goog.require('jdp.utils.codeGen');


/**
 * @implements {jdp.proc.Aggregation}
 * @param {string} alias
 * @constructor
 */
jdp.proc.CountAggregation = function (alias) {
  this.alias_ = alias;
};

/** @override */
jdp.proc.CountAggregation.prototype.generateProcessingCode = function (groupCode) {
  var pGroupAggCode = {
    "type": "MemberExpression",
    "computed": false,
    "object": groupCode,
    "property": {
      "type": "Identifier",
      "name": this.alias_
    }
  };
  // if(p_group.count === undefined )
  return {
    "type": "IfStatement",
    "test": {
      "type": "BinaryExpression",
      "operator": "===",
      "left": pGroupAggCode,
      "right": {
        "type": "Identifier",
        "name": "undefined"
      }
    },
    // { p_group.count = 1; }
    "consequent": {
      "type": "BlockStatement",
      "body": [
        {
          "type": "ExpressionStatement",
          "expression": {
            "type": "AssignmentExpression",
            "operator": "=",
            "left": pGroupAggCode,
            "right": {
              "type": "Literal",
              "value": 1,
              "raw": "1"
            }
          }
        }
      ]
    },
    // else { p_group.count = p_group.count + 1; }
    "alternate": {
      "type": "BlockStatement",
      "body": [
        {
          "type": "ExpressionStatement",
          "expression": {
            "type": "AssignmentExpression",
            "operator": "=",
            "left": pGroupAggCode,
            "right": {
              "type": "BinaryExpression",
              "operator": "+",
              "left": pGroupAggCode,
              "right": {
                "type": "Literal",
                "value": 1,
                "raw": "1"
              }
            }
          }
        }
      ]
    }
  };
};

/** @override */
jdp.proc.CountAggregation.prototype.generateGetResultCode = function () {
  // value.count
  return jdp.utils.codeGen.parse('value.' + this.alias_)[0].expression;
};
