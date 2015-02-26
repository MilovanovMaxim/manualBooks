/**
 * Created by rsabiryanov on 13.02.2015.
 */
(function (module) {

    module.factory('apiService', ['$http', '$q', '$log', 'profileService', function ($http, $q, $log, profileService) {

        var _baseUrl = 'http://marksmith.biz/mbooksapi/';

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
                return wrapResponse($http.get(getResourceUrl(method), {params: _http.addExtraData(data)}))
                    .then(function (data) {
                        return data;
                    });
            }
            ,
            post: function (method, object) {
                var method = method + '?' + _http.preparePostData(_http.addExtraData(object));
                return wrapResponse($http.post(getResourceUrl(method)))
            },
            preparePostData: function (data) {
                var query = [];
                for (prop in data) {
                    query.push(prop + '=' + data[prop]);
                }
                return query.join('&');
            },
            addExtraData: function (data) {
                if (!data)
                    data = {};
                var userId = profileService.getUserId();
                if(userId > 0)
                    data.user_id = userId;
                if(!data.website_id)
                    data.website_id = profileService.getWebsiteId();
                return data;
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
                    return _http.get('displayRecent',{user_id: profileService.getUserId()});
                },
                editUser: function (data) {
                    return _http.post('editUser', data);
                },
                displayUserNotes: function(){
                    return _http.get('displayUserNotes');
                },
                deleteUserNote: function(id){
                    return _http.post('deleteUserNote', {id: id});
                },
                addUserNote:function(note){
                    return _http.post('addUserNote', note);
                },
                statusUser: function(data){
                    return _http.post('statusUser', data);
                },
                changePassword: function(data){
                    return _http.post('changePassword', data);
                }
            },

            books: {
                get: function () {
                    return _http.get('listbooks', {
                        user_id: profileService.getUserId(),
                        website_id: profileService.getWebsiteId()
                    });
                },

                getVersions: function (book) {
                    return _http.get('listVersions', {
                        user_id: profileService.getUserId(),
                        website_id: profileService.getWebsiteId(),
                        manual: book
                    });
                },

                getRecommendatedBooks: function () {
                    return _http.get('displayRecommendedBooks', {
                        user_id: profileService.getUserId(),
                        website_id: profileService.getWebsiteId()
                    });
                },

                getRecommendatedVersions: function () {
                    return _http.get('displayRecommendedVersions', {
                        user_id: profileService.getUserId(),
                        website_id: profileService.getWebsiteId()
                    });
                },

                getRecommendatedPages: function () {
                    return _http.get('displayRecommendedPages', {
                        user_id: profileService.getUserId(),
                        website_id: profileService.getWebsiteId()
                    });
                },
                displayPages: function (versionId) {
                    return _http.get('displayPages', {
                        user_id: profileService.getUserId(),
                        website_id: profileService.getWebsiteId(),
                        version_id: versionId
                    });
                },
                displayPage: function (id) {
                    return _http.get('displayPage', {
                        id: id
                    });
                },
                addBookmark: function (pageId, manualId, manualVersionId) {
                    return _http.post('addBookmark', {
                        page_id: pageId,
                        manual_id: manualId,
                        manual_version_id: manualVersionId
                    });
                },
                displayBookmarks: function () {
                    return _http.get('displayBookmarks', {user_id: profileService.getUserId()})
                },
                downloadVersion: function(versionId){
                    return _http.get('downloadVersion', {version_id: versionId})
                },
                downloadPage: function(pageId){
                    return _http.get('downloadPage', {page_id: pageId})
                },
                removeBookmark: function (pageId) {
                    return _http.post('removeBookmark', {
                        id: pageId
                    });
                }
            },

            glossary: {
                displayFaqs: function () {
                    return _http.get('displayFaqs', {user_id: profileService.getUserId(), website_id: profileService.getWebsiteId()});
                },
                displayFaq: function (id) {
                    return _http.get('displayFaq', {user_id: profileService.getUserId(), id: id})
                }
            },

            tags: {
                get: function(){
                    return _http.get('getTags',{user_id: profileService.getUserId(), website_id: profileService.getWebsiteId()} );
                }
            },

            search: function (searchString) {
                return _http.get('search', {user_id: profileService.getUserId(), search: searchString});
            }
        };
    }]);

})(angular.module('app'));
