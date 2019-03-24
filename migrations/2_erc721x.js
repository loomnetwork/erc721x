const Card = artifacts.require('./Card.sol')

module.exports = (deployer) => {
  const baseTokenURI = "https://rinkeby.loom.games/erc721/zmb/"
  deployer.deploy(Card, baseTokenURI)
};
