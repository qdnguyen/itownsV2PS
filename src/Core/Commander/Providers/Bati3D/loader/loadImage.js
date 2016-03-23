/*global define*/
define([
        'when',
        'debug/DeveloperError'
    ], function(
        when,
        DeveloperError) {
    "use strict";

    var dataUriRegex = /^data:/;
 
    var loadImage = function(url) {
        if (url === undefined) {
            throw new DeveloperError('url is required.');
        }

        return when(url, function(url) {
            var crossOrigin = 'Anonymous';

            var deferred = when.defer();

            loadImage.createImage(url, crossOrigin, deferred);

            return deferred.promise;
        });
    };

    // This is broken out into a separate function so that it can be mocked for testing purposes.
    loadImage.createImage = function(url, crossOrigin, deferred) {
        var image = new Image();

        image.onload = function() {
            deferred.resolve(image);
        };

        image.onerror = function(e) {
            deferred.reject(e);
        };

        if (crossOrigin) {
            image.crossOrigin = crossOrigin;
        }

        image.src = url;
    };

    loadImage.defaultCreateImage = loadImage.createImage;

    return loadImage;
});
