# Random Backend

This is the REST API of Random ,a platform where users can take place in the traditional baba ijebu lottery game on chain(Algorand)

# Project Structure

This project is made up of 3 main folders

- contracts
- scripts
- test

## Contracts

The contracts folder contains the pyTeal code used to write the smart contracts.It is compiled to TEAL bytecode and can be deployed to mainnet or testnet.

To compile the pyteal

- Run the python file `lotto.py`. This also generates the app.teal bytecode and abi contract.json

## Scripts

This folder contains all the scripts written to interact with the smart contract in typescript.The code to deploy the contract is in `deploy.ts`.You are to input your account credentials in `config.ts`.The atomic transaction composer used to call ABI methods from the contract is in `call.ts`.

To deploy the contract,run

```bash
npx ts-node scripts/deploy.ts
```

## Download and Build on local

Clone the repository

```bash
    git clone https://github.com/Jaybee020/
```

Cd into backend folder

```bash
    cd backend
```

Install node dependencies

```bash
   npm install
```

To start the express server

```bash
  npm start
```

Open your local browser and verify the server is running with `http://localhost:6060/`

## API Reference

### Get a user game profile by address

```http
GET "/lotto/profile/:addr"
```

All parameters are to be in URL
| Parameter | Type | Description |
| :-------- | :------- | :------------------------- |
| `addr` | `string` | **Required**. address of account we want to get game profile for. |

response.body

```bash
{   status:true,
    data:userLottoInteraction[]
```

### Search for playerCalls to lottoContract by lottoId

```http
GET "/lotto/playerCalls/:addr/:lottoId"
```

All parameters are to be in URL
| Parameter | Type | Description |
| :-------- | :------- | :------------------------- |
| `addr` | `string` | **Required**. account address to get lotto contract calls fot|
| `lottoId` | `string` | **Required**. lottoId to get filter by|

response.body

```bash
{
    status:true,
    data:userLottoInteraction[]
            }
}
```

### Get All Previous Games Id and other Game Patams

```http
GET "/lotto/allLottoIdHistory"
```

response.body

```bash
{   status:true,
    data:allLottos
    }
```

### Get lotto history details for a specific lottoId

```http
GET "/lotto/lottoHistory/:lottoId"
```

All parameters are to be in URL
| Parameter | Type | Description |
| :-------- | :------- | :------------------------- |
| `lottoId` | `string` | **Required**. lottoId to get details of|

response.body

```bash
{   status:true,
        data: {
        lottoPayTxn: lottoPayTxn,
        lottoCallTxn: lottoCallTxn,
        lottoHistoryDetails: lottoHistoryDetails,
      },
```

### Get all payment Txn to the lottoCall Contract

```http
GET "/lotto/lottoPayTXnHistory"
```

response.body

```bash
{   status:true,
    data:lottoPayTxn,
      },
```

### Get currentGameParams

```http
GET "/lotto/currentGameParams"
```

response.body

```bash
{
    status: true,
    data: [ticketing_start, ticketing_duration,withdrawal_start, ticket_fee, lucky_number, players_ticket_bought, players_ticket_checked, total_game_played],

}
```

### Post method to enter current game on contract

```http
POST "/lotto/enterCurrentGame"
```

All parameters are to be in req.body.
| Parameter | Type | Description |
| :-------- | :------- | :------------------------- |
| `playerAddr` | `string` | **Required**. address of player |
| `guessNumber` | `string` | **Required**. player guess number|

This returns an array of transactions to be signed by the client

response.body

```bash
{   status:true,
    data:Transaction[]
}
```

### Post method to change guess number on contract

```http
POST "/lotto/changePlayerGuessNumber"
```

All parameters are to be in req.body.
| Parameter | Type | Description |
| :-------- | :------- | :------------------------- |
| `playerAddr` | `string` | **Required**. address of player |
| `newGuessNumber` | `string` | **Required**. new player guess number|

This returns an array of transactions to be signed by the client

response.body

```bash
{   status:true,
    data:Transaction[]
}
```

### Get player GuessNumber in current lotto Game

```http
GET "/lotto/getPlayerGuessNumber/:addr"
```

All parameters are to be in URL
| Parameter | Type | Description |
| :-------- | :------- | :------------------------- |
| `addr` | `string` | **Required**. playerAddress to get by|

response.body

```bash
{
    status: true,
    data: Number
}
```

### Get player GuessNumber in current lotto Game

```http
GET "/lotto/getGeneratedRandomNumber"
```

response.body

```bash
{
    status: true,
    data: Number
}
```

### Generate a new lucky number for the lotto Contract

```http
POST "/lotto/generateLuckyNumber"
```

response.body

```bash
{
    status: true,
}
```

### Check if a player is a winner in the lottery

```http
POST "/lotto/checkUserWin"
```

All parameters are to be in req.body.
| Parameter | Type | Description |
| :-------- | :------- | :------------------------- |
| `playerAddr` | `string` | **Required**. address of player |

response.body

```bash
{
    status: true,
    data:Boolean
}
```

## Demo

Working link at ''
