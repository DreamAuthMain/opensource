## 4.0.13 (2023-09-19)

### Chores

- Update deps. (c46a6aa)

## 4.0.12 (2023-09-19)

### Build System

- Use Vite library mode. (1cf3c80)

## 4.0.11 (2023-09-16)

### Chores

- Make the Dict type parameter default to any. (a5ddf4c)

## 4.0.10 (2023-09-13)

### Bug Fixes

- Regex lint errors. (3e7667a)
- Make isUUID regex case insensitive and unicode safe. (17b2dba)

## 4.0.9 (2023-08-31)

**Note**: Updated to version "4.0.9".

## 4.0.8 (2023-08-31)

### Bug Fixes

- Select type TKey did not allow any string. (98bf40c)

## 4.0.7 (2023-08-31)

### Chores

- Add Select type. (18ee48d)

## 4.0.6 (2023-08-31)

### Chores

- Add StringHint type. (00b851e)
- **pick:** Refactor Picked type. (a503145)

## 4.0.5 (2023-08-30)

### Chores

- Add pick. (48c84f6)

## 4.0.4 (2023-08-30)

### Chores

- Add isPrimitive. (5007436)

## 4.0.3 (2023-08-29)

### Chores

- Add exports for isEmailLike and NilUuid. (39291d0)
- Add NilUuid constant. (e54324e)
- Rename Uuid type to UuidLike. (f528c56)
- Rename isEmail to isEmailLike. (6880a92)

## 4.0.2 (2023-08-29)

### Chores

- Add isEmail and isUuid. (7dcb1a8)

## 4.0.1 (2023-08-29)

### Chores

- Add Uuid and Email types. (65d603e)

# 4.0.0 (2023-08-27)

### Breaking Changes

- Remove unsafe. (3ad7b43)

## 3.0.5 (2023-08-26)

### Bug Fixes

- **unsafe:** Error prop hinting. (940e76b)

## 3.0.4 (2023-08-26)

### Bug Fixes

- Types in assign, merge, isComposite, isObject, and isObjectLiteral. (caa50be)

## 3.0.3 (2023-08-26)

### Chores

- Allow falsy values for error types to disable unsafe handler and retry rules. (89e75a4)

## 3.0.2 (2023-08-26)

### Bug Fixes

- Unsafe and supporting utils. (705bd9b)

## 3.0.1 (2023-08-25)

### Chores

- Add unsafe. (303244d)

# 3.0.0 (2023-08-24)

### Breaking Changes

- Remove Pick&#42; types. (e72922c)

# 2.0.0 (2023-08-24)

### Breaking Changes

- Rename OmitPartial to PickPartial. (2a6355f)

### Features

- Add PickRequired type. (059cf05)

## 1.0.11 (2023-08-16)

### Chores

- Add OmitPartial type. (b28fddb)

## 1.0.10 (2023-08-16)

### Chores

- Add clean and isUUID. (cc58588)

## 1.0.9 (2023-08-16)

### Chores

- Add assign. (dc69af3)

## 1.0.8 (2023-08-15)

### Chores

- Export AutoPartial, UndefinedKeys, and Simplify types. (60e644b)

## 1.0.7 (2023-08-10)

### Bug Fixes

- **merge:** Shouldn't export AutoPartial and Simplify types. (847130a)

## 1.0.6 (2023-08-10)

### Bug Fixes

- **merge:** Allow nulls and don't stop when the first undefined is encountered. (0d7b698)

## 1.0.5 (2023-08-10)

### Bug Fixes

- **merge:** Allow undefined args. (677b1e7)

## 1.0.4 (2023-08-09)

### Bug Fixes

- Incorrect readme. (73d7322)

## 1.0.3 (2023-08-08)

### Bug Fixes

- Incorrect isError type. (310b97d)

## 1.0.2 (2023-08-08)

### Chores

- Support multiple codes when calling &#96;isError&#96;. (f315431)

## 1.0.1 (2023-08-07)

### Bug Fixes

- **errors,util:** Missing code on type Error. (4e57f48)

### Chores

- Add isError function. (ed80274)

# 1.0.0

Initial release
