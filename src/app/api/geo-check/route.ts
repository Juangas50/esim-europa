import { NextRequest, NextResponse } from "next/server";
import { isCountryBlocked, getClientIP } from "@/lib/geo-blocking";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);

  if (!ip || ip === "unknown") {
    return NextResponse.json({
      ip: ip || "unknown",
      country: "unknown",
      blocked: false,
      message: "Could not determine location.",
    });
  }

  try {
    // Use ipapi.co (free, no API key needed)
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!geoRes.ok) {
      return NextResponse.json({
        ip,
        country: "unknown",
        blocked: false,
        message: "Geolocation check unavailable.",
      });
    }

    const geoData = await geoRes.json();
    const country = geoData.country_code || null;
    const blocked = isCountryBlocked(country);

    return NextResponse.json({
      ip,
      country: country || "unknown",
      blocked,
      message: blocked
        ? "Your country is not supported for purchases. Please contact support."
        : "Your country is allowed.",
    });
  } catch (error) {
    console.error("Geo check error:", error);
    return NextResponse.json({
      ip,
      country: "unknown",
      blocked: false,
      message: "Geolocation check unavailable.",
    });
  }
}
