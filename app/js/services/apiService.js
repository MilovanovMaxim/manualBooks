/**
 * Created by rsabiryanov on 13.02.2015.
 */
(function (module) {

    module.factory('apiService', ['$http', '$q', '$log', function ($http, $q, $log) {

        var _baseUrl = 'http://marksmith.biz/mbooksapi/';
        var websiteId = 1001;
        var currentUserId = 0;

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
                        currentUserId = data.id;
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

                getRecentActivity: function(){
                    var defer = $q.defer();
                    defer.resolve({
                        items:[
                            {
                                id:'windows',
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
                    })
                    return defer.promise;
                }
            },

            books: {
                get: function () {
                    return _http.get('listbooks', {
                        user_id: currentUserId,
                        website_id: websiteId
                    });
                },

                getVersions: function (book) {
                    return _http.get('listVersions', {
                        user_id: currentUserId,
                        website_id: websiteId,
                        manual: book
                    });
                },

                getRecommendatedBooks: function(){
                    return _http.get('displayRecommendedBooks',{
                        user_id: currentUserId,
                        website_id: websiteId
                    });
                },

                getRecommendatedVersions: function(){
                    return _http.get('displayRecommendedVersions',{
                        user_id: currentUserId,
                        website_id: websiteId
                    });
                },

                getRecommendatedPages: function(){
                    return _http.get('displayRecommendedPages',{
                        user_id: currentUserId,
                        website_id: websiteId
                    });
                },
                displayPages: function(versionId){
                    return  _http.get('displayPages',{
                        user_id: currentUserId,
                        website_id: websiteId,
                        version_id: versionId
                    });
                },
                displayPage:function(id){
                    return  _http.get('displayPage',{
                        id: id
                    });
                },
                addBookmark: function(pageId){
                    return _http.post('addBookmark',{page_id :pageId, user_id: currentUserId});
                }
            },

            glossary: {
                getGlossary: function () {
                    return [{
                        id: "1",
                        FAQ: "How to make tea?"
                    }, {
                        id: "2",
                        FAQ: "How to make eggs?"
                    }];
                },
                getDetails: function () {
                    return {
                        gggxxx: [
                            {
                                "notes": "A means of connecting a computer to any other computer anywhere in the world via dedicated routers and servers. When two computers are connected over the Internet, they can send and receive all kinds of information such as text, graphics, voice, video, and computer programs.No one owns Internet, although several organizations the world over collaborate in its functioning and development. The high-speed, fiber-optic cables (called backbones) through which the bulk of the Internet data travels are owned by telephone companies in their respective countries.The Internet grew out of the Advanced Research Projects Agency's Wide Area Network (then called ARPANET) established by the US Department Of Defense in 1960s for collaboration in military research among business and government laboratories.Later universities and other US institutions connected to it. This resulted in ARPANET growing beyond everyone's expectations and acquiring the name 'Internet.'The development of hypertext based technology (called World Wide web, WWW, or just the Web) provided means of displaying text, graphics, and animations, and easy search and navigation tools that triggered Internet's explosive worldwide growth. Read more: http://www.businessdictionary.com/definition/internet.html#ixzz3OfFHLjKV"
                            }
                        ]
                    }
                }
            },

            search: function(searchString){
                var defer = $q.defer();
                defer.resolve({
                    items: [{
                        title:'This is mocks',
                        shortDescription: 'This is mocks This is mocks This is mocks This is mocks',
                        id:1,
                        tags: ['tag1','tag2','tag3','tag4']
                    }]
                });

                return defer.promise();
            }
        };
    }]);

})(angular.module('app'));
