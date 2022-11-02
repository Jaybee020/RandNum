# RandNum

An algorand blockchain game where players compete for a chance to guess correctly the lucky number for the game period. It utilizes an algorand stateful smart contract to achieve global concensus.

The contract is written in Pyteal.

The article explaining the contract can be found [here](https://dev.to/jaybee020/randnum-35bg) while live site of the game can be found at [randnum](https://randnumber.netlify.app).

# Project Structure

This project is made up of 3 main folders

- backend
- frontend

## Backend

backend contains the contracts' files and also provides an express server that is continuously holding a game on the contract by interacting with it.

## Frontend

The UI of how a potential game can look like to end users.
