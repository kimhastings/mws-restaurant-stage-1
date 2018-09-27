import DBHelper from './dbhelper';

let restaurants,
  neighborhoods,
  cuisines;
var newMap;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 * Move event listeners for filters from index.html into this script
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added 
  fetchTheNeighborhoods();
  fetchTheCuisines();
  document.getElementById("neighborhoods-select").addEventListener('change', updateRestaurants);
  document.getElementById("cuisines-select").addEventListener('change', updateRestaurants);
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
var fetchTheNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
var fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
var fetchTheCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
var fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize leaflet map, called from HTML.
 */
var initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1Ijoia2ltaGFzdGluZ3MiLCJhIjoiY2ppZXVrc2JqMDFxMDNxbzhzcG04M2RsdyJ9.f57inHpFpV7YEf0ProTv7Q',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(self.newMap);

  updateRestaurants();
};
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
var updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
var resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
var fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
var createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  console.log('[Main] Creating HTML for ' + restaurant.name);
  image.alt = restaurant.name;
  if (restaurant.photograph) {
    const imageURLBase = DBHelper.imageUrlBaseForRestaurant(restaurant);
    const imageURL = imageURLBase + ".jpg";
    const imageURL320w = imageURLBase + "-320w.jpg";
    const imageURL480w = imageURLBase + "-480w.jpg";  
    image.src = imageURL;
    image.srcset = `${imageURL320w} 320w, ${imageURL480w} 480w`;  
  } else {
    image.src = `/img/undefined.jpg`;
  }
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const favorite = document.createElement('button');
  favorite.innerHTML = "❤︎";
  favorite.classList.add ("favorite-button");
  setFavoriteButtonDisplay (favorite, restaurant.is_favorite);
  // Handler to toggle favorite button status/display when clicked
  favorite.onclick = function () {
    // restaurant.is_favorite is a string on the server, so keep it that way 
    if (restaurant.is_favorite === "true") {
      restaurant.is_favorite = "false";
    } else {
      restaurant.is_favorite = "true";
    };
    DBHelper.updateFavoriteStatus (restaurant);
    setFavoriteButtonDisplay (favorite, restaurant.is_favorite);
  }
  li.append(favorite);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('button');
  more.innerHTML = 'View Details';
  more.onclick = function () {
    const url = DBHelper.urlForRestaurant(restaurant);
    window.location = url;
  };
  /* more.href = DBHelper.urlForRestaurant(restaurant); */
  li.append(more);

  return li;
};

/**
 * Update display of favorite button
 */
var setFavoriteButtonDisplay = (button, status) => {
  if (status === "true") {
    console.log ("Favoriting");
    button.classList.add ("favorite-true");
    button.classList.remove ("favorite-false");
    button.setAttribute ("aria-label", "Unfavorite this restaurant");
  } else {
    console.log ("Unfavoriting");
    button.classList.add ("favorite-false");
    button.classList.remove ("favorite-true");
    button.setAttribute ("aria-label", "Favorite this restaurant");
  }
};

/**
 * Add markers for current restaurants to the map.
 */
var addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
};
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */

/**
 * Register service worker
 */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./service-worker.js')
    .then(function() { console.log('Service Worker Registered'); })
    .catch(function(err) {console.log('Error registering Service Worker', err); });
}           


