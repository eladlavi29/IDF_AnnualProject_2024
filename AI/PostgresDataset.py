import math
import torch
from torch.utils.data import Dataset
import math
from sqlalchemy import create_engine, text
import pandas as pd
import psycopg2
import random


class PostgresDataset(Dataset):
    schema = 'datasets'
    drop_data_table = 'DROP TABLE IF EXISTS {schema}.x{table_idx}'
    drop_label_table = 'DROP TABLE IF EXISTS {schema}.y{table_idx}'

    def __init__(self, data_query, label_query, conn_string, samples_per_flight, pool_func):
        self.samples_per_flight = samples_per_flight
        self.conn = psycopg2.connect(conn_string)
        self.cursor = self.conn.cursor()
        self.cursor.execute(f'''
        WITH idxs AS
        (
            SELECT DISTINCT table_name[1]::text idx
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = '{self.schema}'
        )
        SELECT i1.idx::int + 1 AS idx
        FROM idxs i1 LEFT JOIN idxs i2 ON i1.idx::int = (i2.idx)::int - 1
        WHERE i2.idx IS NULL 
        ORDER BY i1.idx ASC
        LIMIT 1
        ''')
        result = self.cursor.fetchall()
        if result:
            self.table_idx = result[0][0]
        else:
            self.table_idx = 1
        print(f'{self.table_idx=}')
        # data_query MUST have fid and packet in its columns.
        data_cols = self.get_query_cols(data_query)
        # label_query MUST have fid and label in its columns.
        label_cols = self.get_query_cols(label_query)
        # fids must match (same fids appear in both queries)
        list_to_str = lambda x: ','.join(str(x) for x in x)

        self.cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.schema}.x{self.table_idx} AS 
            SELECT idx, 
                   step, 
                   {list_to_str([f'{pool_func}({col}) {col}' for col in data_cols])}
            FROM (
                SELECT {list_to_str(data_cols)}, 
                       DENSE_RANK() OVER (ORDER BY fid) - 1 idx, 
                       NTILE({samples_per_flight}) OVER (PARTITION BY fid ORDER BY packet) step 
                FROM ({data_query}) a
            ) a
            GROUP BY idx, step
            ORDER BY idx, step
        """)

        self.cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.schema}.y{self.table_idx} AS 
            SELECT DENSE_RANK() OVER (ORDER BY fid) - 1 idx,
                   {list_to_str(label_cols.difference({'fid'}))}
            FROM ({label_query}) a
            """)
        self.conn.commit()

        self.data = list(torch.rand(10))

    def get_query_cols(self, query):
        self.cursor.execute(f'SELECT * FROM ({query}) a LIMIT 0')
        columns = set([col.name for col in self.cursor.description])
        return columns

    def __len__(self):
        self.cursor.execute(f'SELECT COUNT(DISTINCT idx) FROM {self.schema}.x{self.table_idx}')
        return self.cursor.fetchall()[0][0]

    def __getitem__(self, idx):
        # if type(idx) is not int:
        #     return self.__getitems__(idx)

        self.cursor.execute(f'SELECT * FROM {self.schema}.x{self.table_idx} WHERE idx={idx} ORDER BY packet')
        X = torch.tensor(self.cursor.fetchall(), dtype=torch.float)[:, 2:]
        self.cursor.execute(f'SELECT * FROM {self.schema}.y{self.table_idx} WHERE idx={idx}')
        y = torch.tensor(self.cursor.fetchall(), dtype=torch.float)[:, 1:]

        return X, y

    # def __getitems__(self, idxs):
    #     print(idxs)
    #     batch_size = len(idxs)
    #     self.cursor.execute(
    #         f'SELECT * FROM {self.schema}.x{self.table_idx} WHERE idx IN ({", ".join(map(lambda x: str(x), idxs))}) ORDER BY idx ASC, packet ASC')
    #     X = torch.tensor(self.cursor.fetchall(), dtype=torch.float)[:, 2:].reshape(batch_size, self.samples_per_flight,
    #                                                                                -1)
    #     self.cursor.execute(
    #         f'SELECT * FROM {self.schema}.y{self.table_idx} WHERE idx IN ({", ".join(map(lambda x: str(x), idxs))}) ORDER BY idx ASC')
    #     y = torch.tensor(self.cursor.fetchall(), dtype=torch.float)[:, 1:]
    #     print(f'{X.shape=}, {y.shape=}')
    #     return X, y

    def delete(self):
        print('in delete')
        self.cursor.execute(f'DROP TABLE IF EXISTS {self.schema}.x{self.table_idx}')
        # self.cursor.execute(self.drop_data_table.format(schema=self.schema, table_idx=self.table_idx))
        self.cursor.execute(f'DROP TABLE IF EXISTS {self.schema}.y{self.table_idx}')
        # self.cursor.execute(self.drop_label_table.format(schema=self.schema, table_idx=self.table_idx))
        self.conn.commit()
        self.conn.close()

if __name__ == '__main__':

    """
    -- create table deep_learning_datasets.x4(lat float4, lon float4);
    -- create table deep_learning_datasets.y4(alt float4);
    
    WITH idxs AS
    (
        SELECT DISTINCT table_name[1]::text idx
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'deep_learning_datasets'
    )
    SELECT i1.idx::int + 1 AS idx
    FROM idxs i1 LEFT JOIN idxs i2 ON i1.idx::int = (i2.idx)::int - 1
    WHERE i2.idx IS NULL 
    ORDER BY i1.idx ASC
    LIMIT 1
    """

    ds = PostgresDataset('select fid, packet, tele_pp_long, tele_pp_lat from slow_params',
                         'select fid, avg(tele_altitude) tele_altitude from slow_params group by fid',
                         'postgresql://postgres:12345@localhost:5432/FlightDB',
                         1000,
                         'AVG')

    X, y = ds.__getitems__([1, 3])
    print(X.shape, y.shape)

    print(len(ds))

    ds.delete()

    """
    -- select fid, packet, tele_pp_long, tele_pp_lat from slow_params;
    -- select fid, packet, tele_altitude from slow_params
    
    -- select * from datasets.y3;
    -- drop table datasets.x3;
    -- drop table datasets.y3
    -- select idx from datasets.x3 where idx in (1, 3, 5) group by idx
    -- select fid idx, ntile(1000) over (partition by fid order by packet), tele_pp_long, tele_pp_lat from slow_params
    
    -- select * from (select * from fast_params f1 cross join fast_params f2) a limit 0
    -- select * from fast_params f1 cross join fast_params f2 limit 0
    -- explain select fid idx, packet, tele_pp_long, tele_pp_lat from slow_params limit 0
    
    select rank, ntile, avg(tele_pp_long) tele_pp_long, avg(tele_pp_lat) tele_pp_lat 
    from (
        select *, dense_rank() over (order by idx) - 1 rank, ntile(1000) over (partition by idx order by packet) 
        from (
            select fid idx, packet, tele_pp_long, tele_pp_lat 
            from slow_params 
            where fid in (1, 3, 5)
            ) a
        ) a 
    group by rank, ntile 
    order by rank, ntile
    """
