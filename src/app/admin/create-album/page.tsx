import { CreateAlbumForm } from "~/app/admin/create-album/create-album-form";

export default function CreateAlbumPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-2xl font-bold">Create New Album</h1>
      <CreateAlbumForm />
    </div>
  );
}
