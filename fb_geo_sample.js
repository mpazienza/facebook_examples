/*jslint browser: true, sloppy: true, white: true, nomen: false, plusplus: true, maxerr: 50, indent: 2 */

(function (document, window, undefined) {
  /**
   * Extends an object or array
   * @method extend
   */
	function extend(dest, source) {
		var property;
		
		if (typeof source !== "undefined") {
			for (property in source) {
				if (typeof source[property] === "object") {
					if (Object.prototype.toString.call(source[property]) === "[object Array]") {
						destination[property] = dest[property] || [];
					} else {
						destination[property] = dest[property] || {};
					}
					extend(dest[property], source[property]);
				} else {
					dest[property] = source[property];
				}
			}
		}
		return dest;
	};
	
  /**
   * Facebook constructor
   * @method Facebook
   */
  function Facebook(config) {
    var self = this;
    
    self.config = config;
    self.active = false;
    
    return self;
  }
	
	/**
   * Initialize the Facebook API
   * @method Facebook.init
   * @param *function* **fn** the callback function on completion
   */
  Facebook.prototype.init = function (fn) {
		var self     = this,
		    FBRoot   = document.createElement('div'),
				FBScript = document.createElement('script'),
				head     = document.getElementsByTagName('head')[0],
				body     = document.getElementsByTagName('body')[0];
		
		// Add Facebook div to document
		FBRoot.id = 'fb-root';
		body.appendChild(FBRoot);
		
		// Add Facebook API Script to document
		FBScript.src = "//connect.facebook.net/en_US/all.js";
		FBScript.async = true;
		head.appendChild(FBScript);
		
		window.fbAsyncInit = function () {
		  // Set if HTTPS
		  FB._https = (window.location.protocol === 'https:');
		  
		  // Init Application
		  FB.init({
		    appId      : self.config.appId,
		    channelUrl : self.config.channelUrl,
		    status     : self.config.status,
		    cookie     : self.config.cookie,
		    oauth      : self.config.oauth,
		    xfbml      : self.config.xfbml
		  });
		  
		  // Call custom function
		  if (typeof fn === 'function') {
		    fn();
		  }
		};
	};
	
	/**
   * Log into Facebook
   * @method Facebook.login
   * @param *function* **fn** the callback function on completion
   */
  Facebook.prototype.login = function (fn) {
    var self = this;
    
    // Check if user is not logged in
    if (!self.active) {
      FB.login(function (response) {
        if (response.authResponse) {
          self.active = response.authResponse.accessToken;
          self.userId = response.authResponse.userId;
          
          if (typeof fn === 'function') {
            fn();
          }
        }
      }, {
        scope : 'user_location,publish_stream' // The permissions that your app needs to request
      });
    
    // Already Logged in
    } else {
      if (typeof fn === 'function') {
        fn();
      }
    }
  };
  
  /**
   * Create a custom post on Facebook
   * @method Facebook.post
   * @param *object*   **params** the configuration parameters
   * @param *function* **fn**     the callback function on completion
   */
  Facebook.prototype.post = function (params, fn) {
    var self = this,
        defaults = {
          'message'     : 'This is the default message you want to put',
          'name'        : 'This is the title for the link',
          'description' : 'This is a description of the link',
          'link'        : 'http://www.massrelevance.com',
          'picture'     : 'http://www.massrelevance.com/share.jpg',
          'privacy'     : {
            'value' : 'EVERYONE'
          }
        };
    
    params = extend(defaults, params);
    
    // Login if needed
    self.login(function () {
      FB.api('/me/feed', 'post', params, function (response) {
        // Make sure you get the post ID back
        if (response.id) {
          if (typeof fn === 'function') {
            fn();
          }
        }
      })
    });
  };
  
  /**
   * Get a users location from their profile
   * @method Facebook.getLocation
   * @param *function* **fn** the callback function on completion
   */
  Facebook.prototype.getLocation = function (id, fn) {
    var self = this;
    
    // If only function passed
    if (typeof id === 'function') {
      fn = id;
      id = undefined;
    }
    
    // Get the value for the current logged in user
    self.login(function () {
      FB.api('/me', function (response) {
        // Check if location already has an ID
        if (response.location && response.location.id) {
          // Get data for location
          FB.api('/' + response.location.id, function (response) {
            if (typeof fn === 'function') {
              fn(response.location);
            }
          });
        
        // If no ID present, return results
        } else {
          if (typeof fn === 'function') {
            fn(response.location);
          }
        }
      });
    });
  };
  
  /**
   * share something by its URL
   * @method Facebook.share
   * @param *object* **obj** the data for the share post
   * @param *function* **fn** the callback function on completion
   */
  Facebook.prototype.share = function (obj, fn) {
    var self     = this,
        defaults = {
          method      : 'feed',
          link        : '',
          picture     : '',
          name        : '',
          caption     : '',
          description : ''
        };
    
    obj = extend(defaults, obj);
    
    // If only function passed
    if (typeof id === 'function') {
      fn = id;
      id = undefined;
    }
    
    // Get the value for the current logged in user
    self.login(function () {
      FB.ui(obj, function (response) {
        console.log(response);
      });
    });
  };
  
  /**
   * GeoApplication constructor
   * @method GeoApplication
   */
  function GeoApplication() {
    var self = this;
    
    self.facebook = new Facebook({
          appId      : '296998370389976',
          status     : true,
          cookie     : true,
          oauth      : true,
          xfbml      : true
        });
    
    // Initialize the Facebook API
    self.facebook.init();
  }
  
  /**
   * Create an entry and get the user data
   * @method GeoApplication.createEntry
   */
  GeoApplication.prototype.createEntry = function (message) {
    var self = this;
    
    // Create the post
    self.facebook.post({
      'message' : message
    }, function () {
      // get the user data on successful post
      var location;
      
      self.facebook.getLocation(function (response) {
        location = response;
        
        alert(location.city + ", " + location.state + ", " + location.country + " -- latitude:" + location.latitude + " longitude:" + location.longitude);
      });
    });
  };
  
  /**
   * Share something on Facebook
   * @method GeoApplication.share
   */
  GeoApplication.prototype.share = function () {
    var self = this;
    
    // Create the post
    self.facebook.share({
      method      : 'feed',
      link        : 'http://www.massrelevance.com',
      picture     : '',
      name        : '',
      caption     : '',
      description : ''
    });
  };
  
  window.GeoApplication = GeoApplication;
}(document, window));


// Start Application
window.onload = function () {
  var app   = new GeoApplication(),
      btn   = document.getElementById('trigger'),
      share = document.getElementById('share'),
      msg   = document.getElementById('message');
  
  btn.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    
    app.createEntry(msg.value);
  };
  
  share.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    
    app.share();
  };
};