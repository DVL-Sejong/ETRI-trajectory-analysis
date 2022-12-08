document.write('<script src="static/js/pathPredict.js"></script>');
var val = 10

const reduceValue = (target) => {
    val = target.value
}


function volumeReduce() {
    
    /*
    var elem = document.getElementById('origin')
    var element = document.getElementById('destination')
    var slider = document.getElementById("myRange");
    var e = document.getElementById('selectedEdge')
    var temps = []
    
    $.post("http://127.0.0.1:5000/volume", {
        start: elem.innerText,
        destination: element.innerText,
        targetTime: slider.value,
        amount: val,
        e: e.innerText,
        async: false
    }).done(function(data) {
        if (predicted == 1) {
            temp = data.split(',')
        
            for(var i = 0; i < temp.length; i++) {
                console.log(i, parseInt(temp[i]), temp.length)
                temps = lines[parseInt(temp[i])].setStyle({
                    color: '#5e4301',
                    weight: 15,
                    opacity: 0.1
                });

                edgeLayerGroup.addLayer(temps);
            }

            map.addLayer(edgeLayerGroup);
            }
    })
    */
}