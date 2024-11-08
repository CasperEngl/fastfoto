import { Button } from "~/components/ui/button";

export function Pagination({
  currentPage,
  totalPages,
  onNextPage,
  onPreviousPage,
}: {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
}) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPreviousPage}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>
      <div className="text-sm">
        Page {currentPage} of {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onNextPage}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  );
}
