# LOA Planner
This repository contains the source code and documentation for the LOA Planner project.

All console commands given in this document are for Arch Linux kernel 6.16.0-arch2-1.

This project was bootstrapped with [Vite](https://vitejs.dev/).

## Dependencies (required)

#### npm (npm-11.5.2-1 used)
```console
$ sudo pacman -S npm
```

## How to Build
1. Install required dependencies from previous section.
2. Clone this repository.
```console
$ git clone https://github.com/md842/loa-planner
```
3. Navigate to the project directory.
```console
$ cd loa-planner
```

4. Install package dependencies.
```console
loa-planner$ npm install
```

5. Run the production build.
```console
loa-planner$ npm run build
```

## How to Run
To run the app in development mode:
```console
loa-planner$ npm run dev
```

The app can now be accessed at `http://localhost:5173/`.