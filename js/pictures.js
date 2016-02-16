/* global pictures: true */

'use strict';

(function() {
  var container = document.querySelector('.pictures');
  var template = document.querySelector('#picture-template');
  var filters = document.querySelector('.filters');
  filters.classList.add('hidden');

  pictures.forEach(function(picture) {
    var element = getElementFromTemplate(picture);
    container.appendChild(element);
  });

  function getElementFromTemplate(data) {
    var element;
    if ('content' in template) {
      element = template.content.childNodes[1].cloneNode(true);
    } else {
      element = template.children[0].cloneNode(true);
    }
    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;


    var backgroundImage = new Image(182, 182);
    var templateImg = element.querySelector('img');
    var imageLoadTimeout;

    backgroundImage.onload = function() {
      clearTimeout(imageLoadTimeout);
      //можно сделать и фоном: element.style.backgroundImage = 'url(\'' + backgroundImage.src + '\')';
      element.replaceChild(backgroundImage, templateImg);
    };

    backgroundImage.onerror = function() {
      element.classList.add('picture-load-failure');
    };
    backgroundImage.src = data.url;

    var IMAGE_TIMEOUT = 10000;

    imageLoadTimeout = setTimeout(function() {
      backgroundImage.src = '';
      element.classList.add('picture-load-failure');
    }, IMAGE_TIMEOUT);

    return element;
  }
  filters.classList.remove('hidden');
})();
