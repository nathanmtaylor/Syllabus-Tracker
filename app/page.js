import { SAMPLE_SYLLABUS } from "@/lib/sampleData";
import SyllabusUploader from "./components/SyllabusUploader";

export default function Home() {
  return (
    <main className="page">
      <SyllabusUploader initialData={SAMPLE_SYLLABUS} />
    </main>
  );
}
