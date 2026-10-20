import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CAPTCHA: Delivery Status Retrieval" },
      {
        name: "description",
        content:
          "Action-arcade survival game: race your overclocked phone through spam-bots and glitch traffic to retrieve your delivery status.",
      },
      { property: "og:title", content: "CAPTCHA: Delivery Status Retrieval" },
      {
        property: "og:description",
        content:
          "Race your overclocked phone through spam-bots and glitch traffic to retrieve your delivery status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/game/index.html"
      title="CAPTCHA: Delivery Status Retrieval game"
      className="h-screen w-full border-0"
      allow="fullscreen"
    />
  );
}
