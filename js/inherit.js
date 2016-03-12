'use strict';

  function inherit(child, parent) {
    function EmptyConstructor() {}
    EmptyConstructor.prototype = parent.prototype;
    child.prototype = new EmptyConstructor();
  }

module.exports = inherit;
