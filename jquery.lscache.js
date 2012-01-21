/*global jQuery, lscache *//*jshint smarttabs:true */
/*
 * jQuery lscache plugin v0.1.0
 *
 * Copyright 2012 Stephen M. McKamey
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function(jQuery, lscache){
	'use strict';

	jQuery.extend({
		lscache:
			/**
			 * Buffered loading checks lscache first then defers to fetch if not found
			 * 
			 * @param {object} item
			 * @param {object|function():jQuery.Deferred} options jqXHR options or callback to async fetch data
			 * @return {jQuery.Deferred}
			 */
			function(item, options) {
				if (!item || !item.key) {
					throw 'missing cache item';
				}

				var fetch = (typeof options === 'function') ?
					options :
					function() { return jQuery.ajax(options); };

				// wrap response in deferred
				var defd = jQuery.Deferred();

				// lookup in cache
				var value = lscache.get(item.key);

				if (value !== null) {
					//console.log('cache-hit: '+item.key);
					// found in cache
					defd.resolve(value);

				} else {
					//console.log('cache-miss: '+item.key);

					// not found, remotely fetch
					fetch().done(function(value) {
						// intercept and cache value
						lscache.set(item.key, value, item.time);

						//console.log('cache-set: '+item.key);

						// fetch succeeded
						defd.resolve(value);

					}).fail(function() {
						// fetch failed
						defd.reject.apply(defd, arguments);
					});
				}

				// return promise object
				return defd.promise();
			}
		});

})(jQuery, lscache);
