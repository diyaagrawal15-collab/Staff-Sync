/**
 * Comprehensive Automated Test Suite for HRM System (In-Memory Direct Dispatcher)
 * Zero socket dependency — runs anywhere with guaranteed reliability!
 */

const { EventEmitter } = require('events');
const { app } = require('../server');

const invokeApp = (method, urlPath, body = null, token = null) => {
  return new Promise((resolve) => {
    const [path, queryString] = urlPath.split('?');
    const query = {};
    if (queryString) {
      new URLSearchParams(queryString).forEach((val, key) => {
        query[key] = val;
      });
    }

    const req = new EventEmitter();
    req.method = method;
    req.url = urlPath;
    req.path = path;
    req.query = query;
    req.params = {};
    req.headers = {
      'content-type': 'application/json'
    };
    if (token) {
      req.headers['authorization'] = `Bearer ${token}`;
    }
    req.body = body || {};

    let statusCode = 200;
    const res = new EventEmitter();
    res.statusCode = 200;
    res.setHeader = () => res;
    res.getHeader = () => null;

    res.status = (code) => {
      statusCode = code;
      res.statusCode = code;
      return res;
    };

    res.json = (data) => {
      resolve({ status: statusCode, body: data, ok: statusCode >= 200 && statusCode < 300 });
      return res;
    };

    res.send = (data) => {
      let parsed = data;
      try { parsed = JSON.parse(data); } catch (_) {}
      resolve({ status: statusCode, body: parsed, ok: statusCode >= 200 && statusCode < 300 });
      return res;
    };

    res.end = () => {
      resolve({ status: statusCode, body: {}, ok: statusCode >= 200 && statusCode < 300 });
    };

    // Dispatch directly to Express application
    app(req, res, (err) => {
      if (err) {
        resolve({ status: 500, body: { message: err.message }, ok: false });
      } else {
        resolve({ status: 404, body: { message: 'Not Found' }, ok: false });
      }
    });
  });
};

const runAllTests = async () => {
  console.log('====================================================');
  console.log('🧪 Starting HRM Automated Verification Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    console.log('📋 Test Group 1: Health & System Diagnostics');
    const healthRes = await invokeApp('GET', '/api/health');
    assert(healthRes.status === 200 && healthRes.body.status === 'online', 'Server is online and healthy');

    // 2. Authentication Testing
    console.log('\n📋 Test Group 2: Authentication & Credentials');
    const hrLogin = await invokeApp('POST', '/api/auth/login', {
      email: 'hr@example.com',
      password: 'Password123!'
    });
    assert(hrLogin.status === 200 && hrLogin.body.token, 'HR Login successful with JWT returned');
    const hrToken = hrLogin.body.token;

    const mgrLogin = await invokeApp('POST', '/api/auth/login', {
      email: 'manager@example.com',
      password: 'Password123!'
    });
    assert(mgrLogin.status === 200 && mgrLogin.body.user.role === 'manager', 'Manager Login successful with role manager');
    const mgrToken = mgrLogin.body.token;

    const empLogin = await invokeApp('POST', '/api/auth/login', {
      email: 'alex@example.com',
      password: 'Password123!'
    });
    assert(empLogin.status === 200 && empLogin.body.user.role === 'employee', 'Employee Login successful');
    const empToken = empLogin.body.token;

    const badLogin = await invokeApp('POST', '/api/auth/login', {
      email: 'hr@example.com',
      password: 'WrongPassword'
    });
    assert(badLogin.status === 401, 'Unauthorized for bad password rejected properly');

    // 3. Role-Based Access Control (RBAC) Testing
    console.log('\n📋 Test Group 3: Role-Based Access Control (RBAC)');
    const empDeniedHRRoute = await invokeApp('GET', '/api/reports/hr', null, empToken);
    assert(empDeniedHRRoute.status === 403, 'Employee is blocked from HR-only reports (HTTP 403)');

    const hrAllowedHRRoute = await invokeApp('GET', '/api/reports/hr', null, hrToken);
    assert(hrAllowedHRRoute.status === 200, 'HR is authorized to access HR reports (HTTP 200)');

    // 4. Employee Management Testing
    console.log('\n📋 Test Group 4: Employee Management');
    const empList = await invokeApp('GET', '/api/employees', null, hrToken);
    assert(empList.status === 200 && empList.body.data.length > 0, `HR can retrieve employee directory (${empList.body.data.length} employees)`);

    const searchRes = await invokeApp('GET', '/api/employees?search=Alex', null, hrToken);
    assert(searchRes.status === 200 && searchRes.body.data.some(e => e.name.includes('Alex')), 'Employee search by name works');

    // 5. Attendance Management Testing
    console.log('\n📋 Test Group 5: Attendance Management');
    const myAtt = await invokeApp('GET', '/api/attendance/my', null, empToken);
    assert(myAtt.status === 200 && Array.isArray(myAtt.body.data), 'Employee can view their attendance logs');

    const teamAtt = await invokeApp('GET', '/api/attendance/team', null, mgrToken);
    assert(teamAtt.status === 200, 'Manager can view team attendance');

    // 6. Leave Management Testing
    console.log('\n📋 Test Group 6: Leave Management Workflow');
    const leaveApply = await invokeApp('POST', '/api/leaves/apply', {
      leaveType: 'casual',
      startDate: '2026-12-01',
      endDate: '2026-12-02',
      reason: 'Personal family event'
    }, empToken);
    assert(leaveApply.status === 201 && leaveApply.body.data.status === 'pending', 'Employee can apply for leave');
    const newLeaveId = leaveApply.body.data._id;

    const reviewRes = await invokeApp('PUT', `/api/leaves/${newLeaveId}/review`, {
      status: 'approved',
      reviewComment: 'Have a great time with family'
    }, mgrToken);
    assert(reviewRes.status === 200 && reviewRes.body.data.status === 'approved', 'Manager can review and approve leave');

    // 7. Training Programs Testing
    console.log('\n📋 Test Group 7: Training Programs Management');
    const trainings = await invokeApp('GET', '/api/trainings', null, empToken);
    assert(trainings.status === 200 && trainings.body.data.length > 0, 'Employees can browse training programs');

    const firstTrainingId = trainings.body.data[0]._id;
    const progressUpdate = await invokeApp('PUT', `/api/trainings/${firstTrainingId}/progress`, {
      progress: 75,
      score: 92
    }, empToken);
    assert(progressUpdate.status === 200, 'Employee can update training progress & track learning');

    // 8. Announcements Testing
    console.log('\n📋 Test Group 8: Announcements Module');
    const newPost = await invokeApp('POST', '/api/announcements', {
      title: 'Automated CI/CD Pipeline Deployed',
      content: 'All HRM automated tests are passing with flying colors!',
      priority: 'high',
      targetAudience: 'all',
      isPinned: true
    }, hrToken);
    assert(newPost.status === 201, 'HR can publish priority company announcements');

    const getPosts = await invokeApp('GET', '/api/announcements', null, empToken);
    assert(getPosts.status === 200 && getPosts.body.data.length > 0, 'Employees can view published announcements');

    // 9. Notifications Testing
    console.log('\n📋 Test Group 9: Real-time Notifications');
    const notifs = await invokeApp('GET', '/api/notifications', null, empToken);
    assert(notifs.status === 200 && Array.isArray(notifs.body.data), 'Employee can view their notifications');

    console.log('\n====================================================');
    console.log(`🏁 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('💥 Test suite crashed:', err);
    process.exit(1);
  }
};

runAllTests();
