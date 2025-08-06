import { IconShowcase } from '@/components/icons';

export default function IconPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Bitcoin Icons Preview</h1>
        <IconShowcase />
      </div>
    </div>
  );
}