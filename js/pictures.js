'use strict';

(function() {
  var container = document.querySelector('.pictures');
  var template = document.querySelector('#picture-template');
  var filters = document.querySelector('.filters');
  var filtersButton = document.querySelectorAll('.filters-item');
  var pictures = [];
  filters.classList.add('hidden');

  for (var i = 0; i < filtersButton.length; i++) {
    filtersButton[i].onclick = function(e) {
      var clickedElementFor = e.target.htmlFor;
      setActiveFilter(clickedElementFor);
    };
  }

  function setActiveFilter(forID) {
    var filteredPictures = pictures.slice(0);
    switch (forID) {
      case 'filter-new':
        var twoWeeks = new Date() - 2 * 14 * 24 * 60 * 60 * 100;
        filteredPictures = filteredPictures.filter(function(a) {
          return Date.parse(a.date) >= twoWeeks;
        }).sort(function(a, b) {
          return Date.parse(b.date) - Date.parse(a.date);
        });
        break;
      case 'filter-discussed':
        filteredPictures = filteredPictures.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }
    renderPictures(filteredPictures);
  }

  getPictures();

  function renderPictures(picturesArray) {
    container.innerHTML = '';
    var fragment = document.createDocumentFragment();
    picturesArray.forEach(function(picture) {
      var element = getElementFromTemplate(picture);
      fragment.appendChild(element);
    });
    container.appendChild(fragment);
  }

  function getPictures() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '//o0.github.io/assets/json/pictures.json');
    xhr.onloadstart = function() {
      container.classList.add('pictures-loading');
    };
    xhr.onload = function(e) {
      container.classList.remove('pictures-loading');
      var rawData = e.target.response;
      var loadedPictures = JSON.parse(rawData);
      pictures = loadedPictures;
      renderPictures(loadedPictures);
    };

    xhr.send();
    xhr.onerror = function() {
      container.classList.add('pictures-failure');
    };
    xhr.timeout = 10000;
    xhr.ontimeout = function() {
      container.classList.add('pictures-failure');
    };
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
