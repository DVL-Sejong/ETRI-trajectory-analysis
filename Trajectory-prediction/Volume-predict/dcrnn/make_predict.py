import argparse
import numpy as np
import os
import sys
import tensorflow as tf
import yaml
import pandas as pd
from lib.utils import load_graph_data
from model.dcrnn_supervisor import DCRNNSupervisor
from shapely.geometry import Point, Polygon
from scripts.generate_training_data import generate_graph_seq2seq_io_data, generate_train_val_test

def predict(amount, e, t):
    df = pd.read_csv('data/usage.csv', index_col='Unnamed: 0')
    node = pd.read_csv('data/SanFrancisco_nodes.csv')
    edge = pd.read_csv('data/SanFrancisco_edges.csv')

    box = [(-122.4214, 37.7907), (-122.4022, 37.7931), (-122.4013, 37.7885), (-122.4181, 37.7753)]
    polygon = Polygon(box)

    ilist = []
    for i in range(1771):
        if polygon.contains(Point(node.x[i], node.y[i])):
            ilist.append(node.osmid[i])

    elist=[]
    nelist=[]
    for i in range(4468):
        if edge.u[i] in ilist:
            if edge.v[i] in ilist:
                elist.append(i)
            else:
                nelist.append(i)
        else:
            nelist.append(i)

    for i in range(4467, -1,-1):
        if i in nelist:
            df = df.drop(str(i), axis=1)
    
    if t != 12:
        for i in range(323):
            temp = df.iat[t, i]
            df.iat[t, i] = df.iat[12, i]
            df.iat[12, i] = temp
    df.to_hdf('data/SanFrancisco.h5', 'df', format='table')
    generate_train_val_test('data/SanFrancsico','data/SanFrancisco.h5')
    parser = argparse.ArgumentParser()
    parser.add_argument('--config_filename', default='data/model/config_39.yaml')
    predict = run_dcrnn(args)

    for i in range(323):
        predict.iat[0,i] = round(predict.iat[0,i])

    return predict

def run_dcrnn(args):
    with open(args.config_filename) as f:
        config = yaml.safe_load(f)
    tf_config = tf.ConfigProto()
    if args.use_cpu_only:
        tf_config = tf.ConfigProto(device_count={'GPU': 0})
    tf_config.gpu_options.allow_growth = True
    graph_pkl_filename = config['data']['graph_pkl_filename']
    _, _, adj_mx = load_graph_data(graph_pkl_filename)
    with tf.Session(config=tf_config) as sess:
        supervisor = DCRNNSupervisor(adj_mx=adj_mx, **config)
        supervisor.load(sess, config['train']['model_filename'])
        outputs = supervisor.evaluate(sess)
        for i in range(1):
            predict = pd.DataFrame(outputs['predictions'][i].reshape(len(outputs['predictions'][0]), len(outputs['predictions'][0][0])))
    return predict

if __name__ == '__main__':
    sys.path.append(os.getcwd())
    parser = argparse.ArgumentParser()
    parser.add_argument('--use_cpu_only', default=False, type=str, help='Whether to run tensorflow on cpu.')
    parser.add_argument('--config_filename', default='data/model/Gangnam_trained/config_100.yaml', type=str,
                        help='Config file for pretrained model.')
    #parser.add_argument('--output_filename', default='data/dcrnn_Gangnam_predictions.npz')
    args = parser.parse_args()
    run_dcrnn(args)
