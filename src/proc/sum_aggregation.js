goog.provide('jdp.proc.SumAggregation');

goog.require('jdp.proc.Aggregation');
goog.require('jdp.utils.codeGen');


/**
 * @implements {jdp.proc.Aggregation}
 * @param {string} alias
 * @param {jdp.ColumnDefinition | jdp.proc.arithmetic.Operator} column
 * @constructor
 */
jdp.proc.SumAggregation = function (alias, column) {
  this.alias_ = alias;
  this.column_ = column;
};

/** @override */
jdp.proc.SumAggregation.prototype.generateProcessingCode = function (groupCode) {
  var pGroupAggCode = {
    "type": "MemberExpression",
    "computed": false,
    "object": groupCode,
    "property": {
      "type": "Identifier",
      "name": this.alias_
    }
  };
  // if(p_group.sum === undefined )
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
    // { p_group.sum = orders___o_totalprice; }
    "consequent": {
      "type": "BlockStatement",
      "body": [
        {
          "type": "ExpressionStatement",
          "expression": {
            "type": "AssignmentExpression",
            "operator": "=",
            "left": pGroupAggCode,
            "right": this.column_.generateCode()
          }
        }
      ]
    },
    // else { p_group.sum = p_group.sum + orders___o_totalprice; }
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
              "right": this.column_.generateCode()
            }
          }
        }
      ]
    }
  };
};

/** @override */
jdp.proc.SumAggregation.prototype.generateGetResultCode = function () {
  // value.sum
  return jdp.utils.codeGen.parse('value.' + this.alias_)[0].expression;
};