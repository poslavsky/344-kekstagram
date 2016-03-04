'use strict';

(function() {
  function inherit(child, parent) {
    function EmptyConstructor() {}
    EmptyConstructor.prototype = parent.prototype;
    child.prototype = new EmptyConstructor();
  }

  window.inherit = inherit;
})();
