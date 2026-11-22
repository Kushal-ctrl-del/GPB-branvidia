import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true, message: "Disconnected successfully." });
  response.cookies.delete("gbp_token");
  response.cookies.delete("oauth_state");
  return response;
}
