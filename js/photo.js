'use strict';

  function Photo(data) {
    this._data = data;
  }

  Photo.prototype.render = function() {
    var template = document.querySelector('#picture-template');
    //var element;
    if ('content' in template) {
      this.element = template.content.childNodes[1].cloneNode(true);
    } else {
      this.element = template.children[0].cloneNode(true);
    }

    var backgroundImage = new Image(182, 182);
    var templateImg = this.element.querySelector('img');

    backgroundImage.onload = function() {
      this.element.replaceChild(backgroundImage, templateImg);
    }.bind(this);
    backgroundImage.onerror = function() {
      this.element.classList.add('picture-load-failure');
    }.bind(this);

    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;
    backgroundImage.src = this._data.url;

  };

module.exports = Photo;
