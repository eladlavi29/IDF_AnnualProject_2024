import torch
from torch.utils.data import Dataset
from torchvision.transforms import ToTensor
from sqlalchemy import create_engine
import pandas as pd

engine = create_engine('postgresql://postgres:amir@localhost:5432/flight_sem_6')

INDEX_COLUMN = "packet"

class IndicesDataSet(Dataset):
    def __init__(self, fid, table, num_rows_in_memory):
        self.packets = pd.read_sql_query(f"SELECT {INDEX_COLUMN} FROM {table} where fid={fid}", con=engine)
        self.num_rows_in_memory = num_rows_in_memory
        self.idx = 0
        self.max_ind = len(self.packets.index)

    def __len__(self):
        return self.max_ind

    def __getitem__(self):
        tmp = []
        if self.idx!=self.max_ind:
            tmp = (self.packets.iloc[[*range(self.idx, min(self.idx+self.num_rows_in_memory, self.max_ind))]])[INDEX_COLUMN].tolist()
        self.idx = min(self.idx+self.num_rows_in_memory, self.max_ind)
        return tmp
    



# QUICK TEST 


# tmp = IndicesDataSet(1, "slow_params", 10)
# print(tmp.__len__())
# print((tmp.__getitem__()))
# print((tmp.__getitem__()))
# print((tmp.__getitem__()))
# print((tmp.__getitem__()))
# print((tmp.__getitem__()))
# print((tmp.__getitem__()))




class PostGresDataSet(Dataset):
    def __init__(self, fid, table, num_rows_in_memory, param_list, batch_size):
        self.indices_dataset = IndicesDataSet(fid, table, num_rows_in_memory)
        self.param_list = param_list
        self.batch_size = batch_size
        self.X = None
        self.idx = 0
        self.table = table
        self.fid = fid
        self.curr_packets = self.indices_dataset.__getitem__()


    def __len__(self):
        return self.indices_dataset.__len__()

    def __getitem__(self):
        if self.idx >= len(self.curr_packets):
            self.curr_packets = self.indices_dataset.__getitem__()
            if self.curr_packets==[]:
                return None
            self.X = None
            self.idx = 0

        if self.X is None:
            param_list_str = ', '.join(self.param_list)
            curr_packets_str = "("+ ','.join(str(v) for v in self.curr_packets) +")"
            self.X = pd.read_sql_query(f"SELECT {param_list_str} FROM {self.table} where fid={self.fid} and packet in {curr_packets_str}", con=engine)


        res =  self.X.iloc[[*range(self.idx, min(self.idx+self.batch_size, len(self.curr_packets)))]]

        self.idx = min(self.idx+self.batch_size, len(self.curr_packets))

        return res


# tmp = PostGresDataSet(1, "slow_params", 1000, ["packet","tele_rpm", "air_temp"], 500)
# print(tmp.__len__())
# print(tmp.__getitem__())
# print(tmp.__getitem__())
# print(tmp.__getitem__())
# print(tmp.__getitem__())
# print(tmp.__getitem__())
# print(tmp.__getitem__())
# print(tmp.__getitem__())
# print(tmp.__getitem__())
# print(tmp.__getitem__())



# select * INTO temp.try1 from metadata where fid=1

# select * from temp.try1

# drop table temp.try1