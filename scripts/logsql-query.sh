# curl -G http://172.18.0.0.nip.ioloki/api/v1/query_range \
#   --data-urlencode 'query={job="my-app"} |= "error"' \
#   --data-urlencode 'limit=50'


curl -G http://172.18.0.0.nip.io/select/logsql/query \
  --data-urlencode 'query=*' \
  --data-urlencode 'limit=1'
