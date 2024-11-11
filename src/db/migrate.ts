import { faker } from "@faker-js/faker";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { capitalize } from "lodash-es";
import { db, pool } from "~/db/client";
import * as schema from "~/db/schema";

await migrate(db, { migrationsFolder: "./drizzle" });

// Check if we already have users in the database
const existingUsers = await db.select().from(schema.Users).limit(1);

if (existingUsers.length > 0) {
  console.log("💡 Database already contains records, skipping seed.");
  await pool.end();
  process.exit(0);
}

console.log("🌱 Starting database seeding...");

// Create photographers (owners)
const photographers = await db
  .insert(schema.Users)
  .values(
    Array.from({ length: 3 }, () => {
      const firstName = faker.person.firstName();
      return {
        name: firstName,
        email: `photographer+${firstName.toLowerCase()}@casperengelmann.com`,
        userType: "photographer" as const,
      };
    }),
  )
  .returning();

// Create studio members (staff)
const studioMembers = await db
  .insert(schema.Users)
  .values(
    Array.from({ length: 6 }, () => {
      const firstName = faker.person.firstName();
      return {
        name: firstName,
        email: `staff+${firstName.toLowerCase()}@casperengelmann.com`,
        userType: "photographer" as const,
      };
    }),
  )
  .returning();

// Create clients
const clients = await db
  .insert(schema.Users)
  .values(
    Array.from({ length: 10 }, () => {
      const firstName = faker.person.firstName();
      return {
        name: firstName,
        email: `client+${firstName.toLowerCase()}@casperengelmann.com`,
        userType: "client" as const,
      };
    }),
  )
  .returning();

// Create studios for photographers
for (const photographer of photographers) {
  const [studio] = await db
    .insert(schema.Studios)
    .values({
      name: `${photographer.name}'s Studio`,
      createdById: photographer.id,
    })
    .returning();

  // Add photographer as owner
  await db.insert(schema.StudioMembers).values({
    userId: photographer.id,
    studioId: studio.id,
    role: "owner",
  });

  // Add random studio members (staff)
  const randomStudioMembers = faker.helpers.arrayElements(
    studioMembers,
    faker.number.int({ min: 1, max: 3 }),
  );

  // Batch insert studio members
  if (randomStudioMembers.length > 0) {
    await db
      .insert(schema.StudioMembers)
      .values(
        randomStudioMembers.map((member) => ({
          userId: member.id,
          studioId: studio.id,
          role: "member" as const,
        })),
      )
      .onConflictDoNothing();
  }

  const numAlbums = faker.number.int({ min: 2, max: 5 });

  // Create albums for the studio
  const albums = await db
    .insert(schema.Albums)
    .values(
      Array.from({ length: numAlbums }, () => ({
        name: capitalize(
          faker.lorem.words({
            min: 2,
            max: 4,
          }),
        ),
        description: faker.lorem.paragraph(),
        studioId: studio.id,
      })),
    )
    .returning();

  // Process each album
  for (const album of albums) {
    // Add random clients to each album
    const randomClients = faker.helpers.arrayElements(
      clients,
      faker.number.int({ min: 1, max: 3 }),
    );

    // Batch insert studio clients
    const studioClients = await db
      .insert(schema.StudioClients)
      .values(
        randomClients.map((client) => ({
          studioId: studio.id,
          userId: client.id,
        })),
      )
      .onConflictDoNothing()
      .returning();

    // Batch insert album clients
    if (studioClients.length > 0) {
      await db.insert(schema.AlbumClients).values(
        studioClients.map((studioClient) => ({
          albumId: album.id,
          studioClientId: studioClient.id,
        })),
      );
    }

    // Batch insert photos
    const numPhotos = faker.number.int({ min: 5, max: 20 });
    await db.insert(schema.Photos).values(
      Array.from({ length: numPhotos }, (_, index) => ({
        albumId: album.id,
        url: faker.image.urlPicsumPhotos({
          height: faker.number.int({ min: 400, max: 800 }),
          width: faker.number.int({ min: 400, max: 800 }),
          blur: 0,
        }),
        key: faker.string.uuid(),
        caption: faker.lorem.sentence(),
        order: index,
      })),
    );
  }
}

console.log("🚀 Database seeding complete.");

await pool.end();
