$.getJSON('https://api.mercadolibre.com/sites/MLC/search?category=MLC1248&official_store_id=all', function(data) {
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
  var criteria = ['maquillaje', 'CuidadoPiel', 'CuidadoCabello', 'CuidadoCuerpo'],
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

          if (typeof item.price[elm] === 'number') {
            if (item.price[elm] == filter) {
              results.push(item);
              isFiltered = true;
            }
          }

          if (typeof item.condition[elm] === 'string') {
            if (item.condition[elm].toLowerCase().indexOf(filter) !== -1) {
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
