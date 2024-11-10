import { match } from "ts-pattern";
import { Button } from "~/components/ui/button";
import { pluralize } from "~/lib/plural-rules";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalResults,
  onNextPage,
  onPreviousPage,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-muted-foreground">
        {match(pluralize.select(totalResults))
          .with("zero", () => "No results")
          .with("one", () => "1 result")
          .otherwise(() => `${totalResults} results`)}
      </div>
      <div className="flex items-center space-x-2">
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
    </div>
  );
}
