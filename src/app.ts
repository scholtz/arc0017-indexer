import getAlgodClient from './algo/getAlgodClient';
import computeTransactionId from './algo/computeTransactionId';
import getLogger from './common/getLogger';
import setLatestRound from './repository/setLatestRound';
import getLatestRound from './repository/getLatestRound';
import asyncDelay from './common/asyncDelay';
import getSecureConfiguration from './common/getSecureConfiguration';
import tellK8SSuccessState from './common/tellK8SSuccessState';
import getNumber from './hex/getNumber';
import base32 from 'hi-base32';

import algosdk, { decodeAddress, encodeAddress } from 'algosdk';
import { Environment_Min_Fields, Escrow, Escrow_Min_Fields } from './generated/graphql';
import insertEscrow from './repository/insertEscrow';
import getAllEscrows from './repository/getAllEscrows';
import insertTransaction, { InsertTransaction } from './repository/insertTransaction';
import upsertOffer from './repository/upsertOffer';
import upsertEnvironment from './repository/uppsertEnvironment';
import upsertBid from './repository/upsertBid';
import upsertTrade from './repository/usertTrade';

interface Group2Txs {
  [key: string]: TxId2Tx;
}
interface TxId2Tx {
  [key: string]: TxId2Tx;
}

const main = async () => {
  const logger = getLogger();
  try {
    logger.info('App started');
    const config = getSecureConfiguration();
    let round = await getLatestRound(config.indexerId);
    if (!round) {
      logger.info('Round not found');
      return;
    } else {
      logger.info(`Round: ${round}`);
    }
    let saveRound = true;
    const checkOneBlock = false;
    if (checkOneBlock) saveRound = false;
    //round = 22582912;
    logger.debug(`starting at round ${round}`);
    logger.debug(`before getAlgodClient`);
    const client = getAlgodClient();
    logger.debug(`after getAlgodClient`);
    const status = await client.statusAfterBlock(round).do();
    console.log('status', status);

    tellK8SSuccessState();
    //round = 34849;
    let map = await getAllEscrows();

    const block = await client.block(round).do();
    asyncDelay(config.algod.delay);
    const envInsert: Environment_Min_Fields = {
      name: block.block.gen,
      hash: Buffer.from(block.block.gh).toString('base64'),
    };
    const envData = await upsertEnvironment(envInsert);
    const env = envData.data.insert_environment.returning[0];

    console.log('env', env);
    while (true) {
      logger.debug(`processing round ${round}`);
      if (round % 1000 == 0) {
        logger.info(`processing round ${round}`);
      }
      const confirmedRound = round;
      //logger.debug(`before statusAfterBlock ${round}`);
      const status = await client.statusAfterBlock(round).do();
      asyncDelay(config.algod.delay);
      //logger.debug(`after statusAfterBlock ${round}`);
      //logger.debug(`before block ${confirmedRound}`);
      const block = await client.block(confirmedRound).do();
      asyncDelay(config.algod.delay);
      //console.log(block);
      console.log(`Escrow count: ${map?.size}`);

      //logger.debug(`after block ${confirmedRound}`);
      //console.log('block.block', block.block);
      //console.log(JSON.stringify(block.block));

      if (block.block.txns) {
        let countProcessedTxns = 0;
        //console.log('block.block.txns', block.block.txns.length);

        let intraround = -1;
        console.log('finding escrows');
        const txByGroup: Group2Txs = {};
        for (const stxn of block.block.txns) {
          // first find all escrow addresses
          intraround++;
          countProcessedTxns++;
          try {
            //console.log(stxn);
            const sender = encodeAddress(new Uint8Array(stxn.txn.snd));
            if (stxn.lsig) {
              const lsigBuffer = stxn.lsig.l as Buffer;
              if (!lsigBuffer || lsigBuffer.length < 100) continue;
              const lsig = lsigBuffer.toString('hex').toString();
              const ver = lsig.substring(8, 14);
              const sellerStart = 16;
              const seller = lsig.substring(sellerStart, sellerStart + 64);
              const numStart = 14 + 64 + 6;
              const priceStr = lsig.substring(numStart, numStart + 60);
              //console.log(priceStr);
              const price = getNumber(priceStr);
              const multiplierStr = priceStr.substring(price.len * 2);
              const multiplier = getNumber(multiplierStr);
              const assetSellStr = multiplierStr.substring(multiplier.len * 2);
              const assetSell = getNumber(assetSellStr);
              const assetBuyStr = assetSellStr.substring(assetSell.len * 2);
              const assetBuy = getNumber(assetBuyStr);
              const checksum = assetBuyStr.substring(assetBuy.len * 2, assetBuy.len * 2 + 12);
              //console.log('checksum', checksum);
              //console.log('checksum', checksum, assetBuyStr);
              if (checksum == '000102030405') {
                console.log('checksum', checksum);
                // 05260203a0b00120309c14550940c1fcdb187fd0148631e734f60845497d4cec4813bc80473a4b 22 20 0b 03 64 03 04    00 01 02 03 04 05
                // 0309c14550940c1fcdb187fd0148631e734f60845497d4cec4813bc80473a4b2
                // 05260203a0b00120309c14550940c1fcdb187fd0148631e734f60845497d4cec4813bc80473a4b 22 20 0b b9 60 01 03 04 00 01 02 03 04 05 904e33002032031244320
                // 20309c14550940c1fcdb187fd0148631e734f60845497d4cec4813bc80473a4b => GCOBIVIJIDA7ZWYYP7IBJBRR442PMCCFJF6UZ3CICO6IARZ2JMRKPEGTQQ
                const addrBuffer = Buffer.from(seller, 'hex');
                const c: Escrow_Min_Fields = {
                  address: sender,
                  ver: ver,
                  seller: encodeAddress(new Uint8Array(addrBuffer)),
                  price: price.data,
                  multiplier: multiplier.data,
                  assetBuy: assetBuy.data,
                  assetSell: assetSell.data,
                  lsig: lsig,
                  env: env.id,
                };
                //console.log('c', c);
                if (!map.get(c.address)) {
                  await insertEscrow(c);
                  map = map.set(c.address, c);
                  //console.log(`Escrow count: ${map?.size}`);
                  //console.log('lsig', c, lsigBuffer, lsig);
                  //if (stxn) return;
                } else {
                  console.log(`${c.address} already present`);
                }
              }
            }
            if (stxn.txn && stxn.txn.grp) {
              const grp = Buffer.from(stxn.txn.grp).toString('base64');
              if (!txByGroup[grp]) txByGroup[grp] = {};
              const txId = computeTransactionId(block.block.gh, block.block.gen, stxn);
              txByGroup[grp][txId] = stxn;
            }
          } catch (e) {
            //map = await getAllEscrows();
            logger.error(e);
          }
        }
        intraround = -1;
        let countInsertedTxs = 0;
        console.log('finding escrow txs');

        for (const stxn of block.block.txns) {
          try {
            intraround++;
            const sender = encodeAddress(new Uint8Array(stxn.txn.snd));
            let receiver = '';
            if (stxn.txn.type == 'axfer' && stxn.txn.arcv) {
              receiver = encodeAddress(new Uint8Array(stxn.txn.arcv));
            } else if (stxn.txn.type == 'pay' && stxn.txn.rcv) {
              receiver = encodeAddress(new Uint8Array(stxn.txn.rcv));
            } else {
              throw Error(`Unable to process: ${JSON.stringify(stxn)}`);
            }
            if (sender == receiver) {
              console.log('self signed');
              continue;
            } // further code inserts the transaction to or from the escrow.. do not process self txs
            const isClose = stxn.txn.aclose || stxn.txn.close;
            const senderIsEscrow = !!map.get(sender);
            const receiverIsEscrow = !!map.get(receiver);
            //console.log('senderIsEscrow,receiverIsEscrow', senderIsEscrow, receiverIsEscrow, stxn);
            const escrow = senderIsEscrow ? map.get(sender) : map.get(receiver);
            if (!senderIsEscrow && !receiverIsEscrow) continue;

            if (stxn.txn.type == 'axfer' && (stxn.txn.aamt > 0 || isClose)) {
              if (senderIsEscrow) {
                const txId = computeTransactionId(block.block.gh, block.block.gen, stxn);
                var insertTx: InsertTransaction = {
                  txId: txId,
                  account: sender,
                  type: isClose ? 4 : 2, //from escrow
                  asset: stxn.txn.xaid,
                  round: round,
                  intraround: intraround,
                  amount: stxn.txn.aamt ? stxn.txn.aamt : 0,
                  fee: stxn.txn.fee ? stxn.txn.fee : 0,
                  env: env.id,
                };
                const insertTxResult = await insertTransaction(insertTx);
                await upsertOffer(insertTx, insertTxResult, escrow);
                await upsertBid(insertTx, insertTxResult, escrow);
                const grp = Buffer.from(stxn.txn.grp).toString('base64');
                delete txByGroup[grp][txId];
                console.log('Object.values(txByGroup[grp]).length', Object.values(txByGroup[grp]).length);
                if (Object.values(txByGroup[grp]).length == 1) {
                  // other tx is the payment
                  // trade
                  const tx2 = Object.values(txByGroup[grp])[0];
                  const tx2Id = computeTransactionId(block.block.gh, block.block.gen, tx2);
                  await upsertTrade(insertTx, block.block.ts, tx2Id, tx2, escrow);
                }
                countInsertedTxs++;
              }
              if (receiverIsEscrow) {
                const txId = computeTransactionId(block.block.gh, block.block.gen, stxn);
                var insertTx: InsertTransaction = {
                  txId: txId,
                  account: receiver,
                  type: isClose ? 3 : 1, //to escrow
                  asset: stxn.txn.xaid,
                  round: round,
                  intraround: intraround,
                  amount: stxn.txn.aamt ? stxn.txn.aamt : 0,
                  fee: 0,
                  env: env.id,
                };
                const insertTxResult = await insertTransaction(insertTx);
                await upsertOffer(insertTx, insertTxResult, escrow);
                await upsertBid(insertTx, insertTxResult, escrow);
                const grp = Buffer.from(stxn.txn.grp).toString('base64');
                delete txByGroup[grp][txId];
                console.log('Object.values(txByGroup[grp]).length', Object.values(txByGroup[grp]).length);

                if (Object.values(txByGroup[grp]).length == 1) {
                  // other tx is the payment
                  // trade
                  const tx2 = Object.values(txByGroup[grp])[0];
                  const tx2Id = computeTransactionId(block.block.gh, block.block.gen, tx2);
                  await upsertTrade(insertTx, block.block.ts, tx2Id, tx2, escrow);
                }
                countInsertedTxs++;
              }
            } else if (stxn.txn.type == 'pay' && (stxn.txn.amt > 0 || isClose)) {
              if (senderIsEscrow) {
                const txId = computeTransactionId(block.block.gh, block.block.gen, stxn);
                var insertTx: InsertTransaction = {
                  txId: txId,
                  account: sender,
                  type: isClose ? 4 : 2, //from escrow
                  asset: 0,
                  round: round,
                  intraround: intraround,
                  amount: stxn.txn.amt ? stxn.txn.amt : 0,
                  fee: stxn.txn.fee ? stxn.txn.fee : 0,
                  env: env.id,
                };
                const insertTxResult = await insertTransaction(insertTx);
                await upsertOffer(insertTx, insertTxResult, escrow);
                await upsertBid(insertTx, insertTxResult, escrow);
                const grp = Buffer.from(stxn.txn.grp).toString('base64');
                delete txByGroup[grp][txId];
                console.log('Object.values(txByGroup[grp]).length', Object.values(txByGroup[grp]).length);

                if (Object.values(txByGroup[grp]).length == 1) {
                  // other tx is the payment
                  // trade
                  const tx2 = Object.values(txByGroup[grp])[0];
                  const tx2Id = computeTransactionId(block.block.gh, block.block.gen, tx2);
                  await upsertTrade(insertTx, block.block.ts, tx2Id, tx2, escrow);
                }
                countInsertedTxs++;
              }
              if (receiverIsEscrow) {
                const txId = computeTransactionId(block.block.gh, block.block.gen, stxn);
                var insertTx: InsertTransaction = {
                  txId: txId,
                  account: receiver,
                  type: isClose ? 3 : 1, //to escrow
                  asset: 0,
                  round: round,
                  intraround: intraround,
                  amount: stxn.txn.amt ? stxn.txn.amt : 0,
                  fee: 0,
                  env: env.id,
                };
                const insertTxResult = await insertTransaction(insertTx);
                await upsertOffer(insertTx, insertTxResult, escrow);
                await upsertBid(insertTx, insertTxResult, escrow);
                const grp = Buffer.from(stxn.txn.grp).toString('base64');
                delete txByGroup[grp][txId];
                console.log('Object.values(txByGroup[grp]).length', Object.values(txByGroup[grp]).length);

                if (Object.values(txByGroup[grp]).length == 1) {
                  // other tx is the payment
                  // trade
                  const tx2 = Object.values(txByGroup[grp])[0];
                  const tx2Id = computeTransactionId(block.block.gh, block.block.gen, tx2);
                  await upsertTrade(insertTx, block.block.ts, tx2Id, tx2, escrow);
                }
                countInsertedTxs++;
              }
            }
          } catch (e) {
            //map = await getAllEscrows();
            logger.error(e);
          }
        }
        logger.debug(`${countProcessedTxns} ${countInsertedTxs} txns processed with round ${round}`);
      }
      if (checkOneBlock) break;
      round = round + 1;
      if (saveRound) {
        console.log('round', round);
        setLatestRound(config.indexerId, round);
      }
    }
    logger.info(`finished`);
  } catch (e) {
    logger.info(`App error: ${e}`, e);
  }
};
main();
