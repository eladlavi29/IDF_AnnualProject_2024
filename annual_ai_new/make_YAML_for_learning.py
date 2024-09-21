import yaml

if __name__ == "__main__":
    num_epochs = 10
    criterion = 'MSELoss'
    model = 'LSTM'
    model_params = {'input_size': 3, 'hidden_size': 32, 'num_layers': 2, 'proj_size': 2}
    dataset_params = {'samples_per_flight': 1000, 'pool_func': 'avg',
                      'conn_string': 'postgresql://postgres:12345@localhost:5432/FlightDB',
                      'data_query': 'select fid, packet, tele_altitude from slow_params',
                      'label_query': """
                        select fid, exists(select 1 from slow_params sp2 where tele_altitude > 10000 and sp2.fid = sp.fid)
                        from slow_params sp
                        group by fid
                      """
                      }
                      # 'data_query': 'select fid, packet, tele_pp_long, tele_pp_lat from slow_params',
                      # 'label_query': 'select fid, avg(tele_altitude) tele_altitude from slow_params group by fid'}
    split_params = [0.6, 0.2, 0.2]  # train, validate, test
    seed = 42
    dataloader_params = {'shuffle': True, 'batch_size': 5}
    optimizer = 'Adam'
    optimizer_params = {'lr': 1e-3, 'weight_decay': 5e-4}
    path = 'models/test.pt'

    parameters = {'num_epochs': num_epochs, 'seed': seed, 'criterion': criterion,
                  'model': model, 'model_params': model_params, 'dataset_params': dataset_params,
                  'split_params': split_params, 'dataloader_params': dataloader_params, 'optimizer': optimizer,
                  'optimizer_params': optimizer_params, 'path': path}

    # Dataloading parameters
    # data_features_names = ["time", "packet"]
    # labels_names = ["air_temp"]
    # tables_name = ['slow_params']
    # condition = "1=1"
    # num_rows_in_memory = 100
    # input_size = len(data_features_names)
    # Create dictionary with parameters
    # parameters = {
    #     'data_features_names': data_features_names,
    #     'labels_names': labels_names,
    #     'tables_name': tables_name,
    #     'condition': condition,
    #     'num_rows_in_memory': num_rows_in_memory,
    #     'batch_size': batch_size,
    #     'num_epochs': num_epochs,
    #     'layers': layers,
    #     'layer_params': layer_params,
    #     'learning_rate': learning_rate,
    #     'criterion_name': criterion_name
    # }

    # Define output file path
    output_file = 'parameters.yaml'

    # Write parameters to YAML file
    with open(output_file, 'w') as f:
        yaml.dump(parameters, f,)# default_flow_style=False)

    print(f"YAML file '{output_file}' has been created with the following parameters:")
    print(parameters)
