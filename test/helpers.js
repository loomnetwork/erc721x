const ethutil = require('ethereumjs-util')
const { soliditySha3 } = require('web3-utils')

const {
  dayInSecond
} = require('./constants');

// helper functions ----------------------------------------------------------
const addsDayOnEVM = async (days) => {
  await web3.currentProvider.send({
    jsonrpc: "2.0",
    method: "evm_increaseTime",
    params: [dayInSecond * days],
    id: 0
  });

  await web3.currentProvider.send({
    jsonrpc: "2.0",
    method: "evm_mine",
    params: [],
    id: 0
  });
}

const expectThrow = async (promise) => {
  try {
    await promise;
  } catch (error) {
    const invalidOpcode = error.message.search('invalid opcode') >= 0;
    const invalidJump = error.message.search('invalid JUMP') >= 0;
    const outOfGas = error.message.search('out of gas') >= 0;
    const revert = error.message.search('revert') >= 0;

    assert(
      invalidOpcode || invalidJump || outOfGas || revert,
      "Expected throw, got '" + error + "' instead",
    );
    return;
  }

  assert.fail('Expected throw not received');
};

const assertEventVar = (transaction, eventName, eventVar, equalVar) => {
  const event = transaction.logs.find(log => log.event === eventName);
  assert.equal(event.args[eventVar], equalVar, `Event ${event.args[eventVar]} didn't happen`);
};

const getGUID = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}

const Promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  )

async function signHash(from, hash) {
  let sig = (await web3.eth.sign(hash, from)).slice(2)
  let r = ethutil.toBuffer('0x' + sig.substring(0, 64))
  let s = ethutil.toBuffer('0x' + sig.substring(64, 128))
  let v = ethutil.toBuffer(parseInt(sig.substring(128, 130), 16) + 27)
  let mode = ethutil.toBuffer(1) // mode = geth
  let signature = '0x' + Buffer.concat([mode, r, s, v]).toString('hex')
  return signature
}

/**
 *
 * @param Number serialNumber
 * @param Number seriesTotal
 * @param Number mouldId
 * @param Number cosmeticType
 */
const cardCreatorHelper = (
  serialNumber,
  seriesTotal,
  mouldId,
  cosmeticType,
) => {
  const padLeft = (n, str) => {
    return (nr) => {
      return Array(n-String(nr).length+1).join(str||'0')+nr
    }
  }

  const padLefter = padLeft(4)

  const cardSkel = [
    padLefter(serialNumber.toString(16)),
    padLefter(seriesTotal.toString(16)),
    padLefter(mouldId.toString(16)),
    padLefter(cosmeticType.toString(16)),
  ]
  return `0x${cardSkel.join('')}`
}

module.exports = {
  addsDayOnEVM,
  expectThrow,
  assertEventVar,
  getGUID,
  Promisify,
  signHash,
  cardCreatorHelper
}
