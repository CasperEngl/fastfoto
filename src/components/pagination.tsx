import Link from "next/link";
import { Button } from "~/components/ui/button";

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      {currentPage > 1 ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={`?page=${currentPage - 1}`}>Previous</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}
      <div className="text-sm">
        Page {currentPage} of {totalPages}
      </div>
      {currentPage >= totalPages ? (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      ) : (
        <Button variant="outline" size="sm" asChild>
          <Link href={`?page=${currentPage + 1}`}>Next</Link>
        </Button>
      )}
    </div>
  );
}
