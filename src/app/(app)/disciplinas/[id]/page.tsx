import type { Metadata } from "next";
import DisciplinaDetailPage from "./disciplina-view";

export const metadata: Metadata = {
  title: "Disciplina",
};

export default function DisciplinaPage() {
  return <DisciplinaDetailPage />;
}
