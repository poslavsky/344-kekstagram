/* global pictures: true */

'use strict';

(function() {
  var container = document.querySelector('.pictures');
  var template = document.querySelector('#picture-template');
  var filters = document.querySelector('.filters');
  filters.classList.add('hidden');

  function setActiveFilter(pictures) {
    var filtersElements = document.querySelector('.filters').elements;
    for (var i = 0; i < filtersElements.length; i++) {
      if (filtersElements[i].checked) {
        var id = filtersElements[i].id;
        var sortPictures = pictures.slice(0);
        switch (id) {
          case "filter-new":
            sortPictures = sortPictures.sort(function(a, b) {
              return Date.parse(a.date) - Date.parse(b.date);
            });
            break;
          case "filter-discussed":
            sortPictures = sortPictures.sort(function(a, b) {
              return a.comments - b.comments;
            });
            break;
          default:
            return sortPictures;
            break;
        }
      }
      renderPhoto(sortPictures);
    }
  }

  getPhoto();

  function renderPhoto(pictures) {
    container.innerHTML = '';
    pictures.forEach(function(picture) {
      var element = getElementFromTemplate(picture);
      container.appendChild(element);
    });
  }

  function getPhoto() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '//o0.github.io/assets/json/pictures.json');
    xhr.onloadstart = function() {
      container.classList.add('pictures-loading');
    };

    xhr.onload = function(evt) {
      container.classList.remove('pictures-loading');
      var rawData = evt.target.response;

      var loadedPhoto = JSON.parse(rawData);
      setActiveFilter(loadedPhoto);
      console.log(setActiveFilter(loadedPhoto));
      //renderPhoto(loadedPhoto);
    }
    xhr.send();

    xhr.onerror = function() {
      container.classList.add('pictures-failure');
    };
    xhr.timeout = 10000;
    xhr.ontimeout = function() {
      container.classList.add('pictures-failure');
    }
  }


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

    element.replaceChild(backgroundImage, templateImg);
    backgroundImage.src = data.url;

    return element;
  }
  filters.classList.remove('hidden');
})();
