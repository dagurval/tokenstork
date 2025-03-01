import { queryFtAddresses, getTapSwapOrigin } from "./queryChainGraphFT.js"

// HT https://github.com/mr-zwets/token-explorer/blob/main/src/utils/queryChainGraph.ts


export async function getCirculatingTokens( tokenIdFt: string ) {
    // note: chaingraph only returns first 5000 results
    const resultFtAddresses = await queryFtAddresses(tokenIdFt,0);
    const ftAddresses = resultFtAddresses.data.output;

    var ttl_ft = 0;

    const ftsPerAddress = {};
    for(const element of ftAddresses) {
	    ttl_ft = ttl_ft + parseInt(element.fungible_token_amount);
    };
    
    return ttl_ft 
}

async function queryChainGraph(queryReq: string, chaingraphUrl: string) {
  const jsonObj = {
    operationName: null,
    variables: {},
    query: queryReq,
  };
  const response = await fetch(chaingraphUrl, {
    method: "POST",
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(jsonObj), // body data type must match "Content-Type" header
  });
  return await response.json();
}

export async function queryTotalSupplyFT(
  tokenId: string,
  chaingraphUrl: string
) {
  const queryReqTotalSupply = `query {
        transaction(
          where: {
            inputs: {
              outpoint_transaction_hash: { _eq: "\\\\x${tokenId}" }
              outpoint_index: { _eq: 0 }
            }
          }
        ) {
          outputs(where: { token_category: { _eq: "\\\\x${tokenId}" } }) {
            fungible_token_amount
          }
        }
      }`;
  return await queryChainGraph(queryReqTotalSupply, chaingraphUrl);
}

export async function queryActiveMinting(
  tokenId: string,
  chaingraphUrl: string
) {
  const queryReqActiveMinting = `query {
      output(
        where: {
          token_category: { _eq: "\\\\x${tokenId}" }
          _and: { nonfungible_token_capability: { _eq: "minting" } }
          _not: { spent_by: {} }
        }
      ) {
        locking_bytecode
      }
    }`;
  return await queryChainGraph(queryReqActiveMinting, chaingraphUrl);
}

export async function querySupplyNFTs(
  tokenId: string,
  chaingraphUrl: string,
  offset: number = 0
) {
  const queryReqTotalSupply = `query {
        output(
          offset: ${offset}
          where: {
            token_category: {
              _eq: "\\\\x${tokenId}"
            }
            _and: [
              { nonfungible_token_capability: { _eq: "none" } }
            ]
            _not: { spent_by: {} }
          }
        ) {
          locking_bytecode
        }
    }`;
  return await queryChainGraph(queryReqTotalSupply, chaingraphUrl);
}

export async function queryAuthchainLength(
  tokenId: string,
  chaingraphUrl: string
) {
  const queryReqAuthHead = `query {
    transaction(
      where: {
        hash: {
          _eq: "\\\\x${tokenId}"
        }
      }
    ) {
      hash
      authchains {
        authhead {
          hash,
          identity_output {
            fungible_token_amount
          }
        },
        authchain_length
      }
    }
  }`;
  return await queryChainGraph(queryReqAuthHead, chaingraphUrl);
}
