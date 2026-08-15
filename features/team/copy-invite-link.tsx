'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function CopyInviteLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const [href, setHref] = useState(`/invite/${token}`);

  useEffect(() => {
    setHref(`${window.location.origin}/invite/${token}`);
  }, [token]);

  async function copy() {
    await navigator.clipboard.writeText(href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="break-all bg-white px-2 py-1 text-sm">{href}</code>
      <Button type="button" variant="secondary" onClick={copy}>
        {copied ? 'Copied' : 'Copy link'}
      </Button>
    </div>
  );
}
