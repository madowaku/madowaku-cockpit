import test from "node:test";
import assert from "node:assert/strict";
import {
  hasSecureStorage,
  isAllowedAuthUrl,
  publicSession,
  validateGeneration
} from "../policy.mjs";

test("browser launch is restricted to the exact OpenAI authorization origin", () => {
  assert.equal(isAllowedAuthUrl("https://auth.openai.com/authorize?test=1"), true);
  for (const invalid of [
    "http://auth.openai.com/authorize",
    "https://auth.openai.com.evil.example/authorize",
    "https://auth.openai.com@evil.example/authorize",
    "https://chatgpt.com/",
    "javascript:alert(1)",
    "bad"
  ]) assert.equal(isAllowedAuthUrl(invalid), false, invalid);
});

test("credential storage fails closed for the Linux insecure fallback", () => {
  assert.equal(hasSecureStorage("win32", true, ""), true);
  assert.equal(hasSecureStorage("darwin", true, ""), true);
  assert.equal(hasSecureStorage("win32", false, ""), false);
  assert.equal(hasSecureStorage("linux", true, "basic_text"), false);
  assert.equal(hasSecureStorage("linux", true, "gnome_libsecret"), true);
  assert.equal(hasSecureStorage("linux", true, "kwallet6"), true);
});

test("public session cannot expose SDK credentials", () => {
  const value = publicSession({
    status: "connected",
    sharing: true,
    profileLabel: "Connection 1",
    accessToken: "super-secret",
    refreshToken: "another-secret",
    identity: { email: "someone@example.org" }
  });
  assert.deepEqual(value, { status: "connected", sharing: true, label: "Connection 1" });
  assert.equal(JSON.stringify(value).includes("super-secret"), false);
  assert.deepEqual(publicSession({ status: "surprising", sharing: true }), {
    status: "disconnected", sharing: false, label: ""
  });
});

test("generation must be explicit, bounded and use a discovered model", () => {
  const available = [{ slug: "listed-model", displayName: "Listed model" }];
  assert.deepEqual(validateGeneration("  hello  ", "listed-model", available), {
    input: "hello", model: "listed-model"
  });
  for (const invalid of ["", "  ", "a".repeat(501), undefined, { text: "hello" }]) {
    assert.throws(() => validateGeneration(invalid, "listed-model", available));
  }
  assert.throws(() => validateGeneration("hello", "unlisted-model", available));
  assert.throws(() => validateGeneration("hello", "listed-model", []));
});
