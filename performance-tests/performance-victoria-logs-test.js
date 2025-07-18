import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics for ingestion and query performance
const ingestionDuration = new Trend('ingestion_duration', true);
const queryDuration = new Trend('query_duration', true);
const ingestionErrorRate = new Rate('ingestion_error_rate');
const queryErrorRate = new Rate('query_error_rate');
const ingestionSuccessCounter = new Counter('ingestion_success_count');
const querySuccessCounter = new Counter('query_success_count');

// VictoriaLogs endpoint configuration
const baseUrl = 'http://loki-gateway.172.18.0.0.nip.io'; // Replace with your VictoriaLogs instance URL
const ingestionEndpoint = `${baseUrl}//loki/api/v1/push`; // Endpoint for log ingestion
const queryEndpoint = `${baseUrl}/select/logsql/query`; // Endpoint for LogsQL queries

// Test configuration
export const options = {
  scenarios: {
    ingestion: {
      executor: 'ramping-vus',
      stages: [
        { duration: '30s', target: 10 }, // Ramp up to 10 VUs
        { duration: '1m', target: 50 }, // Ramp up to 50 VUs
        { duration: '1m', target: 50 }, // Hold at 50 VUs
        { duration: '30s', target: 0 }, // Ramp down
      ],
    },
    querying: {
      executor: 'ramping-vus',
      startTime: '2m', // Start querying after ingestion phase
      stages: [
        { duration: '30s', target: 5 }, // Ramp up to 5 VUs
        { duration: '1m', target: 20 }, // Ramp up to 20 VUs
        { duration: '1m', target: 20 }, // Hold at 20 VUs
        { duration: '30s', target: 0 }, // Ramp down
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
    _msg: `Test log entry at ${timestamp}`,
    level: ['INFO', 'ERROR', 'DEBUG'][Math.floor(Math.random() * 3)],
    service: `test-service-${Math.floor(Math.random() * 100)}`,
    environment: 'production',
    timestamp: timestamp,
  });
}

// LogsQL query for testing query performance
const logsQLQuery = {
  query: '_time:5m | level="INFO"',
};

// Main test function
export default function () {
  // Ingestion test
  const ingestionPayload = generateLogEntry();
  const ingestionParams = {
    headers: { 'Content-Type': 'application/json' },
  };

  const ingestionRes = http.post(ingestionEndpoint, ingestionPayload, ingestionParams);
  check(ingestionRes, {
    'ingestion status is 204': (r) => r.status === 204,
  });

  ingestionDuration.add(ingestionRes.timings.duration);
  ingestionErrorRate.add(ingestionRes.status !== 204);
  if (ingestionRes.status === 204) {
    ingestionSuccessCounter.add(1);
  }

  // Query test (runs after ingestion phase due to scenario startTime)
  const queryParams = {
    headers: { 'Content-Type': 'application/json' },
  };

  const queryRes = http.post(queryEndpoint, JSON.stringify(logsQLQuery), queryParams);
  check(queryRes, {
    'query status is 200': (r) => r.status === 200,
  });

  queryDuration.add(queryRes.timings.duration);
  queryErrorRate.add(queryRes.status !== 200);
  if (queryRes.status === 200) {
    querySuccessCounter.add(1);
  }

  // Simulate user think time
  sleep(Math.random() * 2); // Random sleep between 0-2 seconds
}

// Custom summary for detailed reporting
export function handleSummary(data) {
  return {
    'stdout': JSON.stringify({
      ingestion: {
        avg_duration_ms: data.metrics.ingestion_duration.values.avg,
        p95_duration_ms: data.metrics.ingestion_duration.values['p(95)'],
        error_rate: data.metrics.ingestion_error_rate.values.rate,
        success_count: data.metrics.ingestion_success_count.values.count,
      },
      querying: {
        avg_duration_ms: data.metrics.query_duration.values.avg,
        p95_duration_ms: data.metrics.query_duration.values['p(95)'],
        error_rate: data.metrics.query_error_rate.values.rate,
        success_count: data.metrics.query_success_count.values.count,
      },
      http: {
        failed_requests: data.metrics.http_req_failed.values.rate,
        avg_request_duration_ms: data.metrics.http_req_duration.values.avg,
        p95_request_duration_ms: data.metrics.http_req_duration.values['p(95)'],
      },
    }, null, 2),
  };
}