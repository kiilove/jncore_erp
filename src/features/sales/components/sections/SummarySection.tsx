"use client";

export default function SummarySection({
  items,
  taxMethod,
  onUpdate,
}: {
  items: any[];
  taxMethod?: string;
  onUpdate: (data: any) => void;
}) {
  // Calculate totals
  const calculateTotals = () => {
    const supplyAmount = items.reduce(
      (sum, item) => sum + (item.supplyAmount || 0),
      0
    );
    const taxAmount = items.reduce(
      (sum, item) => sum + (item.taxAmount || 0),
      0
    );
    const totalAmount = items.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0
    );

    return { supplyAmount, taxAmount, totalAmount };
  };

  const { supplyAmount, taxAmount, totalAmount } = calculateTotals();

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
              d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 100 12 6 6 0 000-12zm-1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm-3 5a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          요약 정보
        </h2>
      </div>

      <div className="p-6">
        <div className="bg-muted/50 border border-border rounded-md shadow-sm p-4">
          <h3 className="font-medium mb-4 flex items-center text-foreground text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-muted-foreground"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 8a1 1 0 11-2 0V6a1 1 0 112 0v4zm0 4a1 1 0 11-2 0 1 1 0 012 0z"
                clipRule="evenodd"
              />
            </svg>
            금액 정보
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-muted-foreground mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-foreground">공급가액</span>
              </div>
              <span className="font-medium text-foreground">
                {supplyAmount.toLocaleString()} 원
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-border">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-muted-foreground mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-foreground">부가세</span>
              </div>
              <span className="font-medium text-foreground">
                {taxAmount.toLocaleString()} 원
              </span>
            </div>

            <div className="flex justify-between items-center py-3 mt-1 bg-blue-50 dark:bg-blue-900/20 rounded-md px-3">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-foreground">합계</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                {totalAmount.toLocaleString()} 원
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
