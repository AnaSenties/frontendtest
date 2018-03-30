/**
 * Created by ana on 3/25/18.
 */
angular.module('testFrontEnd')
    .service('testServices', testServices);

/**
 * Service to get data
 * @param $http {Object}
 * @param $q    {Object}
 * @return promise {object}
 */
    function testServices ($http, $q){

        this.getInfo = function(){
            var urlInfo = "https://s3-us-west-2.amazonaws.com/lgoveabucket/data_melp.json"
            return $http({
                method: 'GET',
                url: urlInfo
            })
        };

        this.getInfoService = function(){
            var deferred = $q.defer();

            this.getInfo()
                .then(function(data){
                    /*console.log(data)*/
                    deferred.resolve(data);
                });
            return deferred.promise;
        };


    };