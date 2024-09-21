token = "fAOaUgg8s7XqjV5ngTIE0ozVGfSq7rr70WWIgHOzJ-nSgsTBmGKfRUQxOrheXNjRoI317H4SwfLmuZOoi5Jxyg=="

import influxdb_client, os, time
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS


org = "my-init-org"
url = "http://localhost:8086"

client = influxdb_client.InfluxDBClient(url=url, token=token, org=org)

bucket="try-2"

write_api = client.write_api(write_options=SYNCHRONOUS)
   
# point = (
#   Point("100")
#   .tag("draining", '2015-07-23 15:55:11')
#   .field("field1", 0)
# )
# write_api.write(bucket=bucket, org=org, record=point)

# point = (
#   Point("100")
#   .tag("draining", '2004-07-23 15:55:11')
#   .field("field1", 0)
# )
# write_api.write(bucket=bucket, org=org, record=point)

# point = (
#   Point("100")
#   .tag("draining", '2019-07-23 15:55:11')
#   .field("field1", 0)
# )
# write_api.write(bucket=bucket, org=org, record=point)

# point = (
#   Point("200")
#   .tag("draining", '2023-07-23 22:03:04')
#   .field("field1", 0)
# )
# write_api.write(bucket=bucket, org=org, record=point)



query_api = client.query_api()

query = """from(bucket: "try-2")
 |> range(start: -10d)
 |> filter(fn: (r) => r._measurement == "100")"""
tables = query_api.query(query, org=org)

for table in tables:
  for record in table.records:
    print((record.get_time()))
    print(type((record.get_time())))
