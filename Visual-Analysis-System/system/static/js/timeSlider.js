var conEdgeLayerGroup = new L.LayerGroup();
var conLines = []
var selectFlag = 0
var slider = document.getElementById("myRange");
var output = document.getElementById("value");
output.innerHTML = slider.value;

slider.oninput = function() {
    output.innerHTML = '<b>' + this.value + '</b>';
    map.removeLayer(conEdgeLayerGroup);
    conEdgeLayerGroup.clearLayers();
    plotCongestionEdge(this.value);
}

function plotCongestionEdge (n) {

    d3.csv('static/data/density.csv', function(error, cdata) {
        d3.csv('static/data/congestion.csv', function(error, data) {
            d3.csv('static/data/SanFrancisco_edges.csv', function(error, edata) {
                if (error) throw error;
                for(var n = 0; n < 4468; n++) {
                    if (error) throw error;
                    var popupMessage = "No congestion degree"
                    for (var j = 0; j < cdata.length; j++) {
                        if (parseInt(cdata[j].index) == n) {
                            popupMessage = "Congestion degree: " + cdata[j].degree
                        }
                    }

                    if (data[slider.value][n] == 1) {
                        var geometry = edata[n].geometry.slice(12, edata[n].geometry.length - 1);
                        var slice = geometry.split(', ')
                        var polylineGeometrys = []
                        for (var i=0; i < slice.length; i++) {
                            var location = slice[i].split(' ');
                            polylineGeometrys.push([location[1], location[0]])
                        }
                        var m_polyline = new L.polyline(polylineGeometrys, {
                            color: 'red',
                            weight: 10,
                            opacity: 0.4,
                            customData: {
                                edge_index: n,
                                edge_osmid: edata[n].osmid,
                                edge_length: edata[n].length
                            }
                        }).on('mouseover', function(e) {
                            this.openPopup();
                            e.target.setStyle({
                                weight: 15
                            });
                        }).on('mouseout', function(e) {
                            this.closePopup();
                            e.target.setStyle({
                                weight: 10,
                                color: 'red'
                            });
                        }).bindPopup(popupMessage).on('click', function(e) {
                            e.target.setStyle({
                                color: 'blue',
                                weight: 15,
                            });
                            chart_on();
                            draw_chart(e.target.options.customData.edge_index);
                            draw_heatmap(e.target.options.customData.edge_index);
                
                            if (selectFlag == 1) {
                                var elem = document.getElementById('selectedEdge')
                                if ( !elem.innerText ) {
                                    elem.innerHTML = '<div id="selectedEdge">' + e.target.options.customData.edge_index + '</div>';
                                }
                                else {
                                    elem.innerHTML = '<div id="selectedEdge"></div>';
                                }
                            }
                        });
                        conEdgeLayerGroup.addLayer(m_polyline)
                    }
                }
            })
            map.addLayer(conEdgeLayerGroup);
        })
    })
    
}

function switching() {
    if (selectFlag == 0) {
        selectFlag = 1
    } else {
        selectFlag = 0
    }
}