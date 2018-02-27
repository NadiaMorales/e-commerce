$(document).ready(() => {
  $('.button-collapse').sideNav();
  // Variables globales
  // Arreglo vacío que contendrá los objetos con información de los productos
  let products = [];
  /*
Objeto vacío que tendrá un array de valores para cada filtro
Será algo similar a esto:

filters = {
  'manufacturer' = ['Apple', 'Sony'],
  'storage' = '[16]
}
*/
  let filters = {};
  console.log(filters);

  // Controladores de eventos
  // Checkbox filtros
  var checkboxes = $('.all-products input[type=checkbox]'); // obtengo todos los checkbox del filtrado
  console.log(checkboxes); // pueden verlo con este console.log

  checkboxes.click(function() {
  // cuando le hago click a un checkbox guarda en specName el el valor del atributo name que tiene
    var that = $(this);
    var specName = that.attr('name');
    // Verifico si el checkbox fue activado (chekeado)
    if (that.is(':checked')) {
      // Si fue chekeado verifico una segunda condición, si no existe en los filtros entonces se crea y pushea
      if (!(filters[specName] && filters[specName].length)) {
        filters[specName] = [];
      }
      // Pusheamos al ese valor
      filters[specName].push(that.val());

      // Finalmente se cambia el hash de la url según los filtros
      // hash se utiliza para navegar de una página a otra en una SPA, la ventaja es que no requiere actualización y se puede ver en la barra de navegación
      createQueryHash(filters);
    }
    // Cuando no está seleccionado el checkbox se quita ese valor del objeto filters
    if (!that.is(':checked')) {
      if (filters[specName] && filters[specName].length && (filters[specName].indexOf(that.val()) != -1)) {
        // guarda en la variable index el valor del checkbox seleccionado (la posicion dentro del filters)
        var index = filters[specName].indexOf(that.val());
        // Lo remueve del filtro para que no muestre los productos que no cumplen con el filtro
        filters[specName].splice(index, 1);
      }
      // cambia el hash de la url según lo desfiltrado
      createQueryHash(filters);
    }
  });
  // Cuando se presiona el botón de CLEAR FILTERS se limpia todo lo del hash # y vuelve a la página inicial
  $('.filters a').click(function(e) {
    e.preventDefault();
    window.location.hash = '#';
  });

  // guardamos el div contenedor de nuestro producto
  var singleProductPage = $('.single-product');

  singleProductPage.on('click', function(e) {
    // si este div tiene la clase visible
    if (singleProductPage.hasClass('visible')) {
      // captura el elemento que tiene el evento, puede ser el span close o el div overlay
      var clicked = $(e.target);
      // console.log(clicked)
      // si el elemento que tuvo el evento tiene la clase close o la clase overlay se cierra la ventana y el hash (#) de la url se limpia y queda con el valor anterior al hacer click en el producto (filtros o nada)
      if (clicked.hasClass('close') || clicked.hasClass('overlay')) {
        createQueryHash(filters);
      }
    }
  });

  // These are called on page load

  // Get data about our products from products.json.

  // https://api.mercadolibre.com/categories/MLC1246

  const skincare = 'MLC1253';
  const haircare = 'MLC1263';
  const bodycare = 'MLC1260';
  const makeup = 'MLC1248';
  let num = 0;
  let category = 'MLC1248';
  $('#MLC1253').click(function() {
    num = 1253;
  });
  if (num === 1253){
    category =  'MLC1253'
  }
  console.log(category);


  $.getJSON(`https://api.mercadolibre.com/sites/MLC/search?category=${category}&official_store_id=all`, function(data) {
    // Write the data into our global variable.
    products = data.results;
    console.log(products);

    // Call a function to create HTML for all the products.
    generateAllProductsHTML(products);

    // Manually trigger a hashchange to start the app.
    $(window).trigger('hashchange');
  });


  // An event handler with calls the render function on every hashchange.
  // The render function will show the appropriate content of out page.
  $(window).on('hashchange', function() {
    render(decodeURI(window.location.hash));
  });


  // Navigation

  function render(url) {
    // Get the keyword from the url.
    var temp = url.split('/')[0];

    // Hide whatever page is currently shown.
    $('.main-content .page').removeClass('visible');
    var map = {

      // The "Homepage".
      '': function() {
        // Clear the filters object, uncheck all checkboxes, show all the products
        filters = {};
        checkboxes.prop('checked', false);

        renderProductsPage(products);
      },

      // Modal del producto
      '#product': function() {
        // Get the index of which product we want to show and call the appropriate function.
        var index = url.split('#product/')[1].trim();
        // Remove the white spaces at the start and at the end of the string.
        console.log(index);

        renderSingleProductPage(index, products);
      },

      // Page with filtered products
      '#filter': function() {
        // Grab the string after the '#filter/' keyword. Call the filtering function.
        url = url.split('#filter/')[1].trim();

        // Try and parse the filters object from the query string.
        try {
          filters = JSON.parse(url);
        }
        // If it isn't a valid json, go back to homepage ( the rest of the code won't be executed ).
        catch (err) {
          window.location.hash = '#';
          return;
        }

        renderFilterResults(filters, products);
      }

    };

    // Execute the needed function depending on the url keyword (stored in temp).
    if (map[temp]) {
      map[temp]();
    }
    // If the keyword isn't listed in the above - render the error page.
    else {
      renderErrorPage();
    }
  }


  // This function is called only once - on page load.
  // It fills up the products list via a handlebars template.
  // It recieves one parameter - the data we took from products.json.
  function generateAllProductsHTML(data) {
    var list = $('.all-products .products-list');

    var theTemplateScript = $('#products-template').html();
    // Compile the template​
    var theTemplate = Handlebars.compile(theTemplateScript);
    list.append(theTemplate(data));


    // Each products has a data-index attribute.
    // On click change the url hash to open up a preview for this product only.
    // Remember: every hashchange triggers the render function.
    list.find('li').on('click', function(e) {
      e.preventDefault();

      var productIndex = $(this).data('index');

      window.location.hash = 'product/' + productIndex;
    });
  }

  // This function receives an object containing all the product we want to show.
  function renderProductsPage(data) {
    var page = $('.all-products'),
      allProducts = $('.all-products .products-list > li');

    // Hide all the products in the products list.
    allProducts.addClass('hidden');

    // Iterate over all of the products.
    // If their ID is somewhere in the data object remove the hidden class to reveal them.
    allProducts.each(function() {
      var that = $(this);

      data.forEach(function(item) {
        if (that.data('index') == item.id) {
          that.removeClass('hidden');
        }
      });
    });

    // Show the page itself.
    // (the render function hides all pages so we need to show the one we want).
    page.addClass('visible');
  }


  // Opens up a preview for one of the products.
  // Its parameters are an index from the hash and the products object.
  function renderSingleProductPage(index, data) {
    var page = $('.single-product'),
      container = $('.preview-large');

    // Find the wanted product by iterating the data object and searching for the chosen index.
    if (data.length) {
      data.forEach(function(item) {
        if (item.id == index) {
          // Populate '.preview-large' with the chosen product's data.
          container.find('h3').text(item.title);
          container.find('img').attr('src', item.thumbnail);
          container.find('p').text(item.title);
          container.find('#li1').text(item.condition);
          container.find('#li2').text(item.available_quantity);
          container.find('#li3').text(item.address.state_name);
          container.find('#li4').text(`${item.price}$`);
          container.find('a').attr('precio', item.price);
          container.find('a').attr('titulo', item.title);
          // class="waves-effect waves-light btn deep-purple darken-4 producto"
          //  precio="${item.price}" titulo="${item.price}" ><i class="material-icons right">add_shopping_cart</i>Añadir`);
        }
      });
    }

    // Show the page.
    page.addClass('visible');
  }

  // Find and render the filtered data results. Arguments are:
  // filters - our global variable - the object with arrays about what we are searching for.
  // products - an object with the full products list (from product.json).
  function renderFilterResults(filters, products) {
    // This array contains all the possible filter criteria.
    var criteria = ['condition', 'price', 'available_quantity'],
      results = [],
      isFiltered = false;

    // Uncheck all the checkboxes.
    // We will be checking them again one by one.
    checkboxes.prop('checked', false);


    criteria.forEach(function(elm) {
      // Check if each of the possible filter criteria is actually in the filters object.
      if (filters[elm] && filters[elm].length) {
        // After we've filtered the products once, we want to keep filtering them.
        // That's why we make the object we search in (products) to equal the one with the results.
        // Then the results array is cleared, so it can be filled with the newly filtered data.
        if (isFiltered) {
          products = results;
          results = [];
        }


        // In these nested 'for loops' we will iterate over the filters and the products
        // and check if they contain the same values (the ones we are filtering by).

        // Iterate over the entries inside filters.criteria (remember each criteria contains an array).
        filters[elm].forEach(function(filter) {
          // Iterate over the products.
          products.forEach(function(item) {
            // If the product has the same specification value as the one in the filter
            // push it inside the results array and mark the isFiltered flag true.
            if (typeof item.available_quantity === 'number') {
              if (item.available_quantity == filter) {
                results.push(item);
                isFiltered = true;
              }
            }

            if (typeof item.price === 'number') {
              if (item.price == filter) {
                results.push(item);
                isFiltered = true;
              }
            }

            if (typeof item.condition === 'string') {
              if (item.condition.toLowerCase().indexOf(filter) !== -1) {
                results.push(item);
                isFiltered = true;
              }
            }
          });

          // Here we can make the checkboxes representing the filters true,
          // keeping the app up to date.
          if (elm && filter) {
            $('input[name=' + elm + '][value=' + filter + ']').prop('checked', true);
          }
        });
      }
    });

    // Call the renderProductsPage.
    // As it's argument give the object with filtered products.
    renderProductsPage(results);
  }


  // Shows the error page.
  function renderErrorPage() {
    var page = $('.error');
    page.addClass('visible');
  }

  // Get the filters object, turn it into a string and write it into the hash.
  function createQueryHash(filters) {
    // Here we check if filters isn't empty.
    if (!$.isEmptyObject(filters)) {
      // Stringify the object via JSON.stringify and write it after the '#filter' keyword.
      window.location.hash = '#filter/' + JSON.stringify(filters);
    } else {
      // If it's empty change the hash to '#' (the homepage).
      window.location.hash = '#';
    }
  }
});
