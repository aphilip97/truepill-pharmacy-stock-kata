# TruePill Pharmacy Stock Kata

A command line application for managing the formulary and
inventory of a pharmacy.

## Requirements

### Formulary functionality

- [x] Read existing list of medications in formulary from local
JSON file `formulary.json` or create it if it doesn't exist.
- [x] Add medications to formulary.
  - [x] Prevent duplicate medications from being added to the
  formulary.
  - [x] Handle erroneous input. E.g. Paracetam0l
  - [x] Add multiple medications at the same time in a comma
  separated list.
  - [x] Write list of medications in formulary to local
  `formulary.json` file.
- [x] Generate report of medications in formulary.
  - [x] Print out a list of all medications in the formulary.

### Inventory functionality

- [x] Read existing inventory from local JSON file
`inventory.json` or create it if it doesn't exist.
- [ ] Add packs of medications to inventory.
  - [ ] Only allow medications in formulary to be added.
- [ ] Generate report of medications in inventory.

## Roadmap

- [ ] Upgrade the database to a local SQLite / remote PostgreSQL
database and use Prisma as an ORM.
- [ ] Build a web server that can act as a backend for the CLI.
