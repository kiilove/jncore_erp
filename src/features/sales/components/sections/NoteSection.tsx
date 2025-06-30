"use client";

export default function NoteSection({
  notes,
  onUpdate,
}: {
  notes: string;
  onUpdate: (data: any) => void;
}) {
  return (
    <section className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden border border-border h-full">
      <div className="bg-gradient-to-r from-blue-50 to-card dark:from-blue-950/20 dark:to-card border-b border-border py-4 px-6">
        <h2 className="text-lg font-medium text-foreground flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          비고
        </h2>
      </div>

      <div className="p-6">
        <div className="relative">
          <div className="absolute top-3 left-3 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <textarea
            value={notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            rows={6}
            className="w-full pl-10 py-2 pr-3 border border-input rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 resize-none text-sm bg-background text-foreground"
          />
        </div>
      </div>
    </section>
  );
}
