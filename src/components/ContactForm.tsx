'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

export function ContactForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setEmail('');
        setMessage('');
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto"
    >
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'submitting'}
          className="flex-1 h-9 text-xs bg-slate-800/50 border-slate-700"
          aria-label="Email address"
        />
        <Textarea
          placeholder="Message (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 200))}
          maxLength={200}
          rows={1}
          disabled={status === 'submitting'}
          className="flex-1 min-h-[36px] h-9 text-xs resize-none bg-slate-800/50 border-slate-700"
          aria-label="Message"
        />
        <Button
          type="submit"
          disabled={status === 'submitting' || !email}
          size="sm"
          className="h-9 px-3 bg-bitcoin-500 hover:bg-bitcoin-600 text-slate-900 font-medium"
        >
          {status === 'submitting' ? (
            <span className="text-xs">Sending...</span>
          ) : status === 'success' ? (
            <span className="text-xs">Sent!</span>
          ) : status === 'error' ? (
            <span className="text-xs">Error</span>
          ) : (
            <>
              <Send className="h-3 w-3 mr-1" />
              <span className="text-xs">Send</span>
            </>
          )}
        </Button>
      </div>
      
      {message.length > 0 && (
        <p className="text-[10px] text-slate-500 mt-1 text-right">
          {200 - message.length} chars left
        </p>
      )}
    </form>
  );
}