var cctvData = {};
var linkData = {};
var mainData = {};
var trjData = {};

var nodeData = {};
var edgeData = [];

var nodeColormap = {'none':'white', 'start':'red', 'destination':'blue', 'trajectory':'green', 'diffuse':'yellow', 'visit':'lightgray'};
var arrowColormap = {'none':'black', 'trajectory':'black', 'visit':'gray'}

var startId, startDirect;
var hasDiffuse = false;

//아래 정리
var svg;

function makeData() {
    for(var id in cctvData) {
        var cctv = cctvData[id];
        const place = Object.values(linkData).find(e => e.cctv == id);

        mainData[id] = {
            'id':parseInt(id),
            'name':cctv.cctvStrtSecnNm,
            'table':place.position,
            'link':{'top':-1, 'down':-1, 'left':-1, 'right':-1}
        }

        for(var i=0;i<4;i++) {
            var link = place['link'][i];
            var link_node = Object.values(cctvData).find(e => e.cctvStrtSecnNm == link);

            if(link_node == undefined) continue;

            if(i==0) mainData[id].link.top = link_node.channel;
            else if(i==1) mainData[id].link.down = link_node.channel;
            else if(i==2) mainData[id].link.right = link_node.channel;
            else mainData[id].link.left = link_node.channel;
        }
    }

    drawBasegraph();
}

function drawBasegraph() {
    var graphDiv = document.getElementById('graph-vis');
    graphDiv.innerHTML = '';

    svg = d3.select('#graph-vis')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('class', 'custom-graph')
        .style('border', '3px solid black');

    svg.append("defs").append("marker")
        .attr("id", "arrow1")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", "12").attr("markerHeight", "12")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", "9").attr("refY", "4")
        .attr("orient", "auto");

    svg.append("defs").append("marker")
        .attr("id", "arrow2")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", "12").attr("markerHeight", "12")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", "9").attr("refY", "4")
        .attr("orient", "auto");

    svg.append("defs").append("marker")
        .attr("id", "arrow3")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", "12").attr("markerHeight", "12")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", "-1").attr("refY", "4")
        .attr("orient", "auto");

    var marker1 = d3.select("#arrow1");
        marker1.append("polygon")
            .attr("points", "2 2, 6 4, 2 6, 2 2")
            .attr("fill", "black");

    var marker2 = d3.select("#arrow2");
        marker2.append("polygon")
            .attr("points", "2 2, 6 4, 2 6, 2 2")
            .attr("fill", "gray");
    var marker3 = d3.select("#arrow3");
        marker3.append("polygon")
            .attr("points", "6 2, 2 4, 6 6, 6 2")
            .attr("fill", "gray");

    var width = graphDiv.clientWidth;
    var height = graphDiv.clientHeight;

    var diffX = (width-40)/5;
    var diffY = (height-40)/5;

    var radius = 10;

    for(var i=0;i<4;i++) {
        for(var j=0;j<4;j++) {
            var node = Object.values(mainData).find(e => e.table.toString() == i.toString() + ',' + j.toString());

            var posX = 20 + (j+1)*diffX;
            var posY = 20 + (i+1)*diffY;

            nodeData[node.id] = {
                'id':node.id,
                'position': [posY, posX],
                'subNodes': {}
            };

            var nodelink = node.link;

            nodeData[node.id].subNodes.top = {
                'type':'top',
                'parent': node.id,
                'position': [posY-radius*2.5, posX],
                'link':nodelink.top,
                'state':'none'
            };

            nodeData[node.id].subNodes.down = {
                'type':'down',
                'parent': node.id,
                'position': [posY+radius*2.5, posX],
                'link':nodelink.down,
                'state':'none'
            };

            nodeData[node.id].subNodes.right = {
                'type':'right',
                'parent': node.id,
                'position': [posY, posX+radius*2.5],
                'link':nodelink.right,
                'state':'none'
            };

            nodeData[node.id].subNodes.left = {
                'type':'left',
                'parent': node.id,
                'position': [posY, posX-radius*2.5],
                'link':nodelink.left,
                'state':'none'
            };
        }
    }

    for(var id in nodeData) {
        var node = nodeData[id];
        var subNode = node.subNodes;

        var top = subNode['top'];
        var down = subNode['down'];
        var left = subNode['left'];
        var right = subNode['right'];

        var edge = {'from': top, 'to': left, 'type':'inside', 'state':'none'};
        edgeData.push(edge);
        var edge = {'from': top, 'to': right, 'type':'inside', 'state':'none'};
        edgeData.push(edge);
        var edge = {'from': top, 'to': down, 'type':'inside', 'state':'none'};
        edgeData.push(edge);
        var edge = {'from': left, 'to': right, 'type':'inside', 'state':'none'};
        edgeData.push(edge);
        var edge = {'from': left, 'to': down, 'type':'inside', 'state':'none'};
        edgeData.push(edge);
        var edge = {'from': right, 'to': down, 'type':'inside', 'state':'none'};
        edgeData.push(edge);

        for (var id in subNode) {
            var sub = subNode[id];

            if(sub.link == -1) continue;

            var from = sub;
            var to = Object.values(nodeData).find(e => e.id == sub.link);
            if(to === undefined) continue;

            if (sub.type == 'top') to = to.subNodes.down;
            else if(sub.type == 'down') to = to.subNodes.top;
            else if(sub.type == 'left') to = to.subNodes.right;
            else to = to.subNodes.left;

            var edge = {
                'from': from,
                'to': to,
                'type':'outside',
                'state':'none'
            };
            edgeData.push(edge);
        }
    }

    var radius = 5;
    for(var i=0;i<edgeData.length;i++) {
        var edge = edgeData[i];

        var from = edge.from;
        var to = edge.to;

        var stroke = 1;
        if(edge.active == true) stroke = radius * 0.7;
        else stroke = radius * 0.4;

        svg.append('line')
            .attr('class', from.parent.toString() + '_' + from.type + '_' + to.parent.toString() + '_' + to.type)
            .attr('x1', from.position[1])
            .attr('y1', from.position[0])
            .attr('x2', to.position[1])
            .attr('y2', to.position[0])
            .style('stroke', arrowColormap[edge.state])
            .style('stroke-width', stroke);
    }

    var radius = 10;
    for(var id in nodeData) {
        var node = nodeData[id];

        var subNodes = node.subNodes;
        for(var id in subNodes) {
            var sub = subNodes[id];

            svg.append('circle')
                .attr('class', 'node')
                .attr('id', node.id + '_' + sub.type)
                .attr('cx', sub.position[1])
                .attr('cy', sub.position[0])
                .attr('fill', nodeColormap[sub.state])
                .attr('r', radius)
                .style('stroke', 'black')
                .style('stroke-width', radius*0.2);
        }
    }

    if(!hasDiffuse) {
        loadTrajectoryData();
    }
    else {
        trajectoryData();
    }
}

function loadTrajectoryData() {
    $.ajax({
        method:'get',
        url:'static/data/trajectory_data_case2.json',
        dataType:'json',
        cache:false
    }).done(function(data) {
        trjData = data;
        trajectoryData();
    });
}

function trajectoryData() {
    for(var i=0;i<trjData.length;i++) {
        var trj = trjData[i];

        if(trj.type == 'start') {
            var to_node = trj.to.split('_');
            Object.values(nodeData).find(e => parseInt(e.id) == to_node[0]).subNodes[to_node[1]].state = 'start';
            document.getElementById(trj.to).style.fill = nodeColormap[trj.type];
        }
        else if(trj.type == 'destination') {
            var from_node = trj.from.split('_');
            Object.values(nodeData).find(e => parseInt(e.id) == from_node[0]).subNodes[from_node[1]].state = 'destination';
            document.getElementById(trj.from).style.fill = nodeColormap[trj.type];
        }
        else {
            var to_node = trj.to.split('_');
            Object.values(nodeData).find(e => parseInt(e.id) == to_node[0]).subNodes[to_node[1]].state = 'trajectory';
            document.getElementById(trj.to).style.fill = nodeColormap[trj.type];
            if(trj.from == 'none' || trj.to == 'none') continue;

            var from_node = trj.to.split('_');
            Object.values(edgeData).find(e => e.from.parent == parseInt(from_node[1]) && e.from.type == from_node[0] && e.to.parent == parseInt(to_node[1]) && e.to.type == to_node[0])
            $('[class=' + trj.from + '_' + trj.to + ']')[0].setAttribute('marker-end', 'url(#arrow1)')
            $('[class=' + trj.from + '_' + trj.to + ']')[0].style.strokeWidth = 3;
        }
    }

    console.log(trjData);
}

function diffusion() {
    hasDiffuse = true;

    var startNode;

    for(var i=0;i<trjData.length;i++) {
        var trj = trjData[i];

        if(trj.from == "none" && trj.type != "start") {
            startNode = trjData[i-1].to;
            break;
        }
    }

    var splt = startNode.split('_');
    var id = splt[0];
    var direct = splt[1];

    startId = id;
    startDirect = direct;

    document.getElementById(id + '_' + direct).style.fill = 'yellow';

    var type = 1;
    var direction = '';
    var directList = ['top', 'down', 'right', 'left'];

    var stack = [];
    var stack2 = [];

    var flag = false;
    if(type == 1) {
        var node = Object.values(nodeData).find(e => e.id == id);

        if (direct == 'top' || direct == 'right') {
            for (var i = 0; i < directList.length; i++) {
                var dir = directList[i];

                if (dir == direct) continue;
                $('[class=' + id + '_' + direct + '_' + id + '_' + dir + ']')[0].style.stroke = 'gray';
                $('[class=' + id + '_' + direct + '_' + id + '_' + dir + ']')[0].style.strokeWidth = 3;

                if ((direct == 'right' && dir == 'top') || (direct == 'right' && dir == 'left') || (direct == 'down' && dir == 'top') ||
                    (direct == 'down' && dir == 'right') || (direct == 'down' && dir == 'left') || (direct == 'left' && dir == 'top')) {
                    $('[class=' + id + '_' + direct + '_' + id + '_' + dir + ']')[0].setAttribute('marker-end', 'url(#arrow3)')
                } else {
                    $('[class=' + id + '_' + direct + '_' + id + '_' + dir + ']')[0].setAttribute('marker-end', 'url(#arrow2)')
                }

                if (nodeData[id].subNodes[dir].state == "trajectory") {
                    var targetNode = Object.values(trjData).find(e => e.from == "none" && e.type != "start");
                    if (targetNode == undefined) return;

                    targetNode.from = id + "_" + direct;
                    flag = true;
                    continue;
                }

                stack.push(id + '_' + dir);
                stack2.push(id + '_' + dir);
                document.getElementById(id + '_' + dir).style.fill = 'lightgray';
            }

            if (flag) return;
        }
    }

    type += 1;

    if(type == 2) {
        var oneLine = true;
        var directList = ['top', 'down', 'right', 'left'];
        var flag = false;

        var trjId, trjDir;

        while(1) {
            var length = stack.length;
            if (length == 0) break;

            if (oneLine) {
                for (var i = 0; i < length; i++) {
                    var s = stack[i].split('_');
                    var id = s[0];
                    var direct = s[1];

                    var dir;
                    if (direct == 'down') dir = 'top';
                    if (direct == 'top') dir = 'down';
                    if (direct == 'left') dir = 'right';
                    if (direct == 'right') dir = 'left';

                    var node = Object.values(nodeData).find(e => e.id == startId);
                    var targetId = node.subNodes[direct].link.toString();

                    document.getElementById(targetId + '_' + dir).style.fill = 'lightgray';
                    $('[class=' + id + '_' + direct + '_' + targetId + '_' + dir + ']')[0].style.stroke = 'gray';
                    $('[class=' + id + '_' + direct + '_' + targetId + '_' + dir + ']')[0].style.strokeWidth = 3;
                    $('[class=' + targetId + '_' + dir + '_' + id + '_' + direct + ']')[0].style.stroke = 'gray';
                    $('[class=' + targetId + '_' + dir + '_' + id + '_' + direct + ']')[0].style.strokeWidth = 3;
                    $('[class=' + id + '_' + direct + '_' + targetId + '_' + dir + ']')[0].setAttribute('marker-end', 'url(#arrow2)');

                    stack.push(targetId + '_' + dir);
                    stack2.push(targetId + '_' + dir);
                }

                stack.shift();
                stack.shift();
                stack.shift();

                oneLine = false;
            } else {
                for (var i = 0; i < length; i++) {
                    var s = stack[i].split('_');
                    var id = s[0];
                    var direct = s[1];

                    for (var j = 0; j < directList.length; j++) {
                        var dir = directList[j];

                        if (dir == direct) continue;

                        if ((direct == 'right' && dir == 'top') || (direct == 'right' && dir == 'left') || (direct == 'down' && dir == 'top') ||
                            (direct == 'down' && dir == 'right') || (direct == 'down' && dir == 'left') || (direct == 'left' && dir == 'top')) {
                            $('[class=' + id + '_' + dir + '_' + id + '_' + direct + ']')[0].style.stroke = 'gray';
                            $('[class=' + id + '_' + dir + '_' + id + '_' + direct + ']')[0].style.strokeWidth = 3;
                            $('[class=' + id + '_' + dir + '_' + id + '_' + direct + ']')[0].setAttribute('marker-start', 'url(#arrow3)')
                        } else {
                            $('[class=' + id + '_' + direct + '_' + id + '_' + dir + ']')[0].style.stroke = 'gray';
                            $('[class=' + id + '_' + direct + '_' + id + '_' + dir + ']')[0].style.strokeWidth = 3;
                            $('[class=' + id + '_' + direct + '_' + id + '_' + dir + ']')[0].setAttribute('marker-end', 'url(#arrow2)')
                        }

                        if (nodeData[id].subNodes[dir].state == "trajectory") {
                            trjId = id, trjDir = dir;
                            flag = true;
                            continue;
                        }

                        stack.push(id + '_' + dir);
                        stack2.push(id + '_' + dir);
                        document.getElementById(id + '_' + dir).style.fill = 'lightgray';
                    }
                }

                stack.shift();
                stack.shift();
                stack.shift();

                oneLine = true;
            }

            if(flag) {
                var flag2 = false;
                var lengths = 1;

                while(1) {
                    var stackLength = stack2.length;
                    if(stackLength - lengths <= 1) {
                        var targetNode = Object.values(trjData).find(e => e.from == "none" && e.type != "start");
                        if (targetNode == undefined) return;

                        targetNode.from = startId + "_" + startDirect;
                        break;
                    }

                    if (oneLine) {
                        var stackLength = stack2.length;
                        var prevNode = stack2[stackLength - lengths - 9];
                        lengths += 9;

                        if(prevNode == (startId + "_" + startDirect)) flag2 = true;

                        var targetNode = Object.values(trjData).find(e => e.from == "none" && e.type != "start");
                        if (targetNode == undefined) return;

                        targetNode.from = prevNode;

                        newNode = {
                            'from': 'none',
                            'to': prevNode,
                            'type': 'trajectory'
                        };

                        trjData.push(newNode);
                        oneLine = false;
                    } else {
                        var stackLength = stack2.length;
                        var prevNode = stack2[stackLength - lengths - 3];
                        lengths += 3;

                        if(prevNode == (startId + "_" + startDirect)) flag2 = true;

                        var targetNode = Object.values(trjData).find(e => e.from == "none" && e.type != "start");
                        if(targetNode == undefined) return;

                        targetNode.from = prevNode;

                        newNode = {
                            'from': 'none',
                            'to':  prevNode,
                            'type': 'trajectory'
                        };

                        trjData.push(newNode);
                        oneLine = true;
                    }

                    if(flag2) break;
                }
                break;
            }
        }
    }
}

function estimation() {
    drawBasegraph();
}

function loadCCTVData() {
    $.ajax({
        method:'get',
        url:'static/data/cctv_data.json',
        dataType:'json',
        cache:false
    }).done(function(data) {
        cctvData = data;
        loadPlaceData();
    });
}

function loadPlaceData() {
    $.ajax({
        method:'get',
        url:'static/data/link_data.json',
        dataType:'json',
        cache:false
    }).done(function(data) {
        linkData = data;
        makeData();
    })
}