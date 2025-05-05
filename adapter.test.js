const assert = require('node:assert');
const { mock } = require('node:test');
const nock = require('nock');

const adapter = require('../../lib/commons/clients/adapter');

describe('Adapter - Unit Tests', () => {
  beforeEach(() => {
    mock.restoreAll();
    nock.cleanAll();
  });

  after(() => {
    mock.reset();
  });

  describe('callback', () => {
    it('should return error when fetch fails', (done) => {
      const exception = new Error('Fetch failed');

      const fetchSpy = mock.method(global, 'fetch', () => Promise.reject(exception));

      const options = {
        url: 'http://example.com',
        method: 'GET'
      };

      adapter(options, (error, response) => {
        assert.equal(error, exception);
        assert.strictEqual(response, undefined);
        assert.equal(fetchSpy.mock.callCount(), 1);
        done();
      });
    });

    it('should return response as string when content-type is text/html', (done) => {
      const res = {
        myResponse: 'response'
      };

      const fetchSpy = mock.method(global, 'fetch', () => Promise.resolve({
        status: 200,
        headers: new Headers({ 'content-type': 'text/html' }),
        text: () => Promise.resolve(JSON.stringify(res))
      }));

      const options = {
        url: 'http://example.com',
        method: 'GET'
      };

      adapter(options, (error, response) => {
        assert.strictEqual(error, null);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body, JSON.stringify(res));
        assert.equal(fetchSpy.mock.callCount(), 1);
        done();
      });
    });

    it('should return response as json when content-type is application/json', (done) => {
      const res = {
        myResponse: 'response'
      };

      const fetchSpy = mock.method(global, 'fetch', () => Promise.resolve({
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(res)
      }));

      const options = {
        url: 'http://example.com',
        method: 'GET'
      };

      adapter(options, (error, response) => {
        assert.strictEqual(error, null);
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, res);
        assert.equal(fetchSpy.mock.callCount(), 1);
        done();
      });
    });

    it('should return error when fails to parse json response', (done) => {
      nock('http://example.com').get('/').reply(200, 'invalid json', {
        'content-type': 'application/json'
      });

      const options = {
        url: 'http://example.com',
        method: 'GET',
        json: true
      };

      adapter(options, (error, response) => {
        assert.equal(error.message, 'Unexpected token \'i\', "invalid json" is not valid JSON');
        assert.strictEqual(error instanceof SyntaxError, true);
        assert.strictEqual(response, undefined);
        done();
      });
    });

    it('should send headers when specified in options', (done) => {
      const res = {
        myResponse: 'response'
      };

      const fetchSpy = mock.method(global, 'fetch', () => Promise.resolve({
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(res)
      }));

      const options = {
        url: 'http://example.com',
        method: 'POST',
        headers: {
          Authorization: 'Bearer token'
        },
        json: true,
        body: {
          myBody: 'body'
        }
      };

      adapter(options, (error, response) => {
        assert.strictEqual(error, null);
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, res);
        assert.equal(fetchSpy.mock.callCount(), 1);
        assert.deepEqual(fetchSpy.mock.calls[0].arguments[1], {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token'
          },
          method: options.method,
          body: JSON.stringify(options.body)
        });
        done();
      });
    });
  });

  describe('promise', () => {
    it('should return error when fetch fails', async () => {
      const exception = new Error('Fetch failed');

      const fetchSpy = mock.method(global, 'fetch', () => Promise.reject(exception));

      const options = {
        url: 'http://example.com',
        method: 'GET'
      };

      await assert.rejects(adapter(options), (err) => {
        assert.equal(err, exception);
        assert.equal(fetchSpy.mock.callCount(), 1);
        return true;
      });
    });

    it('should return response as string when content-type is text/html', async () => {
      const res = {
        myResponse: 'response'
      };

      const fetchSpy = mock.method(global, 'fetch', () => Promise.resolve({
        status: 200,
        headers: new Headers({ 'content-type': 'text/html' }),
        text: () => Promise.resolve(JSON.stringify(res))
      }));

      const options = {
        url: 'http://example.com',
        method: 'GET'
      };

      const response = await adapter(options);

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body, JSON.stringify(res));
      assert.equal(fetchSpy.mock.callCount(), 1);
    });

    it('should return response as json when content-type is application/json', async () => {
      const res = {
        myResponse: 'response'
      };

      const fetchSpy = mock.method(global, 'fetch', () => Promise.resolve({
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(res)
      }));

      const options = {
        url: 'http://example.com',
        method: 'GET'
      };

      const response = await adapter(options);

      assert.strictEqual(response.statusCode, 200);
      assert.deepStrictEqual(response.body, res);
      assert.equal(fetchSpy.mock.callCount(), 1);
    });

    it('should return error when fails to parse json response', async () => {
      nock('http://example.com').get('/').reply(200, 'invalid json', {
        'content-type': 'application/json'
      });

      const options = {
        url: 'http://example.com',
        method: 'GET',
        json: true
      };

      await assert.rejects(adapter(options), (error) => {
        assert.equal(error.message, 'Unexpected token \'i\', "invalid json" is not valid JSON');
        assert.strictEqual(error instanceof SyntaxError, true);
        return true;
      });
    });

    it('should send headers when specified in options', async () => {
      const res = {
        myResponse: 'response'
      };

      const fetchSpy = mock.method(global, 'fetch', () => Promise.resolve({
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(res)
      }));

      const options = {
        url: 'http://example.com',
        method: 'POST',
        headers: {
          Authorization: 'Bearer token'
        },
        json: true,
        body: {
          myBody: 'body'
        }
      };

      const response = await adapter(options);

      assert.strictEqual(response.statusCode, 200);
      assert.deepStrictEqual(response.body, res);
      assert.equal(fetchSpy.mock.callCount(), 1);
      assert.deepEqual(fetchSpy.mock.calls[0].arguments[1], {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token'
        },
        method: options.method,
        body: JSON.stringify(options.body)
      });
    });
  });
});
