import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export function SelectedUser({
  image,
  name,
}: {
  image: string | null;
  name: string | null;
}) {
  return (
    <div className="inline-flex items-center gap-x-2">
      <Avatar className="size-8">
        <AvatarImage src={image ?? undefined} alt={name ?? ""} />
        <AvatarFallback>
          {name?.slice(0, 2).toUpperCase() ?? "??"}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm group-hover:underline">{name}</span>
    </div>
  );
}
