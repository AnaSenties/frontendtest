/**
 * Created by ana on 3/25/18.
 */
angular.module('testFrontEnd')
        .controller('testCtrl', testCtrl);
        function testCtrl($scope, testServices){

            //GLOBALS
            var radius = 100;
            var listMarker = [];
            var radiusCircle = null;
            var marker;
            var comparisonArray = [];
            var isAnimating = false;
            var responseItems = [];
            var infoWindow = null;
            var map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: 19.436947, lng: -99.1309971},
                zoom: 16
            });


            $scope.ratingTotal = 4;
            $scope.comparisonArray = [];
            $scope.originalPosition = {};
            $scope.showList = true;

            //ICON FROM https://material.io/icons/#ic_link
            $scope.orderByName = "name";
            $scope.orderByRating = "-rating";
            $scope.imagePath = 'images/ic_room_black_48px.svg';
            $scope.imageDetail = 'images/ic_expand_more_black_48px.svg';
            $scope.imageRating = 'images/ic_grade_black_48px.svg';
            $scope.imageRatingTotal = 'images/ic_star_border_black_48px.svg';
            $scope.imageSortByName = 'images/ic_sort_by_alpha_black_48px.svg';
            $scope.imageClose = 'images/ic_clear_white_48px.svg';
            $scope.linkInfo = 'images/ic_link_white_48px.svg';
            $scope.linkInfoBlack = 'images/ic_link_black_48px.svg';
            $scope.imageExpandInfo = 'images/ic_expand_more_black_48px.svg';


            /**
             * Service implementation to fetch data from
             * remote server.
             * @params :
             * @retuns :
             */
            function loadData(){
                testServices.getInfoService()
                    .then(function(data){
                        $scope.listItem = data.data;
                        responseItems = data.data;
                        for(var i = 0; i <responseItems.length; i++){
                            responseItems[i].completeInfo = false;

                        }
                    });
            }

            //CALLING SERVICE
            loadData();

            /**
             * Filters by rating and alphabetically
             * @param filter
             * @return
             */
            $scope.orderBy = function (filter){
                $scope.myFilter = filter;
            };

            /**
             * Helper method returns rating array
             * @param num
             * @returns {Array}
             */
            $scope.getRating = function(num) {
                return new Array(num);
            };

            /**
             * Clears all markers from map
             * @params
             * @retunr
             */
            function clearOverlays(){
                for(var i = 0; i < listMarker.length; i++){
                    listMarker[i].setMap(null);
                }
                listMarker.length = 0;
            }

            /**
             * Hides comparison panel, show full list and cleans comparison list
             * @params
             * @return
             */
            $scope.hideComparisonSection = function(){
                $scope.showList = true;
                $scope.comparisonArray = [];
            };

            /**
             * Called when the user clicks on a new location.
             * Takes in a list item and uses previous location if any
             * to handle map animation.
             * Sorts item list based on proximity to user selection.
             * @param data {Object}
             * @return
             */
            $scope.findLocation = function(data){
                document.getElementById("scroll").scrollTop = 0;
                $scope.listItem = bubbleSort(data, $scope.listItem);
                comparisonArray = [];
                $scope.comparisonArray = [];
                var counter = 0;
                $scope.avg = 0;
                if(isAnimating){
                    transition(
                        {
                            lat:data.address.location.lat,
                            lng: data.address.location.lng
                        },
                        {
                            lat:$scope.originalPosition.address.location.lat,
                            lng: $scope.originalPosition.address.location.lng
                        },
                        setPins
                    );
                }else{
                    setPins();
                    $scope.showList = false;
                }
                function setPins() {
                    if (radiusCircle != null) {
                        radiusCircle.setMap(null);
                    }

                    clearOverlays();

                    var numLat = data.address.location.lat;
                    var numLong = data.address.location.lng;

                    marker = new google.maps.Marker({
                        position: {lat: numLat, lng: numLong},
                        map: map,
                        icon: 'images/ic_restaurant_black_48px.svg'
                    });

                    listMarker.push(marker);

                    map.setCenter(marker.position);
                    radiusCircle = new google.maps.Circle({
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#FF0000',
                        fillOpacity: 0.35,
                        map: map,
                        center: marker.position,
                        radius: radius
                    });

                    map.setZoom(19);
                    clearOverlays();

                    for (i in responseItems) {
                        if (google.maps.geometry.spherical.computeDistanceBetween(
                                marker.position,
                                new google.maps.LatLng(
                                    $scope.listItem[i].address.location.lat,
                                    $scope.listItem[i].address.location.lng)) <
                            radius)
                        {
                            listMarker.push(new google.maps.Marker({
                                position: {
                                    lat: $scope.listItem[i].address.location.lat,
                                    lng: $scope.listItem[i].address.location.lng
                                },
                                map: map,
                                icon: 'images/ic_restaurant_black_48px.svg'
                            }));
                            comparisonArray.push(responseItems[i]);
                        } else {
                            counter++;
                            if (counter >= 3) {
                                break;
                            }
                        }
                    }
                    $scope.safeApply(function(){
                        $scope.comparisonArray = comparisonArray;
                        $scope.comparisonArray.map(function(obj){
                            $scope.avg += obj.rating;
                        });
                        $scope.avg = $scope.avg / $scope.comparisonArray.length;
                        $scope.originalPosition = $scope.comparisonArray[0];
                    })
                }
                isAnimating = true;
            };

            /**
             * BubbleSort based on proximity to user selection.
             * @param origin {Object}
             * @param posArray {Array}
             * @returns {Array}
             */
            function bubbleSort(origin, posArray){
                var swap = false;
                var temp = {};
                sort();
                var origin1, pos1, a, b;
                function sort(){
                    swap = false;
                    for(var i = 0; i < posArray.length-1; i++){

                        origin1 = new google.maps.LatLng(
                            origin.address.location.lat,
                            origin.address.location.lng
                        );
                        pos1 = new google.maps.LatLng(
                            posArray[i].address.location.lat,
                            posArray[i].address.location.lng
                        );
                        a = google.maps.geometry.spherical.computeDistanceBetween(origin1, pos1);
                        b = google.maps.geometry.spherical.computeDistanceBetween(
                            new google.maps.LatLng(
                                origin.address.location.lat,
                                origin.address.location.lng
                            ),
                            new google.maps.LatLng(
                                posArray[i+1].address.location.lat,
                                posArray[i+1].address.location.lng
                            )
                        );
                        if(b < a){
                            temp = posArray[i];
                            posArray[i] = posArray[i +1];
                            posArray[i +1] = temp;
                            swap = true;
                        }
                    }
                    if(swap){
                        sort()
                    }
                }
                return posArray
            }

            var x = 0;
            var deltaLat;
            var deltaLng;
            var deltas = 100;

            /**
             * Determines to and from position to animate the map.
             * @param destination {Object}
             * @param origin {Object}
             * @param callback {Function}
             */
            function transition(destination, origin, callback){
                x = 0;
                var tempMarker = new google.maps.Marker({
                    position: {lat: origin.lat, lng: origin.lng},
                    map: map,
                    icon: 'images/ic_restaurant_black_48px.svg'
                });

                clearOverlays();

                listMarker.push(tempMarker);
                deltaLat = (destination.lat - origin.lat)/deltas;
                deltaLng = (destination.lng - origin.lng)/deltas;
                moveMarker(callback);
            }

            /**
             * Moves the map from original position to user selection.
             * Calls setPins when finished.
             * @param callback {Function}
             */
            function moveMarker(callback){
                var latlng = new google.maps.LatLng(
                    $scope.originalPosition.address.location.lat + (deltaLat)*x,
                    $scope.originalPosition.address.location.lng + (deltaLng)*x);
                listMarker[0].setPosition(latlng);
                map.setCenter(latlng);
                radiusCircle.setCenter(latlng);
                if(x < deltas){
                    x++;
                    setTimeout(function(){moveMarker(callback)}, 10);
                }else{
                    $scope.showList = false;
                    callback();
                }
            }

            /**
             * Shows map bubbles
             * @param index {Number}
             * @param data  {Object}
             */
            $scope.displayPopUp = function (index, data){
                if(listMarker.length > 0 && listMarker.length >= index){
                    infoWindow = new google.maps.InfoWindow({
                        content: data.name
                    });
                    infoWindow.open(listMarker[index].get('map'), listMarker[index]);
                }
            };

            /**
             * Hides map bubbles
             * @params
             * @return
             */
            $scope.removePopUp = function (){
                if(infoWindow)
                    infoWindow.close();
                infoWindow = new google.maps.InfoWindow();
            };

            /**
             * Switches from Angular states
             * @param fn {Function}
             */
            $scope.safeApply = function(fn) {
                var phase = this.$root.$$phase;
                if(phase == '$apply' || phase == '$digest') {
                    if(fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };
        }