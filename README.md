# gewaesser-retter

A simple app to show trash collection events by volunteers. This is the
frontend, which depends on external forms and on a connection to an external
database. It contains an interactive map, and a list of summaries.

## Project setup
```
yarn install
```
Note: Currently (as of 2022-05) some indirectly installed packages may complain
about a node version mismatch. A
```
yarn config set ignore-engines true
```
silences this error.

### Compiles and hot-reloads for development.

Needs environmental data in ./.env.development

```
yarn serve
```

### Compiles and minifies for production.

Needs environmental data in ./.env.production
```
yarn build --production
```
