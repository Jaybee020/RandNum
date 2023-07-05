from pyteal import *
import json


is_creator = Txn.sender() == Global.creator_address()
current_ticketing_start = App.globalGet(Bytes("Ticketing_Start"))
current_ticketing_duration = App.globalGet(Bytes("Ticketing_Duration"))
current_withdrawal_start = App.globalGet(Bytes("Withdrawal_Start"))
current_lucky_number = App.globalGet(Bytes("Lucky_Number"))
current_ticket_fee = App.globalGet(Bytes("Ticket_Fee"))
current_win_multiplier = App.globalGet(Bytes("Win_Multiplier"))
current_max_players_allowed = App.globalGet(Bytes("Max_Players_Allowed"))
current_max_guess_number = App.globalGet(Bytes("Max_Guess_Number"))
current_game_master = App.globalGet(Bytes("Game_Master"))
current_game_master_deposit = App.globalGet(Bytes("Game_Master_Deposit"))
current_players_ticket_bought = App.globalGet(Bytes("Players_Ticket_Bought"))
current_players_ticket_checked = App.globalGet(Bytes("Players_Ticket_Checked"))
current_players_won = App.globalGet(Bytes("Players_Won"))
current_game_asset = App.globalGet(Bytes("Game_Asset"))
current_total_game_played = App.globalGet(Bytes("Total_Game_Count"))


class Game_Params(abi.NamedTuple):
    ticketing_start: abi.Field[abi.Uint64]
    ticketing_duration: abi.Field[abi.Uint64]
    withdrawal_start: abi.Field[abi.Uint64]
    ticket_fee: abi.Field[abi.Uint64]
    lucky_number: abi.Field[abi.Uint64]
    players_ticket_bought: abi.Field[abi.Uint64]
    win_multiplier: abi.Field[abi.Uint64]
    max_guess_number: abi.Field[abi.Uint64]
    max_players_allowed: abi.Field[abi.Uint64]
    game_master: abi.Field[abi.Address]
    players_ticket_checked: abi.Field[abi.Uint64]
    players_won: abi.Field[abi.Uint64]
    game_asset: abi.Field[abi.Uint64]
    total_game_played: abi.Field[abi.Uint64]


# initialize global vars
handle_Creation = Seq(
    App.globalPut(Bytes("Ticketing_Start"), Int(0)),
    App.globalPut(Bytes("Ticketing_Duration"), Int(0)),
    App.globalPut(Bytes("Withdrawal_Start"), Int(0)),
    App.globalPut(Bytes("Lucky_Number"), Int(0)),
    App.globalPut(Bytes("Ticket_Fee"), Int(0)),
    App.globalPut(Bytes("Win_Multiplier"), Int(0)),
    App.globalPut(Bytes("Max_Players_Allowed"), Int(0)),
    App.globalPut(Bytes("Max_Guess_Number"), Int(0)),
    App.globalPut(Bytes("Players_Ticket_Bought"), Int(0)),
    App.globalPut(Bytes("Players_Ticket_Checked"), Int(0)),
    App.globalPut(Bytes("Players_Won"), Int(0)),
    App.globalPut(Bytes("Game_Asset"), Int(0)),
    App.globalPut(Bytes("Game_Master"), Global.zero_address()),
    App.globalPut(Bytes("Game_Master_Deposit"), Int(0)),
    Approve()
)


@Subroutine(TealType.none)
def handleAlgoDeposit(create_txn: abi.Transaction, lottery_account: abi.Account, max_players_allowed: abi.Uint64, ticket_fee: abi.Uint64, win_multiplier: abi.Uint64):
    return Seq(
        Assert(
            And(
                create_txn.get().receiver() == Global.current_application_address(),
                create_txn.get().sender() == Txn.sender(),
                create_txn.get().type_enum() == TxnType.Payment,
                # need to deposit at least 1 algo to create game
                create_txn.get().amount() >= Int(1000000),
                # balance after this transaction is sufficient to pay out a scenario where all participants win the lottery
                Balance(lottery_account.address()) -
                MinBalance(lottery_account.address())
                >= max_players_allowed.get() *
                (win_multiplier.get()-Int(1))*ticket_fee.get(),
                # Txn Note must be fixed
                create_txn.get().note() == Bytes("init_game"),
                # ticketing_fee is greater than 1 algo
                ticket_fee.get() >= Int(1000000),
            )
        )
    )


# opt contract into asa before using asa as game_asset
@Subroutine(TealType.none)
def handleASADeposit(create_txn: abi.Transaction, lottery_account: abi.Account, max_players_allowed: abi.Uint64, ticket_fee: abi.Uint64, win_multiplier: abi.Uint64, game_asset: abi.Asset):
    lottery_account_asset_balance = AssetHolding.balance(
        lottery_account.address(), game_asset.asset_id())
    return Seq(
        lottery_account_asset_balance,
        Assert(
            And(
                lottery_account_asset_balance.hasValue(),
                create_txn.get().type_enum() == TxnType.AssetTransfer,
                create_txn.get().xfer_asset() == game_asset.asset_id(),
                create_txn.get().sender() == Txn.sender(),
                create_txn.get().asset_amount() >= Int(1),
                ticket_fee.get() >= Int(1),
                create_txn.get().asset_receiver() == Global.current_application_address(),
                lottery_account_asset_balance.value() >= max_players_allowed.get() *
                (win_multiplier.get()-Int(1))*ticket_fee.get(),
                create_txn.get().note() == Bytes("init_game"),
            )
        )
    )


@Subroutine(TealType.none)
def initiateASATransfer(receiver: Expr, assetId: Expr, amount: Expr, note: Expr):
    return Seq(
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields(
            {
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.fee: Int(0),
                TxnField.asset_amount: amount,
                TxnField.asset_receiver: receiver,
                TxnField.note: note,
                TxnField.xfer_asset: assetId,
            }
        ),
        InnerTxnBuilder.Submit(),
    )


@Subroutine(TealType.none)
def initiateAlgoTransfer(receiver: Expr, amount: Expr, note: Expr):
    return Seq(
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields(
            {
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: receiver,
                TxnField.amount: amount,
                TxnField.note: note,
                TxnField.fee: Int(0),
            }
        ),
        InnerTxnBuilder.Submit(),
    )


# To call this function,the new game master must send a transaction such that the


@ABIReturnSubroutine
def initiliaze_game_params(ticketing_start: abi.Uint64, ticketing_duration: abi.Uint64, ticket_fee: abi.Uint64, withdrawal_start: abi.Uint64, win_multiplier: abi.Uint64, max_guess_number: abi.Uint64, max_players_allowed: abi.Uint64, lottery_account: abi.Account, game_asset: abi.Asset, create_txn: abi.Transaction):
    return Seq(
        Assert(
            And(
                # Make sure lottery contract has been reset
                current_ticketing_start == Int(0),
                current_ticketing_duration == Int(0),
                current_withdrawal_start == Int(0),
                current_lucky_number == Int(0),
                current_ticket_fee == Int(0),
                current_max_players_allowed == Int(0),
                current_win_multiplier == Int(0),
                current_max_guess_number == Int(0),
                current_game_master == Global.zero_address(),
                current_game_master_deposit == Int(0),
                current_players_won == Int(0),
                current_game_asset == Int(0),
                lottery_account.address() == Global.current_application_address(),
                # ticketing phase must start at least 3 minutes into the future
                ticketing_start.get() > Global.latest_timestamp() + Int(180),
                ticketing_start.get() < Global.latest_timestamp() + \
                Int(3600),  # ticketing must start in at least 1 hr
                # ticketing phase must be for at least 15 minutes
                ticketing_duration.get() > Int(900),
                # ticketing phase can only last for at most 12 hours
                ticketing_duration.get() < Int(43200),

                # max guess number should be at least 100
                max_guess_number.get() > Int(99),
                max_players_allowed.get() > Int(0),
                # win multiplier is greater than 1,
                win_multiplier.get() > Int(1),
                # withdrawal starts at least 15 mins after ticketing closed
                withdrawal_start.get() > ticketing_start.get() + \
                ticketing_duration.get() + Int(900),
                withdrawal_start.get() < ticketing_start.get() + \
                ticketing_duration.get() + Int(3600)
            ),
            Or(create_txn.get().type_enum() == TxnType.Payment,
               create_txn.get().type_enum() == TxnType.AssetTransfer)
        ),
        If(create_txn.get().type_enum() == TxnType.Payment).Then(
            handleAlgoDeposit(create_txn, lottery_account,
                              max_players_allowed, ticket_fee, win_multiplier),
            App.globalPut(Bytes("Game_Master_Deposit"),
                          create_txn.get().amount()),

        ).Else(
            handleASADeposit(create_txn, lottery_account, max_players_allowed,
                             ticket_fee, win_multiplier, game_asset),
            App.globalPut(Bytes("Game_Asset"), game_asset.asset_id()),
            App.globalPut(Bytes("Game_Master_Deposit"),
                          create_txn.get().asset_amount()),

        ),
        App.globalPut(Bytes("Ticketing_Start"), ticketing_start.get()),
        App.globalPut(Bytes("Ticketing_Duration"), ticketing_duration.get()),
        App.globalPut(Bytes("Withdrawal_Start"), withdrawal_start.get()),
        App.globalPut(Bytes("Ticket_Fee"), ticket_fee.get()),
        App.globalPut(Bytes("Win_Multiplier"), win_multiplier.get()),
        App.globalPut(Bytes("Max_Players_Allowed"), max_players_allowed.get()),
        App.globalPut(Bytes("Max_Guess_Number"), max_guess_number.get()),
        App.globalPut(Bytes("Game_Master"), Txn.sender()),
    )


@ABIReturnSubroutine
def opt_contract_to_ASA(lottery_account: abi.Account, asset: abi.Asset):
    lottery_account_asset_balance = AssetHolding.balance(
        lottery_account.address(), asset.asset_id())
    return Seq(
        Assert(lottery_account.address() ==
               Global.current_application_address()),
        lottery_account_asset_balance,
        If(Not(lottery_account_asset_balance.hasValue())).Then(
            initiateASATransfer(
                Global.current_application_address(), asset.asset_id(), Int(0), Bytes("opt_in"))
        )
    )


@ABIReturnSubroutine
def get_game_params(*, output: Game_Params):
    ticketing_start = abi.make(abi.Uint64)
    ticketing_duration = abi.make(abi.Uint64)
    withdrawal_start = abi.make(abi.Uint64)
    ticket_fee = abi.make(abi.Uint64)
    lucky_number = abi.make(abi.Uint64)
    players_ticket_bought = abi.make(abi.Uint64)
    players_ticket_checked = abi.make(abi.Uint64)
    game_master = abi.make(abi.Address)
    win_multiplier = abi.make(abi.Uint64)
    max_guess_number = abi.make(abi.Uint64)
    max_players_allowed = abi.make(abi.Uint64)
    players_won = abi.make(abi.Uint64)
    game_asset = abi.make(abi.Uint64)
    total_game_played = abi.make(abi.Uint64)

    return Seq(
        ticketing_start.set(current_ticketing_start),
        ticketing_duration.set(current_ticketing_duration),
        withdrawal_start.set(current_withdrawal_start),
        ticket_fee.set(current_ticket_fee),
        lucky_number.set(current_lucky_number),
        players_ticket_bought.set(current_players_ticket_bought),
        players_ticket_checked.set(current_players_ticket_checked),
        total_game_played.set(current_total_game_played),
        game_master.set(current_game_master),
        win_multiplier.set(current_win_multiplier),
        max_guess_number.set(current_max_guess_number),
        max_players_allowed.set(current_max_players_allowed),
        players_won.set(current_players_won),
        game_asset.set(current_game_asset),
        output.set(ticketing_start, ticketing_duration,
                   withdrawal_start, ticket_fee, lucky_number, players_ticket_bought, win_multiplier, max_guess_number, max_players_allowed, game_master, players_ticket_checked, players_won, game_asset, total_game_played)
    )


@ABIReturnSubroutine
def enter_game(guess_number: abi.Uint64, ticket_txn: abi.Transaction):

    return Seq(
        Assert(
            # Assert that the receiver of the transaction is the smart contract and amount paid is ticket fee and contract is in ticketing phase
            And(
                current_players_ticket_bought < current_max_players_allowed,
                guess_number.get() > Int(0),
                guess_number.get() <= current_max_guess_number,
                ticket_txn.get().note() == Bytes("enter_game"),
                Global.latest_timestamp() <= current_ticketing_start+current_ticketing_duration,
            ),
            Or(ticket_txn.get().type_enum() == TxnType.Payment,
               ticket_txn.get().type_enum() == TxnType.AssetTransfer)
        ),
        If(current_game_asset == Int(0)).Then(
            Assert(
                ticket_txn.get().receiver() == Global.current_application_address(),
                ticket_txn.get().sender() == Txn.sender(),
                ticket_txn.get().type_enum() == TxnType.Payment,
                ticket_txn.get().amount() == current_ticket_fee,
                ticket_txn.get().close_remainder_to() == Global.zero_address(),
            )

        ).Else(
            Assert(
                ticket_txn.get().asset_receiver() == Global.current_application_address(),
                ticket_txn.get().sender() == Txn.sender(),
                ticket_txn.get().type_enum() == TxnType.AssetTransfer,
                ticket_txn.get().asset_amount() == current_ticket_fee,
                ticket_txn.get().xfer_asset() == current_game_asset,
            )
        ),

        # If player has checked from previous game,reset value back to 0
        If(App.localGet(Txn.sender(), Bytes("checked"))).Then(
            App.localPut(Txn.sender(), Bytes("checked"), Int(0)),
            App.localPut(Txn.sender(), Bytes("guess_number"), Int(0))
        ),
        # If player buys another ticket do not increase global var
        If(Not(App.localGet(Txn.sender(), Bytes("guess_number")))).Then(
            App.globalPut(Bytes("Players_Ticket_Bought"),
                          current_players_ticket_bought+Int(1))
        ),
        App.localPut(Txn.sender(), Bytes("guess_number"),
                     guess_number.get())
    )


@ABIReturnSubroutine
def change_guess_number(new_guess_number: abi.Uint64):
    return Seq(
        Assert(
            # Assert we are still in ticketing phase and user has not been checked to prevent reusing previous ticket numbers
            And(
                new_guess_number.get() > Int(0),
                new_guess_number.get() <= current_max_guess_number,
                Global.latest_timestamp() <= current_ticketing_start+current_ticketing_duration,
                App.localGet(Txn.sender(), Bytes(
                    "guess_number")),
                Not(App.localGet(Txn.sender(), Bytes("checked")))
            )
        ),
        App.localPut(Txn.sender(), Bytes(
            "guess_number"), new_guess_number.get())
    )


@ABIReturnSubroutine
def get_user_guess_number(player: abi.Account, *, output: abi.Uint64):
    return Seq(
        Assert(
            And(
                App.localGet(player.address(), Bytes(
                    "guess_number")),
            )
        ),
        output.set(App.localGet(player.address(), Bytes("guess_number")))
    )


@ABIReturnSubroutine
def generate_lucky_number(application_Id: abi.Application):
    # That block number is the reference point in order to get a valid block round to retrieve randomness from

    most_recent_saved_block_difference = Global.round()-Int(24908202)
    most_recent_saved_block_modulo = most_recent_saved_block_difference % Int(
        8)
    most_recent_saved_block = Int(
        24908202) + most_recent_saved_block_difference-most_recent_saved_block_modulo-Int(16)
    return Seq(
        Assert(
            And(
                # make sure we are calling the right randomness beacon,#change value for mainnet/testnet
                application_Id.application_id() == Int(110096026),
                Global.latest_timestamp() >= current_ticketing_start+current_ticketing_duration,
                current_lucky_number == Int(0)
            )
        ),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields(
            {
                TxnField.type_enum: TxnType.ApplicationCall,
                TxnField.application_id:  application_Id.application_id(),
                TxnField.on_completion: OnComplete.NoOp,
                TxnField.fee: Int(0),
                TxnField.application_args: [MethodSignature(
                    "get(uint64,byte[])byte[]"), Itob(most_recent_saved_block), Txn.sender()]  # adds the sender of the transaction has entropy
            }
        ),
        InnerTxnBuilder.Submit(),
        App.globalPut(Bytes("Lucky_Number"), (Btoi(
            Extract(InnerTxn.last_log(), Int(12), Int(8))) % current_max_guess_number) + Int(1)),
    )


@ABIReturnSubroutine
def check_user_win_lottery(player: abi.Account, game_asset: abi.Asset, *, output: abi.Bool):
    user_has_checked = App.localGet(player.address(), Bytes("checked"))
    user_guess_correctly = App.localGet(
        player.address(), Bytes("guess_number")) == current_lucky_number
    return Seq(
        Assert(
            And(
                Global.latest_timestamp() >= current_withdrawal_start,
                App.localGet(player.address(), Bytes("guess_number")),
                current_lucky_number
            )
        ),
        If(user_has_checked).Then(
            output.set(user_guess_correctly)
        ).Else(
            If(user_guess_correctly).Then(
                If(current_game_asset == Int(0)).Then(
                    initiateAlgoTransfer(
                        player.address(), current_ticket_fee*current_win_multiplier, Bytes("pay_winner"))
                ).Else(
                    Assert(game_asset.asset_id() == current_game_asset),
                    initiateASATransfer(
                        player.address(), game_asset.asset_id(), current_ticket_fee*current_win_multiplier, Bytes("pay_winner"))
                ),
                App.globalPut(Bytes("Players_Won"), current_players_won+Int(1))
            ),
            App.localPut(player.address(), Bytes("checked"), Int(1)),
            App.globalPut(Bytes("Players_Ticket_Checked"),
                          current_players_ticket_checked+Int(1)),
            output.set(user_guess_correctly)
        )
    )


@ABIReturnSubroutine
def get_lucky_number(*, output: abi.Uint64):
    return Seq(
        output.set(current_lucky_number)
    )


@ABIReturnSubroutine
def get_total_game_played(*, output: abi.Uint64):
    return Seq(
        output.set(App.globalGet(Bytes("Total_Game_Count")))
    )


@ ABIReturnSubroutine
def reset_game_params(lottery_account: abi.Account, game_master_account: abi.Account, protocol_account: abi.Account, game_asset: abi.Asset):
    lottery_balance = Balance(lottery_account.address()) - \
        MinBalance(lottery_account.address())
    lottery_account_asset_balance = AssetHolding.balance(
        lottery_account.address(), game_asset.asset_id())

    protocol_account_asset_balance = AssetHolding.balance(
        protocol_account.address(), game_asset.asset_id())
    protocol_fee_var = ScratchVar(TealType.uint64)
    game_master_fee_var = ScratchVar(TealType.uint64)
    game_master_reward_var = ScratchVar(TealType.uint64)
    refundable_game_master_deposit = ScratchVar(TealType.uint64)
    return Seq(
        # Make sure every ticket has been checked and winners have been credited
        Assert(
            And(
                is_creator,
                lottery_account.address() == Global.current_application_address(),
                protocol_account.address() == Global.creator_address(),
                game_master_account.address() == current_game_master,
                current_players_ticket_bought == current_players_ticket_checked
            )
        ),
        # calculate how much players game_master deposit allows
        game_master_reward_var.store(
            current_game_master_deposit/(current_ticket_fee*(current_win_multiplier-Int(1))*current_max_players_allowed)),
        # If it is more than players participating
        If(game_master_reward_var.load() > current_players_ticket_bought).Then(
            game_master_reward_var.store(current_players_ticket_bought)
        ),

        If((current_players_won*current_win_multiplier*current_ticket_fee) >= current_game_master_deposit).Then(
            refundable_game_master_deposit.store(Int(0))
        ).Else(
            refundable_game_master_deposit.store(
                current_game_master_deposit-(current_players_won*(current_win_multiplier-Int(1))*current_ticket_fee))
        ),
        # game master usually gets 50% on every ticket bought out of his rewardable players
        game_master_fee_var.store(
            refundable_game_master_deposit.load()+((game_master_reward_var.load()-current_players_won)*current_ticket_fee/Int(2))),
        # Handle the case where the contract can't pay

        If(current_game_asset == Int(0)).Then(
            protocol_fee_var.store(lottery_balance/Int(20)),
            If(protocol_fee_var.load() > Int(500000000)).Then(
                # cap protocol fee at 500 algos
                protocol_fee_var.store(Int(500000000)),
            ),
            If(game_master_fee_var.load() > (lottery_balance-protocol_fee_var.load())).Then(
                game_master_fee_var.store(
                    lottery_balance-protocol_fee_var.load())
            ),
            If(game_master_fee_var.load() > Int(0)).Then(
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields({
                    TxnField.type_enum: TxnType.Payment,
                    TxnField.receiver: protocol_account.address(),
                    TxnField.note: Bytes("pay_protocol"),
                    TxnField.fee: Int(0),
                    TxnField.amount: protocol_fee_var.load()}),
                InnerTxnBuilder.Next(),
                InnerTxnBuilder.SetFields({
                    TxnField.type_enum: TxnType.Payment,
                    TxnField.receiver: game_master_account.address(),
                    TxnField.note: Bytes("pay_game_master"),
                    TxnField.fee: Int(0),
                    TxnField.amount: game_master_fee_var.load()}),
                InnerTxnBuilder.Submit()
            )
        ).Else(
            lottery_account_asset_balance,
            protocol_account_asset_balance,
            Assert(current_game_asset == game_asset.asset_id(),
                   lottery_account_asset_balance.hasValue()),
            protocol_fee_var.store(
                lottery_account_asset_balance.value()/Int(20)),
            If(game_master_fee_var.load() > (lottery_account_asset_balance.value()-protocol_fee_var.load())).Then(
                game_master_fee_var.store(
                    lottery_account_asset_balance.value()-protocol_fee_var.load())
            ),
            If(game_master_fee_var.load() > Int(0)).Then(
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields({
                    TxnField.type_enum: TxnType.AssetTransfer,
                    TxnField.asset_receiver: game_master_account.address(),
                    TxnField.note: Bytes("pay_game_master"),
                    TxnField.xfer_asset: current_game_asset,
                    TxnField.fee: Int(0),
                    TxnField.asset_amount: game_master_fee_var.load()}),
                If(protocol_account_asset_balance.hasValue()).Then(
                    InnerTxnBuilder.Next(),
                    InnerTxnBuilder.SetFields({
                        TxnField.type_enum: TxnType.AssetTransfer,
                        TxnField.asset_receiver: protocol_account.address(),
                        TxnField.note: Bytes("pay_protocol"),
                        TxnField.xfer_asset: current_game_asset,
                        TxnField.fee: Int(0),
                        TxnField.asset_amount: protocol_fee_var.load()}),
                ),
                InnerTxnBuilder.Submit()
            )
        ),
        App.globalPut(Bytes("Total_Game_Count"),
                      App.globalGet(Bytes("Total_Game_Count"))+Int(1)),
        handle_Creation
    )


router = Router(
    name="Lotto",
    bare_calls=BareCallActions(
        no_op=OnCompleteAction(
            action=Seq(App.globalPut(Bytes("Total_Game_Count"), Int(0)), handle_Creation), call_config=CallConfig.CREATE
        ),
        opt_in=OnCompleteAction(
            action=Approve(), call_config=CallConfig.CALL
        ),
        clear_state=OnCompleteAction(
            action=Reject(), call_config=CallConfig.CALL
        ),
        close_out=OnCompleteAction(
            action=Reject(), call_config=CallConfig.CALL
        ),
        # contract can only be updated by creator
        update_application=OnCompleteAction(
            action=Seq(Assert(is_creator), Approve()), call_config=CallConfig.CALL
        ),
        delete_application=OnCompleteAction(
            action=Reject(), call_config=CallConfig.CALL
        ),

    )
)

router.add_method_handler(initiliaze_game_params)
router.add_method_handler(get_game_params)
router.add_method_handler(
    enter_game, method_config=MethodConfig(opt_in=CallConfig.CALL, no_op=CallConfig.CALL))
router.add_method_handler(change_guess_number)
router.add_method_handler(get_user_guess_number)
router.add_method_handler(generate_lucky_number)
router.add_method_handler(get_lucky_number)
router.add_method_handler(check_user_win_lottery)
router.add_method_handler(opt_contract_to_ASA)
router.add_method_handler(reset_game_params)
router.add_method_handler(get_total_game_played)
approval_program, clear_state_program, contract = router.compile_program(
    version=7, optimize=OptimizeOptions(scratch_slots=True)
)


with open("contracts/app.teal", "w") as f:
    f.write(approval_program)

with open("contracts/clear.teal", "w") as f:
    f.write(clear_state_program)


with open("contracts/contract.json", "w") as f:
    f.write(json.dumps(contract.dictify(), indent=4))

if __name__ == "__main__":
    print(approval_program)
