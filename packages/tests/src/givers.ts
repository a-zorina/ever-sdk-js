/*
 * Copyright 2018-2020 TON Labs LTD.
 *
 * Licensed under the SOFTWARE EVALUATION License (the "License"); you may not use
 * this file except in compliance with the License.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific TON DEV software governing permissions and
 * limitations under the License.
 *
 */

// noinspection SpellCheckingInspection
import {
    abiContract,
    KeyPair,
    signerKeys,
    TonClient,
} from "@eversdk/core";
import {ContractPackage} from "./contracts";

function getEnv(name: string): any {
    const globalEval = eval;
    try {
        return globalEval(`process.env.${name}`);
    } catch {
        return undefined;
    }
}

export async function getDefaultGiverKeys(client: TonClient): Promise<KeyPair> {
    const definedSecret = getEnv("TON_GIVER_SECRET");
    if (definedSecret) {
        const definedKeys = await client.crypto.nacl_sign_keypair_from_secret_key({
            secret: definedSecret,
        });
        definedKeys.secret = definedKeys.secret.substr(0, 64);
        return definedKeys;
    }
    return {
        "public": "2ada2e65ab8eeab09490e3521415f45b6e42df9c760a639bcf53957550b25a16",
        "secret": "172af540e43a524763dd53b26a066d472a97c4de37d5498170564510608250c3",
    };
}

export async function getDefaultGiverAddress(client: TonClient, keys: KeyPair): Promise<string> {
    const definedAddress = getEnv("TON_GIVER_ADDRESS");
    if (definedAddress) {
        return definedAddress;
    }
    return (await client.abi.encode_message({
        abi: abiContract(DefaultGiverContract.abi),
        deploy_set: {
            tvc: DefaultGiverContract.tvc ?? "",
        },
        signer: signerKeys(keys),
    })).address;
}

export const DefaultGiverContract: ContractPackage = {
    abi: {
        "ABI version": 2,
        header: ["time", "expire"],
        functions: [
            {
                name: "sendTransaction",
                inputs: [
                    {
                        "name": "dest",
                        "type": "address",
                    },
                    {
                        "name": "value",
                        "type": "uint128",
                    },
                    {
                        "name": "bounce",
                        "type": "bool",
                    },
                ],
                outputs: [],
            },
            {
                name: "getMessages",
                inputs: [],
                outputs: [
                    {
                        components: [
                            {
                                name: "hash",
                                type: "uint256",
                            },
                            {
                                name: "expireAt",
                                type: "uint64",
                            },
                        ],
                        name: "messages",
                        type: "tuple[]",
                    },
                ],
            },
            {
                name: "upgrade",
                inputs: [
                    {
                        name: "newcode",
                        type: "cell",
                    },
                ],
                outputs: [],
            },
            {
                name: "constructor",
                inputs: [],
                outputs: [],
            },
        ],
        data: [],
        events: [],
    },
    tvc: "te6ccgECIAEAA6YAAgE0BgEBAcACAgPPIAUDAQHeBAAD0CAAQdgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAIm/wD0pCAiwAGS9KDhiu1TWDD0oQkHAQr0pCD0oQgAAAIBIA0KAQL/CwH+fyHtRNAg10nCAZ/T/9MA9AX4an/4Yfhm+GKOG/QFbfhqcAGAQPQO8r3XC//4YnD4Y3D4Zn/4YeLTAAGOEoECANcYIPkBWPhCIPhl+RDyqN4j+EUgbpIwcN74Qrry4GUh0z/THzQg+CO88rki+QAg+EqBAQD0DiCRMd7y0Gb4AAwANiD4SiPIyz9ZgQEA9EP4al8E0x8B8AH4R27yfAIBIBQOAgFYEg8BCbjomPxQEAHW+EFujhLtRNDT/9MA9AX4an/4Yfhm+GLe0XBtbwL4SoEBAPSGlQHXCz9/k3BwcOKRII4yXzPIIs8L/yHPCz8xMQFvIiGkA1mAIPRDbwI0IvhKgQEA9HyVAdcLP3+TcHBw4gI1MzHoXwMhwP8RAJiOLiPQ0wH6QDAxyM+HIM6NBAAAAAAAAAAAAAAAAA90TH4ozxYhbyICyx/0AMlx+wDeMMD/jhL4QsjL//hGzwsA+EoB9ADJ7VTef/hnAQm5Fqvn8BMAtvhBbo427UTQINdJwgGf0//TAPQF+Gp/+GH4Zvhijhv0BW34anABgED0DvK91wv/+GJw+GNw+GZ/+GHi3vhG8nNx+GbR+AD4QsjL//hGzwsA+EoB9ADJ7VR/+GcCASAYFQEJuxXvk1gWAbb4QW6OEu1E0NP/0wD0Bfhqf/hh+Gb4Yt76QNcNf5XU0dDTf9/XDACV1NHQ0gDf0VRxIMjPhYDKAHPPQM4B+gKAa89AyXP7APhKgQEA9IaVAdcLP3+TcHBw4pEgFwCEjigh+CO7myL4SoEBAPRbMPhq3iL4SoEBAPR8lQHXCz9/k3BwcOICNTMx6F8G+ELIy//4Rs8LAPhKAfQAye1Uf/hnAgEgGxkBCbjkYYdQGgC++EFujhLtRNDT/9MA9AX4an/4Yfhm+GLe1NH4RSBukjBw3vhCuvLgZfgA+ELIy//4Rs8LAPhKAfQAye1U+A8g+wQg0O0e7VPwAjD4QsjL//hGzwsA+EoB9ADJ7VR/+GcCAtoeHAEBSB0ALPhCyMv/+EbPCwD4SgH0AMntVPgP8gABAUgfAFhwItDWAjHSADDcIccA3CHXDR/yvFMR3cEEIoIQ/////byx8nwB8AH4R27yfA==",
};
export const giverRequestAmount = 500_000_000;
