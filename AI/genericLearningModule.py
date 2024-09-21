import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
import yaml

from dataSetLoader import PostGresDataSet
from PostgresDataset import PostgresDataset

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# YAML file path
yaml_file = 'parameters.yaml'


def create_model(model, model_params):
    # layers_obj = []
    # for layer_name, model_params in zip(model, model_params):
    #     layer = nn.__dict__[layer_name](**model_params)
    #     layers_obj.append(layer)

    model = nn.__dict__[model](**model_params)  #nn.Sequential(*layers_obj)
    return model


def create_criterion(criterion_name):
    criterion = nn.__dict__.get(criterion_name)
    if criterion is None:
        raise ValueError(f"Criterion '{criterion_name}' not found in torch.nn.__dict__")

    return criterion()


def split_features_labels(batch):
    # The last col is row num so cut
    if batch is None:
        raise ValueError("batch is emtpy")

    X = batch.iloc[:, :-2]
    y = batch.iloc[:, -2]
    return X, y


# Training function
def train_model(model, train_loader, val_loader, criterion, optimizer, num_epochs, device, verbose=True):
    model.to(device)
    best_acc = 0.0
    for epoch in range(num_epochs):
        losses = []
        accs = []
        # train model
        for X, y in train_loader:
            # print(X.shape, y.shape)
            h = None

            for x in X.permute(1, 0, 2):
                x, y = x.to(device), y.to(device)
                # print(x.shape)
                # if h:
                #     print(x.shape, h[0].shape)
                y_in, h = model(x, h)

            y_pred = nn.functional.softmax(y_in, dim=1)

            # print(y_pred.shape)
            # print(y.shape)
            # print(y)
            y_class = torch.nn.functional.one_hot(y.squeeze(1).squeeze(1).long(), 2).float()
            # print(y_class.shape)
            loss = criterion(y_pred, y_class)
            optimizer.zero_grad()
            loss.backward()
            losses.append(loss.item())
            optimizer.step()
            y_pred_class = y_pred.argmax(dim=1)
            y = y.squeeze(1).squeeze(1)
            accuracy = (y == y_pred_class).sum().item() / y.size(0)
            accs.append(accuracy)

        # test model
        # for X, y in val_loader:
        #     X, y = X.to(device), y.to(device)
        #     y_pred = model(X)
        #     loss = criterion(y_pred, y)
        #     accuracy = (y == y_pred).sum().item() / y.size(0)

        print(f"Epoch {epoch + 1}/{num_epochs}, Loss: {sum(losses) / len(losses):.4f}, Val Acc: {sum(accs) / len(accs):.4f}")

    return 0
    #
    #     model.train()
    #     running_loss = 0.0
    #     batch = train_loader.__getitem__()
    #     X_train, y_train = split_features_labels(batch)
    #     X_train_tensor = torch.tensor(X_train.values, dtype=torch.float32)
    #     y_train_tensor = torch.tensor(y_train.values, dtype=torch.float32)
    #
    #     X_train_tensor, y_train_tensor = X_train_tensor.to(device), y_train_tensor.to(device)
    #     optimizer.zero_grad()
    #
    #     outputs = model(X_train_tensor)
    #     loss = criterion(outputs, y_train_tensor)
    #     loss.backward()
    #     optimizer.step()
    #     running_loss += loss.item() * X_train_tensor.size(0)
    #
    #     epoch_loss = running_loss / train_loader.batch_size
    #
    #     val_acc = validate_model(model, val_loader, criterion, device)
    #     if val_acc > best_acc:
    #         best_acc = val_acc
    #         best_model_wts = model.state_dict()
    #
    #     print(f"Epoch {epoch + 1}/{num_epochs}, Loss: {epoch_loss:.4f}, Val Acc: {val_acc:.4f}")
    #
    # model.load_state_dict(best_model_wts)
    # return model


# Validation function
def validate_model(model, val_loader, criterion, device):
    model.eval()
    all_preds = []
    all_labels = []
    with torch.no_grad():
        batch = val_loader.__getitem__()
        X_val, y_val = split_features_labels(batch)
        X_val_tensor = torch.tensor(X_val.values, dtype=torch.float32)
        y_val_tensor = torch.tensor(y_val.values, dtype=torch.float32)

        X_val_tensor, y_val_tensor = X_val_tensor.to(device), y_val_tensor.to(device)
        preds = model(X_val_tensor).cpu().numpy()
        all_preds.extend(preds)
        all_labels.extend(y_val_tensor.cpu().numpy())

    all_preds = torch.tensor(all_preds)
    all_labels = torch.tensor(all_labels)
    all_preds, all_labels = all_preds.to(device), all_labels.to(device)
    acc = criterion(all_preds, all_labels)
    return acc


# Classification function
def classify(model, test_loader, criterion, device):
    model.eval()
    all_preds = []
    all_labels = []
    with torch.no_grad():
        batch = test_loader.__getitem__()
        X_test, y_test = split_features_labels(batch)
        X_test_tensor = torch.tensor(X_test.values, dtype=torch.float32)
        y_test_tensor = torch.tensor(y_test.values, dtype=torch.float32)

        X_test_tensor, y_test_tensor = X_test_tensor.to(device), y_test_tensor.to(device)
        preds = model(X_test_tensor).cpu().numpy()
        all_preds.extend(preds)
        all_labels.extend(y_test_tensor.cpu().numpy())

    all_preds = torch.tensor(all_preds)
    all_labels = torch.tensor(all_labels)
    all_preds, all_labels = all_preds.to(device), all_labels.to(device)

    acc = criterion(all_preds, all_labels)
    return all_preds, acc


def attempt_get(from_lib, key):
    result = from_lib.__dict__.get(key)
    if result is None:
        raise KeyError(f'Class {key} not found in {from_lib.__name__}')
    return result


def create_stuff(params):
    model = create_model(params['model'], params['model_params'])
    dataset = PostgresDataset(**params['dataset_params'])
    optimizer = attempt_get(optim, params['optimizer'])(model.parameters(), **params['optimizer_params'])
    criterion = attempt_get(nn, params['criterion'])()
    train_ds, valid_ds, test_ds = random_split(dataset, params['split_params'], generator=torch.Generator().manual_seed(params['seed']))
    train_dl, valid_dl, test_dl = (DataLoader(train_ds, **params['dataloader_params']),#, collate_fn=lambda x: x),
                                   DataLoader(valid_ds, **params['dataloader_params']),#, collate_fn=lambda x: x),
                                   DataLoader(test_ds, **params['dataloader_params']),#, collate_fn=lambda x: x))
                                   )
    return train_dl, valid_dl, test_dl, optimizer, criterion, model, dataset


def main():
    # Load YAML file
    with open(yaml_file, 'r') as f:
        params = yaml.safe_load(f)

    train_dl, valid_dl, test_dl, optimizer, criterion, model, ds = create_stuff(params)

    print('finished creating stuff')
    train_model(model, train_dl, valid_dl, criterion, optimizer, params['num_epochs'], device)
    torch.save(model.state_dict(), params['path'])
    ds.delete()
    return

    ds = PostgresDataset(**params['dataset_params'])

    # Dataloading parameters
    data_features_names = params["data_features_names"]
    labels_names = params["labels_names"]
    tables_name = params["tables_name"]
    condition = params["condition"]
    batch_size = params["batch_size"]
    num_rows_in_memory = params["num_rows_in_memory"]

    ds = PostGresDataSet(data_features_names+labels_names, tables_name, condition, num_rows_in_memory, batch_size)

    # Data loaders
    # TODO: Consider using different non-overlapping dataloader (with different batches sizes and so forth)
    # test batch is the size of batches for training
    # val batch is the size of batch used for validating in every training epoch
    # test batch is the size of the entire test group
    train_loader = ds
    val_loader = ds
    test_loader = ds

    # Hyperparameters
    model_name = params["model_name"]
    layers = params["layers"]
    layer_params = params["layer_params"]
    input_size = len(data_features_names)
    num_epochs = params["num_epochs"]
    learning_rate = params["learning_rate"]
    criterion_name = params["criterion_name"]

    if(len(labels_names) != 1):
        raise ValueError(f"Doesn't currently support more than one target label")
    output_size = 1
    linear_hyperparameters = {
        'in_features': input_size,
        'out_features': output_size
    }

    # model
    model = create_model(layers, layer_params)
    print("The model used: ", model)

    # criterion
    criterion = create_criterion(criterion_name)
    print("The criterion used: ", criterion)

    # optimizer
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    # Training
    model = train_model(model, train_loader, val_loader, criterion, optimizer, num_epochs, device)

    # Classification
    test_preds, test_acc = classify(model, test_loader, criterion, device)
    print(test_preds)
    print("test acc based on criterion: ", test_acc.item())

    # Remove new temp tables
    ds.delete()

if __name__ == "__main__":
    # l = nn.LSTM(input_size=3, hidden_size=32, num_layers=2)
    # print(l(torch.randn(5, 3))[0].shape)
    # exit(0)
    main()

# Understand the way data is sampled make it generic for later

# improve the way get model along with the hyperparamaters are supplied

# use YAML for the model and hyperparamters