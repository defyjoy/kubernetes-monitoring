# curl -X POST http://172.18.0.0.nip.io -H "Content-Type: application/json" -d '
# {
#   "streams": [
#     {
#       "stream": {
#         "job": "test-job"
#       },
#       "values": [
#         [ "'$(date +%s%N)'", "This is a test log line from curl" ]
#       ]
#     }
#   ]
# }'


# curl -s https://data.gharchive.org/$(date -d '2 days ago' '+%Y-%m-%d')-10.json.gz \
#         | curl -T - -X POST -H 'Content-Encoding: gzip' 'http://172.18.0.0.nip.io/insert/jsonline?_time_field=created_at&_stream_fields=type'


curl -XPOST http://172.18.0.0.nip.io/loki/api/v1/push \
  -H "Content-Type: application/json" \
  -d '{"streams": [{"stream": {"job":"test"}, "values": [["1680000000000000000", "hello world"]]}]}'


