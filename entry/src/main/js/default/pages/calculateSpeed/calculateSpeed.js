import router from '@system.router'
import app from '@system.app'
import utils from '../../common/utils.js';
import sensor from '@system.sensor';
import device from '@system.device';
import geolocation from '@system.geolocation';

export default {
    data: {
        step: 'Walking Distance : ',
        displacement: ' ',
        speed: 'Speed ',
        distanceMeter: 0,
        distanceKM: 0,
        lat1: 38.630554,
        lon1: 38.630554,
        lat2: 38.630554,
        lon2: 38.630554
    },
    onInit() {
        let that = this;
        //stepcounter
        that.calculateStepDistance();
        that.getInitialLocation();
        //timer -speed calculator
        var intervalID = setInterval(function () {
            that.calculateStepDistance();
            //calculate displacement with geolocation
            that.finalLocation();
        }, 30000); //5*60*1000
    },
    calculateStepDistance() {
        let that = this;
        sensor.subscribeStepCounter({
            success: function (response) {
                console.log(response.steps);
                that.stepDistance(response.steps);
            },
            fail: function (data, code) {
                console.log('subscribe step count fail, code:' + code + ', data:' + data);
            },
        });
    },
    stepDistance(steps) {
        let instantDistance = parseInt(steps * 0.762);
        //distance in meter
        this.distanceMeter += instantDistance;
        if (this.distanceMeter < 1000) {
            this.step = this.distanceMeter + ' M';
        } else {
            this.distanceKM = this.distanceMeter / 1000;
            this.step = this.distanceKM + ' KM'
        }
        instantDistance = instantDistance / 1000; //convert instant distance from m to km
        let mSpeed = parseInt(instantDistance / 0.002777777777777); //5 min = 0.002777777777777 hour
        this.speed = mSpeed + 'km/h'
    },
    finalLocation() {
        let that = this;
        geolocation.getLocation({
            success: function (data) {
                that.lat2 = data.latitude;
                that.lon2 = data.longitude;
                console.log('success get location 2 data. latitude:' + that.lat2);
                console.log('success get location 2 data. longitude:' + that.lon2);
                try {
                    that.calculateDisplacement();
                }
                catch (e) {
                    console.log('Error : ' + e);
                }
            },
            fail: function (data, code) {
                console.log('fail to get location 2. code:' + code + ', data:' + data);
            },
        });
    },
    calculateDisplacement() {
        let _lat1 = this.lat1
        let _lon1 = this.lon1
        let _lat2 = this.lat2
        let _lon2 = this.lon2;
        console.log("fist location; lat: "+_lat1+"lon:"+_lon1);
        console.log("final location; lat: "+_lat2+"lon:"+_lon2);
            //haversine formula
        var R = 6371e3; // metres
        var rad_lat1 = _lat1 * Math.PI / 180; // φ, λ in radians
        var rad_lat2 = _lat2 * Math.PI / 180;
        var Dlat = (_lat2 - _lat1) * Math.PI / 180;
        var Dlon = (_lon2 - _lon1) * Math.PI / 180;

        var a = Math.sin(Dlat / 2) * Math.sin(Dlat / 2) +
        Math.cos(rad_lat1) * Math.cos(rad_lat2) *
        Math.sin(Dlon / 2) * Math.sin(Dlon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var _displacement = parseInt(R * c); // in metres

  /*
  //Spherical Law of Cosines
        var rad_lat1 = _lat1 * Math.PI / 180
        var rad_lat2 = _lat2 * Math.PI / 180
        var Dlon = (_lon2 - _lon1) * Math.PI / 180
        var R = 6371e3;
        var _displacement = parseInt(Math.acos(Math.sin(rad_lat1) * Math.sin(rad_lat2) + Math.cos(rad_lat1) * Math.cos(rad_lat2) * Math.cos(Dlon)) * R);
*/
        if (_displacement < 1000) {
            this.displacement = _displacement + 'm';
        }
        else {
            _displacement = _displacement / 1000;
            this.displacement = _displacement + 'km';
        }
    },
    getInitialLocation() {
        let that = this;
        geolocation.getLocation({
            success: function (data) {
                that.lat1 = data.latitude;
                that.lon1 = data.longitude;
                console.log('success get location 1 data. latitude:' + that.lat1);
                console.log('success get location 1 data. longitude:' + that.lon1);
            },
            fail: function (data, code) {
                console.log('fail to get location 1. code:' + code + ', data:' + data);
            },
        });
    },
    touchMove(e) { // Handle the swipe event.
        if (e.direction == "right") // Swipe right to exit.
        {
            utils.backToHome();
            geolocation.unsubscribe();
            sensor.unsubscribeStepCounter();
        }
    }
}
