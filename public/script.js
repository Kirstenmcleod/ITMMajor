let map,
    directionsRenderer,
    directionsService,
    waypoints = [],
    jsonWaypoints = [],
    locations = [],
    marker,
    observer,
    scrolled = false,
    mapInitial;

const route = [
    {lat:-33.81304169068419,lng:151.17029426802648},
    {lat:-33.04703236787515,lng:151.6149668},
    {lat:-32.348951807018395,lng:150.08749699357728},
    {lat:-32.599034017734105,lng:149.5867550625885},
    {lat:-31.27334049372182,lng:149.277127345301},
    {lat:-31.280637382157323,lng:149.0135578304929},
    {lat:-28.97224834747879,lng:147.79550597705045},
    {lat:-32.056069337737895,lng:151.6622943328867},
    {lat:-31.88423648651268,lng:152.6542647065874},
];

let weathers={
    "sunny":"fa-sun",
    "overcast":"fa-cloud",
    "heavy fog":"fa-smog",
    "thunderstorm":"fa-cloud-bolt",
    "sunset":"fa-mountain-sun"
};

window.addEventListener('scroll', function() {
    let scrollPosition = window.scrollY;

    if(scrollPosition > 100) setMapPosition();
        
    if(scrollPosition > 300){
        fadeOut(scrollIcon);
    } else if(scrollPosition > 200){
        scrolled = true;
    }
});

document.getElementById('sizzle').addEventListener('ended', function(e) {
    if(!scrolled){
        const scrollIcon = document.getElementById('scrollIcon');
        const mother = document.getElementById('header-overlay');
        const whatarewe = document.getElementById('header-whatarwe');
        const fightingfor = document.getElementById('header-fightingfor');
        scrollIcon.style.display = 'block';
        mother.style.display = 'block';
        fightingfor.style.display = 'block';
        fadeOut(mother);
        fadeIn(scrollIcon);
        fadeIn(whatarewe);
        fadeIn(fightingfor);
        e.target.setAttribute('src', 'https://mother-content.s3.ap-southeast-2.amazonaws.com/Mother2.mp4');
        scrolled = true;
    } else {
        e.target.setAttribute('src', 'https://mother-content.s3.ap-southeast-2.amazonaws.com/Mother1.mp4');
    }
    e.target.play(e.target.muted);
});

window.addEventListener('click', function(e) {
    if(e.target.closest("#play")){
        play(false);
    } else if(e.target.closest("#play-muted")){
        play(true);
    } else if(["header-overlay","sizzle","header-logo","fightingfor-logo","whatarwe-logo"].includes(e.target.id)){
        playOrPause();
    }
});

function play(muted){
    let sizzle = document.getElementById('sizzle');
    sizzle.muted = muted;
    sizzle.play();
    fadeOut(document.getElementById('button-container'));
}

function playOrPause() {
    let sizzle = document.getElementById('sizzle');
    if (sizzle.paused) {
        sizzle.play();
    } else {
        sizzle.pause();
    }
}

visualViewport.addEventListener("resize", () => {
    setMapPosition();
});

function setMapPosition(){
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    console.log(`Viewport resized to ${vw} by ${vh}`)
    
    let scrollPosition = window.scrollY;
    let firstLocationDiv = document.getElementsByClassName("location-container")[0];
    mapInitial = firstLocationDiv.getBoundingClientRect().y + scrollPosition;
    let myMap = document.getElementById("map")

    if(vw <= 1200){
        myMap.style.display = "none";
    } else {
        myMap.style.display = "block";
        if(scrollPosition > mapInitial){
            myMap.style.position = 'fixed';
            myMap.style.top = '0px';
        } else {
            myMap.style.position = "absolute";
            myMap.style.top = mapInitial+"px";
        }
    }
}


document.addEventListener("DOMContentLoaded", () => {    
    let locationsTask = getLocations();
    locationsTask.then(async function(data) {
        locations = data;

        var featuredLocation = 'initiated';
        var isFirstLocation = true;
        var isFeaturedLocation = false;
        const icon = document.createElement("div");
        icon.innerHTML = '<i class="fa fa-pizza-slice fa-lg"></i>';
        var content = document.getElementById('content');
        
        for (const location of locations) {
            if(!location.weather) location.weather = "Sunny";
            if(!location.Temp) location.Temp = "27";

            if(
                !location["Dropbox Link"] ||
                !location["latitude"] ||
                !location["longitude"] ||
                !location["weather"] ||
                !location["Temp"]
            ){
                continue;
            }
            var div = document.createElement("div");
            div.setAttribute("id",`location-${location.ID}`);
            div.dataset.location = location.ID;
            div.classList.add("waypoint");
            if (featuredLocation == 'initiated' || 
                (
                    location.featuredLocation &&
                    featuredLocation != location.featuredLocation
                )
            ){
                
                isFeaturedLocation = true;
                var h1 = document.createElement('h1');
                div.classList.add("featured");
                h1.innerHTML = location.featuredLocation;
                div.appendChild(h1);
                try{

                    const featuredTag = document.createElement("div");

                    featuredTag.className = "featured-tag";
                    featuredTag.textContent = location.featuredLocation;

                    var AdvancedMarkerElement = new google.maps.marker.AdvancedMarkerElement({
                        map,
                        content: featuredTag,
                        position: {lat:parseFloat(location.latitude),lng:parseFloat(location.longitude)},
                        title: location.imageTitle,
                        collisionBehavior: "OPTIONAL_AND_HIDES_LOWER_PRIORITY",
                        zIndex: 100
                    });
                    
                    AdvancedMarkerElement.addListener("click", ()=>{
                        let el = document.getElementById(`location-${location.ID}`);
                        el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
                    });
                } catch(e){
                    console.error('add',e);
                }
                
                featuredLocation = location.featuredLocation;
            }

            let overlay =`<div class="location-container">
                    <img src="${location.s3url || (location['Dropbox Link']+'&raw=1')}" class="location-image large" alt="${location.imageTitle}" </img>
                    <div class="overlay">
                        <i class="fas fa-info-circle unhover"></i>
                        <table class="hover overlay-container">
                            <tbody>
                                <tr><td colspan="2" class="overlay-title">${location.imageTitle}</td></tr>
                                <tr><td colspan="2" class="overlay-text">${location.description}</td></tr>`;
            if(location.featuredLocation) overlay += `<tr><td colspan="2" class="overlay-meta"><i class="fa-solid fa-location-dot"></i>${location.featuredLocation}</td></tr>`;
                            
            overlay +=`   <tr><td colspan="2" class="overlay-meta"><i class="fa-solid fa-crosshairs"></i>${location.latitude},${location.longitude}</td></tr>
                                <tr><td colspan="2" class="overlay-meta"><i class="fa-solid fa-hands-holding-circle"></i>${location.traditionalCustodians}</td></tr>
                                <tr><td colspan="2" class="overlay-meta"><i class="fa-solid ${weathers[location.weather.toLowerCase()]}"></i>${location.weather}</td></tr><tr>
                                <td colspan="2" class="overlay-meta"><i class="fa-solid fa-temperature-half"></i>${location.Temp}&deg;C</td></tr><tr>
                                <td colspan="2" class="overlay-meta"><a target="_blank" href="${location["Dropbox Link"]}&raw=1"><i class="fa-solid fa-arrow-up-right-from-square" style="color: #ffffff;"></i>Open File</a></td></tr>`;
            if(location.readMore) overlay += `<tr><td colspan="2" class="overlay-meta"><a target="_blank" href="${location.readMore}"><i class="fa-solid fa-link"></i>${location.linkDescription||"Read More"}</a></td></tr>`;
            overlay +=`   </tbody></table></div></div>`;

            div.innerHTML += overlay;
            
            content.appendChild(div);

            isFirstLocation = false;

            div.addEventListener("mouseover", function(e){
                moveMarker(e.target.closest(".waypoint").getAttribute("data-location"));
            });
        }

        for (r = 1; r < route.length; r++) { 
            waypoints.push({
                location: new google.maps.LatLng(route[r].lat,route[r].lng),
                stopover: false
            });
        }
        directionsService
            .route({
                origin: new google.maps.LatLng(route[0].lat,route[0].lng),
                destination: new google.maps.LatLng(route[0].lat,route[0].lng),
                waypoints: waypoints,
                optimizeWaypoints: true,
                travelMode: google.maps.TravelMode.DRIVING,
            })
            .then((response) => {
                directionsRenderer.setDirections(response);
            })
            .catch((e) => {
                console.warn("Directions request failed due to " + status);
            })


        marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: new google.maps.LatLng(route[0].lat,route[0].lng),
            draggable: false,
            title: "Drag me!",
            zIndex: 9999,
            collisionBehavior: "OPTIONAL_AND_HIDES_LOWER_PRIORITY"
        });


        observer = new IntersectionObserver(function(entries, observer) {
            entries.forEach((entry)=>{
                console.log(entry.target.id, (entry.isIntersecting) ? 'entering' : 'exiting');
            });
        });

        /*
        document.querySelectorAll('.waypoint').forEach((i) => {
            if (i) {
                observer.observe(i);
            }
        });
        */

        let target = document.querySelector("#map")
        observer.observe(target);
        setMapPosition();
    });
});

function fadeOut(fadeTarget) {
    fadeTarget.classList.add("out");
    fadeTarget.classList.remove("in");
}

function fadeIn(fadeTarget) {
    fadeTarget.classList.add("in");
    fadeTarget.classList.remove("out");
}

async function getLocations() {
    return new Promise(async function(resolve, reject) {
        const xhr = new XMLHttpRequest(); 
        xhr.open("GET", "/ajax/locations", true); 
        xhr.getResponseHeader("Content-type", "application/json"); 
        
        xhr.onload = function() { 
            resolve(JSON.parse(this.responseText)); 
        } 
        
        xhr.send(); 
    });
}

async function initMap() {
    let {Map} = await google.maps.importLibrary("maps");
    let {AdvancedMarkerElement} = await google.maps.importLibrary("marker");
    directionsRenderer = new google.maps.DirectionsRenderer();

    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    let zoomLevel = (vw>1500) ? 8 : 7;

    // Create a map object, and include the MapTypeId to add
    // to the map type control.
    map = new google.maps.Map(document.getElementById("map"),{
        mapId: "441e98620296930",
        center: {
            lat: -34.00,
            lng: 150.000
        },
        zoom: zoomLevel,
        minZoom: zoomLevel,
        maxZoom: zoomLevel,
        mapTypeControl: false,
        mapTypeControlOptions: {},
        scrollwheel: false,
        scaleControl: false,
        zoomControl: false,
        fullscreenControl: false,
        gestureHandling: 'none',
        disableDoubleClickZoom: true,
        draggable: false,
        navigationControl: false,
        streetViewControl: false,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer.setMap(map);
}

function moveMarker(id) {
    for (const location of locations) {
        if(location.ID==id){
            //console.log(location);
            marker.position = new google.maps.LatLng(parseFloat(location.latitude),parseFloat(location.longitude));
            //marker.setPosition(new google.maps.LatLng(parseFloat(location.latitude),parseFloat(location.longitude)));
            //marker.setZIndex(9999)
            return;
            
        }
    }          
};