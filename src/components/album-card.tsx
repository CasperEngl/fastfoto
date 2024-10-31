import { InferSelectModel } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Albums, Photos } from "~/db/schema";

interface AlbumCardProps {
  album: InferSelectModel<typeof Albums> & {
    photos: InferSelectModel<typeof Photos>[];
  };
}

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link
      href={`/admin/albums/${album.id}/edit`}
      className="flex flex-col rounded-lg border p-4 hover:bg-muted"
    >
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span>{album.name}</span>
          <span className="line-clamp-1 text-sm text-muted-foreground">
            {album.description ? album.description : "No description"}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {album.photos.slice(0, 4).map((photo) => (
            <div key={photo.id} className="relative aspect-square">
              <Image
                src={photo.url}
                alt={photo.caption || ""}
                className="rounded-md object-cover"
                fill
              />
            </div>
          ))}
        </div>
      </div>
      <Button className="mt-4 w-full">Edit Album</Button>
    </Link>
  );
}
