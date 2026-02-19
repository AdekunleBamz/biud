
import { StacksMocknet } from "@stacks/network";
import { callReadOnlyFunction, cvToValue, standardPrincipalCV, stringUtf8CV } from "@stacks/transactions";

async function main() {
    const network = new StacksMocknet();
    const contractAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
    const contractName = "biud-username";

    const result1 = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: "get-registration-fee",
        functionArgs: [stringUtf8CV("alice")],
        network,
        senderAddress: contractAddress,
    });

    console.log("Registration fee for 'alice':", cvToValue(result1).value);

    const result2 = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: "is-available",
        functionArgs: [stringUtf8CV("satoshi")],
        network,
        senderAddress: contractAddress,
    });

    console.log("Is 'satoshi' available?:", cvToValue(result2).value);
}

main().catch(console.error);
