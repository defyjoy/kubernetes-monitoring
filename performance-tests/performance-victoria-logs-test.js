import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import encoding from 'k6/encoding';

// Custom metrics for ingestion and query performance
const ingestionDuration = new Trend('ingestion_duration', true);
const queryDuration = new Trend('query_duration', true);
const ingestionErrorRate = new Rate('ingestion_error_rate');
const queryErrorRate = new Rate('query_error_rate');
const ingestionSuccessCounter = new Counter('ingestion_success_count');
const querySuccessCounter = new Counter('query_success_count');

const USERNAME = __ENV.USER;
const PASSWORD = __ENV.PASSWORD;
// VictoriaLogs endpoint configuration
const baseUrl = 'http://vmauth.172.18.0.0.nip.io'; // Replace with your VictoriaLogs instance URL
const ingestionEndpoint = `${baseUrl}/insert/loki/api/v1/push`; // Endpoint for log ingestion
const queryEndpoint = `${baseUrl}/select/logsql/query`; // Endpoint for LogsQL queries


// Encode credentials for Basic Auth
const credentials = `${USERNAME}:${PASSWORD}`;
const encodedCredentials = encoding.b64encode(credentials);

// Test configuration
export const options = {
  scenarios: {
    ingestion: {
      exec: 'perform_ingestion_test',
      executor: 'ramping-vus',
      stages: [
        { duration: '1s', target: 10 }, // Ramp up to 10 VUs
        // { duration: '1m', target: 50 }, // Ramp up to 50 VUs
        // { duration: '1m', target: 50 }, // Hold at 50 VUs
        // { duration: '30s', target: 0 }, // Ramp down
      ],
    },
    querying: {
      exec: 'perform_query_test',
      executor: 'ramping-vus',
      // startTime: '2m', // Start querying after ingestion phase
      startTime: '3s', // Start querying after ingestion phase
      stages: [
        { duration: '1s', target: 10 }, // Ramp up to 5 VUs
        // { duration: '1m', target: 20 }, // Ramp up to 20 VUs
        // { duration: '1m', target: 20 }, // Hold at 20 VUs
        // { duration: '30s', target: 0 }, // Ramp down
      ],
    },
  },
  // thresholds: {
  //   'ingestion_duration': ['p(95)<500'], // 95% of ingestion requests < 500ms
  //   'query_duration': ['p(95)<1000'], // 95% of query requests < 1000ms
  //   'ingestion_error_rate': ['rate<0.01'], // Ingestion error rate < 1%
  //   'query_error_rate': ['rate<0.01'], // Query error rate < 1%
  //   'http_req_failed': ['rate<0.01'], // HTTP error rate < 1%
  //   'http_req_duration': ['p(95)<1000'], // 95% of all requests < 1000ms
  // },
};

// Simulate log data for ingestion
function generateLogEntry() {

  const timestamp = new Date().toISOString();
  return JSON.stringify({
    streams: [
      {
        stream: { job: "k6-test", app: 'loadtest' },
        values: [
          [
            `${parseInt(Date.now() * 1000000)}`, // time in nanoseconds
            "This is a test log line from k6"
          ]
        ]
      }
    ]
  });
}

// Perform injection test 
export function perform_ingestion_test() {
  // Ingestion test
  const ingestionPayload = generateLogEntry();

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${encodedCredentials}`
  };

  const params = {
    headers: headers,
  };

  const ingestionRes = http.post(ingestionEndpoint, ingestionPayload, params);
  check(ingestionRes, {
    'ingestion status is 204': (r) => r.status === 204,
  });

  ingestionDuration.add(ingestionRes.timings.duration);
  ingestionErrorRate.add(ingestionRes.status !== 204);
  if (ingestionRes.status === 204) {
    ingestionSuccessCounter.add(1);
  }

  sleep(Math.random() * 2); // Random sleep between 0-2 seconds
  //--------------------------------------- finish ingestion---------------------------------------------------------//
}

// Perform Query test
export function perform_query_test() {
  // LogsQL query for testing query performance
  const start = Math.floor(Date.now() / 1000) - 604800
  const end = Math.floor(Date.now() / 1000)
  const query = '{app="loadtest"}';
  const limit = 1000;

  const payload = `query=${encodeURIComponent(query)}&start=${start}&end=${end}&limit=${limit}`

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${encodedCredentials}`
  };

  const params = {
    headers: headers
  };


  const queryRes = http.post(queryEndpoint, payload, params);

  check(queryRes, {
    'query status is 200': (r) => r.status === 200,
  });

  queryDuration.add(queryRes.timings.duration);
  queryErrorRate.add(queryRes.status !== 200);
  if (queryRes.status === 200) {
    querySuccessCounter.add(1);
  }
}
