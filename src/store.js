goog.provide('jdp.Store');
goog.provide('jdp.StoreTable');

goog.require('lf.structs.map');
goog.require('lf.type');
goog.require('jdp.structs.Vector');
goog.require('jdp.utils.codeGen');

jdp.Store = function () {
  /** @private {!lf.structs.Map<string, !jdp.StoreTable>} */
  this.tables_ = lf.structs.map.create();
  
  /** @private {} */
  this.stringDictionary = lf.structs.map.create();
};

/**
 *
 * @param {string} name
 * @param {!lf.structs.Map<string, !jdp.ColumnDefinition> | !Array<!jdp.ColumnDefinition>} columnDefinitions
 */
jdp.Store.prototype.createTable = function (name, columnDefinitions) {
  this.tables_.set(name, new jdp.StoreTable(name, columnDefinitions));
};

/**
 *
 * @returns {!lf.structs.Map<string, !jdp.StoreTable>}
 */
jdp.Store.prototype.getTables = function () {
  return this.tables_;
};


/**
 *
 * @param {string} name
 * @param {!lf.structs.Map<string, !jdp.ColumnDefinition> | !Array<!jdp.ColumnDefinition>} columnDefinitions
 * @constructor
 */
jdp.StoreTable = function (name, columnDefinitions) {
  /**
   * @private{string}
   */
  this.name_ = name;
  /**
   * @private {!lf.structs.Map.<string, !jdp.ColumnDefinition>}
   */
  this.columnDefinitions_ = null;
  /**
   * @type {!lf.structs.Map.<string, !jdp.structs.Vector>}
   * @private
   */
  this.columns_ = lf.structs.map.create();
  /**
   * @private {number} The current size
   */
  this.length_ = 0;

  if (columnDefinitions instanceof Array) {
    this.columnDefinitions_ = lf.structs.map.create();
    columnDefinitions.forEach(function (columnDefinition) {
      var name = columnDefinition.getName();
      this.columnDefinitions_.set(name, columnDefinition);
      this.columns_.set(name, new jdp.structs.Vector(lf.type.ArrayView[columnDefinition.getType()]));
    }, this);
  } else {
    this.columnDefinitions_ = columnDefinitions;
    columnDefinitions.forEach(function (_, columnDefinition, name) {
      this.columns_.set(name, new jdp.structs.Vector(lf.type.ArrayView[columnDefinition.getType()]));
    }, this);
  }
};

jdp.StoreTable.prototype.getColumnDefinitions = function () {
  return this.columnDefinitions_;
};

jdp.StoreTable.prototype.getColumns = function () {
  return this.columns_;
};

jdp.StoreTable.prototype.size = function () {
  return this.length_;
};

/**
 *
 * @param columnNames
 * @example
 * // returns function(order_id, cust_id)
 * store.getInserter(['order_id', 'cust_id']);
 */
jdp.StoreTable.prototype.getInserter = function (columnNames) {
  var i,
    columnReferenceName,
    code,
    columnReferencesDecl = [],
    valueCode,
    inserterParams = [],
    inserterBody = [];
  eval('var here = this;');
  this.columnDefinitions_.forEach(function (cd, cn) {
    columnReferenceName = 'col_' + cn;
    // var col_order_id = here.columns_.get('order_id');
    columnReferencesDecl.push({
      "type": "VariableDeclarator",
      "id": {
        "type": "Identifier",
        "name": columnReferenceName
      },
      "init": {
        "type": "CallExpression",
        "callee": {
          "type": "MemberExpression",
          "computed": false,
          "object": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": "here"
            },
            "property": {
              "type": "Identifier",
              "name": "columns_"
            }
          },
          "property": {
            "type": "Identifier",
            "name": "get"
          }
        },
        "arguments": [
          {
            "type": "Literal",
            "value": cn
          }
        ]
      }
    });
    if (columnNames.indexOf(cn) <= -1) {
      valueCode = {
        "type": "Literal",
        "value": null,
        "raw": "null"
      };
    } else {
      inserterParams.push({
        "type": "Identifier",
        "name": cn
      });

      switch (cd.getType()) {
        case lf.Type.DATE_TIME:
          valueCode = {
            "type": "CallExpression",
            "callee": {
              "type": "MemberExpression",
              "computed": false,
              "object": {
                "type": "NewExpression",
                "callee": {
                  "type": "Identifier",
                  "name": "Date"
                },
                "arguments": [
                  {
                    "type": "Identifier",
                    "name": cn
                  }
                ]
              },
              "property": {
                "type": "Identifier",
                "name": "getTime"
              }
            },
            "arguments": []
          };
          break;
        case lf.Type.INTEGER:
          valueCode = {
            "type": "Identifier",
            "name": cn
          };
          break;
        default:
          throw new Error('Type not implemented');
      }
    }
    // col_order_id.push(order_id);
    inserterBody.push({
      "type": "ExpressionStatement",
      "expression": {
        "type": "CallExpression",
        "callee": {
          "type": "MemberExpression",
          "computed": false,
          "object": {
            "type": "Identifier",
            "name": columnReferenceName
          },
          "property": {
            "type": "Identifier",
            "name": "push"
          }
        },
        "arguments": [valueCode]
      }
    });
  });
  // here.length_++;
  inserterBody.push({
    "type": "ExpressionStatement",
    "expression": {
      "type": "UpdateExpression",
      "operator": "++",
      "argument": {
        "type": "MemberExpression",
        "computed": false,
        "object": {
          "type": "Identifier",
          "name": "here"
        },
        "property": {
          "type": "Identifier",
          "name": "length_"
        }
      },
      "prefix": false
    }
  });
  code = escodegen.generate({
    "type": "Program",
    "body": [
      {
        "type": "VariableDeclaration",
        "declarations": columnReferencesDecl,
        "kind": "var"
      },
      {
        "type": "VariableDeclaration",
        "declarations": [
          {
            "type": "VariableDeclarator",
            "id": {
              "type": "Identifier",
              "name": "inserter"
            },
            "init": {
              "type": "FunctionExpression",
              "id": null,
              "params": inserterParams,
              "defaults": [],
              "body": {
                "type": "BlockStatement",
                "body": inserterBody
              },
              "generator": false,
              "expression": false
            }
          }
        ],
        "kind": "var"
      }
    ],
    "sourceType": "script"
  });
  eval(code);
  return inserter;
};

/**
 * @param {!Array<!Object>} objects - Plain javascript objects
 */
jdp.StoreTable.prototype.putSync = function (objects) {
  var i,
    j,
    obj,
    cd,
    value;

  for (i = 0; i < objects.length; i++) {
    obj = objects[i];
    for (j = 0; j < this.columnDefinitions_.length; j++) {
      cd = this.columnDefinitions_[j];
      switch (cd.getType()) {
        case lf.Type.DATE_TIME:
          value = obj[cd.getName()].getTime();
          break;
        case lf.Type.INTEGER:
          value = obj[cd.getName()];
          break;
        default:
          throw new Error('Type not implemented');
      }
      this.columns_.get(cd.getName()).push(value);
    }
    this.length_++;
  }
};
