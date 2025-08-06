const { test, expect } = require("@playwright/test");
const {
  CloudWatchClient,
  PutMetricDataCommand,
} = require("@aws-sdk/client-cloudwatch");

// Custom function to publish metric to CloudWatch (added unit parameter for flexibility)
async function publishMetric(metricName, value, namespace, unit = "Count") {
  const client = new CloudWatchClient({ region: "eu-north-1" }); // Your specified region
  const params = {
    MetricData: [
      {
        MetricName: metricName,
        Dimensions: [{ Name: "Project", Value: "PlaywrightDemo" }],
        Unit: unit,
        Value: value,
      },
    ],
    Namespace: namespace,
  };
  const command = new PutMetricDataCommand(params);
  await client.send(command);
  console.log(`Published metric: ${metricName} = ${value}`);
}

// Sample tests
test.describe("Demo Suite", () => {
  let passedTests = 0;
  let failedTests = 0;
  let totalTests = 0;

  test.beforeEach(() => {
    totalTests++; // Dynamically count each test
  });

  test("Test 1: Successful assertion", async ({ page }) => {
    await page.goto("https://example.com");
    await expect(page).toHaveTitle(/Example Domain/);
    passedTests++;
  });

  test("Test 2: Another assertion", async ({ page }) => {
    await page.goto("https://playwright.dev");
    await expect(page).toHaveTitle(/rsdtfyguhjkll/);
    passedTests++;
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === "failed" || testInfo.status === "timedOut") {
      failedTests++;
    }
  });

  test.afterAll(async () => {
    // Adjust passed count if needed (total - failed)
    passedTests = totalTests - failedTests;

    // Publish the new test count metrics
    await publishMetric("TotalTests", totalTests, "PlaywrightTests");
    await publishMetric("PassedTests", passedTests, "PlaywrightTests");
    await publishMetric("FailedTests", failedTests, "PlaywrightTests");

    // Keep your original pass rate metric
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    await publishMetric("TestPassRate", passRate, "PlaywrightTests", "Percent");
  });
});
