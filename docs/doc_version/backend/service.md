# Common base service structure

Common base service structure to streamline shared functionalities. This approach helps reduce code redundancy and makes it easier to manage CRUD operations for different models. Below is an example structure using a BaseService class to handle shared methods across both services.

**BaseService.ts**
A generic base service to handle common CRUD operations, with type parameters to accommodate different models.

```ts
import { FilterQuery, QueryOptions, UpdateQuery, Model } from "mongoose";

export class BaseService<T> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  findAll({ page, limit }: { page: number; limit: number }) {
    const startIndex = (page - 1) * limit;
    return this.model.find().skip(startIndex).limit(limit);
  }

  findById({ id, options }: { id: string; options?: QueryOptions }) {
    return this.model.findById(id, {}, options);
  }

  findByIds({ ids, options }: { ids: string[]; options?: QueryOptions }) {
    return this.model.find({ _id: { $in: ids } }, {}, options);
  }

  findOne({
    query,
    options,
  }: {
    query: FilterQuery<T>;
    options?: QueryOptions;
  }) {
    return this.model.findOne(query, {}, options);
  }

  create({ data }: { data: Partial<T> }) {
    return this.model.create(data);
  }

  updateById({
    id,
    update,
    options = { new: true },
  }: {
    id: string;
    update: UpdateQuery<T>;
    options?: QueryOptions;
  }) {
    return this.model.findByIdAndUpdate(id, update, options);
  }

  deleteById({ id }: { id: string }) {
    return this.model.deleteOne({ _id: id });
  }

  countDocuments({ query }: { query?: FilterQuery<T> } = {}) {
    return this.model.countDocuments(query);
  }
}
```

**RoleService.ts**
The RoleService class extends BaseService and uses the RoleModel with any additional methods specific to roles.

```ts
import { IRole } from "../interfaces/role.interface";
import { RoleModel } from "../models/role.model";
import { BaseService } from "./base.service";

class RoleService extends BaseService<IRole> {
  constructor() {
    super(RoleModel);
  }

  findRoleByName(name: string) {
    return this.findOne({ name });
  }
}

export const roleService = new RoleService();
```

**UserService.ts**
The UserService class extends BaseService and uses the UserModel with additional user-specific methods, like populating roles and permissions.

```ts
import { IUser } from "../interfaces/user.interface";
import { UserModel } from "../models/user.model";
import { BaseService } from "./base.service";

class UserService extends BaseService<IUser> {
  constructor() {
    super(UserModel);
  }

  findUserByName(username: string) {
    return this.findOne({ username });
  }

  findExtendedUser(userId: string) {
    return this.findById(userId)
      .populate({
        path: "roles",
        populate: { path: "permissions" },
      })
      .exec();
  }

  // Other user-specific methods here
}

export const userService = new UserService();
```
