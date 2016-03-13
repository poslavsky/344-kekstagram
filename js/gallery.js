'use strict';

var Gallery = function() {
  this.element = document.querySelector('.gallery-overlay');
  this._closeButton = this.element.querySelector('.gallery-overlay-close');
  this._onCloseClick = this._onCloseClick.bind(this);
  this._img = this.element.querySelector('.gallery-overlay-image');
  this._onPhotoClick = this._onPhotoClick.bind(this);
  this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  this.currentPicture = 0;
  this.picturesLength = 0;
};

Gallery.prototype.show = function() {
  this.element.classList.remove('invisible');
  this._closeButton.addEventListener('click', this._onCloseClick);
  this._img.addEventListener('click', this._onPhotoClick);
  window.addEventListener('keydown', this._onDocumentKeyDown);
};

Gallery.prototype.hide = function() {
  this.element.classList.add('invisible');
  this._closeButton.removeEventListener('click', this._onCloseClick);
  this._img.removeEventListener('click', this._onPhotoClick);
  window.removeEventListener('keydown', this._onDocumentKeyDown);
  location.hash = '';
};

Gallery.prototype._onCloseClick = function() {
  this.hide();
};

Gallery.prototype._onPhotoClick = function(e) {
  // if (e.target.className !== 'gallery-overlay-image' || this.currentPicture >= this.picturesLength - 1) {
  //   return;
  // }
  // this.setCurrentPicture(++this.currentPicture);
  location.hash = 'photo/' + store.getNextItem(this.number).url;
};

Gallery.prototype._onDocumentKeyDown = function(e) {
  if (e.reyCode === 27) {
    this.hide();
  }
};

Gallery.prototype.setPictures = function(pictures) {
  this.pictures = pictures;
  this.picturesLength = this.pictures.length;

  window.addEventListener('hashchange', this._toggleShowGallery.bind(this));
};

Gallery.prototype._toggleShowGallery = function() {
  var hash = location.hash.match(/#photo\/(\S+)/);
  if (hash === null) {
    this.hide();
  } else {
    this.setCurrentPicture(hash[0].replace('#photo/', ''));
    this.show();
  }
};

Gallery.prototype.setCurrentPicture = function(number) {
  var typeOfArg = typeof(number);
  if (typeOfArg === 'string') {
    var pictureFound = false;
    for (var i = 0; i < this.picturesLength; i++) {
      pictureFound = (this.pictures[i].url === currentPicture);
      if (pictureFound) {
        currentPicture = i;
        break;
      }
    }
  };

  //переключение фото

  Gallery.prototype._changePicture = function(number) {
    location.hash = '#photo/' + this.pictures[number].url;
  };

  var _pictures = this.pictures[number];
  this.picturesLength = this.pictures.length;
  document.querySelector('.gallery-overlay-image').src = _pictures.url;
  document.querySelector('.gallery-overlay-controls-like .likes-count').innerHTML = _pictures.likes;
  document.querySelector('.gallery-overlay-controls-comments .comments-count').innerHTML = _pictures.comments;
  this.currentPicture = number;
};

module.exports = Gallery;
