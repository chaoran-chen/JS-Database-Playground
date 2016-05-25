goog.provide('jdp.proc.EquiJoinStep');

goog.require('jdp.proc.Step');
goog.require('jdp.ColumnDefinition');
goog.require('jdp.utils.codeGen');


/**
 * @implements {jdp.proc.Step}
 * @param {!jdp.proc.Step} childStepLeft
 * @param {!jdp.proc.Step} childStepRight
 * @param {!Array<{left: jdp.ColumnDefinition, right: jdp.ColumnDefinition}>} joinColumns
 * @constructor
 */
jdp.proc.EquiJoinStep = function (childStepLeft, childStepRight, joinColumns) {
  /** @private {!jdp.proc.Step} */
  this.childStepLeft_ = childStepLeft;

  /** @private {!jdp.proc.Step} */
  this.childStepRight_ = childStepRight;

  /** @private {!Array<{left: jdp.ColumnDefinition, right: jdp.ColumnDefinition}>} keyPairs */
  this.joinColumns_ = joinColumns;
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
    cd,
    kp,
    first,
    keyLeft, keyRight, keyLeftCode, keyRightCode;
  fl = this.childStepLeft_.generateCode(prefix + 'l');
  fr = this.childStepRight_.generateCode(prefix + 'r');
  code = fl.code;
  declarations = fl.declarations.concat(fr.declarations);
  declarations.push(
    jdp.utils.codeGen.declaration(pMap),
    jdp.utils.codeGen.declaration(pLeftTuple)
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
  keyLeft = '';
  keyRight = '';
  first = true;
  for (i = 0; i < this.joinColumns_.length; i++) {
    kp = this.joinColumns_[i];
    if (first) {
      keyLeft += '"" +' + kp.left.getFullName();
      keyRight += '"" +' + kp.right.getFullName();
      first = false;
    } else {
      keyLeft += '+ "+++" + ' + kp.left.getFullName();
      keyRight += '+ "+++" + ' + kp.right.getFullName();
    }
  }
  keyLeftCode = jdp.utils.codeGen.parse(keyLeft)[0].expression;
  keyRightCode = jdp.utils.codeGen.parse(keyRight)[0].expression;
  // p_map.set(order___order_id + '+++' + order___cust_id, { [...] });
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
          keyLeftCode,
          {
            "type": "ObjectExpression",
            "properties": leftTupleProperties
          }
        ]
      }
    }
  );
  code = code.concat(fr.code);
  // p_leftTuple = p_map.get(order2___order_id + '+++' + order2___cust_id);
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
          "arguments": [keyRightCode]
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