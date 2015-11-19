/**
 * Created by jonathanpopham on 11/3/15.
 */
var map;

function initialize() {
    var myLatlng = new google.maps.LatLng(33.75294,-84.40176);
    var mapOptions = {
        zoom: 15,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

}

var heatmap;
var ref = new Firebase('https://crimsonmap.firebaseio.com');
var database;

var currentTime = new Date();
function doLoad(e) {
    document.getElementById("hourOfDay").value = currentTime.getHours().toString();
    document.getElementById("dayOfWeek").selectedIndex = currentTime.getDay();
}

ref.on("value", function(snapshot) {
    console.log(snapshot.val());
    console.log(snapshot.numChildren());
    database = snapshot;
    buildMap();
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

function buildMap() {

    google.maps.event.addDomListener(window, 'load', initialize);

    var pointList = [];
    var count = 0;

    database.forEach(function(stuff) {
        //console.log(stuff.child(0).val());
        //console.log(stuff.key());
        var latlngStr = stuff.child("0").val().split(",",2);

        var type = stuff.child("1").val();
        var weekDay = stuff.child("2").val();
        var badlyFormattedTime = stuff.child("3").val();

        var hourDate = new Date(badlyFormattedTime);
        var hour = hourDate.getHours();

        var filterPoint = false;
        switch(type)
        {
            case "AGG ASSAULT":
                filterPoint = document.getElementById("aggassault").checked;
                break;
            case "AUTO THEFT":
                filterPoint = document.getElementById("autotheft").checked;
                break;
            case "BURGLARY":
                filterPoint = document.getElementById("burglary").checked;
                break;
            case "HOMICIDE":
                filterPoint = document.getElementById("homicide").checked;
                break;
            case "LARCENY":
                filterPoint = document.getElementById("larceny").checked;
                break;
            case "RAPE":
                filterPoint = document.getElementById("rape").checked;
                break;
            case "ROBBERY":
                filterPoint = document.getElementById("robbery").checked;
                break;
        }

        if(filterPoint)
        {
            filterPoint = document.getElementById("ignoreDay").checked || weekDay == document.getElementById("dayOfWeek").value;
        }

        if(filterPoint)
        {
            filterPoint = document.getElementById("ignoreHour").checked || hour.toString() == document.getElementById("hourOfDay").value;
        }

        if(filterPoint)
        {
            count = count + 1;
            var lat = parseFloat(latlngStr[0]);
            var lng = parseFloat(latlngStr[1]);
            var glatlng = new google.maps.LatLng(lat, lng);

            pointList.push(glatlng);

            //var name = stuff.key();

            //new google.maps.Marker({
            //        position: glatlng,
            //	    map: map,
            //	    title: name
            //    });
        }

    });

    var pointArray = new google.maps.MVCArray(pointList);

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: pointArray
    });

    heatmap.setMap(map);
    heatmap.set('radius', 20);

    document.getElementById("points").innerText = count;

}
function toggleHeatmap() {
    //heatmap.setMap(heatmap.getMap() ? null : map);
    if(heatmap) { heatmap.setMap(null); }
    buildMap();
}

function changeGradient() {
    var gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
    ];
    heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

function changeRadius() {
    var x = parseInt(document.getElementById("radiusText").value);
    if(x > 3)
    {
        heatmap.set('radius', x);
    }
}

function changeOpacity() {
    heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}

function changeDis() {
    heatmap.set('dissipating', heatmap.get('dissipating') ? false : true);
}

buildMap();