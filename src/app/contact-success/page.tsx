import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

export default function ContactSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full text-center">
        <CheckCircleIcon className="w-16 h-16 text-bitcoin mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Message Sent!</h1>
        <p className="text-slate-400 mb-6">
          Thank you for reaching out. We'll get back to you as soon as possible.
        </p>
        <Link href="/">
          <Button className="bg-bitcoin-500 hover:bg-bitcoin-600 text-slate-900">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}