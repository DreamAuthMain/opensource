# DreamAuth Open Source Repo

Official DreamAuth open source packages.

[![push](https://github.com/DreamAuthMain/opensource/actions/workflows/push.yml/badge.svg)](https://github.com/DreamAuthMain/opensource/actions/workflows/push.yml)
[![codecov](https://codecov.io/gh/DreamAuthMain/opensource/branch/main/graph/badge.svg?token=E2VYI8XJLB)](https://codecov.io/gh/DreamAuthMain/opensource)

## Development

Scripts expect a Mac or Linux environment (no Windows).

After cloning, run the following command to complete enlistment.

```sh
npm i && npm run build
```

## Configuration

Some configuration is at the root, and some is per-package.

- Root
  - Prettier
  - ESLint (extends `<root>/config/.eslintrc.cjs`)
  - TSConfig (extends `<root>/config/tsconfig.json`)
    - Only used for ESLint (not used for type-checking and building).
    - Must include all types/libs for _all_ packages.
  - Jest (extends `<root>/config/jest.config.cjs`)
    - Also runs ESLint.
- Package
  - TSConfig (extends `<root>/config/tsconfig.json`)
    - Adds extra types/libs/config required by the package.
    - Build uses `<package>/config/tsconfig*.json` files which extend the package TSConfig.
  - Jest (extends `<root>/config/jest.config.test.cjs`)
    - Only used when running test/jest directly in the package.
