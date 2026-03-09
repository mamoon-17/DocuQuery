import { useState } from "react";
import { FileSearch } from "lucide-react";
import DocumentUpload from "@/components/DocumentUpload";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  const [session, setSession] = useState<{ id: string; fileName: string } | null>(null);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="flex items-center gap-2 border-b px-6 py-4">
        <FileSearch className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold tracking-tight">
          Docu<span className="gradient-text">Query</span>
        </h1>
      </header>

      <main className="flex flex-1 flex-col">
        {!session ? (
          /* Upload State */
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
            <div className="w-full max-w-lg space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Ask your <span className="gradient-text">documents</span> anything
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Upload a PDF and instantly query its contents using AI-powered semantic search.
                </p>
              </div>

              <DocumentUpload
                onUploadSuccess={(sessionId, fileName) =>
                  setSession({ id: sessionId, fileName })
                }
              />

              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  PDF support
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Semantic search
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  AI-powered
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Chat State */
          <div className="flex flex-1 flex-col max-w-3xl mx-auto w-full">
            <ChatInterface sessionId={session.id} fileName={session.fileName} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
