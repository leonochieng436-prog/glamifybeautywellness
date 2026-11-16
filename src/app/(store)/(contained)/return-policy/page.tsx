import type { Metadata } from "next";
import ReturnsPolicyDocument from "@/components/ReturnsPolicyDocument";

export const metadata: Metadata = {
  title: "Return Policy",
  description: "How to contact the store about cancellations, returns, and refunds.",
};
export const dynamic = "force-dynamic";

export default function ReturnPolicyPage() {
  return <ReturnsPolicyDocument title="Return Policy" />;
}
