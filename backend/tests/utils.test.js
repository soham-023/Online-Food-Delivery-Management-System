const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const roleGuard = require('../middleware/roleGuard');
const errorHandler = require('../middleware/errorHandler');

// Minimal Express-like response mock
const mockRes = () => {
  const res = { statusCode: 200, body: undefined };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
};

describe('ApiError', () => {
  test('carries status code, message and operational flag', () => {
    const err = new ApiError(404, 'Restaurant not found');
    assert.ok(err instanceof Error);
    assert.equal(err.statusCode, 404);
    assert.equal(err.message, 'Restaurant not found');
    assert.equal(err.isOperational, true);
  });
});

describe('asyncHandler', () => {
  test('forwards rejected promises to next()', async () => {
    const boom = new Error('boom');
    let received;
    await asyncHandler(async () => { throw boom; })({}, {}, (e) => { received = e; });
    assert.equal(received, boom);
  });

  test('does not call next() when the handler succeeds', async () => {
    let called = false;
    await asyncHandler(async () => 'ok')({}, {}, () => { called = true; });
    assert.equal(called, false);
  });
});

describe('generateToken', () => {
  test('signs a token containing the user id', () => {
    process.env.JWT_SECRET = 'test-secret';
    const token = generateToken('user-123');
    const payload = jwt.verify(token, 'test-secret');
    assert.equal(payload.id, 'user-123');
  });

  test('throws a clear error when JWT_SECRET is missing', () => {
    const saved = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    try {
      assert.throws(() => generateToken('user-123'), /JWT_SECRET is not set/);
    } finally {
      process.env.JWT_SECRET = saved;
    }
  });
});

describe('roleGuard', () => {
  test('returns 401 when there is no authenticated user', () => {
    const res = mockRes();
    roleGuard('admin')({}, res, () => assert.fail('next should not be called'));
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
  });

  test('returns 403 for a role that is not allowed', () => {
    const res = mockRes();
    roleGuard('admin')({ user: { role: 'customer' } }, res, () => assert.fail('next should not be called'));
    assert.equal(res.statusCode, 403);
  });

  test('calls next() for an allowed role', () => {
    let called = false;
    roleGuard('admin', 'restaurant')({ user: { role: 'restaurant' } }, mockRes(), () => { called = true; });
    assert.equal(called, true);
  });
});

describe('errorHandler', () => {
  const run = (err) => {
    const res = mockRes();
    const originalError = console.error;
    console.error = () => {};
    try {
      errorHandler(err, {}, res, () => {});
    } finally {
      console.error = originalError;
    }
    return res;
  };

  test('uses the status code from ApiError', () => {
    const res = run(new ApiError(404, 'Not here'));
    assert.equal(res.statusCode, 404);
    assert.deepEqual({ success: res.body.success, message: res.body.message }, { success: false, message: 'Not here' });
  });

  test('defaults unknown errors to 500', () => {
    assert.equal(run(new Error('oops')).statusCode, 500);
  });

  test('maps JWT errors to 401', () => {
    const invalid = Object.assign(new Error('bad'), { name: 'JsonWebTokenError' });
    const expired = Object.assign(new Error('old'), { name: 'TokenExpiredError' });
    assert.equal(run(invalid).statusCode, 401);
    assert.equal(run(invalid).body.message, 'Invalid token');
    assert.equal(run(expired).body.message, 'Token expired');
  });

  test('maps Sequelize unique constraint errors to 400 with the field name', () => {
    const err = Object.assign(new Error('dup'), { name: 'SequelizeUniqueConstraintError', fields: { email: 'a@b.c' } });
    const res = run(err);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /'email'/);
  });

  test('maps invalid UUIDs to 400', () => {
    const err = Object.assign(new Error('invalid input syntax for type uuid: "x"'), { name: 'SequelizeDatabaseError' });
    assert.equal(run(err).statusCode, 400);
  });
});
