goog.provide('jdp.structs.Vector');


/**
 * This is a dynamic array based on a TypedArray.
 * @param {!function} vectorType - A constructor for a TypedArray, e.g. Int32Array
 * @param {number} [length=10] - The initial length
 * @constructor
 */
jdp.structs.Vector = function (vectorType, length) {
  if(length === undefined || length < 1){
    length = 10;
  }

  /** @private {!function} */
  this.vectorType_ = vectorType;

  /** @private {number} - The length of the underlying ArrayBuffer. */
  this.maxLength_ = length;

  /** @private {!TypedArray} */
  this.typedArray_ = new vectorType(this.maxLength_);

  /** @private {number} */
  this.numberElements_ = 0;
};

jdp.structs.Vector.prototype.reallocateVector_ = function (length) {
  var newArray,
    i;
  newArray = new this.vectorType_(length);
  for (i = 0; i < Math.max(length, this.numberElements_); i++) {
    newArray[i] = this.typedArray_[i];
  }
  this.typedArray_ = newArray;
  this.maxLength_ = length;
};

jdp.structs.Vector.prototype.push = function (value) {
  if (this.numberElements_ === this.maxLength_) {
    this.reallocateVector_(this.maxLength_ * 2 | 0);
  }
  this.typedArray_[this.numberElements_] = value;
  this.numberElements_++;
};

jdp.structs.Vector.prototype.get = function (index) {
  return this.typedArray_[index];
};

jdp.structs.Vector.prototype.size = function () {
  return this.numberElements_;
};
