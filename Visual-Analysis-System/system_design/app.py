import numpy as np
import pandas as pd
import sys
from flask import Flask
from flask import render_template
from flask import request
from haversine import haversine
#from make_predict import predict, run_dcrnn

app = Flask(__name__)
@app.route('/')
def hello_world():  # put application's code here
    print("python flask server run")
    return render_template('trajectory.html')

@app.route('/path' ,methods=['POST'])
def path():
    start = request.form['start']
    destination = request.form['destination']
    targetTime = request.form['targetTime']
    pathList = pathPredict(int(start), int(destination), int(targetTime))
    return pathList  #, destination, targetTime #pathList

@app.route('/volume', methods=['POST'])
def volume():
    start = request.form['start']
    destination = request.form['destination']
    targetTime = request.form['targetTime']
    amount = request.form['amount']
    e = request.form['e']
    usage = pd.read_csv('static/data/usage.csv')
    edge = pd.read_csv(path + 'SanFrancisco_edges.csv')
    volume = predict(amount, e, targetTime)

    prev = 0
    cnt = 0
    wIdx = 0
    weight = np.zeros(4468)

    for i in range(4468):        
        if edge['u'][i] == edge['u'][prev]:
            if str(i) in volume.columns:
                cnt += volume.loc[0, str(i)]
            else:
                cnt += usage.loc[targetTime, str(i)]
        else:
            while wIdx < i:
                if str(wIdx) in volume.columns:
                    if cnt == 0:
                        weight[wIdx] = 0
                    else:
                        weight[wIdx] = (100 - ((round(volume.loc[0, str(wIdx)] / cnt, 2) // 0.01) * 0.2)) / 100
                else:
                    if cnt == 0:
                        weight[wIdx] = 0
                    else:
                        weight[wIdx] = (100 - ((round(usage.loc[targetTime, str(wIdx)] / cnt, 2) // 0.01) * 0.2)) / 100
                wIdx += 1
            if str(wIdx) in volume.columns:    
                cnt = volume.loc[0, str(wIdx)]
            else:
                cnt = usage.loc[targetTime, str(wIdx)]
        prev = i

    speed = pd.read_csv('static/data/speed(weight).csv')
    
    for i in range(4468):
        if weight[i] != 0:
            weight[i] = (edge['length'][i] / (speed.at[targetTime, i] * 5 / 18)) * weight[i]
        else:
            weight[i] = edge['length'][i] / (speed.at[targetTime, i] * 5 / 18)

    pathList = pathPredict_vol(int(start), int(destination), int(targetTime), weight)

    return pathList

def pathPredict(start, destination, n):

    path = 'static/data/'
    nodes = pd.read_csv(path + 'SanFrancisco_nodes.csv', index_col='osmid')
    edges = pd.read_csv(path + 'SanFrancisco_edges.csv')
    weight = pd.read_csv(path + 'weight.csv', index_col='Unnamed: 0')
    Open = []
    Close = []
    dict = {'NodeID': start, 'FScore': 0, 'GScore': 0, 'HScore': 0, 'ParentNode': ''}
    Close.append(dict)

    i = 0
    flag = 0
    for u, v in zip(edges['u'], edges['v']):
        if u == start:
            flag = 1
            GScore = weight[str(i)][n]

            stCo= (float(nodes.loc[start].geometry[7:-1].split(' ')[1]), float(nodes.loc[start].geometry[7:-1].split(' ')[0]))
            deCo = (float(nodes.loc[destination].geometry[7:-1].split(' ')[1]), float(nodes.loc[destination].geometry[7:-1].split(' ')[0]))
            
            HScore = (haversine(stCo, (deCo[0], stCo[1]), unit = 'm') + haversine((deCo[0], stCo[1]), deCo, unit = 'm')) * (100 / 18)
            
            FScore = GScore + HScore

            dict = {'NodeID': v, 'FScore': FScore, 'GScore': GScore, 'HScore': HScore, 'ParentNode': u}
            Open.append(dict)
        else:
            if flag == 1:
                break
        i += 1
    while Close[-1].get('NodeID') != destination:
        Open = sorted(Open, key=lambda x:x['FScore'])
        Close.append(Open[0])
        Open.pop(0)
        i = 0
        flag = 0
        for u, v in zip(edges['u'], edges['v']):
            if u == Close[-1].get('NodeID'):
                flag = 1
                for item in Close:
                    if item.get('NodeID') == Close[-1].get('NodeID'):
                        prevGScore = item.get('GScore')
                GScore = weight[str(i)][n] + prevGScore

                stCo= (float(nodes.loc[Close[-1].get('NodeID')].geometry[7:-1].split(' ')[1]), float(nodes.loc[Close[-1].get('NodeID')].geometry[7:-1].split(' ')[0]))
                deCo = (float(nodes.loc[destination].geometry[7:-1].split(' ')[1]), float(nodes.loc[destination].geometry[7:-1].split(' ')[0]))
               
                HScore = (haversine(stCo, (deCo[0], stCo[1]), unit = 'm') + haversine((deCo[0], stCo[1]), deCo, unit = 'm')) * (100 / 18)

                FScore = GScore + HScore

                dict = {'NodeID': v, 'FScore': FScore, 'GScore': GScore, 'HScore': HScore, 'ParentNode': u}
                flag_d = 0
                for item in Open:
                    if item.get('NodeID') == dict.get('NodeID'):
                        flag_d = 1
                        item['FScore'] = dict.get('FScore')
                        item['GScore'] = dict.get('GScore')
                        item['HScore'] = dict.get('HScore')
                        item['ParentNode'] = dict.get('ParentNode')
                if flag_d == 0:
                    Open.append(dict)
            else:
                if flag == 1:
                    break
            i += 1
    path = []
    j = -1
    node = Close[j].get('NodeID')
    path.append(node)
    while path[-1] != start:
        node = Close[j].get('ParentNode')
        path.append(node)
        while node != Close[j].get('NodeID'):
            j -= 1
    path.reverse()
    cp = ''
    for i in range(len(path) - 1):
        for j in range(4468):
            if (edges['u'][j] == path[i]):
                if (edges['v'][j] == path[i + 1]):
                    cp += str(j) + ','
    cp = cp[:-1]
    return cp

def pathPredict_vol(start, destination, n, weight):

    path = 'static/data/'
    nodes = pd.read_csv(path + 'SanFrancisco_nodes.csv', index_col='osmid')
    edges = pd.read_csv(path + 'SanFrancisco_edges.csv')

    Open = []
    Close = []
    dict = {'NodeID': start, 'FScore': 0, 'GScore': 0, 'HScore': 0, 'ParentNode': ''}
    Close.append(dict)

    i = 0
    flag = 0
    for u, v in zip(edges['u'], edges['v']):
        if u == start:
            flag = 1
            GScore = weight[i]

            stCo= (float(nodes.loc[start].geometry[7:-1].split(' ')[1]), float(nodes.loc[start].geometry[7:-1].split(' ')[0]))
            deCo = (float(nodes.loc[destination].geometry[7:-1].split(' ')[1]), float(nodes.loc[destination].geometry[7:-1].split(' ')[0]))
            
            HScore = (haversine(stCo, (deCo[0], stCo[1]), unit = 'm') + haversine((deCo[0], stCo[1]), deCo, unit = 'm')) * (100 / 18)
            
            FScore = GScore + HScore

            dict = {'NodeID': v, 'FScore': FScore, 'GScore': GScore, 'HScore': HScore, 'ParentNode': u}
            Open.append(dict)
        else:
            if flag == 1:
                break
        i += 1
    while Close[-1].get('NodeID') != destination:
        Open = sorted(Open, key=lambda x:x['FScore'])
        Close.append(Open[0])
        Open.pop(0)
        i = 0
        flag = 0
        for u, v in zip(edges['u'], edges['v']):
            if u == Close[-1].get('NodeID'):
                flag = 1
                for item in Close:
                    if item.get('NodeID') == Close[-1].get('NodeID'):
                        prevGScore = item.get('GScore')
                GScore = weight[i] + prevGScore

                stCo= (float(nodes.loc[Close[-1].get('NodeID')].geometry[7:-1].split(' ')[1]), float(nodes.loc[Close[-1].get('NodeID')].geometry[7:-1].split(' ')[0]))
                deCo = (float(nodes.loc[destination].geometry[7:-1].split(' ')[1]), float(nodes.loc[destination].geometry[7:-1].split(' ')[0]))
               
                HScore = (haversine(stCo, (deCo[0], stCo[1]), unit = 'm') + haversine((deCo[0], stCo[1]), deCo, unit = 'm')) * (100 / 18)

                FScore = GScore + HScore

                dict = {'NodeID': v, 'FScore': FScore, 'GScore': GScore, 'HScore': HScore, 'ParentNode': u}
                flag_d = 0
                for item in Open:
                    if item.get('NodeID') == dict.get('NodeID'):
                        flag_d = 1
                        item['FScore'] = dict.get('FScore')
                        item['GScore'] = dict.get('GScore')
                        item['HScore'] = dict.get('HScore')
                        item['ParentNode'] = dict.get('ParentNode')
                if flag_d == 0:
                    Open.append(dict)
            else:
                if flag == 1:
                    break
            i += 1
    path = []
    j = -1
    node = Close[j].get('NodeID')
    path.append(node)
    while path[-1] != start:
        node = Close[j].get('ParentNode')
        path.append(node)
        while node != Close[j].get('NodeID'):
            j -= 1
    path.reverse()
    cp = ''
    for i in range(len(path) - 1):
        for j in range(4468):
            if (edges['u'][j] == path[i]):
                if (edges['v'][j] == path[i + 1]):
                    cp += str(j) + ','
    cp = cp[:-1]
    return cp

if __name__ == '__main__':
    app.run(debug=True)