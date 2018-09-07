const Card = artifacts.require('./Card.sol')

module.exports = (deployer) => {
  deployer.deploy(Card)
};
