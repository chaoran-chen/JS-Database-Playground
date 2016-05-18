goog.provide('jdp.proc.EquiJoinStep');

goog.require('jdp.proc.Step');
goog.require('jdp.ColumnDefinition');
goog.require('jdp.utils.codeGen');


/**
 * @implements {jdp.proc.Step}
 * @param {!jdp.proc.Step} childStepLeft
 * @param {!jdp.proc.Step} childStepRight
 * @param {!jdp.ColumnDefinition} leftKey
 * @param {!jdp.ColumnDefinition} rightKey
 * @constructor
 */
jdp.proc.EquiJoinStep = function (childStepLeft, childStepRight, leftKey, rightKey) {
  /** @private {!jdp.proc.Step} */
  this.childStepLeft_ = childStepLeft;

  /** @private {!jdp.proc.Step} */
  this.childStepRight_ = childStepRight;

  /** @private {!jdp.ColumnDefinition} */
  this.leftKey_ = leftKey;

  /** @private {!jdp.ColumnDefinition} */
  this.rightKey_ = rightKey;
};


/**
 * @override
 * @param prefix
 */
jdp.proc.EquiJoinStep.prototype.generateCode = function (prefix) {
  var code,
    innerBody = [],
    declarations,
    columnDefinitions = [],
    fl,
    fr;
  var pMap = prefix + '_map',
    pLeftTuple = prefix + '_leftTuple',
    leftTupleProperties = [],
    i,
    cd;
  fl = this.childStepLeft_.generateCode(prefix + 'l');
  fr = this.childStepRight_.generateCode(prefix + 'r');
  code = fl.code;
  declarations = fl.declarations.concat(fr.declarations);
  declarations.push(
    jdp.utils.codeGen.declaration(pMap)
  );
  code.unshift(
    jdp.utils.codeGen.parse(pMap + ' = lf.structs.map.create();')[0]
  );
  // [...] order___order_id: 1, order___cust_id: 24 [...]
  for (i = 0; i < fl.columnDefinitions.length; i++) {
    cd = fl.columnDefinitions[i];
    leftTupleProperties.push({
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
    });
  }
  // p_map.set(order___order_id, { [...] });
  fl.innerBody.push(
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
            "name": this.leftKey_.getFullName()
          },
          {
            "type": "ObjectExpression",
            "properties": leftTupleProperties
          }
        ]
      }
    }
  );
  code = code.concat(fr.code);
  // p_leftTuple = p_map.get(customer___cust_id);
  fr.innerBody.push(
    {
      "type": "ExpressionStatement",
      "expression": {
        "type": "AssignmentExpression",
        "operator": "=",
        "left": {
          "type": "Identifier",
          "name": pLeftTuple
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
              "name": this.rightKey_.getFullName()
            }
          ]
        }
      }
    }
  );
  // if(p_leftTuple !== undefined) { [...] }
  fr.innerBody.push(
    {
      "type": "IfStatement",
      "test": {
        "type": "BinaryExpression",
        "operator": "!==",
        "left": {
          "type": "Identifier",
          "name": pLeftTuple
        },
        "right": {
          "type": "Identifier",
          "name": "undefined"
        }
      },
      "consequent": {
        "type": "BlockStatement",
        "body": innerBody
      },
      "alternate": null
    }
  );
  // order___order_id = p_leftTuple.order___order_id
  for (i = 0; i < fl.columnDefinitions.length; i++) {
    cd = fl.columnDefinitions[i];
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
              "type": "Identifier",
              "name": pLeftTuple
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
  columnDefinitions = fl.columnDefinitions.concat(fr.columnDefinitions);
  return new jdp.proc.StepCodeFragment(code, innerBody, declarations, columnDefinitions);
};