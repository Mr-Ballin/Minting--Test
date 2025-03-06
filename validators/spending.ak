use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/primitive/bytearray
use cardano/address.{Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{InlineDatum, Input, OutputReference, Transaction}
use modules/types.{Cip68}
use modules/value

/// Fee validator to ensure 5 ADA payment
validator fee_validator(fee_wallet: VerificationKeyHash) {
  spend(
    _datum: Option<Data>,
    _redeemer: Void,
    _o_ref: OutputReference,
    tx: Transaction,
  ) {
    // Ensure the transaction pays 5 ADA to the fee wallet
    expect Some(_fee_output) =
      list.find(
        tx.outputs,
        fn(output) {
          when output.address.payment_credential is {
            Script(pkh) -> and {
                pkh == fee_wallet,
                assets.lovelace_of(output.value) >= 5000000,
              }
            _ -> False
          }
        },
      )
    True
  }

  else(_) {
    fail
  }
}

/// CIP-68:
/// https://web.archive.org/web/20240619002020/https://developers.cardano.org/docs/governance/cardano-improvement-proposals/cip-0068/
validator cip_68 {
  mint(_redeemer: Void, policy_id: PolicyId, tx: Transaction) {
    // must mint exactly 2 tokens: ref_token & usr_token
    expect [ref_token, usr_token] = tx.mint |> value.to_pairs(policy_id)

    // must mint 1 ref_token, labelled:000643b0
    expect Pair(ref_token_name, 1) = ref_token
    expect #"000643b0" = ref_token_name |> bytearray.take(4)

    // must send ref_token to self_script with CIP-68 inline datum
    expect [ref_token_utxo] =
      tx.outputs |> transaction.find_script_outputs(policy_id)
    expect InlineDatum(metadata) = ref_token_utxo.datum
    expect cip68_data: Cip68 = metadata

    // Check if a token with this image URL already exists
    expect False = {
      let existing_utxos =
        tx.reference_inputs |> list.map(fn(input) { input.output })
      list.any(
        existing_utxos,
        fn(utxo) {
          when utxo.datum is {
            InlineDatum(existing_metadata) -> {
              expect existing_cip68: Cip68 = existing_metadata
              expect Some(Pair(_, existing_image)) =
                list.find(
                  existing_cip68.metadata,
                  fn(pair) { pair.1st == #"696d616765" },
                )
              expect Some(Pair(_, new_image)) =
                list.find(
                  cip68_data.metadata,
                  fn(pair) { pair.1st == #"696d616765" },
                )
              existing_image == new_image
            }
            _ -> False
          }
        },
      )
    }

    expect 1 =
      ref_token_utxo.value |> assets.quantity_of(policy_id, ref_token_name)

    // must mint usr_token with the same name as the ref_token
    let Pair(usr_token_name, _) = usr_token
    expect
      bytearray.drop(usr_token_name, 4) == bytearray.drop(ref_token_name, 4)

    True
  }

  spend(
    _datum: Option<Cip68>,
    _redeemer: Void,
    o_ref: OutputReference,
    tx: Transaction,
  ) {
    // must consume usr_token to proof ownership
    expect Some(input) = tx.inputs |> transaction.find_input(o_ref)
    expect Script(policy_id) = input.output.address.payment_credential
    expect [Pair(ref_token_name, _)] =
      // extract the input ref_token AssetName by self PolicyID
      input.output.value |> value.to_pairs(policy_id)
    let token_name = ref_token_name |> bytearray.drop(4)
    expect {
      let input <- list.any(tx.inputs)
      let tokens = input.output.value |> value.to_pairs(policy_id)
      let Pair(asset_name, _) <- list.any(tokens)
      and {
        asset_name != ref_token_name,
        bytearray.drop(asset_name, 4) == token_name,
      }
    }

    // must resend ref_token to update the metadatum
    expect [output] = tx.outputs |> transaction.find_script_outputs(policy_id)
    expect InlineDatum(metadata) = output.datum
    expect _: Cip68 = metadata
    expect [Pair(o_ref_token_name, _)] =
      // extract the output ref_token AssetName by self PolicyID
      output.value |> value.to_pairs(policy_id)
    and {
      o_ref_token_name == ref_token_name,
      // ☝🏻must resend ref_token with the same AssetName

      output.address == input.output.address,
      // ☝🏻prevent insufficient-staking-control vulnerability:
      // https://library.mlabs.city/common-plutus-security-vulnerabilities#11.insufficientstakingkeycontrol

      output.reference_script == input.output.reference_script,
    }
  }

  else(_) {
    fail
  }
}
