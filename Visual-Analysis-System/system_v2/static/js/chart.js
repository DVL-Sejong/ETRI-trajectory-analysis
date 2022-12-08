var dataPath = 'static/data/'
var chart;
var lchart;
var schart;
var nchart;
var chartRendered = 0
var lchartRendered = 0
var schartRendered = 0
var nchartRendered = 0

function draw_chart(n) {
  if (lchartRendered == 1) {
    lchart.destroy();
  }
  var speed = [];
  var usage = [];
  var thresholdSpeed = 3;
  d3.csv(dataPath + 'SanFrancisco_edges.csv', function(error, data) {
    if (data[n].maxspeed == '') {
      thresholdSpeed = 33.77
    } else {
      thresholdSpeed = parseFloat(data[n].maxspeed.split(' ')[0]) * 1.609 * 0.6
    }
  })

  d3.csv(dataPath + 'speed.csv', function(error, data) {
    if (error) throw error;
    d3.csv(dataPath + 'usage.csv', function(error, udata) { 
      if (error) throw error;

      for (var i = 0; i < 24; i++) {
        speed[i] = data[i][n]
        usage[i] = udata[i][n]
      }
      var t = parseInt(document.getElementById("myRange").value)
      var loptions = {
        series: [
          {
            name: "Speed",
            data: speed
          },
          {
            name: "Volume",
            data: usage
          }
        ],
        chart: {
          height: 300,
          type: 'line',
        },
        annotations: {
          yaxis: [{
            strokeDashArray: 0,
            y: thresholdSpeed,
            borderColor: '#FF0000'
          }],
          xaxis: [
            {
              x: t,
              x2: t + 1,
              fillColor: '#FF0000',

            }
          ]
        },
        dataLabels: {
          enabled: false
        },
        strike: {
          width: [1, 1, 4]
        },
        title: {
          text: "Average Speed & Volume Edge: " + n,
          align: 'left'
        },
        xaxis: {
          categories: [0, 1, 2,3,  4,5, 6,7, 8,9, 10,11, 12,13, 14,15, 16,17, 18,19, 20,21, 22,23],
          title: {
            text: "Time",
            offsetY: 80
          }
        },
        yaxis: [
          {
            axisTiceks: {
              show: true,
            },
            axisBorder: {
              show: true,
              color: '#008FFB'
            },
            labels: {
              style: {
                colors: '008FFB',
              }
            },
            title: {
              text: "Speed (Km/h)",
              style: {
                color: '#008FFB',
              }
            },
            tooltip: {
              enabled: true
            }
          },
          {
            seriesName: 'usage',
            opposite: true,
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: true,
              color: '#00E396'
            },
            labels: {
              style: {
                colors: '#00E396',
              }
            },
            title: {
              text: "Traffic Volume",
              style: {
                color: '#00E396',
              }
            }
          },
        ],
        tooltip: {
          fixed: {
            enabled: true,
            position: 'topLeft',
            offsetY: 30
          },
        },
        legend: {
          horizontalAlign: 'left',
          offsetX: 40
        }
      };
      lchart = new ApexCharts(document.querySelector("#trafficInformation"), loptions);
      lchartRendered = 1
      lchart.render();
    })
  })
}

function chartDisplay() {
  var trafficInfo = document.getElementById("trafficInformation");
  var heat = document.getElementById("heatMap");
  var single = document.getElementById("singleRoad");
  var network = document.getElementById("network");
  if(trafficInfo.style.display=='block'){ 		
    trafficInfo.style.display = 'none';
    heat.style.display = 'none';
    single.style.display = 'none';
    network.style.display = 'none';
  }else{ 		
    trafficInfo.style.display = 'block';
    heat.style.display = 'block';
    single.style.display = 'block';
    network.style.display = 'block';
  } 
}

function chart_exit(){
  var trafficInfo = document.getElementById("trafficInformation");
  var heat = document.getElementById("heatMap");
  var single = document.getElementById("singleRoad");
  var network = document.getElementById("network");
  if (trafficInfo.style.display=='block') { 		
    trafficInfo.style.display = 'none';
    heat.style.display = 'none';
    single.style.display = 'none';
    network.style.display = 'none';
  }
}

function chart_on() {
  var trafficInfo = document.getElementById("trafficInformation");
  var heat = document.getElementById("heatMap");
  var single = document.getElementById("singleRoad");
  var network = document.getElementById("network");
  trafficInfo.style.display = 'block';
  heat.style.display = 'block';
  single.style.display = 'block';
    network.style.display = 'block';
}

function dashboardDisplay() {
  var odselector = document.getElementById("odselector");
  var edgePricing = document.getElementById("edgeselector");
  var origin = document.getElementById("origin");
  var destination = document.getElementById("destination");
  var selectedEdge = document.getElementById("selectedEdge");
  var timeselector = document.getElementById("timeselector");
  var predict = document.getElementById("predict");
  var trajectory = document.getElementById("trajectory");

  if(odselector.style.display=='block'){ 		
    odselector.style.display = 'none';
    edgePricing.style.display = 'none';
    origin.style.display = 'none';
    destination.style.display = 'none';
    selectedEdge.style.display = 'none';
    timeselector.style.display = 'none';
    predict.style.display = 'none';
    trajectory.style.display = 'none';
  }else{ 		
    odselector.style.display = 'block';
    edgePricing.style.display = 'block';
    origin.style.display = 'block';
    destination.style.display = 'block';
    selectedEdge.style.display = 'block';
    timeselector.style.display = 'block';
    predict.style.display = 'block';
    trajectory.style.display = 'block';
  } 
}

function draw_heatmap(n) {
  draw_single()
  draw_network()
  if (chartRendered == 1) {
    chart.destroy();
  }
  d3.csv(dataPath+'congestionWeek.csv', function(error, data) {
    var congestionList = [];
    if (error) throw error
    
    for (var i=0; i < 168; i++) {
      congestionList[i] = data[i][n];
    }
    var options = {
      series: [{
        name: 'Mon',
        data: congestionList.slice(0,24)
      },
      {
        name: 'Tues',
        data: congestionList.slice(24,48)
      },
      {
        name: 'Wed',
        data: congestionList.slice(48,72)
      },
      {
        name: 'Tur',

        data: congestionList.slice(72, 96)
      },
      {
        name: 'Fri',
        data: congestionList.slice(96, 120)
      },
      {
        name: 'Sat',
        data: congestionList.slice(120, 144)
      },
      {
        name: 'Sun',
        data: congestionList.slice(144, 168)
      },
      ],
      xaxis: {
        categories: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
      },
      chart: {
        height: 240,
        type: 'heatmap'
      },
      dataLabels: {
        enabled: false
      },
      colors: ["#FF0000"],
      title: {
        text: 'Congestion HeatMap Edge: ' + n
      },
    };
    chart = new ApexCharts(document.querySelector("#heatMap"), options);
    chartRendered = 1
    chart.render();
  })
}

function draw_single() {
  if (schartRendered == 1) {
    schart.destroy()
  }
  var soptions = {
    series: [
    {
      name: 'Congestion',
      data: [32, 64, 45, 37, 81, 51, 27]
    }
    ],
      chart: {
      height: 250,
      type: 'bar'
    },
    plotOptions: {
      bar: {
        columnWidth: '60%'
      }
    },
    colors: ['#00E396'],
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    title: {
      text: 'No. of Congestion Edge: 1234'
    }
  };

  var schart = new ApexCharts(document.querySelector("#singleRoad"), soptions);
  schart.render();
  schartRendered = 1
}

function draw_network() {
  if (nchartRendered == 1) {
    nchart.destroy()
  }
  var noptions = {
    series: [
    {
      name: 'Congestion',
      data: [132, 264, 145, 137, 81, 151, 227]
    }
    ],
      chart: {
      height: 250,
      type: 'bar'
    },
    plotOptions: {
      bar: {
        columnWidth: '60%'
      }
    },
    colors: ['#008FFB'],
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    title: {
      text: 'No. of Network Congestion Edge'
    }
  };

  var nchart = new ApexCharts(document.querySelector("#network"), noptions);
  nchart.render();
  nchartRendered = 1
}
/*
var options = {
  series: [{
    name: "Origin",
    data: [{
      x: 'Mon',
      y: [0, 127]
    }, {
      x: 'Tue',
      y: [0, 86]
    }, {
      x: 'Wed',
      y: [0, 72]
    }, {
      x: 'Thu',
      y: [0, 64]
    },{
      x: 'Fri',
      y: [0, 88]
    },{
      x: 'Sat',
      y: [0, 92]
    },{
      x: 'Sun',
      y: [0, 100]
    }]
}, {
    name: "Predict",
    data: [{
      x: 'Team A',
      y: [0, 113]
    }, {
      x: 'Team B',
      y: [0, 72]
    }, {
      x: 'Team C',
      y: [0, 61]
    }, {
      x: 'Team D',
      y: [0, 48]
    }, {
      x: 'Team D',
      y: [0, 67]
    }, {
      x: 'Team D',
      y: [0, 76]
    }, {
      x: 'Team D',
      y: [0, 82]
    }]
}],
  chart: {
  type: 'rangeBar',
  height: 350
},
plotOptions: {
  bar: {
    horizontal: false
  }
},
dataLabels: {
  enabled: true,
  style: {
    colors: ['#FFFFFF', '#000000']
  }
},
colors: ['#61764B', '#BCE29E'],
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();*/

/*var options = {
          series: [55, 44, 41, 25, 41],
          chart: {
          width: '100%',
          type: 'pie',
        },
        labels: ["Road 1", "Road 2", "Road 3", "Road 4", "Others"],
        theme: {
          monochrome: {
            enabled: true,
            color: '#f49d1a'
          }
        },
        plotOptions: {
          pie: {
            dataLabels: {
              offset: -5
            }
          },
          colors: ['#ff0000']
        },
        dataLabels: {
          formatter(val, opts) {
            const name = opts.w.globals.labels[opts.seriesIndex]
            return [name, val.toFixed(1) + '%']
          }
        },
        legend: {
          show: false
        },
        title: {text: "Congestion Degree"}
        };

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();*/