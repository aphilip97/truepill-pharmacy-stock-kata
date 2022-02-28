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
- [x] Add packs of medications to inventory.
  - [x] Only allow medications in formulary to be added.
  - [x] Handle erroneous input. E.g. -10, 2e-3, 0.02 etc.
  - [x] Write inventory to local `inventory.json` file.
- [x] Generate report of medications in inventory.
  - [x] Print out a list of all the medications in the inventory
  with the total number of packs for each combination of
  medicine, strength and pack size.

## Installation

Clone the repository with and run `npm install`.

## Build

Transpile the app from TypeScript to JavaScript using
`npm run build`. The output will be in the `build/` folder.

You can run `npm run build:watch` during development to
type-check on save.

## Usage

You can run the app using `npm run start`.

> **NOTE**: There is no nodemon version of this command for
development. I tried it out and it would mess up the `inquirer`
prompts.

Upon running the app you will be presented with the following
options:

- `Add Medication To Formulary`
- `Generate Formulary Report`
- `Add Medication To Inventory`
- `Generate Inventory Report`
- `Quit`

You can quit the app using CTRL+C but the option to quit is
still there for a more complete interface.

> **TIP**: When presented with any kind of confirmation prompt
you can just press ENTER instead of typing `y / Y` and inquirer
will accept that as a yes. You will have to type `n / N` for no
though.

## Roadmap

I think the following features would be good to have but for the
sake of keeping things simple and the data source local I've
decided not to implement it.

- [ ] Upgrade the database to a local SQLite / remote PostgreSQL
database and use Prisma as an ORM.
- [ ] Build a ReST API that can act as a backend for the command
line application.
