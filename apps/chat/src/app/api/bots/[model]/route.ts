import { ***REMOVED***, BingBot } from "bots";
import { NextRequest, NextResponse } from "next/server";
import { postPayload } from "@/app/api/bots/typing";
import { textSecurity } from "@/lib/content";

export async function POST(
  req: NextRequest,
  { params }: { params: { model: string } }
): Promise<NextResponse> {
  const role = req.headers.get("role") ?? "free";

  let payload;

  try {
    payload = await new NextResponse(req.body).json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 }); // TODO correct code
  }

  const parseResult = postPayload.safeParse(payload);

  if (!parseResult.success) return NextResponse.json(parseResult.error);

  const { conversation, maxTokens, model } = parseResult.data;

  let bot;
  switch (params.model) {
    case "openai":
      if (model === "new-bing") return NextResponse.json({}, { status: 404 });
      bot = new ***REMOVED***({
        cookie: process.env.***REMOVED***!,
        token: process.env.***REMOVED***!,
        model,
      });
      break;
    case "new-bing":
      bot = new BingBot(process.env.BING_COOKIE!);
      break;
    default:
      return NextResponse.json({}, { status: 404 });
  }

  // 文本安全 TODO 节流
  const suggestion = await textSecurity(conversation);
  if (suggestion.toLowerCase() !== "pass")
    return NextResponse.json({}, { status: 402 });

  return new NextResponse(
    bot.answerStream({ conversation, signal: req.signal })
  );
}

export const config = {
  runtime: "edge",
};
