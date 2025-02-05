import { Accordion, AccordionItem } from "@heroui/accordion";

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

const Script = {
 
  Cip68: applyDoubleCborEncoding(
    "59052c010100323232323232322533300232323232323232323232323232323232325333013300900c1323232323232533301c301f002132533301a300d375a60380082a66603466e3d22104000643b00033371890002401000226464a66603e6044004264a66603a66e1d2004301e37540022660246044603e6ea800454ccc074c040c94ccc078c044c07cdd50008a400026eb4c08cc080dd500099299980f1808980f9baa00114c103d87a8000132330010013756604860426ea8008894ccc08c004530103d87a80001323332225333024337220160062a66604866e3c02c00c4c050cc0a0dd400125eb80530103d87a8000133006006001375c60440026eb4c08c004c09c008c094004cc030dd5980a180f9baa00200a1533301d3371e6602a6eb8c078015200833015004480205288b0b0b1806980f1baa0011630200013300c3758601660386ea805801c5858dd7180d0018b180e800980e801180d800998019bab301a301b301b301b301b30173754022004a6660286014602a6ea803c54ccc05cc058dd50078a4c2c2c6eb8c060c054dd50068a999809980300609919911919299980c1807180c9baa00113232533301a300d301b37540022646464a666040604600426464a66603e64660020026eb0c050c088dd500e1129998120008a5013322533302332330010013301237566036604c6ea8c06cc098dd50018051129998140008a501332253330273253330283330283371e00201694128899b8f33020001480200285281bae302800214a22660080080026054002605600229444cc010010004c098004c09c0044c8c94ccc090c09c0084c94ccc088cdc3a400860466ea80044cc05cc09cc090dd500089919299981398150010a99981219b8f375c604a00200e2a66604866ebcc060c098dd5002180c18131baa301b3026375401826466ebcc004c09cdd5002980098139baa301c3027375401a4605460566056605600229405280b1814000998081bab3019302437540040102c602460466ea800458c094004cc044dd6180818109baa01b005163301600148020dd7180f0008b1810800998049bab3012301d37546024603a6ea800c004dd7180f980e1baa00116300d301b3754601a60366ea8c040c06cdd5000980e980d1baa0011632330010013758601860346ea8050894ccc0700045300103d87a800013322533301b3375e601e603a6ea800801c4c02ccc07c0092f5c026600800800260360026038002a66602c6018602e6ea804454ccc064c060dd50088a4c2c2c603200260326034002602a6ea80345888c94ccc054c020c058dd50008a5eb7bdb1804dd5980d180b9baa0013300300200122323300100100322533301800114c103d87a800013233322253330193372200e0062a66603266e3c01c00c4c024cc074dd300125eb80530103d87a8000133006006001375c602e0026eacc060004c070008c068004dd2a40004602a602c602c00244646600200200644a66602a002297ae0133225333014325333015300830163754002266e3c018dd7180d180b9baa00114a06010602c6ea8c020c058dd500109980c00119802002000899802002000980b800980c0009b87480088c048004894ccc034c00cc038dd50010991919191919299980b180c801099198008008031119299980c80100509919191802180f802980d0011bae3018001301b00230020021630170013017002375a602a002602a0046eacc04c004c03cdd50010b1b87480008c03cc04000488ccdc600099b81371a00400200460106ea8004c02cc03000cc028008c024008c024004c010dd50008a4c26cacae6955ceaab9e5573eae815d0aba21"
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
            setActionResult(hash);
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

          submitTx(tx).then(setActionResult).catch(onError);
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
    </div>
  );
}