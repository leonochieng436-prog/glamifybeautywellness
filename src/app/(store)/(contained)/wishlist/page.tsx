import CardList from "@/components/CardList";
export const metadata = { title: "Wishlist" };
export default function Wishlist() { return <><h1 className="type-h1 mb-2">Wishlist</h1><CardList source="wishlist" empty="Nothing saved yet. Tap the heart on any product." /></>; }
