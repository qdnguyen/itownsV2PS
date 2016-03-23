/*global define*/
define([
    ], function(
        ) {
    "use strict";

    var DeveloperError = function(message) {
        this.name = 'DeveloperError';
        this.message = message;

        //Browsers such as IE don't have a stack property until you actually throw the error.
        var stack;
        try {
            throw new Error();
        } catch (e) {
            stack = e.stack;
        }

        this.stack = stack;
    };

    DeveloperError.prototype.toString = function() {
        var str = this.name + ': ' + this.message;

        if (this.stack != undefined) {
            str += '\n' + this.stack.toString();
        }

        return str;
    };

    DeveloperError.throwInstantiationError = function() {
        throw new DeveloperError('This function defines an interface and should not be called directly.');
    };

    return DeveloperError;
});
