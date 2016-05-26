goog.provide('jdp.proc.AvgAggregation');

goog.require('jdp.proc.Aggregation');
goog.require('jdp.utils.codeGen');


/**
 * @implements {jdp.proc.Aggregation}
 * @param {string} alias
 * @param {jdp.ColumnDefinition | jdp.proc.arithmetic.Operator} column
 * @constructor
 */
jdp.proc.AvgAggregation = function (alias, column) {
  this.alias_ = alias;
  this.column_ = column;
};

/** @override */
jdp.proc.AvgAggregation.prototype.generateProcessingCode = function (groupCode) {
  var pGroupAggSumCode = {
    "type": "MemberExpression",
    "computed": false,
    "object": groupCode,
    "property": {
      "type": "Identifier",
      "name": this.alias_ + '___sum'
    }
  };
  var pGroupAggCountCode = {
    "type": "MemberExpression",
    "computed": false,
    "object": groupCode,
    "property": {
      "type": "Identifier",
      "name": this.alias_ + '___count'
    }
  };
  // if(p_group.avg___sum === undefined )
  return {
    "type": "IfStatement",
    "test": {
      "type": "BinaryExpression",
      "operator": "===",
      "left": pGroupAggSumCode,
      "right": {
        "type": "Identifier",
        "name": "undefined"
      }
    },
    // { [...] }
    "consequent": {
      "type": "BlockStatement",
      "body": [
        // p_group.avg___sum = orders___o_totalprice;
        {
          "type": "ExpressionStatement",
          "expression": {
            "type": "AssignmentExpression",
            "operator": "=",
            "left": pGroupAggSumCode,
            "right": this.column_.generateCode()
          }
        },
        // p_group.avg___count = 1;
        {
          "type": "ExpressionStatement",
          "expression": {
            "type": "AssignmentExpression",
            "operator": "=",
            "left": pGroupAggCountCode,
            "right": {
              "type": "Literal",
              "value": 1,
              "raw": "1"
            }
          }
        }
      ]
    },
    // else { [...] }
    "alternate": {
      "type": "BlockStatement",
      "body": [
        // p_group.avg___sum = p_group.sum + orders___o_totalprice;
        {
          "type": "ExpressionStatement",
          "expression": {
            "type": "AssignmentExpression",
            "operator": "=",
            "left": pGroupAggSumCode,
            "right": {
              "type": "BinaryExpression",
              "operator": "+",
              "left": pGroupAggSumCode,
              "right": this.column_.generateCode()
            }
          }
        },
        // p_group.avg___count = p_group.avg___count + 1;
        {
          "type": "ExpressionStatement",
          "expression": {
            "type": "AssignmentExpression",
            "operator": "=",
            "left": pGroupAggCountCode,
            "right": {
              "type": "BinaryExpression",
              "operator": "+",
              "left": pGroupAggCountCode,
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
jdp.proc.AvgAggregation.prototype.generateGetResultCode = function (value) {
  // p_tuple.avg___sum/p_tuple.avg___count
  return jdp.utils.codeGen.parse(value + '.' + this.alias_ + '___sum / ' + value + '.' + this.alias_ + '___count')[0].expression;
};
