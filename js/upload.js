/* global Resizer: true */
/* global docCookies: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */

  // Находим элементы формы
  var formElement = document.forms['upload-resize'];
  var resizeX = formElement['resize-x'];
  var resizeY = formElement['resize-y'];
  var resizeSize = formElement['resize-size'];
  var forwardButton = formElement['resize-fwd'];
  var resizeControls = document.querySelector('.upload-resize-controls').elements;

  // Вешаем на интересующие нас три поля обработчик
  // таким образом при каждом изменении будет вызываться
  // resizeFormIsValid и производиться валидация
  resizeX.onchange = resizeFormIsValid;
  resizeY.onchange = resizeFormIsValid;
  resizeSize.onchange = resizeFormIsValid;


  function resizeFormIsValid() {
    var valid = true;
    resizeX.min = 0;
    resizeY.min = 0;
    resizeSize.min = 0;
    resizeX.max = currentResizer._image.naturalWidth - resizeSize.value;
    resizeY.max = currentResizer._image.naturalHeight - resizeSize.value;

    for (var i = 0; i < resizeControls.length; i++) {
      if (!resizeControls[i].validity.valid) {
        valid = false;
        break;
      }
    }
    forwardButton.disabled = !valid;
    return valid;
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  //Находим элементы, отвечающие за переключение фильтров
  var filtersRadio = document.querySelectorAll('.upload-filter-controls input');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */

  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }


  function resizeFormSetInput() {
    var changeInpitValue = document.createEvent('customEvent');
    changeInpitValue.initCustomEvent('resizerchange', false, false, {});
    window.addEventListener('resizerchange', function() {
      resizeX.value = currentResizer.getConstraint().x;
      resizeY.value = currentResizer.getConstraint().y;
      resizeSize.value = currentResizer.getConstraint().side;
    });
    window.dispatchEvent(changeInpitValue);
  }

  resizeForm.addEventListener('input', function() {
    currentResizer.setConstraint(+resizeX.value, +resizeY.value, +resizeSize.value);
  });


  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */

  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);

          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
          resizeFormSetInput();
        };

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */

  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */

  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();
    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;
      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */

  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();
    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  //Сохраняем последний выбранный фильтр в куки
  //Устанавливаем срок жизни кук - кол-во дней, прошедших с моего др
  //Находим элементы, отвечающие за переключенеи фильтров и делаем по ним перебор
  //Когда перебор находить чекед элемент, закидываем его в куки.
  function cookieSave() {
    var oneday = 1000 * 60 * 60 * 24;
    var today = new Date();
    var currentYear = today.getFullYear();
    var lastBirthday = new Date(currentYear, 10, 22);
    var passed = (today.getTime() - lastBirthday.getTime());
    var daysFromToday = Math.floor(passed / oneday);
    daysFromToday = daysFromToday > 0 ? daysFromToday = daysFromToday : daysFromToday = daysFromToday + 365;
    var expire = today.getTime() + new Date(daysFromToday * oneday).getTime();
    for (var i = 0; i < filtersRadio.length; i++) {
      if (filtersRadio[i].checked) {
        docCookies.setItem('filtersRadio', filtersRadio[i].value, Date(expire));
        break;
      }
    }
  }

  function addFilter() {
    var getRadio = docCookies.getItem('filtersRadio');
    for (var i = 0; i < filtersRadio.length; i++) {
      if (getRadio === filtersRadio[i].value) {
        filtersRadio[i].checked = true;
        var filterClass = 'filter-' + getRadio;
        filterImage.className = 'filter-image-preview ' + filterClass;
        break;
      }
    }
  }

  forwardButton.addEventListener('click', function() {
    addFilter();
  });

  //Сохраняем последний выбранный фильтр в куки
  //Устанавливаем срок жизни кук - кол-во дней, прошедших с моего др
  //Находим элементы, отвечающие за переключенеи фильтров и делаем по ним перебор
  //Когда перебор находить чекед элемент, закидываем его в куки.
  function cookieSave() {
    var oneday = 1000 * 60 * 60 * 24;
    var today = new Date();
    var currentYear = today.getFullYear();
    var lastBirthday = new Date(currentYear, 10, 22);
    var passed = (today.getTime() - lastBirthday.getTime());
    var daysFromToday = Math.floor(passed / oneday);
    daysFromToday = daysFromToday > 0 ? daysFromToday = daysFromToday : daysFromToday = daysFromToday + 365;
    var expire = today.getTime() + new Date(daysFromToday * oneday).getTime();
    for (var i = 0; i < filtersRadio.length; i++) {
      if (filtersRadio[i].checked) {
        docCookies.setItem('filtersRadio', filtersRadio[i].value, Date(expire));
        break;
      }
    }
  }

  function addFilter() {
    var getRadio = docCookies.getItem('filtersRadio');
    for (var i = 0; i < filtersRadio.length; i++) {
      if (getRadio === filtersRadio[i].value) {
        filtersRadio[i].checked = true;
        var filterClass = 'filter-' + getRadio;
        filterImage.className = 'filter-image-preview ' + filterClass;
        break;
      }
    }
  }

  forwardButton.onclick = function() {
    addFilter();
  };

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();
    cookieSave();
    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });


  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  });

  cleanupResizer();
  updateBackground();
})();
