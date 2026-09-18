// Lets the browser check a password against APP_PASSWORD without ever
// receiving the real value - it only ever gets back { ok: true/false }.
// This does NOT protect anything by itself; /api/extract checks the
// password again, independently, since that's the route that actually
// costs money to call.
export async function POST(request) {
  let password;
  try {
    ({ password } = await request.json());
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const expected = process.env.APP_PASSWORD;
  // If APP_PASSWORD isn't set at all, fail closed (deny) rather than
  // accidentally leaving the gate open because of a missing env var.
  const ok = Boolean(expected) && password === expected;

  return Response.json({ ok }, { status: ok ? 200 : 401 });
}
