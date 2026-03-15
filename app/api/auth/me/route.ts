import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function GET() {
  // Read the access token from the httpOnly cookie
  const token = (await cookies()).get("access_token")?.value;

  // No token = clearly not logged in, but respond in a friendly, structured way
  if (!token) {
    return NextResponse.json(
      {
        loggedIn: false,
        user: null,
        message: "No active session. Please sign in to access your dashboard.",
      },
      { status: 200 }
    );
  }
  
  try {
    // Verify and decode the JWT payload (expects sub, email, role, etc.)
    const payload = await verifyAccessToken(token);

    // Positive, informative response with basic user context
    return NextResponse.json(
      {
        loggedIn: true,
        user: {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        },
        message: "You are signed in.",
      },
      { status: 200 }
    );
  } catch {
    // Token is missing/expired/invalid → treat as logged out but don’t hard-fail
    return NextResponse.json(
      {
        loggedIn: false,
        user: null,
        message:
          "Your session has expired or is no longer valid. Please sign in again.",
      },
      { status: 200 }
    );
  }
}