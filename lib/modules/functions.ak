use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{ScriptHash}
use cardano/address.{Script}
use cardano/assets.{PolicyId, Value}
use cardano/transaction.{Input, OutputReference}

pub fn mint_qty(mint: Value, policy_id: PolicyId) -> Int {
  expect [Pair(_, qty)] =
    //     ☝🏻Pair:
    //     - https://aiken-lang.org/language-tour/primitive-types#pair
    //     - https://github.com/aiken-lang/prelude/blob/190650684e6ebfd0236bd896b107d575538c6c22/lib/aiken.ak#L86-L88
    //     - https://aiken-lang.github.io/prelude/aiken/builtin.html#Pair
    mint
      |> assets.tokens(policy_id)
      |> dict.to_pairs()
  //              ☝🏻Pairs:
  //              - https://aiken-lang.org/language-tour/primitive-types#pairs
  //              - https://github.com/aiken-lang/prelude/blob/190650684e6ebfd0236bd896b107d575538c6c22/lib/aiken.ak#L94-L95
  //              - https://aiken-lang.github.io/stdlib/aiken/collection/pairs.html
  qty
}

pub fn consume_utxo(
  transaction_inputs: List<Input>,
  output_reference: OutputReference,
) -> Bool {
  let transaction_input <- list.any(transaction_inputs)
  //                   ☝🏻Backpassing:
  // https://aiken-lang.org/language-tour/functions#backpassing-
  transaction_input.output_reference == output_reference
}

pub fn filter_map_script_inputs(
  inputs: List<Input>,
  script_hash: ScriptHash,
  map_to: fn(Input) -> result,
) -> List<result> {
  let input <- list.filter_map(inputs)
  when input.output.address.payment_credential is {
    Script(hash) ->
      if hash == script_hash {
        input |> map_to |> Some
      } else {
        None
      }
    _ -> None
  }
}
