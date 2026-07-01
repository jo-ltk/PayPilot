import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://api.shopify.com/*", () => {
    return HttpResponse.json({ data: {} });
  }),
  http.post("https://testpay.easebuzz.in/*", () => {
    return HttpResponse.json({ status: 1 });
  }),
];
