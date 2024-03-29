'use strict';

/**
 * @ngdoc function
 * @name telehealthApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the telehealthApp
 */
angular.module('telehealthApp')
    .controller('formController', function(restcalls, $scope, $filter, $rootScope) {

        $scope.data = {};

        // function to process the form
        $scope.processForm = function() {};

        // TO Get Reasons List
        restcalls.getReasonsList().then(function(response) {
            $scope.reasons = response.data;
            $scope.selected = $scope.reasons[""];
        });

        // TO Get Locations List
        restcalls.getLocations().then(function(response) {
            $scope.states = response.data;
            $scope.data.searchTextSelected = $scope.states[""];
        });

        $scope.validateLocation = function() {
            if ((!$scope.data.searchTextSelected) === $scope.states.name) {
                console.log("Location is invalid");
            }
        };

        var currentDate = moment();

        var firstWeek = moment().add(1, 'w');
        var secondWeek = moment().add(2, 'w');
        var firsttabdate = currentDate.clone();
        var secondtabDate = firstWeek.clone();
        var thirdtabDate = secondWeek.clone();

        function getTabDate(tabdate) {
            return tabdate.format('MMM') + " " + tabdate.startOf('week').format('DD') + " - " + tabdate.endOf('week').format('DD'); //+", "+tabdate.format('YYYY')
        }

        $scope.firstTab = getTabDate(firsttabdate);
        $scope.secondTab = getTabDate(secondtabDate);
        $scope.thirdTab = getTabDate(thirdtabDate);



          
        var fnWeekDays = function(dt) {

                
            var currentDate = dt;    
            var weekStart = currentDate.clone().startOf('week');    
            var weekEnd = currentDate.clone().endOf('week');

            var days = [];

                
            for (var i = 0; i <= 6; i++) {
                //days.push(moment(weekStart).add(i, 'days').format("dddd MMMM Do"));                 
                days.push(moment(weekStart).add(i, 'days').format("ddd D"));    
            }    
            return days;  
        };     
        $scope.weekDays = fnWeekDays(currentDate);
        $scope.divIndex = "tab1";

        $scope.currentWeekDates = function(Week1) {
            $scope.weekDays = fnWeekDays(currentDate);
            $scope.weekData = $scope.firstWeekData;
            $scope.iscurrentWeekNavPillActive = true;
            $scope.isfirstWeekNavPillActive = false;
            $scope.issecondWeekNavPillActive = false;
            $scope.divIndex = "tab1";
        };

          
        $scope.firstWeekDates = function(Week2) {
            $scope.weekDays = fnWeekDays(firstWeek);
            $scope.weekData = $scope.secondWeekData;
            $scope.iscurrentWeekNavPillActive = false;
            $scope.isfirstWeekNavPillActive = true;
            $scope.issecondWeekNavPillActive = false;
            $scope.divIndex = "tab2";
        };

          
        $scope.secondWeekDates = function(week3) {
            $scope.weekDays = fnWeekDays(secondWeek);
            $scope.weekData = $scope.thirdWeekData;
            $scope.iscurrentWeekNavPillActive = false;
            $scope.isfirstWeekNavPillActive = false;
            $scope.issecondWeekNavPillActive = true;
            $scope.divIndex = "tab3";
        };
        var currentWeekDataOriginal = [];
        var firstWeekDataOriginal = [];
        var secondWeekDataOriginal = [];

        var getSlotsByLocationHits = false;
        var searchTextSelected = '';

        $scope.getSlotsByLocation = function() {
            if (!getSlotsByLocationHits || searchTextSelected != $scope.data.searchTextSelected.name) {

                $scope.iscurrentWeekNavPillActive = true;
                $scope.isfirstWeekNavPillActive = false;
                $scope.issecondWeekNavPillActive = false;
                getSlotsByLocationHits = true;

                restcalls.getAllSlots($scope.data.searchTextSelected.name).then(function(response) {
                    searchTextSelected = $scope.data.searchTextSelected.name;
                    var threeWeeksData = response.data;
                    $scope.firstWeekData = addDummyDataToWeek(threeWeeksData.week1);

                    $scope.weekData = $scope.firstWeekData;

                    $scope.secondWeekData = threeWeeksData.week2;

                    $scope.thirdWeekData = threeWeeksData.week3;


                    angular.copy($scope.firstWeekData, currentWeekDataOriginal);
                    angular.copy($scope.secondWeekData, firstWeekDataOriginal);
                    angular.copy($scope.thirdWeekData, secondWeekDataOriginal);
                });
            }
        };


        function addDummyDataToWeek(weekData) {
            var requiredDummyObjects = 7 - weekData.length;
            var Dummies = [];
            for (var i = requiredDummyObjects; i > 0; i--) {
                var date = new Date();
                date.setDate(date.getDate() - i);
                var dummy = {
                    "slots": [{
                        "available": "Blocked",
                        "start_Time": "N",
                        "end_Time": "A",
                        "slot_id": 3
                    }, {
                        "available": "Blocked",
                        "start_Time": "N",
                        "end_Time": " A",
                        "slot_id": 2
                    }, {
                        "available": "Blocked",
                        "start_Time": "N",
                        "end_Time": "A",
                        "slot_id": 1
                    }],
                    "date": date
                };
                Dummies.push(dummy);
            }
            angular.forEach(weekData, function(day, index) {
                if (index === 0) {
                    var current_timehh = new moment().format("hh");
                    var current_timeHH = new moment().format("HH");
                    var slots = day.slots;
                    for (var i = 0; i < slots.length; i++) {
                        var endtime = Number(slots[i].end_Time.split(":")[0]);
                        if (endtime === 11 && endtime <= current_timeHH) {
                            slots[i].start_Time = 'N';
                            slots[i].end_Time = 'A';
                            slots[i].available = 'Blocked';
                        } 
                        else if (endtime != 11 && (endtime + 12) <= current_timeHH) {
                            slots[i].start_Time = 'N';
                            slots[i].end_Time = 'A';
                            slots[i].available = 'Blocked';
                        }
                    }
                }

                Dummies.push(day);
            });
            return Dummies;
        }

        $scope.toggledDay = [];

        $scope.toggleButton = function(available, index, slotArray, weekData) {
            $scope.toggledDay = [];

            angular.copy(secondWeekDataOriginal, $scope.thirdWeekData);
            angular.copy(firstWeekDataOriginal, $scope.secondWeekData);
            angular.copy(currentWeekDataOriginal, $scope.firstWeekData);

            if (available === 'Yes') {
                $scope.weekData[index].slots[slotArray].available = 'Selected';
                $scope.toggledDay.push($scope.weekData[index].date);
                $scope.toggledDay.push($scope.weekData[index].slots[slotArray]);
                console.log(JSON.stringify($scope.toggledDay) + "-----");
            } else {
                $scope.weekData[index].slots[slotArray].available = 'Yes';
                $scope.toggledDay = [];
            }

        };

        $rootScope.getConfirmedDetails = function() {
            $rootScope.locationName = $scope.data.searchTextSelected.name;
            $rootScope.reasonType = $scope.data.selected.indetail;
            $rootScope.selectedDate = $scope.toggledDay[0];
            $rootScope.selectedSlot = $scope.toggledDay[1].start_Time + ' - ' + $scope.toggledDay[1].end_Time;
        };


    }).directive('myRepeatDirective', function() {
        return function(scope, element, attrs) {
            scope.$watch('weekData', function() {
                // all the code here...
                if (scope.$last) {
                    scope.$emit('LastElem');
                }
            });


        };
    })
    .directive('myMainDirective', function() {
        return function(scope, element, attrs) {

            scope.$on('LastElem', function(event) {
                var  owl  =  $('.owl-carousel');
                var dow = 0;

                owl.trigger('destroy.owl.carousel');

                $("#tab1,#tab2,#tab3").owlCarousel({
                    navText: ["<img src='../images/previous.png'>", "<img src='../images/next.png'>"],
                    rewindNav: true,
                    responsiveClass: true,
                    touchDrag : false,
                    mouseDrag  : false,

                    responsive: {
                        0: {
                            items: 1,
                            nav: true,
                            loop: false
                        },
                        600: {
                            items: 3,
                            nav: true,
                            loop: false
                        },
                        1025: {
                            items: 4,
                            nav: true,
                            loop: false
                        },
                        1280: {
                            items: 7,
                            nav: false,
                            loop: false
                        }
                    }

                });

                if(screen.width <= 320 ) {
                    if(scope.toggledDay && scope.toggledDay[0]) {
                        dow = new Date(scope.toggledDay[0]).getDay();
                    }

                    if(dow > 0) {
                        $('.owl-carousel').trigger('to.owl.carousel', [dow]);
                    }
                }

            });
        };
    });