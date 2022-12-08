var lines = [];
var edges = [];
var edgeLayerGroup = new L.LayerGroup();
var dataPath = 'static/data/'

d3.csv(dataPath + 'SanFrancisco_edges.csv', function(error, data) {
    for(var n = 0; n < 4468; n++) {
        if (error) throw error;

        var geometry = data[n].geometry.slice(12, data[n].geometry.length - 1);
        var slice = geometry.split(', ')
        var polylineGeometrys = []
        for (var i=0; i < slice.length; i++) {
            var location = slice[i].split(' ');
            polylineGeometrys.push([location[1], location[0]])
        }
        var m_polyline = new L.polyline(polylineGeometrys, {
            color: 'red',
            weight: 5,
            customData: {
                edge_index: n,
                edge_osmid: data[n].osmid,
                edge_length: data[n].length
            }
        })
        lines.push(m_polyline)
    }
})

d3.csv(dataPath + 'SanFrancisco_edges.csv', function(error, data) {
    d3.csv(dataPath + 'usage.csv', function(error, udata) {
        if (error) throw error;
        var col = 'red'
        for(var n = 0; n < 4468; n++) {
            if (error) throw error;
            col = 'red'
            var geometry = data[n].geometry.slice(12, data[n].geometry.length - 1);
            var slice = geometry.split(', ')
            var polylineGeometrys = []
            for (var i=0; i < slice.length; i++) {
                var location = slice[i].split(' ');
                polylineGeometrys.push([location[1], location[0]])
            }
            if (udata[12][n] < 500) {
                col = 'green'
            } else if (udata[12][n] < 1000) {
                col = 'orange'
            }
            var m_polyline = new L.polyline(polylineGeometrys, {
                color: col,
                weight: 5,
                customData: {
                    edge_index: n,
                    edge_osmid: data[n].osmid,
                    edge_length: data[n].length
                }
            }).addTo(map)

            if (udata[15][n] < 500) {
                col = 'green'
            } else if (udata[15][n] < 1000) {
                col = 'orange'
            }
            var m_polyline = new L.polyline(polylineGeometrys, {
                color: col,
                weight: 5,
                customData: {
                    edge_index: n,
                    edge_osmid: data[n].osmid,
                    edge_length: data[n].length
                }
            }).addTo(map2)
        }
    })
})

