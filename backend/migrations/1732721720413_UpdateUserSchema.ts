import { Db, MongoClient } from "mongodb";
import { MigrationInterface } from "mongo-migrate-ts";

export class UpdateUserSchema1732721720413 implements MigrationInterface {
  public async up(db: Db, client: MongoClient): Promise<void | never> {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const users = await db.collection("users").find({}).toArray();

        for (const user of users) {
          // Chuyển dữ liệu avatar và name vào detail_user
          const detailUser = {
            user_code: "",
            name: user.name || "",
            avatar: user.avatar || null,
            birth_date: new Date(),
            address: "",
            gender: "",
          };

          await db.collection("users").updateOne(
            { _id: user._id },
            {
              $set: { detail_user: detailUser },
              $unset: { avatar: "", name: "" }, // Xóa avatar và name khỏi root level
            }
          );
        }
      });
    } finally {
      await session.endSession();
    }
  }

  public async down(db: Db, client: MongoClient): Promise<void | never> {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const users = await db.collection("users").find({}).toArray();

        // console.log(users);

        for (const user of users) {
          // Chuyển dữ liệu từ detail_user trở lại root level
          const name = user.detail_user?.name || "";
          const avatar = user.detail_user?.avatar || null;

          await db.collection("users").updateOne(
            { _id: user._id },
            {
              $set: { name, avatar },
              $unset: { detail_user: "" }, // Xóa detail_user khỏi schema mới
            }
          );
        }
      });
    } finally {
      await session.endSession();
    }
  }
}
