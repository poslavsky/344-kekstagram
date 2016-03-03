/* global Photo: true, Gallery: true */
'use strict';

(function() {
  var container = document.querySelector('.pictures');
  var filters = document.querySelector('.filters');
  var activeFilter = 'filter-popular';
  var pictures = [];
  var filteredPictures = [];
  var currentPage = 0;
  var PAGE_SIZE = 12;
  var gallery = new Gallery();

  filters.classList.add('hidden');

  filters.addEventListener('click', function(e) {
    var clickedElementFor = e.target;
    if (clickedElementFor.classList.contains('filters-item')) {
      setActiveFilter(clickedElementFor.htmlFor);
    }
  });

  function setActiveFilter(forID) {
    filteredPictures = pictures.slice(0);
    switch (forID) {
      case 'filter-new':
        var twoWeeks = new Date() - 14 * 24 * 60 * 60 * 1000;
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
    currentPage = 0;
    renderPictures(0, true);
  }

  function checkAddItem() {
    var bottomCoordinates = document.querySelector('.pictures').getBoundingClientRect().bottom;
    var viewportSize = window.innerHeight;
    if (bottomCoordinates <= viewportSize) {
      if (currentPage < Math.ceil(filteredPictures.length / PAGE_SIZE)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    var scrollTimeout = setTimeout(function() {
      if (checkAddItem()) {
        renderPictures(++currentPage);
      }
    }, 100);
  });

  getPictures();

  function onGalleryClickHandler(e) {
    e.preventDefault();
    gallery.show();
  }

  function renderPictures(pageNumber, replace) {
    if (replace) {
      [].forEach.call(container.childNodes, function(element) {
        container.removeChild(element);
        element.removeEventListener('click', onGalleryClickHandler);
      });
    }

    var fragment = document.createDocumentFragment();
    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var pagePictures = filteredPictures.slice(from, to);
    pagePictures.forEach(function(picture) {
      var photoElement = new Photo(picture);
      photoElement.render();
      photoElement.element.addEventListener('click', onGalleryClickHandler);
      fragment.appendChild(photoElement.element);
    });
    container.appendChild(fragment);
    while (checkAddItem()) {
      renderPictures(++currentPage);
    }
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
      try {
        var loadedPictures = JSON.parse(rawData);
      } catch (err) {
        console.log('Обработка ошибки ответа сервера');
      }
      pictures = loadedPictures;
      setActiveFilter(activeFilter);
      renderPictures(0);
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

  // function getElementFromTemplate(data) {
  //
  // }
  filters.classList.remove('hidden');
})();
