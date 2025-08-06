const { test, expect } = require("@playwright/test");
const {
  CloudWatchClient,
  PutMetricDataCommand,
} = require("@aws-sdk/client-cloudwatch");

// Custom function to publish metric to CloudWatch
async function publishMetric(metricName, value, namespace) {
  const client = new CloudWatchClient({ region: "eu-north-1" }); // Adjust region as needed
  const params = {
    MetricData: [
      {
        MetricName: metricName,
        Dimensions: [{ Name: "Project", Value: "PlaywrightDemo" }],
        Unit: "Percent",
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
  let totalTests = 2; // Adjust based on number of tests

  test("Test 1: Successful assertion", async ({ page }) => {
    await page.goto("https://example.com");
    await expect(page).toHaveTitle(/Example Domain/);
    passedTests++;
  });

  test("Test 2: Another assertion", async ({ page }) => {
    await page.goto("https://playwright.dev");
    await expect(page).toHaveTitle(/Playwright/);
    passedTests++;
  });

  test.afterAll(async () => {
    const passRate = (passedTests / totalTests) * 100;
    await publishMetric("TestPassRate", passRate, "PlaywrightTests"); // Publish custom metric
  });
});
