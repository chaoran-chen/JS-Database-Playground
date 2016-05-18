goog.provide('jdp.ColumnDefinition');

goog.require('lf.Type');


/**
 *
 * @param {string} name
 * @param {!lf.Type} type
 * @param {string} [alias]
 * @param {string} [tableAlias]
 * @constructor
 */
jdp.ColumnDefinition = function (name, type, alias, tableAlias) {
  this.name_ = name;
  this.type_ = type;
  this.alias_ = alias || name;
  this.tableName_ = tableAlias;
};

/**
 * @returns {string}
 */
jdp.ColumnDefinition.prototype.getName = function () {
  return this.name_;
};

/**
 * @returns {!lf.Type}
 */
jdp.ColumnDefinition.prototype.getType = function () {
  return this.type_;
};

/**
 * @returns {string}
 */
jdp.ColumnDefinition.prototype.getAlias = function () {
  return this.alias_;
};

/**
 * @param {string} alias
 */
jdp.ColumnDefinition.prototype.setAlias = function (alias) {
  this.alias_ = alias;
};

/**
 * @returns {string}
 */
jdp.ColumnDefinition.prototype.getTableAlias = function () {
  return this.tableName_;
};

/**
 * @returns {string}
 */
jdp.ColumnDefinition.prototype.getFullName = function () {
  if (goog.isDefAndNotNull(this.tableName_)) {
    return this.tableName_ + '___' + this.alias_;
  } else {
    return this.alias_;
  }
};

/**
 * @returns {jdp.ColumnDefinition}
 */
jdp.ColumnDefinition.prototype.copy = function () {
  return new jdp.ColumnDefinition(this.name_, this.type_, this.alias_, this.tableName_);
};