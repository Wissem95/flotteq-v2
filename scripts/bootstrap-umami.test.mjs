import assert from 'node:assert/strict';
import test from 'node:test';

import { bootstrapUmami } from './bootstrap-umami.mjs';

function response(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

test('sécurise le compte initial et crée la propriété FlotteQ', async () => {
  const calls = [];
  const responses = [
    response(401, { error: 'unauthorized' }),
    response(200, {
      token: 'default-token',
      user: { id: 'admin-id', username: 'admin', role: 'admin' },
    }),
    response(200, { id: 'admin-id' }),
    response(200, {
      token: 'secured-token',
      user: { id: 'admin-id', username: 'admin', role: 'admin' },
    }),
    response(200, { data: [] }),
    response(200, { id: 'website-id', domain: 'flotteq.fr' }),
  ];

  const websiteId = await bootstrapUmami({
    baseUrl: 'http://umami:3000',
    adminPassword: 'mot-de-passe-tres-long-et-unique',
    fetchImpl: async (url, options = {}) => {
      calls.push({ url, options });
      return responses.shift();
    },
  });

  assert.equal(websiteId, 'website-id');
  assert.equal(calls[2].url, 'http://umami:3000/api/users/admin-id');
  assert.deepEqual(JSON.parse(calls[2].options.body), {
    password: 'mot-de-passe-tres-long-et-unique',
    role: 'admin',
    username: 'admin',
  });
  assert.equal(calls[5].url, 'http://umami:3000/api/websites');
});

test('réutilise un compte sécurisé et une propriété existante', async () => {
  const calls = [];
  const responses = [
    response(200, {
      token: 'secured-token',
      user: { id: 'admin-id', username: 'admin', role: 'admin' },
    }),
    response(200, {
      data: [{ id: 'existing-id', domain: 'flotteq.fr' }],
    }),
  ];

  const websiteId = await bootstrapUmami({
    baseUrl: 'http://umami:3000',
    adminPassword: 'mot-de-passe-tres-long-et-unique',
    fetchImpl: async (url, options = {}) => {
      calls.push({ url, options });
      return responses.shift();
    },
  });

  assert.equal(websiteId, 'existing-id');
  assert.equal(calls.length, 2);
});
