import type { Metadata } from "next";
import ReturnsPolicyDocument from "@/components/ReturnsPolicyDocument";

export const metadata: Metadata = {
  title: "Returns and refunds",
  description: "How to contact the store about cancellations, returns and refunds.",
};
export const dynamic = "force-dynamic";

export default function ReturnsPage() {
  return <ReturnsPolicyDocument title="Returns and refunds" />;
}
