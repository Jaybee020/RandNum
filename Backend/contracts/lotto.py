from pyteal import *
import json


is_creator = Txn.sender() == Global.creator_address()
current_ticketing_start = App.globalGet(Bytes("Ticketing_Start"))
current_ticketing_duration = App.globalGet(Bytes("Ticketing_Duration"))
current_withdrawal_start = App.globalGet(Bytes("Withdrawal_Start"))
current_lucky_number = App.globalGet(Bytes("Lucky_Number"))
current_ticket_fee = App.globalGet(Bytes("Ticket_Fee"))
current_players_ticket_bought = App.globalGet(Bytes("Players_Ticket_Bought"))
current_players_ticket_checked = App.globalGet(Bytes("Players_Ticket_Checked"))
current_total_game_played = App.globalGet(Bytes("Total_Game_Count"))


class Game_Params(abi.NamedTuple):
    ticketing_start: abi.Field[abi.Uint64]
    ticketing_duration: abi.Field[abi.Uint64]
    withdrawal_start: abi.Field[abi.Uint64]
    ticket_fee: abi.Field[abi.Uint64]
    lucky_number: abi.Field[abi.Uint64]
    players_ticket_bought: abi.Field[abi.Uint64]
    players_ticket_checked: abi.Field[abi.Uint64]
    total_game_played: abi.Field[abi.Uint64]


# store the deployer of the contract in global storage and initialize global vars
handle_Creation = Seq(
    App.globalPut(Bytes("Ticketing_Start"), Int(0)),
    App.globalPut(Bytes("Ticketing_Duration"), Int(0)),
    App.globalPut(Bytes("Withdrawal_Start"), Int(0)),
    App.globalPut(Bytes("Lucky_Number"), Int(0)),
    App.globalPut(Bytes("Ticket_Fee"), Int(0)),
    App.globalPut(Bytes("Players_Ticket_Bought"), Int(0)),
    App.globalPut(Bytes("Players_Ticket_Checked"), Int(0)),
    Approve()
)


@ABIReturnSubroutine
def initiliaze_game_params(ticketing_start: abi.Uint64, ticketing_duration: abi.Uint64, ticket_fee: abi.Uint64, withdrawal_start: abi.Uint64):
    return Seq(
        Assert(
            And(
                is_creator,
                # Make sure function has not been called before
                current_ticketing_start == Int(0),
                current_ticketing_duration == Int(0),
                current_withdrawal_start == Int(0),
                current_lucky_number == Int(0),
                current_ticket_fee == Int(0),
                # ticketing phase must start at least 3 minutes into the future
                ticketing_start.get() > Global.latest_timestamp() + Int(180),
                # ticketing phase must be for at least 15 minutes
                ticketing_duration.get() > Int(900),
                # ticketing_fee is greater than 1 algo
                ticket_fee.get() >= Int(1000000),
                # withdrawal starts at least 15 mins after ticketing closed
                withdrawal_start.get() > ticketing_start.get() + \
                ticketing_duration.get() + Int(900)
            )

        ),
        App.globalPut(Bytes("Ticketing_Start"), ticketing_start.get()),
        App.globalPut(Bytes("Ticketing_Duration"), ticketing_duration.get()),
        App.globalPut(Bytes("Withdrawal_Start"), withdrawal_start.get()),
        App.globalPut(Bytes("Ticket_Fee"), ticket_fee.get()),
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
        output.set(ticketing_start, ticketing_duration,
                   withdrawal_start, ticket_fee, lucky_number, players_ticket_bought, players_ticket_checked, total_game_played)
    )


@ABIReturnSubroutine
def enter_game(guess_number: abi.Uint64, ticket_txn: abi.PaymentTransaction):

    return Seq(
        Assert(

            # Assert that the receiver of the transaction is the smart contract and amount paid is ticket fee and contract is in ticketing phase
            And(
                guess_number.get() > Int(0),
                guess_number.get() <= Int(10000),
                ticket_txn.get().receiver() == Global.current_application_address(),
                ticket_txn.get().sender() == Txn.sender(),
                ticket_txn.get().type_enum() == TxnType.Payment,
                ticket_txn.get().amount() == current_ticket_fee,
                ticket_txn.get().close_remainder_to() == Global.zero_address(),
                Global.latest_timestamp() <= current_ticketing_start+current_ticketing_duration,
            )
        ),

        # If player has checked from previous game,reset value back to 0
        If(App.localGet(Txn.sender(), Bytes("checked"))).Then(
            App.localPut(Txn.sender(), Bytes("checked"), Int(0))
        ),
        App.localPut(Txn.sender(), Bytes("guess_number"),
                     guess_number.get()),
        App.globalPut(Bytes("Players_Ticket_Bought"),
                      current_players_ticket_bought+Int(1))
    )


@ABIReturnSubroutine
def change_guess_number(new_guess_number: abi.Uint64):
    return Seq(
        Assert(
            # Assert we are still in ticketing phase and user has not been checked to prevent reusing previous ticket numbers
            And(
                new_guess_number.get() > Int(0),
                new_guess_number.get() <= Int(10000),
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
                TxnField.application_args: [MethodSignature(
                    "get(uint64,byte[])byte[]"), Itob(most_recent_saved_block), Txn.sender()]  # adds the sender of the transaction has entropy
            }
        ),
        InnerTxnBuilder.Submit(),
        App.globalPut(Bytes("Lucky_Number"), (Btoi(
            Extract(InnerTxn.last_log(), Int(12), Int(4))) % Int(10000)) + Int(1)),
        Approve()
    )


@ABIReturnSubroutine
def check_user_win_lottery(player: abi.Account, *, output: abi.Bool):
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
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields({
                    TxnField.type_enum: TxnType.Payment,
                    TxnField.receiver: player.address(),
                    TxnField.amount: current_ticket_fee*Int(10)}),
                InnerTxnBuilder.Submit()
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
def reset_game_params():
    return Seq(
        # Make sure every ticket has been checked and winners have been credited
        Assert(
            And(
                is_creator,
                current_players_ticket_bought == current_players_ticket_checked
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
        # Prevent updating and deleting of this application
        update_application=OnCompleteAction(
            action=Reject(), call_config=CallConfig.CALL
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
