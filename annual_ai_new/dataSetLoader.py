from torch.utils.data import Dataset
import torch
import math
from sqlalchemy import create_engine
import pandas as pd
import random
from sqlalchemy import text

engine = create_engine('postgresql://postgres:1234@localhost:5432/postgres')

INDEX_COLUMN = "num_row"
SCHEMA = "temp"


class IndicesDataSet(Dataset):
    def __init__(self, table, num_rows_in_memory):
        self.indices = pd.read_sql_query(f"SELECT ROW_NUMBER() OVER() AS {INDEX_COLUMN} FROM {SCHEMA}.{table}", con=engine)
        self.num_rows_in_memory = num_rows_in_memory
        self.idx = 0
        self.max_ind = len(self.indices.index)

    def __len__(self):
        return self.max_ind

    def __getitem__(self):
        tmp = []
        if self.idx!=self.max_ind:
            tmp = (self.indices.iloc[[*range(self.idx, min(self.idx+self.num_rows_in_memory, self.max_ind))]])[INDEX_COLUMN].tolist()
        self.idx = min(self.idx+self.num_rows_in_memory, self.max_ind)
        return tmp



class PostGresDataSet(Dataset):
    def __init__(self, param_list, table_list, condition, num_rows_in_memory, batch_size):

        flag = True

        while(flag):
            rand_num = random.randint(0, 2**31)
            new_table_name = "try_" + str(rand_num)

            curr_pd = pd.read_sql_query(f"SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '{SCHEMA}' AND  TABLE_NAME = '{new_table_name}'", con=engine)

            if curr_pd["count"][0]==0:
                flag = False

        self.new_table_name = new_table_name
        # print("final name: ", new_table_name)

        param_list_str = ', '.join(param_list)
        tables_list_str = ', '.join(table_list)

        with engine.connect() as con:
            con.execute(text(f"select {param_list_str} INTO {SCHEMA}.{new_table_name} from {tables_list_str} where {condition}"))
            con.commit()

        self.indices_dataset = IndicesDataSet(new_table_name, num_rows_in_memory)

        # add index column
        # with engine.connect() as con:
        #     con.execute(text(f"ALTER TABLE {SCHEMA}.{self.new_table_name} ADD {INDEX_COLUMN} INT"))
        #     con.execute(text(f"UPDATE {SCHEMA}.{self.new_table_name} SET {INDEX_COLUMN} = row_number_series.row_number FROM (SELECT ROW_NUMBER() OVER() AS row_number FROM {SCHEMA}.{self.new_table_name}) AS row_number_series"))


        #     con.commit()

        # print("self.indices_dataset.indices: ", self.indices_dataset.indices)

        # index_df = self.indices_dataset.indices[[INDEX_COLUMN]]
        # print(index_df.columns)
        # index_df.to_sql(name=self.new_table_name, con=engine, schema=SCHEMA, if_exists='append', index=False)

        self.batch_size = batch_size
        self.X = None
        self.idx = 0

        self.curr_indices = self.indices_dataset.__getitem__()


    def __len__(self):
        return self.indices_dataset.__len__()

    def __getitem__(self):
        # print("len(self.curr_indices): ", len(self.curr_indices))
        if self.idx >= len(self.curr_indices):
            self.curr_indices = self.indices_dataset.__getitem__()
            if self.curr_indices==[]:
                return None
            self.X = None
            self.idx = 0

        if self.X is None:
            curr_indices_str = "("+ ','.join(str(v) for v in self.curr_indices) +")"
            self.X = pd.read_sql_query(f"WITH MyCte AS (SELECT *, ROW_NUMBER() OVER() AS {INDEX_COLUMN} FROM {SCHEMA}.{self.new_table_name}) SELECT * FROM MyCte where {INDEX_COLUMN} in {curr_indices_str}", con=engine)

        # print("self.X.shape: ", self.X.shape)

        res =  self.X.iloc[[*range(self.idx, min(self.idx+self.batch_size, len(self.curr_indices)))]]

        self.idx = min(self.idx+self.batch_size, len(self.curr_indices))

        return res

    def num_remaining_batches(self):
        return math.ceil((len(self) - self.idx) / self.batch_size)

    def delete(self):
        with engine.connect() as con:
            con.execute(text(f"drop table {SCHEMA}.{self.new_table_name}"))
            con.commit()



# ds = PostGresDataSet(["packet","tele_rpm", "air_temp"], ["slow_params"], "fid=1", 1000, 500)
# print(ds.__len__())
#
# print("XXXXXXXXXXXXXXXXXXXXXXXX")
# batch = ds.__getitem__()
# print(batch)
#
# ds.delete()