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

// Create some users of different types
const firstName = faker.person.firstName();
await db
  .insert(schema.Users)
  .values({
    name: firstName,
    email: `admin+${firstName.toLowerCase()}@casperengelmann.com`,
    userType: "admin",
  })
  .returning()
  .execute();

const photographers = await Promise.all(
  Array(3)
    .fill(null)
    .map(async () => {
      const firstName = faker.person.firstName();
      return await db
        .insert(schema.Users)
        .values({
          name: firstName,
          email: `photographer+${firstName.toLowerCase()}@casperengelmann.com`,
          userType: "photographer",
        })
        .returning()
        .execute();
    }),
);

const clients = await Promise.all(
  Array(10)
    .fill(null)
    .map(async () => {
      const firstName = faker.person.firstName();
      return await db
        .insert(schema.Users)
        .values({
          name: firstName,
          email: `client+${firstName.toLowerCase()}@casperengelmann.com`,
          userType: "client",
        })
        .returning()
        .execute();
    }),
);

// Create albums for photographers
for (const photographer of photographers) {
  const numAlbums = faker.number.int({ min: 2, max: 5 });

  for (let i = 0; i < numAlbums; i++) {
    const album = await db
      .insert(schema.Albums)
      .values({
        name: capitalize(
          faker.lorem.words({
            min: 2,
            max: 4,
          }),
        ),
        description: faker.lorem.paragraph(),
        ownerId: photographer[0].id,
      })
      .returning()
      .execute();

    // Add some random clients to each album
    const randomClients = faker.helpers.arrayElements(
      clients,
      faker.number.int({ min: 1, max: 3 }),
    );

    for (const client of randomClients) {
      await db
        .insert(schema.UsersToAlbums)
        .values({
          userId: client[0].id,
          albumId: album[0].id,
        })
        .execute();
    }

    // Add some photos to each album
    const numPhotos = faker.number.int({ min: 5, max: 20 });
    for (let j = 0; j < numPhotos; j++) {
      await db
        .insert(schema.Photos)
        .values({
          albumId: album[0].id,
          url: faker.image.urlPicsumPhotos({
            height: faker.number.int({ min: 400, max: 800 }),
            width: faker.number.int({ min: 400, max: 800 }),
            blur: 0,
          }),
          key: faker.string.uuid(),
          caption: faker.lorem.sentence(),
          order: j,
        })
        .execute();
    }
  }
}

console.log("🚀 Database seeding complete.");

await pool.end();
