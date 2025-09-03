# Performance Testing – Restful-Booker API

This repository contains a suite of performance tests conducted on the public [Restful-Booker API](https://restful-booker.herokuapp.com/apidoc/index.html)—a sample Create-Read-Update-Delete (CRUD) API with authentication, commonly used for testing and learning purposes

---

## API Under Test

Restful-Booker API offers endpoints to manage hotel bookings and includes:

- POST /auth – Generate an authentication token

- POST /booking – Create a booking

- GET /booking, GET /booking/{id} – Retrieve bookings

- PUT /booking/{id}, PATCH /booking/{id} – Full or partial updates

- DELETE /booking/{id} – Delete a booking

. The API resets to a default state every 10 minutes and includes a variety of edge cases, making it ideal for testing supremely realistic performance behavior.

---

## Test Types & Configuration
**1. Load Testing**
- Thread Counts: 500, 1000, 1500, 2000, 2500, 3000, 3500
- Ramp-Up: 10s
- Loop Count: 1 (each thread runs one iteration)


**2. Spike Testing**
- Two scenarios using Ultimate Thread Group:
- 1000 threads: Ramp up in 5s, hold 60s, ramp down in 5s
- 2000 threads: Same pattern scaled higher

**3. Stress Testing**
- Stepwise user increase: 300 → 600 → 900 → 1200 → 1500 → 1800 threads
- Each increment: ramp-up over 20s, hold for 60s, shutdown 10s (final stage shutdown 30s)

**4. Endurance Testing**
- 3000 threads, infinite loop
- Ramp-Up: 10s, Duration: 10,800 seconds (3 hours)
- Includes all API operations: auth, create, get, update, partial update, delete

--- 

## Data Driven Testing
Used booking_data.csv, containing 21 distinct booking payload rows (fields: firstname, lastname, totalprice, depositpaid, checkin, checkout, additionalneeds). This was used with JMeter’s CSV Data Set Config to simulate realistic and variable booking data.


## Reporting with Allure

For detailed visualization of test executions, **Allure Report** was integrated with the project.  
Allure provides an interactive, web-based dashboard with metrics such as response time distribution, error percentage, throughput, and percentiles.

### Generate Allure Report
1. Run your JMeter tests with results exported in `.xml` or `.json` format.
2. Use the following command to generate the report:
    ```bash
    allure generate allure-results --clean -o allure-report
    ```
3. Open the report in the browser:
    ```bash
    allure open allure-report
    ```

### Features in Allure Report
- Trend charts of test runs over time.
- Detailed per-transaction metrics (response times, error %).
- Summary of passed/failed requests.
- Graphical view of throughput vs latency.

---

## Results Overview
**Endurance Test (3000 threads, 3 hours)**
- **Total Requests:** 5,548,427 — 12.84% failures

- **Avg Response Time:** 3,928 ms, 99th percentile: ~8,012 ms

- **Throughput:** ~513 req/sec

- **Response time trend:** Cyclic sawtooth pattern with periodic spikes, but no continuous degradation
- **Conclusion:** The API remained up but showed performance instability and high error rate under sustained heavy load.


**Load Testing Summary**
| Threads | Avg Resp Time | Throughput |  Error % |
| ------: | ------------: | ---------: | -------: |
|     500 |        347 ms |    253/sec |       0% |
|    1000 |        416 ms |    489/sec |       0% |
|    1500 |       1147 ms |    530/sec |       0% |
|    2000 |       3744 ms |    355/sec |       0% |
|    2500 |       1719 ms |    488/sec |       0% |
|    3000 |       3562 ms |    279/sec |       0% |
|    3500 |       5658 ms |    270/sec | **7.5%** |
Beyond ~1500 threads, performance degraded sharply—latency spiked, throughput dropped, and error rate began rising.

## Spike Testing
- **1000 threads spike:** No failures; average response times varied by endpoint (~0.9–2.4s), throughput ~530 req/sec.
- **2000 threads spike:** No failures; average latencies increased 3–4×, throughput dropped to ~339 req/sec; heavy endpoints (update/delete) showed mean 7–8s response times.

## Stress Testing (up to 1800 threads)
- **Error Rate:** ~1.3%
- **Avg Response Time:** ~2.57s, Median: 9.3s
- **Throughput:** ~471 req/sec
- High p95 and p99 latencies (10–14s); write/update operations exhibited up to ~3% failures.

---

## Key Insights

- **Maximum stable throughput:** ~500 req/sec (under steady load).
- **Optimal concurrency:** ~1500 threads—beyond this point, performance collapses.
- **Auth endpoint:** Reliable up to ~2500 users, but response times explode at >3000 users.
- **Write operations (update/delete/patch):** Significant degradation and high error rates under stress.
- **Soak stability:** No memory leaks detected, but cyclic latency spikes imply backend resource content

---

## Recommendations

- Introduce caching, optimize database writes, add connection pooling.
- Scale horizontally (API servers, DB replicas).
- Use deployment architecture with load balancing and auto-scaling.
- Monitor and tune JMeter test plans for high latency scenarios.
- Define SLAs carefully (target <1s, optimal upper bound <3s).

---

## How to Execute Tests

1. Clone this repo.
2. Install JMeter (v5.x recommended).
3. Run desired .jmx:
    ```bash
    jmeter -n -t <test_plan>.jmx -l <result>.jtl
    jmeter -g <result>.jtl -o <report_dir>
    ```
4. Analyze reports and tweak configurations as needed.
5. Use CSV for data-driven booking payloads.


---

## Contributing
Contributions to this project are welcome! If you find any issues or want to add new test cases, please follow these steps:
1. Fork the repository.
2. Create a new branch for your changes.
3. Make your changes and commit them.
4. Submit a pull request with a detailed description of your changes.

***
For any questions or feedback, please contact the repository owner or open an issue on GitHub.

Happy Testing! 🚀
