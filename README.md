jQuery.lscache()
================

This simple jQuery plugin adds an [lscache](http://github.com/pamelafox/lscache) buffer into
`jQuery.ajax()` calls (or any fetch method returning a promise object). `lscache` is a Memcached-style
key-value cache built on top of `localStorage`. The semantics are the same as `$.ajax(settings)`
but with an additional argument for the cache item.

Requirements
------------

- jQuery 1.5 or later. http://jquery.com
- lscache: http://github.com/pamelafox/lscache

Usage
-----

```
	$.lscache(object, object|function);
```

Where the first argument is the cache item, implemented as an object literal with two properties:

 - string `key`: lscache key
 - number `time`: time until expiration in minutes (see [lscache](http://github.com/pamelafox/lscache#readme))

The second argument is *either*:

1. A callback function to retrieve the item value, which returns a
[jQuery.Deferred](http://api.jquery.com/category/deferred-object/) promise object
2. An [`$.ajax` `settings`](http://api.jquery.com/jQuery.ajax/) object to retrive the value via jqXHR.

Examples
--------

This example retrieves the current user data from a remote API. If it has not been fetched within the last hour,
it will get a new copy of the data, store it in cache and return it. The result will be the same whether it is
stored in cache or is remotely fetched.

```
	$.lscache(
		{
			key: 'current-user',
			time: 60
		},
		{
			type: 'GET',
			url: '/api/user',
			data: {
				userid: 1234
			}

		}).done(function(user) {
			alert('Successfully retrieved user '+user.name);

		}).fail(function(xhr, status, responseText) {
			alert('Remote fetch failed for user 1234: '+responseText);
		});
```

The next example shows a custom fetch method that isn't based upon `$.ajax`. The `fetch` argument can be any function
that returns a `jQuery.Deferred` promise object. This allows any asynchronous callbacks with success/fail semantics.

```
	$.lscache(
		{
			key: 'current-user',
			time: 60
		},
		function() {
			var defd = $.Deferred();

			// ...perform asynchronous work here
			setTimeout(function() {
				// NOTE: this happens after the fetch function returns
				if (wasResultWasSuccessful) {
					// if successful respond with result
					defd.resolve({
						id: 1234
						name: 'Bob',
						email: 'bob@example.com'
					});

				} else {
					// if failed respond with contextual information
					defd.reject(rejection);
				}
			}, 5000);

			return defd.promise();

		}).done(function(user) {
			alert('Successfully retrieved user '+user.name);

		}).fail(function(rejection) {
			alert('Remote fetch failed for user 1234');
		});
```

By building upon the [jQuery.Deferred](http://api.jquery.com/category/deferred-object/) object, you can actually chain multiple
fetch calls together where some of them may be populated from lscache and others are remotely fetched, each with their own
expiration policies. jQuery provides the [`$.when`](http://api.jquery.com/jQuery.when/) method for this purpose:

```
	$.when(
		$.lscache({
			key: 'current-user',
			time: 10
		},
		{
			type: 'GET',
			url: '/api/user',
			data: {
				userid: 1234
			}
		}),

		$.lscache({
			key: 'current-profile',
			time: 60
		},
		{
			type: 'POST',
			url: '/api/user/profile',
			data: {
				userid: 1234
			}
		})

	).done(function(user, profile) {
		// work with both objects together

	}).fail(function(xhr, status, responseText) {
		console.log('user/profile failed for 1234: '+responseText);
	});
```
