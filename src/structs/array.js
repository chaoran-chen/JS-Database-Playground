/**
 * @license
 * Copyright 2015 The Lovefield Project Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Utility methods for binary insertion and binary removal.
 * Preferred instead of using goog.array since the latter adds siginficant
 * overhead, especially goog.array.binaryInsert, which eventually calls
 * goog.array.splice, which for no good reason is calling goog.array.slice,
 * degrading performance.
 */
goog.provide('lf.structs.array');


/**
 * @param {!Array<VALUE>} arr
 * @param {VALUE} value
 * @param {function(VALUE, VALUE): number=} opt_comparator
 * @return {number} Lowest index of the target value if found, otherwise
 *   (-(insertion point) - 1). The insertion point is where the value should
 *   be inserted into arr to preserve the sorted property.  Return value >= 0
 *   iff target is found.
 * @template VALUE
 * @private
 */
lf.structs.array.binarySearch_ = function(arr, value, opt_comparator) {
  var left = 0;
  var right = arr.length;
  var comparator = opt_comparator || lf.structs.array.defaultComparator_;
  while (left < right) {
    var middle = (left + right) >> 1;
    if (comparator(arr[middle], value) < 0) {
      left = middle + 1;
    } else {
      right = middle;
    }
  }

  // ~left is a shorthand for -left - 1.
  return left == right && arr[left] == value ? left : ~left;
};


/**
 * @param {number} lhs
 * @param {number} rhs
 * @return {number} Negative value if lhs < rhs, 0 if equal, positive value if
 *     lhs > rhs.
 * @private
 */
lf.structs.array.defaultComparator_ = function(lhs, rhs) {
  return lhs - rhs;
};


/**
 * @param {!Array<VALUE>} arr
 * @param {VALUE} value
 * @param {function(VALUE, VALUE): number=} opt_comparator
 * @return {boolean} Whether the value was inserted.
 * @template VALUE
 */
lf.structs.array.binaryInsert = function(arr, value, opt_comparator) {
  var index = lf.structs.array.binarySearch_(arr, value, opt_comparator);
  if (index < 0) {
    arr.splice(-(index + 1), 0, value);
    return true;
  }
  return false;
};


/**
 * @param {!Array<VALUE>} arr
 * @param {VALUE} value
 * @param {function(VALUE, VALUE): number=} opt_comparator
 * @return {boolean} Whether the value was removed.
 * @template VALUE
 */
lf.structs.array.binaryRemove = function(arr, value, opt_comparator) {
  var index = lf.structs.array.binarySearch_(arr, value, opt_comparator);
  if (index < 0) {
    return false;
  }

  arr.splice(index, 1);
  return true;
};
