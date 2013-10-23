/*
 * facebook-user.js V. 1.0.0, Created 2012 by Christian Bäuerlein
 * https://github.com/fabrik42/facebook-user.js
 */
(function (scope, Backbone) {

    var FacebookUser = Backbone.Model.extend({

        defaults: {
            email: '',
            first_name: '',
            last_name: '',
            id: '',
            link: '',
            locale: '',
            name: '',
            quotes: '',
            timezone: '',
            username: '',
            verified: '',
            access_token: ''
        },

        initialize: function (attributes, options) {
            options || (options = {});
            this.options = _.defaults(options, this.defaultOptions);

            _.bindAll(this, 'onLoginStatusChange');

            FB.Event.subscribe('auth.authResponseChange', this.onLoginStatusChange);
        },

        options: null,

        defaultOptions: {
            // see https://developers.facebook.com/docs/authentication/permissions/
            scope: [], // fb permissions
            autoFetch: true, // auto fetch profile after login
            protocol: location.protocol
        },

        _loginStatus: null,

        isConnected: function () {
            return this._loginStatus === 'connected';
        },

        login: function (callback) {
            if (typeof callback === 'undefined') {
                callback = function () { };
            }
            FB.login(callback, { scope: this.options.scope.join(',') });
        },

        logout: function (callback) {
            if (typeof callback === 'undefined') {
                callback = function () { };
            }

            FB.logout(callback);
        },

        updateLoginStatus: function () {
            FB.getLoginStatus(this.onLoginStatusChange);
        },

        onLoginStatusChange: function (response) {
            if (this._loginStatus === response.status) return false;

            var event;

            if (response.status === 'not_authorized') {
                event = 'facebook:unauthorized';
            } else if (response.status === 'connected') {
                event = 'facebook:connected';
                if (this.options.autoFetch === true) this.fetch();


                this.set({ 'access_token': response.authResponse.accessToken });

            } else {
                console.log('facebook:disconnected');
                event = 'facebook:disconnected';
                // unset the model
                this.unset('access_token');
                this.unset('id');
                this.unset('email');
                this.unset('first_name');
                this.unset('last_name');
                this.unset('link');
                this.unset('locale');
                this.unset('name');
                this.unset('quotes');
                this.unset('timezone');
                this.unset('username');
                this.unset('verified');
                this.unset('pictures');


            }

            this.trigger(event, this, response);
            this._loginStatus = response.status;
        },

        parse: function (response) {
            var attributes = _.extend(response, {
                pictures: this.profilePictureUrls(response.id)
            });

            return attributes;
        },

        sync: function (method, model, options) {
            if (method !== 'read') throw new Error('FacebookUser is a readonly model, cannot perform ' + method);

            var callback = function (response) {
                if (response.error) {
                    options.error(response);
                } else {
                    // options.success(model, response, options);
                    options.success(response);
                }
                return true;
            };

            FB.api('/me', callback);
        },

        profilePictureUrls: function (id) {
            id || (id = this.id);
            var urls = {};
            _(['square', 'small', 'normal', 'large']).each(function (size) {
                urls[size] = this.profilePictureUrl(id, size);
            }, this);

            return urls;
        },

        profilePictureUrl: function (id, size) {
            //return [
            //  this.options.protocol,
            //  '//graph.facebook.com/',
            //  id,
            //  '/picture?type=',
            //  size,
            //  this.options.protocol.indexOf('https') > -1 ? '&return_ssl_resources=1' : ''
            //].join('');
            return [
              'http:',
              '//graph.facebook.com/',
              id,
              '/picture?type=',
              size
            ].join('');
        }

        

    });

    scope.FacebookUser = FacebookUser;

    return FacebookUser;

})(this, Backbone);