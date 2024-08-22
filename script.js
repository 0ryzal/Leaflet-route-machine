window.onload = function(){
    // initialize map
    var map = L.map('map', {
    center: [-7.2830013, 112.7952795],
    zoom: 13 });

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map)   ;

    var baselayers = {
        OSM: L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png'),
        ESRI: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'),
        openTopo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'),
        Forest: L.tileLayer('https://dev.{s}.tile.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'),
        velo: L.tileLayer('http://tile.thunderforest.com/cycle/${z}/${x}/${y}.png')
    };
  baselayers.OSM.addTo(map);

    var Cadastre = L.tileLayer.wms('http://localhost:8080/geoserver/yaounde/wms',
    {layers: 'yaounde:yde',
    format: 'image/png',
    transparent: true
    });

    var National = L.tileLayer.wms('http://localhost:8080/geoserver/yaounde/wms',
    {layers: 'yaounde:national',
    format: 'image/png',
    transparent: true
    });

    var Point = L.tileLayer.wms('http://localhost:8080/geoserver/yaounde/wms',
    {layers: 'yaounde:monument historique',
    format: 'image/png',
    transparent: true
    });

    ms_url="http://localhost:8080/geoserver/yaounde/wms";
        
        function Identify(e) 
        {
            var BBOX = map.getBounds().toBBoxString();
            var WIDTH = map.getSize().x;
            var HEIGHT = map.getSize().y;
            var X = map.layerPointToContainerPoint(e.layerPoint).x;
            var Y = map.layerPointToContainerPoint(e.layerPoint).y;

            var URL = ms_url + 'SERVICE=WMS&VERSION=1.1.0&REQUEST=GetFeatureInfo&LAYERS=yaounde:yde&QUERY_LAYERS=yaounde:yde&BBOX='+BBOX+'&FEATURE_COUNT=1&HEIGHT='+HEIGHT+'&WIDTH='+WIDTH+'&INFO_FORMAT=text%2Fhtml&SRS=EPSG%3A4326&X='+X+'&Y='+Y;

            $.ajax({
                url: URL,
                dataType: "html",
                type: "GET",
                success: function(data) 
                {
                    var popup = new L.Popup
                    ({
                        maxWidth: 300
                    });
    
                    popup.setContent(data);
                    popup.setLatLng(data.latlng);
                    map.openPopup(popup);
                }
            });
        }

        map.on('click', Identify);


    var marqueurs ={"Yaounde": Cadastre,"Point": Point,"Route Nationnale":National};

    L.control.layers(baselayers, marqueurs).addTo(map);

    L.control.scale().addTo(map);

    routingControl = L.Routing.control({

    lineOptions: {
        styles: [{color: '#1a4bcc', opacity: 1, weight: 7}]
    },

    router: new L.Routing.osrmv1({
        language: 'en',
        profile: 'car', 
    }),

        geocoder: L.Control.Geocoder.nominatim()
    }).addTo(map)

   map.locate({setView: false, watch: true, maxZoom: 17});
        map.once('locationfound', function(ev){
  routingControl.setWaypoints(ev.latlng);

    });
}