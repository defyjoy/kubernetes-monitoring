Below is a k6 performance test script designed to evaluate VictoriaLogs' ingestion performance, resource usage, and query performance. The script simulates log ingestion via HTTP POST requests, measures resource usage indirectly through response times and error rates, and tests query performance using LogsQL queries. It includes realistic scenarios, custom metrics, and thresholds to assess performance under load. The script is written in JavaScript, leveraging k6's capabilities for load testing, and is configured to ramp up virtual users (VUs) to simulate varying loads.

```javascript

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
const baseUrl = 'http://victorialogs:8428'; // Replace with your VictoriaLogs instance URL
const ingestionEndpoint = `${baseUrl}/write`; // Endpoint for log ingestion
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
  thresholds: {
    'ingestion_duration': ['p(95)<500'], // 95% of ingestion requests < 500ms
    'query_duration': ['p(95)<1000'], // 95% of query requests < 1000ms
    'ingestion_error_rate': ['rate<0.01'], // Ingestion error rate < 1%
    'query_error_rate': ['rate<0.01'], // Query error rate < 1%
    'http_req_failed': ['rate<0.01'], // HTTP error rate < 1%
    'http_req_duration': ['p(95)<1000'], // 95% of all requests < 1000ms
  },
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

```

### How to Use the Script
1. **Install k6**: Follow the official k6 installation guide (https://k6.io/docs/get-started/installation/). For example, on Debian-based systems:
   ```bash
   sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747825680
   sudo add-apt-repository 'deb https://dl.k6.io/deb stable main'
   sudo apt-get update
   sudo apt-get install k6
   ```
2. **Configure VictoriaLogs**: Update `baseUrl` in the script to point to your VictoriaLogs instance (e.g., `http://localhost:8428`).
3. **Run the Test**: Save the script as `victoria_logs_performance_test.js` and run it with:
   ```bash
   k6 run victoria_logs_performance_test.js
   ```
4. **Optional: Export Results**: To visualize results in Grafana, integrate with InfluxDB or Prometheus:
   ```bash
   k6 run --out influxdb=http://influxdb:8086/mydb victoria_logs_performance_test.js
   ```
   Set up a Grafana dashboard to monitor metrics like `ingestion_duration`, `query_duration`, and error rates.

### Script Explanation
- **Scenarios**: The script uses two scenarios:
  - `ingestion`: Ramps up to 50 VUs to test log ingestion performance.
  - `querying`: Starts after 2 minutes, ramps up to 20 VUs to test query performance.
- **Custom Metrics**: Tracks ingestion and query durations (`Trend`), error rates (`Rate`), and successful operations (`Counter`).
- **Thresholds**: Ensures 95% of requests complete within acceptable times (500ms for ingestion, 1000ms for queries) and error rates remain below 1%.
- **Log Generation**: Simulates realistic log entries with random levels and service names to test high-cardinality ingestion.
- **Query Testing**: Uses a simple LogsQL query (`_time:5m | level="INFO"`) to evaluate query performance.
- **Resource Usage**: Indirectly assessed via response times and error rates. For direct monitoring, use tools like `htop` or `nmon` on the VictoriaLogs server, as recommended in k6 documentation.[](https://grafana.com/docs/k6/latest/testing-guides/running-large-tests/)
- **Custom Summary**: Outputs a JSON-formatted summary of key metrics for easy analysis.

### Notes
- **Resource Usage**: Direct CPU/memory monitoring requires external tools (e.g., `htop`, `nmon`) on the VictoriaLogs server, as k6 focuses on request-level metrics.[](https://grafana.com/docs/k6/latest/testing-guides/running-large-tests/)
- **High-Cardinality Testing**: The script generates logs with varied `service` fields to simulate high-cardinality data, critical for VictoriaLogs' performance claims.[](https://docs.victoriametrics.com/)
- **Scalability**: Adjust `stages` in the `options` object to test higher loads (e.g., 100+ VUs) based on your hardware and VictoriaLogs setup.
- **Visualization**: For deeper analysis, integrate with Grafana Cloud or InfluxDB to visualize metrics in real-time.[](https://grafana.com/blog/2023/04/11/how-to-visualize-load-testing-results/)

This script provides a robust starting point for testing VictoriaLogs' performance. Modify the load profiles, query complexity, or log structure to match your specific use case.[](https://github.com/grafana/k6)