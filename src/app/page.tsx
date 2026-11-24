import { redirect } from "next/navigation";

// A aba principal do app é "Treinos".
export default function Home() {
  redirect("/treinos");
}
