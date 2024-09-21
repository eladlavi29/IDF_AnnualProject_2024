import torch
from torch.utils.data import Dataset


class CustomDataset(Dataset):
    def __init__(self):
        self.data = list(torch.rand(10))

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        print('get item')
        if issubclass(type(idx), list):
            return self.__getitems__(idx)
        return self.data[idx]

    def __getitems__(self, idxs):
        print('in get items')
        return [self.data[idx] for idx in idxs]


ds = CustomDataset()
print(ds.data)
print(ds[5])
print(ds[[1, 2, 3, 4, 5]])
