import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        background: "#2f6d5f",
        color: "#ffffff",
        fontSize: 36,
        fontWeight: 700,
      }}
    >
      W
    </div>,
    size,
  );
}