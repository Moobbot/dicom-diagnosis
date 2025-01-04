import { Db, MongoClient } from "mongodb";
import { MigrationInterface } from "mongo-migrate-ts";

export class UpdatePermissionSchema1732775242221 implements MigrationInterface {
  public async up(db: Db, client: MongoClient): Promise<void | never> {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection("permissions").updateMany(
          { description: { $exists: false } }, // Chỉ áp dụng cho các tài liệu chưa có trường "description"
          { $set: { description: "" } } // Giá trị mặc định
        );
      });
    } finally {
      await session.endSession();
    }
  }

  public async down(db: Db, client: MongoClient): Promise<void | never> {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection("permissions").updateMany(
          {}, // Áp dụng cho tất cả các tài liệu
          { $unset: { description: "" } } // Xóa trường
        );
      });
    } finally {
      await session.endSession();
    }
  }
}
