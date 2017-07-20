require('../../sass/main.sass');
var tpl = require('../hbs/add-html.hbs');

  setTimeout(function () {
      var $div = document.querySelector('div');
      $div.innerHTML=tpl({text:'world!'});
  },2000)
