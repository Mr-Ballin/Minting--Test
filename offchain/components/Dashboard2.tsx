import { Accordion, AccordionItem } from "@heroui/accordion";
import { Button } from "@heroui/button";

import { ActionGroup } from "../types/action";
import Cip68 from "./actions/E_Cip68";

import {
  Address,
  applyDoubleCborEncoding,
  Constr,
  Data,
  fromText,
  LucidEvolution,
  MintingPolicy,
  mintingPolicyToId,
  SpendingValidator,
  toUnit,
  TxSignBuilder,
  validatorToAddress,
} from "@lucid-evolution/lucid";
import { network } from "@/config/lucid";
import { useState } from "react";

const Script = {
 
  Cip68: applyDoubleCborEncoding(
    "59065b0101003232323232323225333002323232323232323232323232323232323232532333015300a00e1323232323232533301e3021002132533301c300e375a603c0082a66603866e3d22104000643b00033371890002401000226464a6660426048004264a66603e601660406ea80044c8cc05000454ccc080cc05cc8cc004004dd6180b98119baa01d22533302500114bd70099813180c18121baa30270013300200230280012325333022300e302337540022646602e00226464a66604a6034604c6ea80044c8c94ccc09cc070c0a0dd5000899baf00230293233760605a002605a605c0026eb0c0b0c0a4dd50008b198019bab30193028375400e466e3cdd71814000a4505696d61676500302732337606056002605660580026eb0c0a8c09cdd50008b198009bab301730263754004466e3cdd71813000a4505696d6167650022323300100100322533302a00114c0103d87a80001332253330293005002130183302d374e6605a60540046605a605600497ae04bd7009980200200098160009816800981398121baa00114a0602260466ea80045854ccc080c048c94ccc084c04cc088dd50008a400026eb4c098c08cdd5000992999810980998111baa00114c0103d87a8000132330010013756604e60486ea8008894ccc098004530103d87a80001323332225333027337220180062a66604e66e3c03000c4c058cc0acdd400125eb80530103d87a8000133006006001375c604a0026eb4c098004c0a8008c0a0004cc038dd5980b18111baa00300b153330203371e660306eb8c084019200833018005480205288b0b181218109baa00116300e302037540022c60440026601a6eb0c030c078dd500c0038b0b1bae301c00316301f001301f002301d0013300437566038603a603a603a603a60326ea804c0094ccc058c02cc05cdd50088a99980c980c1baa01114985858dd7180d180b9baa00f15333015300700e13233223232533301a300f301b375400226464a666038601c603a6ea80044c8c8c94ccc088c0940084c8c94ccc084cc060dd6180a18119baa01d232330010013301037566032604a6ea8c064c094dd50010039129998138008a501332253330263253330273330273371e00201094128899b8f3301f0014802001c5281bae302700214a22660080080026052002605400226464a66604c6052004264a6660486020604a6ea80044cc060c0a4c098dd500089919299981498160010a99981319b8f375c604e00200e2a66604c66ebcc064c0a0dd5002180c98141baa301c3028375401826466ebcc004c0a4dd5002980098149baa301d3029375401a46058605a605a605a00229405280b1815000998089bab301a302637540040102c6026604a6ea800458c09c004cc048dd6180898119baa01d005163301800148020dd718100008b1811800998051bab3013301f37546026603e6ea800c004dd71810980f1baa00116300e301d3754601c603a6ea8c044c074dd5000980f980e1baa0011632330010013758601a60386ea8058894ccc0780045300103d87a800013322533301d3375e6020603e6ea800801c4c030cc0840092f5c026600800800260400026042002a666030601a60326ea804c54ccc06cc068dd50098a4c2c2c603600260366038002602e6ea803c58dc3a40084464a66602c6010602e6ea800452f5bded8c026eacc06cc060dd50009980180100091191980080080191299980c8008a6103d87a8000132333222533301a3372200e0062a66603466e3c01c00c4c024cc078dd300125eb80530103d87a8000133006006001375c60300026eacc064004c074008c06c004dd2a40004602c602e602e00244646600200200644a66602c002297ae0133225333015325333016300830173754002266e3c018dd7180d980c1baa00114a06010602e6ea8c020c05cdd500109980c80119802002000899802002000980c000980c8009b87480088c04c004894ccc038c00cc03cdd50010991919191919299980b980d001099198008008031119299980d001005099191918021810002980d8011bae3019001301c00230020021630180013018002375a602c002602c0046eacc050004c040dd50010b1b87480008c040c04400488c8cc00400400c894ccc04000452809991299980798028010a51133004004001301200130130012233371800266e04dc680100080118041baa001300b300c003300a002300900230090013004375400229309b2b2b9a5573aaae7955cfaba05742ae881"
  ),

  FeeValidator: applyDoubleCborEncoding(
    "5901f60101003232323232323223225333004323232323253323300a3001300b3754004264664464a66601c66e1d2000300f375464660020026eb0c050c054c054c044dd50049129998098008a6103d87a800013322533233013325333014300b301537540022a66602866e3cdd7180c980b1baa001012133712904056f10219299980a9806180b1baa0011480004dd6980d180b9baa001325333015300c301637540022980103d87a8000132330010013756603660306ea8008894ccc068004530103d87a8000132333222533301b33722911000031533301b3371e910100003130093301f375000497ae014c0103d87a8000133006006001375c60320026eb4c068004c078008c070004c8cc004004dd5980d180d980b9baa00522533301900114c103d87a8000132333222533301a33722911000031533301a3371e910100003130083301e374c00497ae014c0103d87a8000133006006001375c60300026eacc064004c074008c06c0045280a50323001301637546002602c6ea80108c0640044c004cc05c00d2f5c06e9520001330040040013015001301600114a22ca66601a66e1d2000300e375400c2a666020601e6ea80185261616301000130103011001300c37540046e1d200216300d300e003300c002300b002300b0013006375400229309b2b1bae0015734aae7555cf2ab9f5740ae855d11"
  ),
};

export default function Dashboard(props: {
  lucid: LucidEvolution;
  address: Address;
  setActionResult: (result: string) => void;
  onError: (error: any) => void;
  imageUrl?: string;
}) {
  const { lucid, address, setActionResult, onError, imageUrl } = props;
  const [result, setResult] = useState<string | null>(null);

  async function submitTx(tx: TxSignBuilder) {
    try {
      console.log("Starting transaction signing...");
      const txSigned = await tx.sign.withWallet().complete();
      console.log("Transaction signed successfully");
      
      console.log("Submitting transaction...");
      const txHash = await txSigned.submit();
      console.log("Transaction submitted successfully:", txHash);

      return txHash;
    } catch (error) {
      console.error("Transaction error:", error);
      throw error; // Re-throw to be caught by the error handler
    }
  }

  const actions: Record<string, ActionGroup> = {

    Cip68: {
      mint: async ({ name, image, label, qty }: { name: string; image: string; label: 222 | 333 | 444; qty: number }) => {
        try {
          console.log("Starting CIP-68 mint process...");
          
          if (name.length > 32) throw "Asset Name is too long!";
          if (image.length > 64) throw "Asset Image URL is too long!";

          console.log("Creating metadata...");
          const metadata = Data.fromJson({ name, image });
          const version = BigInt(1);
          const extra: Data[] = [];
          const cip68 = new Constr(0, [metadata, version, extra]);

          console.log("Creating datum...");
          const datum = Data.to(cip68);
          const redeemer = Data.void();

          console.log("Setting up CIP-68 validator...");
          const cip68Script = Script.Cip68;
          
          console.log("Creating minting policy...");
          const mintingPolicy: MintingPolicy = { 
            type: "PlutusV3", 
            script: cip68Script 
          };
          
          console.log("Calculating policy ID...");
          const policyID = mintingPolicyToId(mintingPolicy);
          console.log("Policy ID:", policyID);

          console.log("Setting up spending validator...");
          const spendingValidator: SpendingValidator = { type: "PlutusV3", script: cip68Script };
          const validatorAddress = validatorToAddress(network, spendingValidator);
          console.log("Validator address:", validatorAddress);

          console.log("Setting up fee address...");
          const feeAddress = "addr_test1qpp8tejz3g8m44g23kqh9w6alvwyukfeuxp39aac2tm6xa8nsy9wgpcls7fszah6acrhcs8cw9mhmdzjzyt9ydz3a9mq78eamp";

          console.log("Creating asset units...");
          const assetName = fromText(name);
          const refUnit = toUnit(policyID, assetName, 100);
          const usrUnit = toUnit(policyID, assetName, label);
          console.log("Reference unit:", refUnit);
          console.log("User unit:", usrUnit);

          localStorage.setItem("refUnit", refUnit);
          localStorage.setItem("usrUnit", usrUnit);

          console.log("Building transaction...");
          let tx = lucid.newTx();

          // Add reference inputs for all existing tokens
          const existingUtxos = await lucid.utxosAt(validatorAddress);
          if (existingUtxos.length > 0) {
            console.log("Found existing UTXOs at validator address:", existingUtxos);
            tx = tx.readFrom(existingUtxos);
          } else {
            console.log("No existing UTXOs at validator address - this is the first mint");
          }

          // Add minting operations
          tx = tx.mintAssets(
            {
              [refUnit]: 1n,
              [usrUnit]: BigInt(qty),
            },
            redeemer
          );

          // Add reference token payment
          tx = tx.pay.ToContract(
            validatorAddress,
            { kind: "inline", value: datum },
            {
              [refUnit]: 1n,
            }
          );

          // Always add the fee payment regardless of token type
          tx = tx.pay.ToAddress(
            feeAddress,
            { lovelace: 5_000_000n }
          );

          // Attach minting policy and complete transaction
          tx = tx.attach.MintingPolicy(mintingPolicy);

          console.log("Completing transaction build...");
          const completedTx = await tx.complete();

          console.log("Transaction built successfully, proceeding to sign...");
          submitTx(completedTx).then((hash) => {
            console.log("Transaction submitted with hash:", hash);
            setResult(hash);
          }).catch((error) => {
            console.error("Error in submitTx:", error);
            onError(error);
          });
        } catch (error) {
          console.error("Error in mint function:", error);
          onError(error);
        }
      },

      update: async ({ name, image }: { name: string; image: string }) => {
        try {
          if (name.length > 32) throw "Asset Name is too long!";
          if (image.length > 64) throw "Asset Image URL is too long!";

          const metadata = Data.fromJson({ name, image });
          const version = BigInt(1);
          const extra: Data[] = [];
          const cip68 = new Constr(0, [metadata, version, extra]);

          const datum = Data.to(cip68);
          const redeemer = Data.void();

          const spendingValidator: SpendingValidator = { type: "PlutusV3", script: Script.Cip68 };
          const validatorAddress = validatorToAddress(network, spendingValidator);

          const refUnit = localStorage.getItem("refUnit");
          const usrUnit = localStorage.getItem("usrUnit");

          if (!refUnit || !usrUnit) throw "Found no asset units in the current session's local storage. Must mint first!";

          const refTokenUTXOs = await lucid.utxosAtWithUnit(validatorAddress, refUnit);
          const usrTokenUTXOs = await lucid.utxosAtWithUnit(address, usrUnit);

          const tx = await lucid
            .newTx()
            .collectFrom([...refTokenUTXOs, ...usrTokenUTXOs], redeemer)
            .attach.SpendingValidator(spendingValidator)
            .pay.ToContract(
              validatorAddress,
              { kind: "inline", value: datum },
              {
                [refUnit]: 1n,
              }
            )
            .complete();

          submitTx(tx).then((hash) => {
            console.log("Transaction submitted with hash:", hash);
            setResult(hash);
          }).catch(onError);
        } catch (error) {
          onError(error);
        }
      },
    },
  };

  return (
    <div className="flex flex-col gap-2">
      <span>{address}</span>

      <Accordion variant="splitted">
        
        {/* CIP-68 */}
        <AccordionItem key="5" aria-label="Accordion 5" title="CIP-68">
          <Cip68 onMint={actions.Cip68.mint} onUpdate={actions.Cip68.update} imageUrl={imageUrl} />
        </AccordionItem>
      </Accordion>

      {/* Transaction Result Display */}
      {result && (
        <div className="mt-4 p-4 bg-white/5 rounded-lg text-sm text-white/80 flex items-center justify-between">
          <div className="break-all pr-4">{result}</div>
          <Button
            className="bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-lg ml-2 px-3 py-1 text-sm"
            onClick={() => {
              navigator.clipboard.writeText(result);
              // Optional: Show a temporary "Copied!" message
              const originalText = result;
              setResult("Copied!");
              setTimeout(() => setResult(originalText), 1000);
            }}
          >
            Copy
          </Button>
        </div>
      )}
    </div>
  );
}