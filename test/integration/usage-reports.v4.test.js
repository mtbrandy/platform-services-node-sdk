/* eslint-disable no-console */
/**
 * (C) Copyright IBM Corp. 2020.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { readExternalSources } = require('ibm-cloud-sdk-core');
const UsageReportsV4 = require('../../dist/usage-reports/v4');
const authHelper = require('../resources/auth-helper.js');

// testcase timeout value (60s).
const timeout = 60000;

// Location of our config file.
const configFile = 'usage_reports.env';

const describe = authHelper.prepareTests(configFile);

let usageReportsService;
let config;
let accountId;
let resourceGroupId;
let orgId;
let billingMonth;
let cosBucket;
let cosLocation;
let snapshotDateFrom;
let snapshotDateTo;

describe('UsageReportsV4_integration', () => {
  jest.setTimeout(timeout);

  beforeAll(async () => {
    usageReportsService = UsageReportsV4.newInstance({});

    config = readExternalSources(UsageReportsV4.DEFAULT_SERVICE_NAME);

    expect(usageReportsService).not.toBeNull();
    expect(config).not.toBeNull();

    accountId = config.accountId;
    resourceGroupId = config.resourceGroupId;
    orgId = config.orgId;
    billingMonth = config.billingMonth;
    cosBucket = config.cosBucket;
    cosLocation = config.cosLocation;
    snapshotDateFrom = config.snapshotDateFrom;
    snapshotDateTo = config.snapshotDateTo;
    expect(accountId).not.toBeNull();
    expect(resourceGroupId).not.toBeNull();
    expect(orgId).not.toBeNull();
    expect(billingMonth).not.toBeNull();
    expect(cosBucket).not.toBeNull();
    expect(cosLocation).not.toBeNull();
    expect(snapshotDateFrom).not.toBeNull();
    expect(snapshotDateTo).not.toBeNull();

    // console.log('Finished setup.');
  });

  test('getAccountSummary()', (done) => {
    const params = {
      accountId,
      billingmonth: billingMonth,
    };

    usageReportsService
      .getAccountSummary(params)
      .then((res) => {
        expect(res).not.toBeNull();
        expect(res.status).toEqual(200);

        const { result } = res;
        expect(result).toBeDefined();
        // console.log('getAccountSummary() result: ', result);

        expect(result.account_id).toEqual(accountId);
        expect(result.month).toEqual(billingMonth);
        expect(result.offers).not.toBeNull();
        expect(result.subscription).not.toBeNull();
        done();
      })
      .catch((err) => {
        console.warn(err);
        done(err);
      });
  });
  test('getAccountUsage()', (done) => {
    const params = {
      accountId,
      billingmonth: billingMonth,
      names: true,
      acceptLanguage: 'English',
    };

    usageReportsService
      .getAccountUsage(params)
      .then((res) => {
        expect(res).not.toBeNull();
        expect(res.status).toEqual(200);

        const { result } = res;
        expect(result).toBeDefined();
        // console.log('getAccountUsage() result: ', result);

        expect(result.account_id).toEqual(accountId);
        expect(result.month).toEqual(billingMonth);
        expect(result.resources).not.toBeNull();
        done();
      })
      .catch((err) => {
        console.warn(err);
        done(err);
      });
  });
  test('getResourceGroupUsage()', (done) => {
    const params = {
      accountId,
      resourceGroupId,
      billingmonth: billingMonth,
      names: true,
    };

    usageReportsService
      .getResourceGroupUsage(params)
      .then((res) => {
        expect(res).not.toBeNull();
        expect(res.status).toEqual(200);

        const { result } = res;
        expect(result).toBeDefined();
        // console.log('getResourceGroupUsage() result: ', result);

        expect(result.account_id).toEqual(accountId);
        expect(result.month).toEqual(billingMonth);
        expect(result.resources).not.toBeNull();
        done();
      })
      .catch((err) => {
        console.warn(err);
        done(err);
      });
  });
  test('getOrgUsage()', (done) => {
    const params = {
      accountId,
      organizationId: orgId,
      billingmonth: billingMonth,
      names: true,
    };

    usageReportsService
      .getOrgUsage(params)
      .then((res) => {
        expect(res).not.toBeNull();
        expect(res.status).toEqual(200);

        const { result } = res;
        expect(result).toBeDefined();
        // console.log('getOrgUsage() result: ', result);

        expect(result.account_id).toEqual(accountId);
        expect(result.month).toEqual(billingMonth);
        expect(result.resources).not.toBeNull();
        done();
      })
      .catch((err) => {
        console.warn(err);
        done(err);
      });
  });
  test('getResourceUsageAccount()', async () => {
    const resources = [];
    let offset = null;

    try {
      do {
        const params = {
          accountId,
          billingmonth: billingMonth,
          names: true,
          limit: 50,
          start: offset,
        };

        // Get next page of results.
        const res = await usageReportsService.getResourceUsageAccount(params);
        expect(res.status).toEqual(200);

        const { result } = res;
        expect(result).toBeDefined();

        // console.log('getResourceUsageAccount() result: ', result);
        expect(result.resources).toBeDefined();
        resources.push(...result.resources);

        // Get offset of next page.
        if (result.next) {
          offset = result.next.offset;
        } else {
          offset = null;
        }
      } while (offset != null);
    } catch (err) {
      console.log(err);
    }

    // Make sure we found some resources.
    const numResources = resources.length;
    // console.log(`getResourceUsageAccount() response contained ${numResources} total resources`);
    expect(numResources).toBeGreaterThan(0);
  });
  test('getResourceUsageResourceGroup()', async () => {
    const resources = [];
    let offset = null;

    try {
      do {
        const params = {
          accountId,
          resourceGroupId,
          billingmonth: billingMonth,
          names: true,
          limit: 50,
          start: offset,
        };

        // Get next page of results.
        const res = await usageReportsService.getResourceUsageResourceGroup(params);
        expect(res.status).toEqual(200);

        const { result } = res;
        expect(result).toBeDefined();

        // console.log('getResourceUsageResourceGroup() result: ', result);
        expect(result.resources).toBeDefined();
        resources.push(...result.resources);

        // Get offset of next page.
        if (result.next) {
          offset = result.next.offset;
        } else {
          offset = null;
        }
      } while (offset != null);
    } catch (err) {
      console.log(err);
    }

    // Make sure we found some resources.
    const numResources = resources.length;
    // console.log(`getResourceUsageResourceGroup() response contained ${numResources} total resources`);
    expect(numResources).toBeGreaterThan(0);
  });
  test('getResourceUsageOrg()', async () => {
    const resources = [];
    let offset = null;

    try {
      do {
        const params = {
          accountId,
          organizationId: orgId,
          billingmonth: billingMonth,
          names: true,
          limit: 50,
          start: offset,
        };

        // Get next page of results.
        const res = await usageReportsService.getResourceUsageOrg(params);
        expect(res.status).toEqual(200);

        const { result } = res;
        expect(result).toBeDefined();

        // console.log('getResourceUsageOrg() result: ', result);
        expect(result.resources).toBeDefined();
        resources.push(...result.resources);

        // Get offset of next page.
        if (result.next) {
          offset = result.next.offset;
        } else {
          offset = null;
        }
      } while (offset != null);
    } catch (err) {
      console.log(err);
    }

    // Make sure we found some resources.
    const numResources = resources.length;
    // console.log(`getResourceUsageOrg() response contained ${numResources} total resources`);
    expect(numResources).toBeGreaterThan(0);
  });

  test('createReportsSnapshotConfig()', async () => {
    const params = {
      accountId,
      interval: 'daily',
      cosBucket,
      cosLocation,
      cosReportsFolder: 'IBMCloud-Billing-Reports',
      reportTypes: ['account_summary', 'enterprise_summary', 'account_resource_instance_usage'],
      versioning: 'new',
    };

    const res = await usageReportsService.createReportsSnapshotConfig(params);
    expect(res).toBeDefined();
    expect(res.status).toBe(201);
    expect(res.result).toBeDefined();
  });

  test('getReportsSnapshotConfig()', async () => {
    const params = {
      accountId,
    };

    const res = await usageReportsService.getReportsSnapshotConfig(params);
    expect(res).toBeDefined();
    expect(res.status).toBe(200);
    expect(res.result).toBeDefined();
  });

  test('updateReportsSnapshotConfig()', async () => {
    const params = {
      accountId,
      interval: 'daily',
      cosBucket,
      cosLocation,
      cosReportsFolder: 'IBMCloud-Billing-Reports',
      reportTypes: ['account_summary', 'enterprise_summary'],
      versioning: 'new',
    };

    const res = await usageReportsService.updateReportsSnapshotConfig(params);
    expect(res).toBeDefined();
    expect(res.status).toBe(200);
    expect(res.result).toBeDefined();
  });

  test('getReportsSnapshot()', async () => {
    const params = {
      accountId,
      month: billingMonth,
      dateFrom: snapshotDateFrom,
      dateTo: snapshotDateTo,
    };

    const res = await usageReportsService.getReportsSnapshot(params);
    expect(res).toBeDefined();
    expect(res.status).toBe(200);
    expect(res.result).toBeDefined();
  });

  test('deleteReportsSnapshotConfig()', async () => {
    const params = {
      accountId,
    };

    const res = await usageReportsService.deleteReportsSnapshotConfig(params);
    expect(res).toBeDefined();
    expect(res.status).toBe(204);
    expect(res.result).toBeDefined();
  });
});
