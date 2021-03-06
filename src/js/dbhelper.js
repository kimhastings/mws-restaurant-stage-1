/*
 * Common database helper functions.
 */

/*
 * DBHelper uses an idb database
 */

import idb from 'idb';

const dbPromise = idb.open("db", 1, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore("restaurants", {
         keyPath: "id"
      });
    case 1:
      const reviewsStore = upgradeDB.createObjectStore("reviews", {
         keyPath: "id",
         autoIncrement: true
      });
    case 2:
      upgradeDB.createObjectStore("pending", {
         keyPath: "id",
         autoIncrement: true
      });
  }
});

class DBHelper {

  /*
   * Server database URLS
   * Change this to your server
   */
  static get RESTAURANT_SERVER_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
  static get REVIEW_SERVER_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/reviews`;
  }


  /*
   * Fetch and cache all restaurants
   */
  static fetchRestaurants(callback) {
/* 
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.RESTAURANT_SERVER_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        const restaurants = json.restaurants;
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
 */

    // Try to fetch restaurant database from server
    fetch(`${DBHelper.RESTAURANT_SERVER_URL}`)
      .then (response => {
        return response.json();
      })
      // Fetch succeeded. Return the live data after caching it in the database
      .then (server_data => {
        dbPromise.then (db => {
          var tx = db.transaction('restaurants' , 'readwrite');
          var store = tx.objectStore('restaurants');
          server_data.forEach(restaurant => store.put(restaurant));
        });
        return callback (null, server_data);
      })
      // Fetch failed. Return the cached data from the database
      .catch (error => {
        console.log ("DBHelper: Restaurant fetch failed and caught");
        dbPromise.then (db => {
          var tx = db.transaction('restaurants' , 'readwrite');
          var store = tx.objectStore('restaurants');
          var cached_data = store.getAll();
          return cached_data;
        })
        .then (cached_data => {
          return callback (null, cached_data);
        })
      })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL base.
   */
  static imageUrlBaseForRestaurant(restaurant) {
    if (restaurant.photograph) {
      return (`/img/${restaurant.photograph}`);
    } else {
      return null;
    }
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (restaurant.photograph) {
      return (`/img/${restaurant.photograph}.jpg`);
    } else {
      return (`/img/undefined.jpg`);
    }
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

  /**
   * Update restaurant's favorite status
   */
  static updateFavoriteStatus (restaurant) {
    console.log ("Changing favorite status to ", restaurant.is_favorite);

    // Try to update favorite status on server
    fetch(`${DBHelper.RESTAURANT_SERVER_URL}/${restaurant.id}/?is_favorite=${restaurant.is_favorite}`, {
      method: "PUT"
    })
      .then (() => {
        // PUT succeeded. Update the database to keep it in sync with server
        dbPromise.then (db => {
          var tx = db.transaction('restaurants' , 'readwrite');
          var store = tx.objectStore('restaurants');
          store.get(restaurant.id)
            .then (dbRecord => {
              dbRecord.is_favorite = restaurant.is_favorite;
              store.put (restaurant);
            });
        });
      })
      .catch (error => {
        // PUT failed
        console.log ("DBHelper: PUT failed to update favorite status");
     })
  }   

  /*
   * Fetch and cache reviews for a restaurant
   */
  static fetchReviewsForRestaurant(id, callback) {
    
        // Try to fetch restaurant reviews from server
        fetch(`${DBHelper.REVIEW_SERVER_URL}/?restaurant_id=${id}`)
          .then (response => {
            return response.json();
          })
          // Fetch succeeded. Return the live data after caching it in the database
          .then (server_data => {
            dbPromise.then (db => {
              var tx = db.transaction('reviews' , 'readwrite');
              var store = tx.objectStore('reviews');
              server_data.forEach(review => store.put(review));
            });
            return callback (null, server_data);
          })
          // Fetch failed. Return the cached data from the database
          .catch (error => {
            console.log ("DBHelper: Review fetch failed and caught");
            dbPromise.then (db => {
              var tx = db.transaction('reviews' , 'readwrite');
              var store = tx.objectStore('reviews');
              var cached_data = store.getAll();
              return cached_data;
            })
            .then (cached_data => {
              return callback (null, cached_data);
            })
          })
      }

    /*
     * Add new restaurant review
     */
    static addReview(review) {
      // Try to post review to server
      fetch(`${DBHelper.REVIEW_SERVER_URL}`, {
        method: 'POST', 
        mode:'cors',
        headers: new Headers ({'Content-Type': 'application/json; charset=utf-8'}),
        body: JSON.stringify(review)
      })
        .then((response) => {
          // POST succeeded. Update the database to keep it in sync with server
          dbPromise.then (db => {
            var tx = db.transaction('reviews' , 'readwrite');
            var store = tx.objectStore('reviews');
            store.add(review);
            return tx.complete;
          });
        })
        .catch (error => {
          // POST failed. Save review to be posted when server comes back online
          console.log ("DBHelper: POST failed");
          dbPromise.then (db => {
            var tx = db.transaction('pending' , 'readwrite');
            var store = tx.objectStore('pending');
            store.add(review);
            return tx.complete;
          });
        })
    }

    /*
     * Add pending restaurant reviews
     */
    static addPendingReviews() {
      dbPromise
      // Get pending reviews from store
      .then (db => {
          var tx = db.transaction('pending' , 'readwrite');
          var store = tx.objectStore('pending');
          return store.getAll();
      })
      // Post pending reviews to server
      .then (pendingReviews => {
        pendingReviews.forEach(review => {
          fetch(`${DBHelper.REVIEW_SERVER_URL}`, {
            method: 'POST', 
            mode:'cors',
            headers: new Headers ({'Content-Type': 'application/json; charset=utf-8'}),
            body: JSON.stringify(review)
          })              
          .then((response) => {
            // Update the database to keep it in sync with server
            dbPromise.then (db => {
              var tx = db.transaction('reviews' , 'readwrite');
              var store = tx.objectStore('reviews');
              store.add(review);
              return tx.complete;
            });
          })
        })
      })
      // Better luck next time
      .catch (error => {
        return;
      });

      // Clear pending reviews from store (only if fetch succeeds)
      dbPromise.then (db => {
        var tx = db.transaction('pending' , 'readwrite');
        var store = tx.objectStore('pending');
        store.clear();
        return tx.complete;
      })
    }

  }

  module.exports = DBHelper;