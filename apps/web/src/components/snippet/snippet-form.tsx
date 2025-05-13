import type React from 'react';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Shield } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface SnippetFormProps {
  onSnippetCreated: (link: string) => void;
}

export function SnippetForm({ onSnippetCreated }: SnippetFormProps) {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [uploaderInfo, setUploaderInfo] = useState('');
  const [expiresAfter, setExpiresAfter] = useState('24h');
  const [maxViews, setMaxViews] = useState('unlimited');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) return;

    setIsSubmitting(true);

    // In a real app, this would be an API call to create the snippet
    // For demo purposes, we'll simulate an API call with a timeout
    setTimeout(() => {
      // Generate a fake unique link
      const snippetId = Math.random().toString(36).substring(2, 10);
      const secretKey = Math.random().toString(36).substring(2, 15);
      const link = `https://secure-snippet.example/s/${snippetId}/${secretKey}`;

      onSnippetCreated(link);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <Card className="w-full shadow-md border-slate-200 bg-white">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Textarea
                placeholder="Paste your code here..."
                className="min-h-[300px] font-mono text-sm resize-y"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Snippet Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="My awesome code"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language (for syntax highlighting)</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plaintext">Plain Text</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="bash">Bash</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="uploader-info">Your Name/Note (Optional, shown to recipient)</Label>
              <Input
                id="uploader-info"
                placeholder="John Doe"
                value={uploaderInfo}
                onChange={(e) => setUploaderInfo(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-3 text-slate-700">Link Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expires-after">Expires After</Label>
                  <Select value={expiresAfter} onValueChange={setExpiresAfter}>
                    <SelectTrigger id="expires-after" className="w-full">
                      <SelectValue placeholder="Select expiration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-views">Max Views</Label>
                  <Select value={maxViews} onValueChange={setMaxViews}>
                    <SelectTrigger id="max-views" className="w-full">
                      <SelectValue placeholder="Select max views" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                      <SelectItem value="1">1 View (Burn after reading)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center pb-6">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700"
            disabled={!code.trim() || isSubmitting}
          >
            <Shield className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Creating Secure Snippet...' : 'Create Secure Snippet'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
