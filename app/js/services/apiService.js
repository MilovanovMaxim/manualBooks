/**
 * Created by rsabiryanov on 13.02.2015.
 */
(function (module) {

    module.factory('apiService', ['$http', '$q', '$log','profileService', function ($http, $q, $log, profileService) {

        var _baseUrl = 'http://marksmith.biz/mbooksapi/';
        var websiteId = 1001;

        var getResourceUrl = function (method) {
            return _baseUrl + method;
        };

        var wrapResponse = function (response) {
            var defer = $q.defer();

            response.then(function (respone) {
                data = respone.data;
                if (data.success === 'true')
                    defer.resolve(data);
                return defer.reject(data);
            }, function (reason) {
                $log.error(reason);
                return defer.reject(reason);
            });

            return defer.promise;
        };

        var _http = {

            get: function (method, data) {
                return wrapResponse($http.get(getResourceUrl(method), {params: data}))
                    .then(function (data) {
                        return data;
                    });
            }
            ,
            post: function (method, object) {
                var method = method + '?' + _http.preparePostData(object);
                return wrapResponse($http.post(getResourceUrl(method)))
            },
            preparePostData: function (data) {
                var query = [];
                for (prop in data) {
                    query.push(prop + '=' + data[prop]);
                }
                return query.join('&');
            }
        };

        return {

            account: {
                registration: function (data) {
                    return _http.post('registration', data);
                },
                login: function (data) {
                    return _http.get('login', data);
                },
                forgotPwd: function (data) {
                    return _http.post('forgotPassword', data);
                },

                getRecentActivity: function () {
                    var defer = $q.defer();
                    defer.resolve({
                        items: [
                            {
                                id: 'windows',
                                title: 'This is mocks',
                                img: ''
                            },
                            {
                                title: 'Microsft Windows'
                            },
                            {
                                title: 'Apple OSX'
                            }
                        ]
                    });
                    return defer.promise;
                }
            },

            books: {
                get: function () {
                    return _http.get('listbooks', {
                        user_id: profileService.getUserId(),
                        website_id: websiteId
                    });
                },

                getVersions: function (book) {
                    return _http.get('listVersions', {
                        user_id: profileService.getUserId(),
                        website_id: websiteId,
                        manual: book
                    });
                },

                getRecommendatedBooks: function () {
                    return _http.get('displayRecommendedBooks', {
                        user_id: profileService.getUserId(),
                        website_id: websiteId
                    });
                },

                getRecommendatedVersions: function () {
                    return _http.get('displayRecommendedVersions', {
                        user_id: profileService.getUserId(),
                        website_id: websiteId
                    });
                },

                getRecommendatedPages: function () {
                    return _http.get('displayRecommendedPages', {
                        user_id: profileService.getUserId(),
                        website_id: websiteId
                    });
                },
                displayPages: function (versionId) {
                    return _http.get('displayPages', {
                        user_id: profileService.getUserId(),
                        website_id: websiteId,
                        version_id: versionId
                    });
                },
                displayPage: function (id) {
                    return _http.get('displayPage', {
                        id: id
                    });
                },
                addBookmark: function (pageId) {
                    return _http.post('addBookmark', {page_id: pageId, user_id: profileService.getUserId()});
                },
                displayBookmarks: function () {
                    return _http.get('displayBookmarks', {user_id: profileService.getUserId()})
                }
            },

            glossary: {
                displayFaqs: function () {
                    return _http.get('displayFaqs',{user_id: profileService.getUserId(),website_id: websiteId });
                },
                displayFaq: function (id) {
                    return _http.get('displayFaq',{user_id: profileService.getUserId(),id: id })
                }
            },

            search: function (searchString) {
                var defer = $q.defer();
                defer.resolve({
                    items: [{
                        title: 'This is mocks',
                        shortDescription: 'This is mocks This is mocks This is mocks This is mocks',
                        id: 1,
                        tags: ['tag1', 'tag2', 'tag3', 'tag4']
                    }]
                });

                return defer.promise();
            }
        };
    }]);

})(angular.module('app'));
